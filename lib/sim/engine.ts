import { LEVEL_WEIGHT } from "./data.ts";
import { extractRoots, matchesAnyRoot, similarity, tokenize } from "./text.ts";
import type { AiCheck, ContextItem, EvidenceLevel, Proposal, Rubric, SourceType, Verdict } from "./types.ts";

// Mesin penilaian SIMULASI. Di aplikasi nyata, penilaian dilakukan model AI
// dengan rubrik yang sama (lihat docs/03-penilaian-ai-dan-anti-fraud.md).
// Heuristik di sini hanya meniru bentuk keluarannya: skor per rubrik + alasan.

export const LIMITS = {
  minChars: 60,
  maxChars: 1000,
  maxActivePerAccount: 3,
  duplicateThreshold: 0.6,
};

// Kosakata umum untuk heuristik simulasi (bukan khusus satu kasus).
const ACTION_ROOTS = [
  "bangun", "lebar", "normalisasi", "bongkar", "tertib", "jadwal", "angkut", "pasang",
  "bentuk", "libat", "alokasi", "anggar", "latih", "awas", "pantau", "rawat", "tanam",
  "relokasi", "sosialisasi", "koordinasi", "tetap", "terap", "wajib", "tambah", "evaluasi",
  "ajukan", "audit", "cabut", "beri", "sediakan", "patroli", "padam", "basah", "sekat",
  "terbit", "revisi", "atur", "denda", "gugat", "tindak", "umumkan", "buka", "pulih",
  "restorasi", "subsidi", "insentif",
];
const TIME_PATTERN = /\b\d+\s*(hari|minggu|bulan|tahun|triwulan|kali|jam)\b|\b(mingguan|bulanan|tahunan|triwulan|setiap musim|tiap musim)\b/;
const PARTY_PATTERN = /\b(dinas|pupr|bpbd|bnpb|bmkg|klhk|kementerian|menteri|polri|kejaksaan|pemda|pemprov|pemkab|pemkot|gubernur|bupati|desa|warga|petani|pengembang|perusahaan|pemegang konsesi|kelurahan|rw|rt|tim|satgas|manggala agni|presiden|dpr|dprd)\b/;
const RISK_ROOTS = [
  "risiko", "dampak", "kompensasi", "relokasi", "biaya", "anggar", "apbn", "apbd",
  "sementara", "evaluasi", "indikator", "ukur", "jika", "penolakan", "tolak", "transisi",
];

const INJECTION_PATTERNS: RegExp[] = [
  /abaikan\s+(semua\s+|seluruh\s+)?(instruksi|perintah|aturan)/i,
  /ignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above)?\s*instructions/i,
  /beri(kan)?\s+(usulan\s+ini\s+|saya\s+)?(skor|nilai)\s*(100|sempurna|tertinggi|maksimal)/i,
  /(skor|nilai)\s*(=|:)\s*100/i,
  /system\s*prompt|you\s+are\s+now|kamu\s+sekarang\s+adalah/i,
  /<\/?\s*(system|instruction|prompt)\b/i,
];

export function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(text));
}

function clamp(n: number, max: number) {
  return Math.max(0, Math.min(max, n));
}

