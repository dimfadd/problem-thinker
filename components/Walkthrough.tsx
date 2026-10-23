"use client";

import { useEffect, useRef, useState } from "react";
import { INITIAL_CONTEXTS, SEED_PROPOSALS } from "@/lib/sim/data.ts";
import { scoreProposal } from "@/lib/sim/engine.ts";

// Tur animasi 5 langkah dengan bahasa sehari-hari.
// Berjalan sendiri saat terlihat di layar, bisa dijeda dan dipilih per langkah.

const FACTS: Record<string, { text: string; src: string }> = {
  k1: { text: "99% kebakaran terjadi karena ulah manusia", src: "Sekretariat Kabinet" },
  k2: { text: "20 lahan perusahaan asing disegel, 5 jadi tersangka", src: "Bisnis.com" },
  k3: { text: "Perusahaan asing sengaja membakar hutan", src: "Unggahan media sosial" },
  k4: { text: "Bantuan pusat menunggu status darurat dari daerah", src: "Antara" },
  k5: { text: "Pengadilan mewajibkan negara mengevaluasi izin lahan", src: "Mongabay" },
};

const STEPS = [
  {
    title: "Ada masalah",
    body: "Pemerintah, perusahaan, atau organisasi menuliskan satu masalah. Contohnya: kebakaran hutan yang terjadi setiap tahun.",
    ms: 5500,
  },
  {
    title: "Orang menambahkan fakta, wajib dengan sumber",
    body: "Setiap fakta harus menyebut dari mana asalnya: berita, dokumen, atau saksi. Tanpa sumber, fakta tidak bisa ditambahkan.",
    ms: 7000,
  },
  {
    title: "AI mengecek sumbernya",
    body: "AI membuka setiap sumber. Satu unggahan media sosial bilang perusahaan asing \"sengaja\" membakar, padahal berita resmi baru menyebut tersangka. AI memberi tanda peringatan.",
    ms: 9000,
  },
  {
    title: "Orang mengirim usulan, AI menilai",
    body: "Siapa saja yang diizinkan boleh mengusulkan solusi. AI menilai setiap usulan dengan 4 pertanyaan yang sama, lalu menaruhnya di garis.",
    ms: 9000,
  },
  {
    title: "Terlihat mana yang paling dekat dengan solusi",
    body: "Merah berarti jauh dari solusi, hijau berarti dekat. Setiap nilai ada alasannya. Keputusan akhir tetap di tangan manusia.",
    ms: 11000,
  },
];

const PLAIN_REASON: Record<string, string[]> = {
  d: ["Menyalahkan pihak asing berdasarkan klaim yang belum terbukti.", "Tidak ada langkah yang bisa dijalankan."],
  a: ["Menjawab penyebab utama: pembakaran lahan, izin perusahaan, dan bantuan yang terlambat.", "Jelas siapa melakukan apa dan kapan, serta memikirkan risikonya."],
};

const SHORT_PROPOSAL: Record<string, string> = {
  a: "Status darurat otomatis saat titik api muncul, audit izin perusahaan dalam 12 bulan, dan bantu petani membuka lahan tanpa membakar.",
  b: "Cabut izin perusahaan yang lahannya terbakar 2 tahun berturut-turut.",
  c: "Tambah patroli dan helikopter pemadam setiap kemarau.",
  d: "Usir semua perusahaan asing dari Indonesia.",
  e: "Pemerintah harus lebih tegas.",
};

const SCORED = SEED_PROPOSALS.map((p) => ({ ...p, ...scoreProposal(p.text, INITIAL_CONTEXTS) }));
const ARRIVAL = [...SCORED].sort((a, b) => a.score - b.score);
const BEST = SCORED.find((p) => p.accountId === "a")!;
const RED = SCORED.find((p) => p.accountId === "d")!;

const QUESTIONS: { key: keyof (typeof SCORED)[number]["rubric"]; label: string; max: number }[] = [
  { key: "akarMasalah", label: "Menjawab penyebab masalah?", max: 35 },
  { key: "kelayakan", label: "Bisa dijalankan?", max: 25 },
  { key: "spesifik", label: "Jelas siapa, kapan, berapa?", max: 20 },
  { key: "risiko", label: "Memikirkan risikonya?", max: 20 },
];

