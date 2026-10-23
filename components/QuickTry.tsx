"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ACCOUNTS, INITIAL_CONTEXTS, PROBLEM, QUICK_EXAMPLES, SEED_PROPOSALS } from "@/lib/sim/data.ts";
import { LIMITS, assignLanes, evaluateSubmission } from "@/lib/sim/engine.ts";
import type { Proposal } from "@/lib/sim/types.ts";

// Versi "coba" yang paling sederhana: tulis usulan, lihat nilainya dan alasannya.

const QUESTIONS: { key: keyof Proposal["rubric"]; label: string; max: number }[] = [
  { key: "akarMasalah", label: "Menjawab penyebab masalah", max: 35 },
  { key: "kelayakan", label: "Bisa benar-benar dijalankan", max: 25 },
  { key: "spesifik", label: "Jelas siapa, kapan, dan berapa", max: 20 },
  { key: "risiko", label: "Memikirkan risiko dan biaya", max: 20 },
];

const EXAMPLE_ASAL =
  "Pokoknya pemerintah dan semua pihak harus bertindak cepat dan tegas supaya kebakaran hutan tidak terjadi lagi di tahun depan.";

const PLAIN_RULE: Record<string, string> = {
  "AF-00": "Usulannya terlalu pendek. Tulis minimal satu atau dua kalimat: apa yang dilakukan, dan oleh siapa.",
  "AF-01": "Anda sudah mengirim usulan yang hampir sama. Mengirim berkali-kali tidak menambah nilai.",
  "AF-02": "Batas 3 usulan per orang untuk satu masalah sudah tercapai. Tekan \"Ulangi\" untuk mencoba lagi.",
  "AF-04": "Usulan ini berisi perintah ke AI supaya diberi nilai tinggi. Usulan ditahan untuk diperiksa admin dan tidak dinilai.",
};

const labelOf = (id: string) => (id === "you" ? "Anda" : ACCOUNTS.find((a) => a.id === id)?.label.replace("Akun simulasi ", "Orang ") ?? id);
const initialsOf = (id: string) => (id === "you" ? "Anda" : id.toUpperCase());

function verdictLabel(score: number) {
  if (score >= 70) return { text: "Dekat dengan solusi", tone: "ok" as const };
  if (score >= 35) return { text: "Di tengah", tone: "warn" as const };
  return { text: "Jauh dari solusi", tone: "danger" as const };
}

function seed(): Proposal[] {
  const out: Proposal[] = [];
  for (const s of SEED_PROPOSALS) {
    const v = evaluateSubmission({ text: s.text, accountId: s.accountId, accountLabel: labelOf, proposals: out, contexts: INITIAL_CONTEXTS, now: 0 });
    if (v.kind === "diterima") out.push(v.proposal);
  }
  return out;
}

type Message = { tone: "ok" | "warn" | "danger"; title: string; body: string } | null;