export function scoreProposal(
  text: string,
  contexts: ContextItem[],
): { score: number; rubric: Rubric; reasons: string[]; flags: string[] } {
  const tokens = tokenize(text);
  const lower = text.toLowerCase();
  const reasons: string[] = [];
  const flags: string[] = [];

  // 1. Menyentuh akar masalah: konsep konteks mana yang dibahas, dibobot tingkat bukti.
  let totalWeight = 0;
  let coveredWeight = 0;
  let conceptHits = 0;
  const covered: string[] = [];
  const missed: string[] = [];
  const weak: string[] = [];
  contexts.forEach((ctx, i) => {
    const w = LEVEL_WEIGHT[ctx.level];
    totalWeight += w;
    const hits = matchesAnyRoot(tokens, ctx.roots);
    if (hits.length >= 1) {
      coveredWeight += w;
      covered.push(`[${i + 1}] ${ctx.concept}`);
      if (ctx.level === 0) weak.push(`[${i + 1}]`);
    } else {
      missed.push(`[${i + 1}] ${ctx.concept}`);
    }
  });
  for (const t of tokens) {
    if (contexts.some((c) => c.roots.some((r) => t.startsWith(r)))) conceptHits++;
  }
  let akarMasalah = totalWeight > 0 ? (coveredWeight / totalWeight) * 35 : 0;

  // 2. Kelayakan: ada langkah tindakan yang jelas.
  const actions = matchesAnyRoot(tokens, ACTION_ROOTS).length;
  const kelayakan = clamp((actions / 5) * 25, 25);

  // 3. Spesifik & terukur: angka, waktu, pihak penanggung jawab.
  let spesifik = 0;
  const numbers = (text.match(/\d+([.,]\d+)?/g) ?? []).length;
  spesifik += Math.min(numbers, 2) * 5;
  if (TIME_PATTERN.test(lower)) spesifik += 5;
  if (PARTY_PATTERN.test(lower)) spesifik += 5;
  spesifik = clamp(spesifik, 20);

  // 4. Risiko & dampak samping dibahas.
  const riskHits = matchesAnyRoot(tokens, RISK_ROOTS).length;
  const risiko = clamp((riskHits / 4) * 20, 20);

  // Penalti: menumpuk kata kunci konteks tanpa langkah nyata.
  const density = tokens.length > 0 ? conceptHits / tokens.length : 0;
  const stuffing = density > 0.45 && actions < 2;
  if (stuffing) {
    akarMasalah = akarMasalah * 0.3;
    flags.push("Penalti: mengulang kata kunci konteks tanpa langkah tindakan.");
  }

  if (covered.length > 0) reasons.push(`Membahas konteks ${covered.join(", ")}.`);
  if (missed.length > 0) reasons.push(`Belum menyentuh ${missed.join(", ")}.`);
  if (weak.length > 0) {
    reasons.push(`Bersandar pada konteks ${weak.join(", ")} yang belum terverifikasi atau diberi peringatan AI, jadi bobotnya kecil.`);
  }
  reasons.push(
    actions >= 3
      ? "Langkah tindakan cukup jelas."
      : actions > 0
        ? "Langkah tindakan masih sedikit."
        : "Tidak ada langkah tindakan konkret.",
  );
  if (spesifik < 10) reasons.push("Kurang angka, tenggat, atau pihak penanggung jawab.");
  if (risiko === 0) reasons.push("Tidak membahas biaya, risiko, atau cara evaluasi.");

  const rubric: Rubric = {
    akarMasalah: Math.round(akarMasalah),
    kelayakan: Math.round(kelayakan),
    spesifik: Math.round(spesifik),
    risiko: Math.round(risiko),
  };
  const score = rubric.akarMasalah + rubric.kelayakan + rubric.spesifik + rubric.risiko;
  return { score, rubric, reasons, flags };
}

