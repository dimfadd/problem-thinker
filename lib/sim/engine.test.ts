import { test } from "node:test";
import assert from "node:assert/strict";
import { ACCOUNTS, INITIAL_CONTEXTS, QUICK_EXAMPLES, SEED_PROPOSALS } from "./data.ts";
import { assignLanes, buildContext, canOwnerConfirm, deriveLevel, evaluateSubmission, scoreProposal } from "./engine.ts";
import type { Proposal } from "./types.ts";

const label = (id: string) => ACCOUNTS.find((a) => a.id === id)?.label ?? id;

function seed(): Proposal[] {
  const out: Proposal[] = [];
  for (const s of SEED_PROPOSALS) {
    const v = evaluateSubmission({ text: s.text, accountId: s.accountId, accountLabel: label, proposals: out, contexts: INITIAL_CONTEXTS, now: 0 });
    assert.equal(v.kind, "diterima");
    if (v.kind === "diterima") out.push(v.proposal);
  }
  return out;
}

test("usulan lengkap lebih tinggi daripada usulan normatif", () => {
  const strong = scoreProposal(SEED_PROPOSALS[0].text, INITIAL_CONTEXTS).score;
  const vague = scoreProposal(SEED_PROPOSALS[2].text, INITIAL_CONTEXTS).score;
  assert.ok(strong >= 75, `strong=${strong}`);
  assert.ok(vague <= 25, `vague=${vague}`);
});

test("penilaian deterministik untuk teks yang sama", () => {
  const a = scoreProposal(QUICK_EXAMPLES.kuat, INITIAL_CONTEXTS);
  const b = scoreProposal(QUICK_EXAMPLES.kuat, INITIAL_CONTEXTS);
  assert.deepEqual(a, b);
});

test("injeksi instruksi dikarantina", () => {
  const v = evaluateSubmission({ text: QUICK_EXAMPLES.injeksi, accountId: "you", accountLabel: label, proposals: seed(), contexts: INITIAL_CONTEXTS, now: 1 });
  assert.equal(v.kind, "dikarantina");
});

test("spam kata kunci kena penalti", () => {
  const r = scoreProposal(QUICK_EXAMPLES.spam, INITIAL_CONTEXTS);
  assert.ok(r.flags.length > 0);
  assert.ok(r.score < 30, `score=${r.score}`);
});

test("duplikat dari akun sama ditolak, batas 3 usulan berlaku", () => {
  const ps = seed();
  const first = evaluateSubmission({ text: QUICK_EXAMPLES.kuat, accountId: "you", accountLabel: label, proposals: ps, contexts: INITIAL_CONTEXTS, now: 1 });
  assert.equal(first.kind, "diterima");
  if (first.kind === "diterima") ps.push(first.proposal);
  const dup = evaluateSubmission({ text: QUICK_EXAMPLES.kuat + " Segera.", accountId: "you", accountLabel: label, proposals: ps, contexts: INITIAL_CONTEXTS, now: 2 });
  assert.equal(dup.kind, "ditolak");
  if (dup.kind === "ditolak") assert.match(dup.rule, /AF-01/);
});

test("jiplakan usulan akun lain ditandai, bukan diberi peringkat", () => {
  const v = evaluateSubmission({ text: SEED_PROPOSALS[0].text, accountId: "you", accountLabel: label, proposals: seed(), contexts: INITIAL_CONTEXTS, now: 1 });
  assert.equal(v.kind, "diterima");
  if (v.kind === "diterima") assert.equal(v.proposal.status, "ditandai");
});

test("konteks tanpa sumber ditolak, berita wajib URL", () => {
  const a = buildContext({ statement: "Pompa air di rumah pompa utama rusak sejak awal tahun ini.", sourceType: "data", sourceRef: "", addedBy: "x" });
  assert.equal(a.ok, false);
  const b = buildContext({ statement: "Pompa air di rumah pompa utama rusak sejak awal tahun ini.", sourceType: "berita", sourceRef: "koran kemarin", addedBy: "x" });
  assert.equal(b.ok, false);
  const c = buildContext({ statement: "Pompa air di rumah pompa utama rusak sejak awal tahun ini.", sourceType: "narasumber", sourceRef: "Operator rumah pompa", addedBy: "x" });
  assert.ok(c.ok && c.context.level === 0);
});

