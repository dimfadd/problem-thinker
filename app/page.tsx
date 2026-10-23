import { QuickTry } from "@/components/QuickTry";
import { ScaleView } from "@/components/ScaleView";
import { Simulator } from "@/components/Simulator";
import { SiteHeader } from "@/components/SiteHeader";
import { Walkthrough } from "@/components/Walkthrough";

// Landing page. Prinsip: bahasa sehari-hari, satu gagasan per bagian,
// pengunjung paham tanpa perlu dijelaskan orang lain.

const QUESTIONS = [
  { q: "Apakah menjawab penyebab masalahnya?", w: "35%", note: "Fakta yang sumbernya kuat dihitung lebih berat." },
  { q: "Apakah bisa benar-benar dijalankan?", w: "25%", note: "Ada langkah nyata, bukan sekadar \"harus lebih tegas\"." },
  { q: "Apakah jelas siapa, kapan, dan berapa?", w: "20%", note: "Ada pihak yang bertanggung jawab, tenggat, dan angka." },
  { q: "Apakah memikirkan risiko dan biayanya?", w: "20%", note: "Ada perkiraan dampak samping atau sumber dana." },
];

const CHEATS = [
  { try: "Mengirim usulan yang sama berkali-kali", then: "Ditolak otomatis." },
  { try: "Menyontek usulan orang lain", then: "Ketahuan. Nilainya tetap milik orang yang mengirim lebih dulu." },
  { try: "Menyuruh AI memberi nilai tinggi", then: "Usulan ditahan untuk diperiksa admin dan tidak dinilai." },
  { try: "Membuat banyak akun palsu", then: "Setiap akun wajib verifikasi email dan nomor HP." },
  { try: "Menambahkan fakta tanpa sumber", then: "Tidak bisa disimpan. Fakta yang melebihi isi sumbernya diberi peringatan." },
  { try: "Pemilik masalah membenarkan faktanya sendiri", then: "Tidak cukup. Bukti terkuat butuh 2 saksi yang tidak berkepentingan." },
];

type Cell = boolean | string;
const PLANS = [
  { name: "Publik", price: "Gratis" },
  { name: "Organisasi", price: "Berlangganan" },
  { name: "Pemerintah", price: "Kontrak tahunan" },
];
const PLAN_ROWS: { feature: string; cells: [Cell, Cell, Cell] }[] = [
  { feature: "Membuat masalah yang terbuka untuk publik", cells: ["Maks. 3", true, true] },
  { feature: "AI mengecek sumber fakta", cells: ["Terbatas", "Lebih banyak", "Sesuai kontrak"] },
  { feature: "AI menilai usulan, lengkap dengan alasan", cells: ["Terbatas", "Lebih banyak", "Sesuai kontrak"] },
  { feature: "Garis hasil dan riwayat semua kejadian", cells: [true, true, true] },
  { feature: "Ruang tertutup khusus anggota atau karyawan", cells: [false, true, true] },
  { feature: "Saksi dan tim peninjau", cells: [false, true, true] },
  { feature: "Laporan untuk rapat pengambilan keputusan", cells: [false, true, true] },
  { feature: "Halaman konsultasi publik atas nama instansi", cells: [false, false, true] },
  { feature: "Saksi dari warga yang sudah terverifikasi", cells: [false, false, true] },
  { feature: "Tersambung ke sistem pengaduan instansi", cells: [false, false, true] },
];

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0.5" y="0.5" width="15" height="15" rx="2" fill="var(--verdigris)" />
      <path d="M4 8.2l2.6 2.6L12 5.4" fill="none" stroke="var(--card)" strokeWidth="1.8" />
    </svg>
  );
}