let counter = 0;
export function makeId(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * Jalankan pemeriksaan anti-fraud lalu penilaian.
 * Urutan sengaja: injeksi, panjang, duplikat sendiri, batas usulan, jiplakan.
 */
export function evaluateSubmission(input: {
  text: string;
  accountId: string;
  accountLabel: (id: string) => string;
  proposals: Proposal[];
  contexts: ContextItem[];
  now: number;
}): Verdict {
  const text = input.text.trim();

  if (detectInjection(text)) {
    return {
      kind: "dikarantina",
      rule: "AF-04 Injeksi instruksi",
      message:
        "Usulan berisi kalimat yang mencoba memerintah penilai. Usulan tidak dinilai dan masuk antrean moderator.",
    };
  }

  if (text.length < LIMITS.minChars || tokenize(text).length < 8) {
    return {
      kind: "ditolak",
      rule: "AF-00 Terlalu pendek",
      message: `Usulan minimal ${LIMITS.minChars} karakter dan berisi gagasan yang bisa dinilai.`,
    };
  }

  const own = input.proposals.filter((p) => p.accountId === input.accountId);
  for (const p of own) {
    const sim = similarity(text, p.text);
    if (sim >= LIMITS.duplicateThreshold) {
      return {
        kind: "ditolak",
        rule: "AF-01 Duplikat",
        message: `Kemiripan ${Math.round(sim * 100)}% dengan usulan Anda sebelumnya. Edit usulan lama sebagai versi baru, jangan kirim ulang.`,
      };
    }
  }

  if (own.length >= LIMITS.maxActivePerAccount) {
    return {
      kind: "ditolak",
      rule: "AF-02 Batas usulan",
      message: `Maksimal ${LIMITS.maxActivePerAccount} usulan aktif per akun untuk satu berkas.`,
    };
  }

  const result = scoreProposal(text, input.contexts);
  const flags = [...result.flags];
  let status: Proposal["status"] = "dinilai";

  const others = input.proposals.filter((p) => p.accountId !== input.accountId);
  let best: { sim: number; p: Proposal } | null = null;
  for (const p of others) {
    const sim = similarity(text, p.text);
    if (!best || sim > best.sim) best = { sim, p };
  }
  if (best && best.sim >= LIMITS.duplicateThreshold) {
    status = "ditandai";
    flags.push(
      `AF-03 Mirip ${Math.round(best.sim * 100)}% dengan usulan ${input.accountLabel(best.p.accountId)} yang dikirim lebih dulu. Tidak masuk garis sampai ditinjau.`,
    );
  }

  return {
    kind: "diterima",
    proposal: {
      id: makeId("u"),
      accountId: input.accountId,
      text,
      createdAt: input.now,
      status,
      score: result.score,
      rubric: result.rubric,
      reasons: result.reasons,
      flags,
    },
  };
}

/**
 * Susun titik di garis supaya titik yang berdekatan tidak saling menutupi:
 * titik yang skornya berselisih kurang dari `gap` diturunkan ke lajur berikutnya.
 */
export function assignLanes(scores: { id: string; score: number }[], gap = 6) {
  const sorted = [...scores].sort((a, b) => a.score - b.score);
  const lanes: number[][] = [];
  const out: Record<string, number> = {};
  for (const s of sorted) {
    let lane = 0;
    while (lanes[lane]?.some((x) => Math.abs(x - s.score) < gap)) lane++;
    (lanes[lane] ??= []).push(s.score);
    out[s.id] = lane;
  }
  return out;
}

/**
 * Validasi konteks baru dari pengguna. Konteks tanpa sumber ditolak.
 * Tingkat bukti awal ditentukan jenis sumber; naik hanya lewat verifikasi.
 */
export function buildContext(input: {
  statement: string;
  sourceType: SourceType;
  sourceRef: string;
  addedBy: string;
}): { ok: true; context: ContextItem } | { ok: false; errors: Partial<Record<"statement" | "sourceRef", string>> } {
  const statement = input.statement.trim();
  const sourceRef = input.sourceRef.trim();
  const errors: Partial<Record<"statement" | "sourceRef", string>> = {};

  if (statement.length < 30) errors.statement = "Tulis pernyataan konteks minimal 30 karakter.";
  if (!sourceRef) {
    errors.sourceRef = "Sumber wajib diisi. Konteks tanpa sumber tidak bisa ditambahkan.";
  } else if (input.sourceType === "berita" && !/^https?:\/\/\S+\.\S+/.test(sourceRef)) {
    errors.sourceRef = "Untuk berita, isi URL lengkap yang diawali http:// atau https://.";
  } else if (sourceRef.length < 8) {
    errors.sourceRef = "Rujukan sumber terlalu singkat untuk bisa ditelusuri.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // Simulasi pemeriksaan AI. Di aplikasi nyata AI membuka URL publik atau
  // membaca dokumen yang diunggah, lalu membandingkan isinya dengan pernyataan.
  const isUrl = /^https?:\/\/\S+\.\S+/.test(sourceRef);
  const aiCheck: AiCheck =
    input.sourceType === "narasumber"
      ? { status: "ragu", note: "Pernyataan narasumber tidak bisa diperiksa AI. Butuh konfirmasi atau saksi." }
      : input.sourceType === "dokumen"
        ? { status: "gagal_akses", note: "Dokumen belum diunggah, AI tidak punya bahan untuk diperiksa." }
        : isUrl
          ? { status: "cocok", note: "Simulasi: AI dianggap berhasil membuka URL dan isinya cocok." }
          : { status: "gagal_akses", note: "Rujukan bukan URL atau dokumen, AI tidak bisa membukanya." };
  const level: EvidenceLevel = aiCheck.status === "cocok" ? 2 : 0;
  const roots = extractRoots(statement);
  return {
    ok: true,
    context: {
      id: makeId("k"),
      statement,
      sourceType: input.sourceType,
      sourceRef,
      level,
      aiCheck,
      witnesses: 0,
      ownerConfirmed: false,
      roots,
      concept: statement.split(/\s+/).slice(0, 4).join(" ").toLowerCase(),
      addedBy: input.addedBy,
    },
  };
}

/**
 * Hitung ulang tingkat bukti dari tiga lapis verifikasi.
 * Aturan kunci: pemilik berkas tidak bisa mengesampingkan temuan AI
 * "bertentangan"; hanya saksi yang bisa.
 */
export function deriveLevel(ctx: Pick<ContextItem, "aiCheck" | "witnesses" | "ownerConfirmed">, minWitnesses = 2): EvidenceLevel {
  if (ctx.witnesses >= minWitnesses) return 3;
  if (ctx.aiCheck.status === "bertentangan") return 0;
  if (ctx.aiCheck.status === "cocok") return 2;
  if (ctx.ownerConfirmed) return 1;
  return 0;
}

export function canOwnerConfirm(ctx: Pick<ContextItem, "aiCheck" | "ownerConfirmed">): boolean {
  return !ctx.ownerConfirmed && (ctx.aiCheck.status === "ragu" || ctx.aiCheck.status === "gagal_akses");
}
