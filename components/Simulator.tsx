"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ACCOUNTS,
  INITIAL_CONTEXTS,
  LEVEL_LABEL,
  PROBLEM,
  QUICK_EXAMPLES,
  SEED_PROPOSALS,
  SOURCE_LABEL,
} from "@/lib/sim/data.ts";
import { LIMITS, assignLanes, buildContext, evaluateSubmission } from "@/lib/sim/engine.ts";
import type { ContextItem, EvidenceLevel, Proposal, SourceType } from "@/lib/sim/types.ts";

type Phase = "konteks" | "usulan";
type Tone = "ok" | "warn" | "danger" | "info";
interface LogEntry {
  id: number;
  time: string;
  tone: Tone;
  tag: string;
  text: string;
}
interface Notice {
  tone: Tone;
  title: string;
  body: string;
}

const RUBRIC_ROWS: { key: keyof Proposal["rubric"]; label: string; max: number }[] = [
  { key: "akarMasalah", label: "Menyentuh akar masalah", max: 35 },
  { key: "kelayakan", label: "Bisa dijalankan", max: 25 },
  { key: "spesifik", label: "Spesifik & terukur", max: 20 },
  { key: "risiko", label: "Membahas risiko & biaya", max: 20 },
];

const accountOf = (id: string) => ACCOUNTS.find((a) => a.id === id)!;
const labelOf = (id: string) => accountOf(id).label;

function clock() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LevelBars({ level }: { level: EvidenceLevel }) {
  return (
    <span className="level-bars" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <i key={n} data-on={level >= n} />
      ))}
    </span>
  );
}