function PlanCell({ value }: { value: Cell }) {
  if (value === true)
    return (
      <>
        <Check />
        <span className="visually-hidden">Termasuk</span>
      </>
    );
  if (value === false)
    return (
      <>
        <span aria-hidden="true" style={{ color: "var(--ink-2)" }}>
          -
        </span>
        <span className="visually-hidden">Tidak termasuk</span>
      </>
    );
  return <span className="plan-text">{value}</span>;
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#cara-kerja">
        Langsung ke cara kerja
      </a>
      <SiteHeader />
      <main id="top">
        {/* ---------- pembuka ---------- */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="status-line">
                <span className="dot" aria-hidden="true" />
                Masih dalam pengembangan. Contoh di halaman ini adalah simulasi.
              </p>
              <h1>
                Cari solusi terbaik untuk sebuah masalah, bersama-sama, berdasarkan <em>fakta</em>.
              </h1>
              <p className="lede">
                Siapa pun yang diizinkan bisa mengusulkan solusi. Setiap fakta wajib ada sumbernya. AI membantu menilai usulan
                mana yang paling masuk akal, dan selalu menjelaskan alasannya.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#contoh">
                  Lihat contohnya
                </a>
                <a className="btn btn-ghost" href="#coba">
                  Coba kirim usulan
                </a>
              </div>
            </div>

            <figure className="dossier hero-demo" aria-label="Contoh hasil: usulan asal-asalan berada di sisi merah, usulan matang di sisi hijau">
              <span className="qt-tag">Masalah</span>
              <p className="hd-title">Kebakaran hutan terjadi setiap kemarau. Usulan mana yang paling masuk akal?</p>
              <div className="scale" aria-hidden="true">
                <div className="scale-labels">
                  <span>Jauh dari solusi</span>
                  <span>Dekat dengan solusi</span>
                </div>
                <div className="scale-track" />
                <div className="scale-field" style={{ height: 36, marginTop: 10 }}>
                  {[
                    { s: 0, t: "E" },
                    { s: 15, t: "D", hl: true },
                    { s: 40, t: "C" },
                    { s: 60, t: "B" },
                    { s: 93, t: "A", hl: true },
                  ].map((d) => (
                    <span key={d.t} className={`scale-dot${d.hl ? " hl-static" : " dim-static"}`} style={{ left: `${d.s}%`, top: 0 }}>
                      {d.t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hd-callouts">
                <div className="hd-call red">
                  <span className="hd-score">D · nilai 15</span>
                  <p>&ldquo;Usir semua perusahaan asing.&rdquo;</p>
                  <small>Menyalahkan tanpa bukti, tidak ada langkah nyata.</small>
                </div>
                <div className="hd-call green">
                  <span className="hd-score">A · nilai 93</span>
                  <p>&ldquo;Status darurat otomatis, audit izin perusahaan, bantu petani membuka lahan tanpa membakar.&rdquo;</p>
                  <small>Menjawab penyebabnya, jelas siapa dan kapan.</small>
                </div>
              </div>
            </figure>
          </div>
        </section>

        {/* ---------- cara kerja ---------- */}
        <section className="section" id="cara-kerja" aria-labelledby="cara-kerja-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 1</span>
              <h2 id="cara-kerja-title">Cara kerjanya, dalam 4 langkah.</h2>
            </div>
            <ol className="steps4">
              <li>
                <span className="s4-num">1</span>
                <div>
                  <h3>Tulis masalahnya</h3>
                  <p>Pemerintah, perusahaan, atau organisasi menuliskan masalah yang ingin dipecahkan.</p>
                </div>
                <div className="s4-visual" aria-hidden="true">
                  <span className="qt-tag">Masalah</span>
                  <span className="s4-line">Kebakaran hutan setiap kemarau</span>
                </div>
              </li>
              <li>
                <span className="s4-num">2</span>
                <div>
                  <h3>Tambahkan fakta, wajib dengan sumber</h3>
                  <p>Fakta tanpa sumber tidak bisa ditambahkan. AI mengecek apakah sumbernya benar-benar berkata begitu.</p>
                </div>
                <div className="s4-visual" aria-hidden="true">
                  <span className="s4-line">99% karena ulah manusia</span>
                  <span className="s4-src">Sumber: Sekretariat Kabinet</span>
                  <span className="tour-badge ok">✓ Dicek AI</span>
                </div>
              </li>
              <li>
                <span className="s4-num">3</span>
                <div>
                  <h3>Orang mengirim usulan solusi</h3>
                  <p>Bisa terbuka untuk publik, atau khusus karyawan dan anggota. Pemilik masalah yang mengatur.</p>
                </div>
                <div className="s4-visual s4-bubbles" aria-hidden="true">
                  <span>&ldquo;Tambah patroli&rdquo;</span>
                  <span>&ldquo;Audit izin perusahaan&rdquo;</span>
                  <span>&ldquo;Bantu petani&rdquo;</span>
                </div>
              </li>
              <li>
                <span className="s4-num">4</span>
                <div>
                  <h3>AI menilai, hasilnya terlihat di garis</h3>
                  <p>Merah berarti jauh dari solusi, hijau berarti dekat. Setiap nilai ada alasannya. Keputusan tetap di tangan manusia.</p>
                </div>
                <div className="s4-visual" aria-hidden="true">
                  <div className="scale-track" />
                  <div className="s4-dots">
                    <i style={{ left: "10%" }} />
                    <i style={{ left: "45%" }} />
                    <i style={{ left: "88%" }} />
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* ---------- contoh (tur) ---------- */}
        <section className="section section-alt" id="contoh" aria-labelledby="contoh-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 2</span>
              <h2 id="contoh-title">Contoh: kebakaran hutan dan lahan.</h2>
              <p>Animasi ini berjalan sendiri. Tekan &ldquo;Jeda&rdquo; kapan saja, atau pilih langkah yang ingin dilihat.</p>
            </div>
            <Walkthrough />
          </div>
        </section>

        {/* ---------- coba ---------- */}
        <section className="section" id="coba" aria-labelledby="coba-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 3</span>
              <h2 id="coba-title">Sekarang giliran Anda. Kirim usulan, lihat nilainya.</h2>
              <p>Tidak perlu daftar. Semua berjalan di browser Anda dan tidak disimpan.</p>
            </div>
            <QuickTry />
            <details className="advanced">
              <summary>Mau mencoba fitur lengkapnya? Tambah fakta, saksi, dan aturan anti-curang</summary>
              <p className="advanced-note">
                Versi lengkap ini memperlihatkan semua aturan: menambah fakta dengan sumber, peringatan AI, konfirmasi pemilik
                masalah, saksi, dan catatan semua kejadian.
              </p>
              <Simulator />
            </details>
          </div>
        </section>

        {/* ---------- peran AI ---------- */}
        <section className="section section-alt" id="peran-ai" aria-labelledby="peran-ai-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 4</span>
              <h2 id="peran-ai-title">AI membantu menilai. Manusia yang memutuskan.</h2>
              <p>AI mengerjakan bagian yang melelahkan: mengecek ratusan sumber dan membaca ribuan usulan dengan ukuran yang sama.</p>
            </div>
            <div className="ai-plain">
              <div>
                <h3>4 pertanyaan yang dipakai AI untuk setiap usulan</h3>
                <ol className="q4">
                  {QUESTIONS.map((x) => (
                    <li key={x.q}>
                      <span className="q4-w">{x.w}</span>
                      <div>
                        <strong>{x.q}</strong>
                        <p>{x.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="ai-limits">
                <h3>Yang tidak dilakukan AI</h3>
                <ul>
                  <li>Tidak memilih solusi mana yang dipakai. Itu keputusan pemilik masalah.</li>
                  <li>Tidak menentukan benar atau salah secara politik. Nilai hanya mengukur kecocokan dengan fakta yang ada.</li>
                  <li>Tidak menghapus peringatannya hanya karena diminta.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- anti-curang ---------- */}
        <section className="section" id="aman" aria-labelledby="aman-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 5</span>
              <h2 id="aman-title">Sulit dicurangi.</h2>
              <p>Setiap kejadian tercatat dan bisa diperiksa.</p>
            </div>
            <dl className="cheats">
              {CHEATS.map((c) => (
                <div key={c.try}>
                  <dt>
                    <span className="cheat-if">Kalau ada yang</span> {c.try.charAt(0).toLowerCase() + c.try.slice(1)}
                  </dt>
                  <dd>{c.then}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------- ribuan usulan ---------- */}
        <section className="section section-alt" id="ramai" aria-labelledby="ramai-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 6</span>
              <h2 id="ramai-title">Kalau yang mengusulkan ribuan orang?</h2>
              <p>
                Usulan yang mirip digabung menjadi satu gelembung. Makin besar gelembungnya, makin banyak orang yang mengusulkan hal
                serupa. Posisi usulan Anda tetap ditandai.
              </p>
            </div>
            <ScaleView />
          </div>
        </section>

        {/* ---------- untuk siapa ---------- */}
        <section className="section" id="untuk-siapa" aria-labelledby="untuk-siapa-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 7</span>
              <h2 id="untuk-siapa-title">Untuk siapa?</h2>
            </div>
            <div className="modes">
              <div className="mode">
                <h3>Pemerintah</h3>
                <p>
                  Konsultasi publik yang terbuka. Warga bisa melihat fakta apa yang dipakai dan kenapa sebuah usulan dinilai tinggi.
                </p>
                <p className="mode-eg">Contoh: penanganan karhutla, banjir, tata kota.</p>
              </div>
              <div className="mode">
                <h3>Perusahaan</h3>
                <p>Kumpulkan solusi dari karyawan. Usulan dinilai dari isinya, bukan dari jabatan pengirimnya.</p>
                <p className="mode-eg">Contoh: keluhan pelanggan, proses kerja yang lambat.</p>
              </div>
              <div className="mode">
                <h3>Organisasi & komunitas</h3>
                <p>Keputusan bersama anggota yang bisa dipertanggungjawabkan.</p>
                <p className="mode-eg">Contoh: program kerja, advokasi, penggunaan dana.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- paket ---------- */}
        <section className="section section-alt" id="paket" aria-labelledby="paket-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 8</span>
              <h2 id="paket-title">Gratis untuk publik. Berlangganan untuk organisasi.</h2>
              <p>Harga belum ditetapkan. Daftar fitur masih bisa berubah sebelum peluncuran.</p>
            </div>
            <div className="table-wrap">
              <table className="plan-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="visually-hidden">Fitur</span>
                    </th>
                    {PLANS.map((p) => (
                      <th scope="col" key={p.name}>
                        <span className="plan-name">{p.name}</span>
                        <span className="plan-price">{p.price}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLAN_ROWS.map((r) => (
                    <tr key={r.feature}>
                      <th scope="row">{r.feature}</th>
                      {r.cells.map((c, i) => (
                        <td key={PLANS[i].name}>
                          <PlanCell value={c} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <span>Problem Thinker · masih dalam pengembangan · 2026</span>
        </div>
      </footer>
    </>
  );
}