test("titik berdekatan dipisah ke lajur berbeda", () => {
  const lanes = assignLanes([{ id: "x", score: 50 }, { id: "y", score: 52 }, { id: "z", score: 80 }]);
  assert.notEqual(lanes.x, lanes.y);
  assert.equal(lanes.z, 0);
});

test("usulan keempat dari akun yang sama ditolak AF-02", () => {
  const ps = seed();
  const texts = [
    "Bongkar bangunan di atas saluran Jl. Melati dan lebarkan drainase menjadi 2 m dalam 4 bulan oleh Dinas PUPR.",
    "Tambah jadwal angkut sampah menjadi 3 kali seminggu dan pasang saringan di pintu air yang dirawat RW 05.",
    "Wajibkan pengembang perumahan membangun sumur resapan dan kolam retensi, diawasi kelurahan setiap 6 bulan.",
  ];
  for (const t of texts) {
    const v = evaluateSubmission({ text: t, accountId: "you", accountLabel: label, proposals: ps, contexts: INITIAL_CONTEXTS, now: 1 });
    assert.equal(v.kind, "diterima");
    if (v.kind === "diterima") ps.push(v.proposal);
  }
  const fourth = evaluateSubmission({ text: "Latih karang taruna memantau tinggi air di 4 titik dan laporkan ke BPBD setiap hari selama musim hujan.", accountId: "you", accountLabel: label, proposals: ps, contexts: INITIAL_CONTEXTS, now: 2 });
  assert.equal(fourth.kind, "ditolak");
  if (fourth.kind === "ditolak") assert.match(fourth.rule, /AF-02/);
});

test("verifikasi berlapis: AI, pemilik berkas, saksi", () => {
  const ragu = { aiCheck: { status: "ragu" as const, note: "" }, witnesses: 0, ownerConfirmed: false };
  assert.equal(deriveLevel(ragu), 0);
  assert.equal(canOwnerConfirm(ragu), true);
  assert.equal(deriveLevel({ ...ragu, ownerConfirmed: true }), 1);
  assert.equal(deriveLevel({ ...ragu, aiCheck: { status: "cocok", note: "" } }), 2);
  assert.equal(deriveLevel({ ...ragu, witnesses: 2 }), 3);
});

test("pemilik berkas tidak bisa mengesampingkan temuan AI bertentangan", () => {
  const konflik = { aiCheck: { status: "bertentangan" as const, note: "" }, witnesses: 0, ownerConfirmed: false };
  assert.equal(canOwnerConfirm(konflik), false);
  assert.equal(deriveLevel({ ...konflik, ownerConfirmed: true }), 0);
  assert.equal(deriveLevel({ ...konflik, witnesses: 2 }), 3);
});

test("URL berita dicek AI, dokumen tanpa unggahan memicu peringatan", () => {
  const a = buildContext({ statement: "Pompa air di rumah pompa utama rusak sejak awal tahun ini.", sourceType: "berita", sourceRef: "https://contoh.id/pompa", addedBy: "x" });
  assert.ok(a.ok && a.context.level === 2 && a.context.aiCheck.status === "cocok");
  const b = buildContext({ statement: "Pompa air di rumah pompa utama rusak sejak awal tahun ini.", sourceType: "dokumen", sourceRef: "Surat dinas no 12/2026", addedBy: "x" });
  assert.ok(b.ok && b.context.level === 0 && b.context.aiCheck.status === "gagal_akses");
});

test("id konteks baru tidak bentrok dengan konteks awal", () => {
  const ids = new Set(INITIAL_CONTEXTS.map((c) => c.id));
  for (let i = 0; i < 5; i++) {
    const r = buildContext({ statement: "Pompa air di rumah pompa utama rusak sejak awal tahun ini.", sourceType: "data", sourceRef: "https://contoh.id/x", addedBy: "x" });
    assert.ok(r.ok && !ids.has(r.context.id));
    if (r.ok) ids.add(r.context.id);
  }
});