export function Walkthrough() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const touched = useRef(false);
  const remaining = useRef(STEPS[0].ms);
  const stageRef = useRef<HTMLDivElement>(null);
  const last = STEPS.length - 1;

  // Mulai otomatis saat panggung terlihat, kecuali pengguna memilih gerak minimal.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (touched.current) return;
        setPlaying(entry.isIntersecting && entry.intersectionRatio >= 0.3);
      },
      { threshold: [0, 0.3] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    remaining.current = STEPS[step].ms;
  }, [step]);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const t = setTimeout(() => {
      if (step < last) setStep((s) => s + 1);
      else setPlaying(false);
    }, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current = Math.max(0, remaining.current - (performance.now() - start));
    };
  }, [playing, step, last]);

  function go(n: number) {
    touched.current = true;
    setStep(Math.max(0, Math.min(last, n)));
  }

  function togglePlay() {
    touched.current = true;
    if (!playing && step === last) {
      setStep(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  }

  const facts = INITIAL_CONTEXTS.filter((c) => c.id !== "k3" || step >= 2);
  const s = STEPS[step];

  return (
    <div className="tour">
      {/* ---------- panggung ---------- */}
      <div className="tour-stage" aria-hidden="true" ref={stageRef}>
        <div className="dossier tour-dossier">
          <div className="tour-problem">
            <span className="qt-tag">Masalah</span>
            <h3>Kebakaran hutan dan lahan terjadi setiap kemarau</h3>
            {step === 0 && (
              <p className="tour-body enter" style={{ animationDelay: "0.4s" }}>
                Asapnya mengganggu jutaan orang. Bank Dunia memperkirakan kerugian 2019 sekitar US$5,2 miliar. Apa solusi
                terbaiknya?
              </p>
            )}
          </div>

          {(step === 1 || step === 2) && (
            <ol className="tour-facts">
              {facts.map((c, i) => {
                const late = c.id === "k3";
                const flagged = c.aiCheck.status !== "cocok";
                return (
                  <li
                    key={c.id}
                    className={`enter${step === 2 ? " scanning" : ""}`}
                    style={{ animationDelay: `${late ? 2.8 : step === 1 ? i * 0.5 : 0}s`, ["--scan-delay" as string]: `${i * 0.55}s` }}
                  >
                    <span className="tour-fact-text">
                      {FACTS[c.id].text}
                      <span className="src">Sumber: {FACTS[c.id].src}</span>
                    </span>
                    {step === 2 && (
                      <span
                        className={`tour-badge enter ${flagged ? "danger" : "ok"}`}
                        style={{ animationDelay: `${late ? 3.6 : 0.6 + i * 0.55}s` }}
                      >
                        {flagged ? "Sumbernya tidak bilang begitu" : "✓ Sumber cocok"}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          {step >= 3 && (
            <div className="scale tour-scale enter">
              <div className="scale-labels">
                <span>Jauh dari solusi</span>
                <span>Dekat dengan solusi</span>
              </div>
              <div className="scale-track" />
              <div className="scale-field" style={{ height: 44, marginTop: 10 }}>
                {ARRIVAL.map((p, i) => {
                  const hl = step === 4 && (p.accountId === "a" || p.accountId === "d");
                  return (
                    <span
                      key={p.accountId}
                      className={`scale-dot tour-dot${hl ? " hl" : ""}${step === 4 && !hl ? " dim" : ""}`}
                      style={{
                        ["--to" as string]: `${p.score}%`,
                        left: `${p.score}%`,
                        top: 0,
                        animationDelay: step === 3 ? `${0.5 + i * 0.9}s` : "0s",
                      }}
                    >
                      {p.accountId.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="tour-scorecard enter" style={{ animationDelay: `${0.5 + (ARRIVAL.length - 1) * 0.9}s` }}>
              <div className="tour-scorecard-head">
                <span>Usulan A dinilai AI</span>
                <span className="mono">{BEST.score}/100</span>
              </div>
              <p className="tour-quote">&ldquo;{SHORT_PROPOSAL.a}&rdquo;</p>
              <ul>
                {QUESTIONS.map((q, i) => (
                  <li key={q.key}>
                    <span>{q.label}</span>
                    <span className="mono">
                      {BEST.rubric[q.key]}/{q.max}
                    </span>
                    <span className="meter">
                      <i
                        style={{
                          width: `${(BEST.rubric[q.key] / q.max) * 100}%`,
                          animationDelay: `${0.5 + (ARRIVAL.length - 1) * 0.9 + 0.3 + i * 0.25}s`,
                        }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 4 && (
            <div className="tour-verdicts">
              {[RED, BEST].map((p, i) => (
                <div key={p.accountId} className={`tour-verdict enter ${i === 0 ? "red" : "green"}`} style={{ animationDelay: `${0.4 + i * 1.6}s` }}>
                  <div className="tour-scorecard-head">
                    <span>
                      Usulan {p.accountId.toUpperCase()} · {i === 0 ? "jauh dari solusi" : "dekat dengan solusi"}
                    </span>
                    <span className="mono">{p.score}/100</span>
                  </div>
                  <p className="tour-quote">&ldquo;{SHORT_PROPOSAL[p.accountId]}&rdquo;</p>
                  <ul>
                    {PLAIN_REASON[p.accountId].map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- narasi & kontrol ---------- */}
      <div className="tour-side">
        <div className="tour-controls">
          <button type="button" className="icon-btn" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Langkah sebelumnya">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <button type="button" className="btn btn-primary tour-play" onClick={togglePlay} aria-pressed={playing}>
            {playing ? "Jeda" : step === last ? "Putar ulang" : "Putar"}
          </button>
          <button type="button" className="icon-btn" onClick={() => go(step + 1)} disabled={step === last} aria-label="Langkah berikutnya">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <span className="tour-count">
            Langkah {step + 1} dari {STEPS.length}
          </span>
        </div>

        <ol className="tour-steps">
          {STEPS.map((st, i) => (
            <li key={st.title} data-state={i === step ? "active" : i < step ? "done" : "todo"}>
              <button type="button" onClick={() => go(i)} aria-current={i === step ? "step" : undefined}>
                <span className="tour-num">{i + 1}</span>
                <span>{st.title}</span>
              </button>
              {i === step && (
                <div className="tour-narr" aria-live="polite">
                  <p>{s.body}</p>
                  <span className="tour-progress" aria-hidden="true">
                    <i key={step} style={{ animationDuration: `${st.ms}ms`, animationPlayState: playing ? "running" : "paused" }} />
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
        {step === last && (
          <a className="btn btn-ghost" href="#coba" style={{ marginTop: 12 }}>
            Sekarang coba kirim usulan Anda
          </a>
        )}
      </div>
    </div>
  );
}
