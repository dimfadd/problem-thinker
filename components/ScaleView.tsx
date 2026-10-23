"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Tampilan garis penilaian saat usulan berjumlah ribuan.
// Tiga lapis: sebaran (histogram), gelembung klaster usulan mirip, dan penanda posisi Anda.
// Semua angka di sini data simulasi yang dibangkitkan dengan seed tetap.

interface Cluster {
  id: string;
  label: string;
  example: string;
  count: number;
  mean: number;
  sd: number;
}

const CLUSTERS: Cluster[] = [
  { id: "c1", label: "Pemerintah harus tegas", example: "Pemerintah harus lebih tegas dan serius menangani karhutla.", count: 341, mean: 5, sd: 3 },
  { id: "c2", label: "Usir perusahaan asing", example: "Usir semua perusahaan asing karena mereka yang sengaja membakar.", count: 286, mean: 13, sd: 5 },
  { id: "c3", label: "Tambah patroli & water bombing", example: "Tambah patroli Manggala Agni dan helikopter water bombing setiap kemarau.", count: 412, mean: 38, sd: 7 },
  { id: "c4", label: "Restorasi gambut & sekat kanal", example: "Bangun sekat kanal dan basahi kembali gambut yang dikeringkan.", count: 87, mean: 51, sd: 9 },
  { id: "c5", label: "Cabut izin konsesi terbakar", example: "Evaluasi dan cabut izin konsesi yang lahannya terbakar 2 tahun berturut-turut.", count: 198, mean: 59, sd: 8 },
  { id: "c6", label: "Buka lahan tanpa bakar", example: "Beri insentif dan alat pembukaan lahan tanpa bakar untuk petani di desa rawan.", count: 151, mean: 67, sd: 8 },
  { id: "c7", label: "Status darurat otomatis", example: "Status siaga darurat otomatis saat titik panas melewati ambang BMKG.", count: 64, mean: 75, sd: 6 },
  { id: "c8", label: "Paket lengkap pusat-daerah-konsesi", example: "Gabungan status darurat otomatis, audit izin, dan insentif tanpa bakar, dengan risiko dan tenggat.", count: 23, mean: 89, sd: 4 },
];

const YOUR_SCORE = 71;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate() {
  const rnd = mulberry32(20261023);
  const scores: number[] = [];
  const ranges: Record<string, [number, number]> = {};
  for (const c of CLUSTERS) {
    let lo = 100;
    let hi = 0;
    for (let i = 0; i < c.count; i++) {
      const u = Math.max(rnd(), 1e-9);
      const v = rnd();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      const s = Math.max(0, Math.min(100, Math.round(c.mean + z * c.sd)));
      scores.push(s);
      lo = Math.min(lo, s);
      hi = Math.max(hi, s);
    }
    ranges[c.id] = [lo, hi];
  }
  const bins = new Array(50).fill(0) as number[];
  for (const s of scores) bins[Math.min(49, Math.floor(s / 2))]++;
  const rank = scores.filter((s) => s > YOUR_SCORE).length + 1;
  return { total: scores.length, bins, ranges, rank };
}

const DATA = generate();
const fmt = (n: number) => n.toLocaleString("id-ID");

/** Tempatkan gelembung tanpa tumpang tindih: coba posisi vertikal dari tengah ke luar. */
function layout(width: number) {
  const maxR = width < 560 ? 26 : 38;
  const minR = width < 560 ? 14 : 14;
  const maxCount = Math.max(...CLUSTERS.map((c) => c.count));
  const placed: { id: string; x: number; y: number; r: number }[] = [];
  const order = [...CLUSTERS].sort((a, b) => b.count - a.count);
  for (const c of order) {
    const r = Math.max(minR, Math.sqrt(c.count / maxCount) * maxR);
    const x = Math.max(r, Math.min(width - r, (c.mean / 100) * width));
    let y = 0;
    for (let k = 0; k < 60; k++) {
      const off = Math.ceil(k / 2) * 6 * (k % 2 === 0 ? 1 : -1);
      const ok = placed.every((p) => Math.hypot(p.x - x, p.y - off) >= p.r + r + 3);
      if (ok) {
        y = off;
        break;
      }
    }
    placed.push({ id: c.id, x, y, r });
  }
  const top = Math.min(...placed.map((p) => p.y - p.r));
  const bottom = Math.max(...placed.map((p) => p.y + p.r));
  return { placed: placed.map((p) => ({ ...p, y: p.y - top })), height: bottom - top };
}

export function ScaleView() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<string>("c8");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lay = useMemo(() => (width > 0 ? layout(width) : null), [width]);
  const maxBin = Math.max(...DATA.bins);
  const sel = CLUSTERS.find((c) => c.id === selected)!;
  const [lo, hi] = DATA.ranges[sel.id];

  return (
    <div className="panel scaleview">
      <div className="panel-title">
        <h3>{fmt(DATA.total)} usulan untuk satu berkas</h3>
        <span className="mono step-no">Data simulasi</span>
      </div>

      <div ref={ref} className="sv-body">
        {/* lapis 1: sebaran */}
        <div className="sv-hist" aria-hidden="true">
          {DATA.bins.map((n, i) => (
            <span key={i} style={{ height: `${(n / maxBin) * 100}%` }} title={`Skor ${i * 2}-${i * 2 + 1}: ${n} usulan`} />
          ))}
          <i className="sv-you" style={{ left: `${YOUR_SCORE}%` }}>
            <b>Anda</b>
          </i>
        </div>
        <div className="scale-track" aria-hidden="true" />
        <div className="scale-ticks" aria-hidden="true">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>

        {/* lapis 2: klaster */}
        <div className="sv-bubbles" style={{ height: lay ? lay.height + 20 : 120 }} role="group" aria-label="Klaster usulan mirip">
          {lay?.placed.map((p) => {
            const c = CLUSTERS.find((x) => x.id === p.id)!;
            return (
              <button
                key={p.id}
                type="button"
                className="sv-bubble"
                aria-pressed={selected === p.id}
                aria-label={`${c.label}: ${c.count} usulan, rata-rata skor ${c.mean}`}
                style={{ left: p.x - p.r, top: p.y + 4, width: p.r * 2, height: p.r * 2, ["--pos" as string]: `${c.mean}%` }}
                onClick={() => setSelected(p.id)}
              >
                {p.r >= 16 ? fmt(c.count) : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* lapis 3: detail & posisi Anda */}
      <div className="sv-detail" aria-live="polite">
        <div>
          <div className="sv-detail-head">
            <strong>{sel.label}</strong>
            <span className="mono">
              {fmt(sel.count)} usulan · skor {lo} sampai {hi}
            </span>
          </div>
          <p className="tour-quote">Contoh isi: &ldquo;{sel.example}&rdquo;</p>
          <p className="hint" style={{ marginTop: 6, color: "var(--ink-2)", fontSize: "0.8125rem" }}>
            Setiap usulan di klaster ini tetap bisa dibuka satu per satu, lengkap dengan skor dan alasannya.
          </p>
        </div>
        <div className="sv-you-card">
          <span className="mono">Posisi Anda</span>
          <strong>
            {YOUR_SCORE}/100 · peringkat {fmt(DATA.rank)} dari {fmt(DATA.total)}
          </strong>
        </div>
      </div>
    </div>
  );
}