export function QuickTry() {
  const [proposals, setProposals] = useState<Proposal[]>(seed);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !draft.trim()) return;
    const text = draft;
    setPending(true);
    setMessage(null);
    timer.current = setTimeout(() => {
      setPending(false);
      const v = evaluateSubmission({ text, accountId: "you", accountLabel: labelOf, proposals, contexts: INITIAL_CONTEXTS, now: Date.now() });
      if (v.kind !== "diterima") {
        const code = v.rule.slice(0, 5);
        setMessage({
          tone: "danger",
          title: v.kind === "dikarantina" ? "Ditahan, tidak dinilai" : "Tidak bisa dikirim",
          body: PLAIN_RULE[code] ?? v.message,
        });
        return;
      }
      const p = v.proposal;
      setProposals((ps) => [...ps, p]);
      setSelectedId(p.id);
      setDraft("");
      if (p.status === "ditandai") {
        setMessage({
          tone: "warn",
          title: "Ketahuan menyontek",
          body: "Usulan ini hampir sama dengan usulan orang lain yang masuk lebih dulu. Ditandai dan tidak masuk garis.",
        });
      } else if (p.flags.length > 0) {
        setMessage({
          tone: "warn",
          title: `Nilai ${p.score}, dipotong`,
          body: "Usulan ini hanya mengulang kata kunci tanpa langkah nyata, jadi nilainya dipotong.",
        });
      } else {
        const vl = verdictLabel(p.score);
        setMessage({ tone: vl.tone, title: `Nilai Anda ${p.score} dari 100: ${vl.text.toLowerCase()}`, body: "Titik \"Anda\" sudah muncul di garis. Lihat alasannya di bawah." });
      }
    }, 900);
  }

  function fill(text: string) {
    setDraft(text);
    textRef.current?.focus();
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setProposals(seed());
    setDraft("");
    setPending(false);
    setMessage(null);
    setSelectedId(null);
  }

  const placed = proposals.filter((p) => p.status === "dinilai");
  const lanes = useMemo(() => assignLanes(placed.map((p) => ({ id: p.id, score: p.score })), 15), [placed]);
  const laneCount = Math.max(1, ...Object.values(lanes).map((l) => l + 1));
  const selected = proposals.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="qt">
      <div className="qt-problem">
        <span className="qt-tag">Masalah</span>
        <p className="qt-title">{PROBLEM.title}</p>
        <p className="qt-sub">
          Sudah ada {INITIAL_CONTEXTS.length} fakta bersumber dan {SEED_PROPOSALS.length} usulan dari orang lain. Sekarang giliran Anda.
        </p>
      </div>

      <form className="qt-form" onSubmit={submit}>
        <label htmlFor="qt-draft" className="qt-label">
          Apa usulan Anda untuk mengatasi karhutla?
        </label>
        <textarea
          id="qt-draft"
          ref={textRef}
          className="textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={LIMITS.maxChars}
          placeholder="Tulis apa yang harus dilakukan, oleh siapa, kapan, dan apa risikonya."
        />
        <div className="qt-examples">
          <span>Belum ada ide? Pakai contoh:</span>
          <div className="chips">
            <button type="button" className="chip" onClick={() => fill(QUICK_EXAMPLES.kuat)}>
              Usulan yang matang
            </button>
            <button type="button" className="chip" onClick={() => fill(EXAMPLE_ASAL)}>
              Usulan asal-asalan
            </button>
            <button type="button" className="chip" onClick={() => fill(QUICK_EXAMPLES.injeksi)}>
              Coba curangi AI
            </button>
          </div>
        </div>
        <div className="qt-actions">
          <button type="submit" className="btn btn-primary" disabled={pending || !draft.trim()}>
            {pending ? "AI sedang menilai..." : "Kirim dan lihat nilainya"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            Ulangi
          </button>
        </div>
        {pending && (
          <div className="loading" role="status">
            <span>AI membandingkan usulan Anda dengan {INITIAL_CONTEXTS.length} fakta</span>
            <span className="bar" aria-hidden="true" />
          </div>
        )}
        {!pending && message && (
          <div className="notice" data-tone={message.tone} role="status">
            <strong>{message.title}</strong>
            {message.body}
          </div>
        )}
      </form>

      <div className="qt-line">
        <div className="scale-labels qt-ends">
          <span>Jauh dari solusi</span>
          <span>Dekat dengan solusi</span>
        </div>
        <div className="scale-track" aria-hidden="true" />
        <div className="scale-field" style={{ height: laneCount * 40 + 8, marginTop: 10 }} role="group" aria-label="Posisi setiap usulan">
          {placed.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`scale-dot${p.accountId === "you" ? " qt-you" : ""}`}
              data-you={p.accountId === "you" ? "true" : undefined}
              aria-pressed={selectedId === p.id}
              aria-label={`${labelOf(p.accountId)}, nilai ${p.score}. Lihat alasannya.`}
              style={{ left: `${p.score}%`, top: (lanes[p.id] ?? 0) * 40 }}
              onClick={() => setSelectedId(p.id)}
            >
              {initialsOf(p.accountId)}
            </button>
          ))}
        </div>
        <p className="qt-hint">Ketuk titik mana pun untuk melihat isi usulan dan alasan nilainya.</p>
      </div>

      {selected ? (
        <div className="qt-result" aria-live="polite">
          <div className="qt-result-head">
            <div>
              <span className="qt-who">{selected.accountId === "you" ? "Usulan Anda" : `Usulan ${labelOf(selected.accountId)}`}</span>
              <span className={`qt-verdict ${verdictLabel(selected.score).tone}`}>{verdictLabel(selected.score).text}</span>
            </div>
            <div className="score-big">
              {selected.score}
              <small>/100</small>
            </div>
          </div>
          <blockquote>{selected.text}</blockquote>
          <ul className="qt-checks">
            {QUESTIONS.map((q) => {
              const ok = selected.rubric[q.key] / q.max >= 0.6;
              return (
                <li key={q.key} data-ok={ok}>
                  <span className="qt-mark" aria-hidden="true">
                    {ok ? "✓" : "✗"}
                  </span>
                  <span>
                    {q.label}
                    <span className="visually-hidden">{ok ? ": ya" : ": belum"}</span>
                  </span>
                  <span className="mono">
                    {selected.rubric[q.key]}/{q.max}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="empty">Belum ada usulan yang dipilih. Kirim usulan Anda, atau ketuk salah satu titik di garis.</div>
      )}
    </div>
  );
}