export function Simulator() {
  const [contexts, setContexts] = useState<ContextItem[]>(INITIAL_CONTEXTS);
  const [phase, setPhase] = useState<Phase>("konteks");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logId = useRef(0);

  // form konteks
  const [ctxStatement, setCtxStatement] = useState("");
  const [ctxType, setCtxType] = useState<SourceType>("berita");
  const [ctxRef, setCtxRef] = useState("");
  const [ctxErrors, setCtxErrors] = useState<Partial<Record<"statement" | "sourceRef", string>>>({});
  const [ctxNotice, setCtxNotice] = useState<Notice | null>(null);

  // form usulan
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function addLog(tone: Tone, tag: string, text: string) {
    logId.current += 1;
    const entry = { id: logId.current, time: clock(), tone, tag, text };
    setLog((l) => [entry, ...l].slice(0, 12));
  }

  function submitContext(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "konteks") return;
    const res = buildContext({ statement: ctxStatement, sourceType: ctxType, sourceRef: ctxRef, addedBy: "Anda" });
    if (!res.ok) {
      setCtxErrors(res.errors);
      setCtxNotice(null);
      addLog("danger", "Konteks ditolak", Object.values(res.errors).join(" "));
      return;
    }
    setContexts((c) => [...c, res.context]);
    setCtxErrors({});
    setCtxStatement("");
    setCtxRef("");
    setCtxNotice({
      tone: res.context.level === 0 ? "warn" : "ok",
      title: `Konteks [${contexts.length + 1}] ditambahkan`,
      body:
        res.context.level === 0
          ? "Tingkat bukti: klaim belum diverifikasi. Bobotnya setengah sampai narasumber terverifikasi."
          : `Tingkat bukti: ${LEVEL_LABEL[res.context.level].toLowerCase()}.`,
    });
    addLog("ok", "Konteks masuk", `[${contexts.length + 1}] dari ${SOURCE_LABEL[ctxType].toLowerCase()}, ${LEVEL_LABEL[res.context.level].toLowerCase()}.`);
  }

  function openProposals() {
    setPhase("usulan");
    setCtxNotice(null);
    const seeded: Proposal[] = [];
    for (const s of SEED_PROPOSALS) {
      const v = evaluateSubmission({
        text: s.text,
        accountId: s.accountId,
        accountLabel: labelOf,
        proposals: seeded,
        contexts,
        now: Date.now(),
      });
      if (v.kind === "diterima") seeded.push(v.proposal);
    }
    setProposals(seeded);
    addLog("info", "Fase berganti", `Konteks dikunci (${contexts.length} butir). Usulan dibuka, ${seeded.length} usulan akun simulasi masuk.`);
  }

  function submitProposal(e: React.FormEvent) {
    e.preventDefault();
    if (pending || phase !== "usulan") return;
    const text = draft;
    setPending(true);
    setNotice(null);
    // Jeda singkat meniru waktu penilaian model.
    timer.current = setTimeout(() => {
      const v = evaluateSubmission({
        text,
        accountId: "you",
        accountLabel: labelOf,
        proposals,
        contexts,
        now: Date.now(),
      });
      setPending(false);
      if (v.kind === "ditolak") {
        setNotice({ tone: "danger", title: `Ditolak: ${v.rule}`, body: v.message });
        addLog("danger", "Ditolak", `${v.rule}. ${v.message}`);
        return;
      }
      if (v.kind === "dikarantina") {
        setNotice({ tone: "danger", title: `Dikarantina: ${v.rule}`, body: v.message });
        addLog("danger", "Karantina", `${v.rule}. Usulan disimpan untuk moderator, tidak dinilai.`);
        return;
      }
      const p = v.proposal;
      setProposals((ps) => [...ps, p]);
      setSelectedId(p.id);
      setDraft("");
      if (p.status === "ditandai") {
        setNotice({ tone: "warn", title: "Diterima, tetapi ditandai", body: p.flags[p.flags.length - 1] });
        addLog("warn", "Ditandai", p.flags[p.flags.length - 1]);
      } else if (p.flags.length > 0) {
        setNotice({ tone: "warn", title: `Dinilai dengan penalti: ${p.score} dari 100`, body: p.flags.join(" ") });
        addLog("warn", "Penalti", `Usulan Anda mendapat ${p.score}/100. ${p.flags.join(" ")}`);
      } else {
        setNotice({ tone: "ok", title: `Dinilai: ${p.score} dari 100`, body: "Titik Anda (warna kuningan) sudah masuk garis. Pilih titik mana pun untuk melihat alasannya." });
        addLog("ok", "Dinilai", `Usulan Anda mendapat ${p.score}/100.${p.flags.length ? " " + p.flags.join(" ") : ""}`);
      }
    }, 900);
  }

  function prefill(kind: "kuat" | "duplikat" | "jiplak" | "injeksi" | "spam") {
    if (kind === "duplikat") {
      const mine = [...proposals].reverse().find((p) => p.accountId === "you");
      setDraft(mine ? mine.text : QUICK_EXAMPLES.kuat);
      if (!mine) {
        setNotice({ tone: "info", title: "Kirim usulan dulu", body: "Belum ada usulan Anda. Kirim contoh ini sekali, lalu tekan \"Coba kirim ulang\" lagi untuk melihat penolakan duplikat." });
      }
    } else if (kind === "jiplak") {
      setDraft(SEED_PROPOSALS[0].text);
    } else {
      setDraft(QUICK_EXAMPLES[kind]);
    }
    textareaRef.current?.focus();
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setContexts(INITIAL_CONTEXTS);
    setPhase("konteks");
    setProposals([]);
    setSelectedId(null);
    setDraft("");
    setPending(false);
    setNotice(null);
    setCtxNotice(null);
    setCtxErrors({});
    setCtxStatement("");
    setCtxRef("");
    addLog("info", "Ulang", "Simulasi dikembalikan ke awal.");
  }

  const placed = proposals.filter((p) => p.status === "dinilai");
  const flagged = proposals.filter((p) => p.status === "ditandai");
  const lanes = useMemo(() => assignLanes(placed.map((p) => ({ id: p.id, score: p.score }))), [placed]);
  const laneCount = Math.max(1, ...Object.values(lanes).map((l) => l + 1));
  const selected = proposals.find((p) => p.id === selectedId) ?? null;
  const myCount = proposals.filter((p) => p.accountId === "you").length;

  return (
    <div>
      <ol className="phase-bar" aria-label="Tahap berkas">
        <li data-state="done">
          <span className="n">01</span>Masalah
        </li>
        <li data-state={phase === "konteks" ? "active" : "done"} aria-current={phase === "konteks" ? "step" : undefined}>
          <span className="n">02</span>Konteks
        </li>
        <li data-state={phase === "usulan" ? "active" : "todo"} aria-current={phase === "usulan" ? "step" : undefined}>
          <span className="n">03</span>Usulan
        </li>
      </ol>

      <div className="sim">
        {/* ---------- kolom kiri: berkas ---------- */}
        <section className="panel" aria-labelledby="berkas-title">
          <div className="panel-title">
            <h3 id="berkas-title">{PROBLEM.title}</h3>
            <span className="mono step-no">{PROBLEM.number}</span>
          </div>
          <p className="problem-body">{PROBLEM.body}</p>
          <div className="meta-row">
            <span>Pemilik berkas: {PROBLEM.owner}</span>
            <span>Usulan: terbuka untuk publik</span>
          </div>

          <ol className="ctx-list" aria-label="Konteks bersumber">
            {contexts.map((c, i) => (
              <li key={c.id}>
                <span className="cite">[{i + 1}]</span>
                <div>
                  <p className="ctx-statement">{c.statement}</p>
                  <p className="ctx-source">
                    {SOURCE_LABEL[c.sourceType]}: {c.sourceRef}
                  </p>
                  <span className="level">
                    <LevelBars level={c.level} />
                    {LEVEL_LABEL[c.level]} · ditambahkan {c.addedBy}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          {phase === "konteks" ? (
            <form className="form" onSubmit={submitContext} noValidate aria-labelledby="ctx-form-title">
              <h4 id="ctx-form-title" style={{ fontSize: "1.125rem" }}>
                Tambah konteks
              </h4>
              <div className="field">
                <label htmlFor="ctx-statement">Pernyataan</label>
                <textarea
                  id="ctx-statement"
                  className="textarea"
                  style={{ minHeight: 88 }}
                  value={ctxStatement}
                  onChange={(e) => setCtxStatement(e.target.value)}
                  placeholder="Contoh: Pompa air di rumah pompa utama rusak sejak Januari."
                  aria-invalid={!!ctxErrors.statement}
                  aria-describedby={ctxErrors.statement ? "ctx-statement-err" : undefined}
                  maxLength={400}
                />
                {ctxErrors.statement && (
                  <span id="ctx-statement-err" className="error-text">
                    {ctxErrors.statement}
                  </span>
                )}
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="ctx-type">Jenis sumber</label>
                  <select id="ctx-type" className="select" value={ctxType} onChange={(e) => setCtxType(e.target.value as SourceType)}>
                    {(Object.keys(SOURCE_LABEL) as SourceType[]).map((k) => (
                      <option key={k} value={k}>
                        {SOURCE_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="ctx-ref">Rujukan sumber (wajib)</label>
                  <input
                    id="ctx-ref"
                    className="input"
                    value={ctxRef}
                    onChange={(e) => setCtxRef(e.target.value)}
                    placeholder={ctxType === "berita" ? "https://..." : ctxType === "narasumber" ? "Nama dan peran narasumber" : "Judul dokumen, halaman"}
                    aria-invalid={!!ctxErrors.sourceRef}
                    aria-describedby={ctxErrors.sourceRef ? "ctx-ref-err" : undefined}
                    maxLength={200}
                  />
                  {ctxErrors.sourceRef && (
                    <span id="ctx-ref-err" className="error-text">
                      {ctxErrors.sourceRef}
                    </span>
                  )}
                </div>
              </div>
              {ctxNotice && (
                <div className="notice" data-tone={ctxNotice.tone} role="status">
                  <strong>{ctxNotice.title}</strong>
                  {ctxNotice.body}
                </div>
              )}
              <div className="hero-cta" style={{ marginTop: 0 }}>
                <button type="submit" className="btn btn-ghost">
                  Lampirkan konteks
                </button>
                <button type="button" className="btn btn-primary" onClick={openProposals}>
                  Kunci konteks, buka usulan
                </button>
              </div>
            </form>
          ) : (
            <div className="notice" style={{ marginTop: 20 }}>
              <strong>Konteks dikunci</strong>
              Selama fase usulan, konteks tidak bisa ditambah. Ini mencegah orang menambah konteks setelah melihat usulan mana yang ingin dimenangkan.
            </div>
          )}
        </section>

        {/* ---------- kolom kanan: usulan & garis ---------- */}
        <section className="panel" aria-labelledby="usulan-title">
          <div className="panel-title">
            <h3 id="usulan-title">Usulan & garis penilaian</h3>
            <button type="button" className="btn btn-ghost btn-small" onClick={reset}>
              Ulang simulasi
            </button>
          </div>

          <div className="scale">
            <div className="scale-labels">
              <span>Jauh dari solusi masalah + konteks</span>
              <span>Dekat dengan solusi masalah + konteks</span>
            </div>
            <div className="scale-track" aria-hidden="true" />
            <div className="scale-ticks" aria-hidden="true">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
            {placed.length === 0 ? (
              <div className="empty" style={{ marginTop: 12 }}>
                {phase === "konteks"
                  ? "Belum ada usulan. Garis terisi setelah fase konteks dikunci dan usulan dibuka."
                  : "Belum ada usulan yang lolos penilaian."}
              </div>
            ) : (
              <div className="scale-field" style={{ height: laneCount * 38 + 8, marginTop: 10 }} role="group" aria-label="Titik usulan pada garis">
                {placed.map((p) => {
                  const acc = accountOf(p.accountId);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="scale-dot"
                      data-you={acc.isYou ? "true" : undefined}
                      aria-pressed={selectedId === p.id}
                      aria-label={`${acc.label}, skor ${p.score} dari 100. Lihat alasan.`}
                      title={`${acc.label}: ${p.score}`}
                      style={{ left: `${p.score}%`, top: (lanes[p.id] ?? 0) * 38 }}
                      onClick={() => setSelectedId(p.id)}
                    >
                      {acc.initials}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {flagged.length > 0 && (
            <div className="notice" data-tone="warn" style={{ marginTop: 12 }}>
              <strong>Ditandai, menunggu tinjauan ({flagged.length})</strong>
              <div className="chips" style={{ marginTop: 8 }}>
                {flagged.map((p) => (
                  <button key={p.id} type="button" className="chip" onClick={() => setSelectedId(p.id)}>
                    Lihat usulan {labelOf(p.accountId)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "usulan" ? (
            <form className="form" onSubmit={submitProposal} aria-labelledby="draft-label">
              <div className="field">
                <label id="draft-label" htmlFor="draft">
                  Tulis usulan sebagai &ldquo;Anda&rdquo;
                </label>
                <span className="hint">
                  Batas {LIMITS.maxActivePerAccount} usulan per akun. Terpakai: {myCount}.
                </span>
                <textarea
                  id="draft"
                  ref={textareaRef}
                  className="textarea"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={LIMITS.maxChars}
                  placeholder="Apa yang harus dilakukan, oleh siapa, kapan, dan apa risikonya?"
                />
                <span className="count mono">
                  {draft.length}/{LIMITS.maxChars}
                </span>
              </div>
              <div className="field">
                <span className="hint">Isi cepat untuk mencoba aturan:</span>
                <div className="chips">
                  <button type="button" className="chip" onClick={() => prefill("kuat")}>
                    Usulan lengkap
                  </button>
                  <button type="button" className="chip" onClick={() => prefill("duplikat")}>
                    Coba kirim ulang
                  </button>
                  <button type="button" className="chip" onClick={() => prefill("jiplak")}>
                    Jiplak usulan Akun A
                  </button>
                  <button type="button" className="chip" onClick={() => prefill("injeksi")}>
                    Perintah ke penilai
                  </button>
                  <button type="button" className="chip" onClick={() => prefill("spam")}>
                    Tumpuk kata kunci
                  </button>
                </div>
              </div>
              {pending ? (
                <div className="loading" role="status">
                  <span>Menilai terhadap {contexts.length} konteks</span>
                  <span className="bar" aria-hidden="true" />
                </div>
              ) : (
                notice && (
                  <div className="notice" data-tone={notice.tone} role="status">
                    <strong>{notice.title}</strong>
                    {notice.body}
                  </div>
                )
              )}
              <div>
                <button type="submit" className="btn btn-primary" disabled={pending || draft.trim().length === 0}>
                  {pending ? "Sedang dinilai" : "Kirim usulan untuk dinilai"}
                </button>
              </div>
            </form>
          ) : (
            <div className="notice" style={{ marginTop: 20 }}>
              <strong>Fase usulan belum dibuka</strong>
              Tambahkan konteks bersumber di berkas, lalu tekan &ldquo;Kunci konteks, buka usulan&rdquo;.
            </div>
          )}

          {selected && (
            <div className="detail" aria-live="polite">
              <div className="detail-head">
                <div>
                  <div style={{ fontWeight: 600 }}>{labelOf(selected.accountId)}</div>
                  <div className="mono step-no">
                    {selected.status === "ditandai" ? "Ditandai, tidak masuk garis" : "Dinilai"}
                  </div>
                </div>
                <div className="score-big">
                  {selected.score}
                  <small>/100</small>
                </div>
              </div>
              <blockquote>{selected.text}</blockquote>
              <ul className="rubric">
                {RUBRIC_ROWS.map((r) => (
                  <li key={r.key}>
                    <span>{r.label}</span>
                    <span className="mono">
                      {selected.rubric[r.key]}/{r.max}
                    </span>
                    <span className="meter" aria-hidden="true">
                      <i style={{ width: `${(selected.rubric[r.key] / r.max) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="reasons">
                {selected.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
                {selected.flags.map((f) => (
                  <li key={f} style={{ color: "var(--oxblood)" }}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <details className="log-wrap" style={{ marginTop: 20 }}>
            <summary>Catatan audit ({log.length})</summary>
            {log.length === 0 ? (
              <p className="hint" style={{ color: "var(--ink-2)", fontSize: "0.875rem" }}>
                Belum ada kejadian. Setiap konteks, usulan, penolakan, dan karantina tercatat di sini.
              </p>
            ) : (
              <ul className="log" aria-live="polite">
                {log.map((l) => (
                  <li key={l.id}>
                    <time className="mono">{l.time}</time>
                    <span>
                      <span className="tag" data-tone={l.tone}>
                        {l.tag}.
                      </span>{" "}
                      {l.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </details>
        </section>
      </div>
      <p style={{ marginTop: 16, color: "var(--ink-2)", fontSize: "0.875rem" }}>
        Simulasi berjalan di browser Anda dengan penilai heuristik, bukan model AI. Semua data, akun, dan sumber di atas fiktif.
      </p>
    </div>
  );
}
