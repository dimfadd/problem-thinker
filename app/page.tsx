import { SiteHeader } from "@/components/SiteHeader";
import { LevelBars, Simulator } from "@/components/Simulator";
import { ScaleView } from "@/components/ScaleView";
import { Walkthrough } from "@/components/Walkthrough";
import { LEVEL_LABEL } from "@/lib/sim/data.ts";
import type { EvidenceLevel } from "@/lib/sim/types.ts";

const REPO_URL = "https://github.com/dimfadd/problem-thinker";

const RUBRIC = [
  {
    w: 35,
    title: "Menyentuh akar masalah",
    body: "Seberapa banyak konteks yang dijawab usulan, dibobot menurut tingkat bukti konteksnya. Konteks terverifikasi berbobot empat kali klaim yang belum diverifikasi.",
  },
  {
    w: 25,
    title: "Bisa dijalankan",
    body: "Ada langkah tindakan yang jelas, bukan sekadar harapan seperti \"pemerintah harus lebih peduli\".",
  },
  {
    w: 20,
    title: "Spesifik dan terukur",
    body: "Menyebut angka, tenggat, dan pihak yang bertanggung jawab.",
  },
  {
    w: 20,
    title: "Membahas risiko dan biaya",
    body: "Menyebut dampak samping, sumber anggaran, atau cara mengukur berhasil tidaknya.",
  },
];

const LEVEL_NOTE: Record<EvidenceLevel, string> = {
  0: "AI ragu atau tidak bisa mengakses sumber, dan belum ada yang mengonfirmasi. Bobot 0,5.",
  1: "AI memberi peringatan, lalu pemilik berkas mengonfirmasi sendiri. Pemilik berkas pihak berkepentingan, jadi bobotnya 1.",
  2: "AI membuka sumber publik atau dokumen terunggah dan isinya cocok dengan pernyataan. Bobot 1,5.",
  3: "Minimal 2 saksi independen membenarkan. Satu-satunya cara mengesampingkan temuan AI \"bertentangan\". Bobot 2.",
};

const FRAUD = [
  { code: "AF-01", pattern: "Mengirim usulan yang sama berulang kali", guard: "Usulan yang kemiripannya di atas ambang dengan usulan sendiri ditolak. Perubahan dilakukan lewat versi baru.", demo: true },
  { code: "AF-02", pattern: "Membanjiri satu berkas dari satu akun", guard: "Maksimal 3 usulan aktif per akun per berkas, ditambah batas laju pengiriman.", demo: true },
  { code: "AF-03", pattern: "Menjiplak usulan yang sudah berada di sisi hijau", guard: "Isi dan skor usulan lain disembunyikan selama fase usulan. Jiplakan ditandai, kredit untuk pengirim pertama.", demo: true },
  { code: "AF-04", pattern: "Memerintah penilai AI (prompt injection)", guard: "Usulan diperlakukan sebagai data, bukan instruksi. Kalimat perintah membuat usulan dikarantina untuk moderator.", demo: true },
  { code: "AF-05", pattern: "Menumpuk kata kunci dari konteks", guard: "Rubrik memotong skor usulan yang mengulang konteks tanpa langkah tindakan.", demo: true },
  { code: "AF-06", pattern: "Memakai banyak akun (sybil)", guard: "Verifikasi email dan nomor HP. Organisasi memakai SSO atau undangan per domain. Sinyal perangkat dan IP dipantau.", demo: false },
  { code: "AF-07", pattern: "Menggiring hasil lewat konteks berat sebelah", guard: "Konteks wajib bersumber dan diperiksa AI. Konfirmasi pemilik berkas berbobot rendah; bobot tertinggi butuh 2 saksi independen. Konteks dikunci sebelum usulan dibuka.", demo: true },
  { code: "AF-08", pattern: "Mengedit usulan setelah dinilai", guard: "Usulan terkunci setelah dinilai. Edit menjadi versi baru yang dinilai ulang, riwayatnya terlihat.", demo: false },
  { code: "AF-12", pattern: "Klaim yang melebihi isi sumber", guard: "AI membandingkan pernyataan dengan isi sumber. Klaim yang melampaui sumber diberi peringatan publik dan berbobot kecil.", demo: true },
  { code: "AF-13", pattern: "Pemilik berkas membenarkan konteksnya sendiri", guard: "Konfirmasi pemilik berkas berbobot rendah dan tidak bisa membatalkan peringatan \"melebihi sumber\". Hanya 2 saksi independen yang bisa.", demo: true },
  { code: "AF-09", pattern: "Skor berubah saat dinilai ulang", guard: "Model, prompt, dan rubrik dikunci per berkas. Alasan penilaian disimpan dan bisa diajukan banding.", demo: false },
];

function Check({ done }: { done: boolean }) {
  return done ? (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0.5" y="0.5" width="15" height="15" rx="2" fill="var(--verdigris)" />
      <path d="M4 8.2l2.6 2.6L12 5.4" fill="none" stroke="var(--card)" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="2" fill="none" stroke="var(--rule-strong)" strokeWidth="1.5" />
    </svg>
  );
}

type Cell = boolean | string;
const PLANS = [
  { name: "Publik", price: "Gratis" },
  { name: "Organisasi", price: "Berlangganan" },
  { name: "Instansi pemerintah", price: "Kontrak tahunan" },
];
const PLAN_ROWS: { feature: string; cells: [Cell, Cell, Cell] }[] = [
  { feature: "Membuat berkas publik", cells: ["Maks. 3 aktif", true, true] },
  { feature: "Konteks bersumber + pemeriksaan sumber oleh AI", cells: ["Kuota bulanan", "Kuota lebih besar", "Sesuai kontrak"] },
  { feature: "Usulan dan penilaian AI dengan alasan", cells: ["Kuota bulanan", "Kuota lebih besar", "Sesuai kontrak"] },
  { feature: "Garis penilaian dan catatan audit", cells: [true, true, true] },
  { feature: "Ruang kerja privat, anggota, dan peran", cells: [false, true, true] },
  { feature: "SSO dan undangan per domain", cells: [false, true, true] },
  { feature: "Saksi internal dari luar tim pemilik berkas", cells: [false, true, true] },
  { feature: "Panel peninjau dan banding skor", cells: [false, true, true] },
  { feature: "Ekspor laporan untuk rapat keputusan", cells: [false, true, true] },
  { feature: "Portal konsultasi publik dengan identitas instansi", cells: [false, false, true] },
  { feature: "Pool saksi warga terverifikasi", cells: [false, false, true] },
  { feature: "Integrasi dengan sistem aduan (API)", cells: [false, false, true] },
];

function PlanCell({ value }: { value: Cell }) {
  if (value === true)
    return (
      <>
        <Check done />
        <span className="visually-hidden">Ya</span>
      </>
    );
  if (value === false)
    return (
      <>
        <span aria-hidden="true" style={{ color: "var(--ink-2)" }}>
          -
        </span>
        <span className="visually-hidden">Tidak</span>
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
                Tahap rancangan. Simulasi di halaman ini berjalan di browser Anda.
              </p>
              <h1>
                Keputusan atas masalah bersama, diambil dari <em>bukti</em>, bukan dari suara paling keras.
              </h1>
              <p className="lede">
                Problem Thinker mengubah satu masalah menjadi berkas. Konteks wajib bersumber dan diperiksa AI. Usulan
                solusi dari publik atau anggota dinilai terhadap berkas itu, lalu ditaruh di garis dari merah sampai
                hijau, lengkap dengan alasannya.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#cara-kerja">
                  Tonton cara kerjanya
                </a>
                <a className="btn btn-ghost" href="#coba">
                  Coba simulasi sendiri
                </a>
              </div>
            </div>

            <figure className="dossier" aria-label="Contoh tampilan berkas karhutla">
              <div className="dossier-head mono">
                <span>BERKAS PT-2026-0012</span>
                <span>Fase: penilaian ditutup</span>
              </div>
              <h3>Karhutla berulang setiap musim kemarau</h3>
              <ol>
                <li>
                  <span className="cite">[1]</span>
                  <span>
                    99% karhutla 2019 disebabkan ulah manusia.
                    <span className="src">Sekretariat Kabinet, dicek AI</span>
                  </span>
                </li>
                <li>
                  <span className="cite">[2]</span>
                  <span>
                    20 konsesi asing disegel, 5 perusahaan tersangka.
                    <span className="src">Bisnis.com, dicek AI</span>
                  </span>
                </li>
                <li>
                  <span className="cite">[3]</span>
                  <span>
                    &ldquo;Perusahaan asing sengaja membakar.&rdquo;
                    <span className="src hero-warn">Peringatan AI: melebihi sumber</span>
                  </span>
                </li>
              </ol>
              <div className="scale" style={{ marginTop: 20 }} aria-hidden="true">
                <div className="scale-track" />
                <div className="scale-field" style={{ height: 36, marginTop: 8 }}>
                  {[
                    { s: 0, t: "E" },
                    { s: 15, t: "D" },
                    { s: 40, t: "C" },
                    { s: 60, t: "B" },
                    { s: 93, t: "A" },
                  ].map((d) => (
                    <span key={d.t} className="scale-dot" style={{ left: `${d.s}%`, top: 0, cursor: "default" }}>
                      {d.t}
                    </span>
                  ))}
                </div>
              </div>
              <figcaption className="mono" style={{ color: "var(--ink-2)", marginTop: 4 }}>
                Titik = usulan. Posisi = skor terhadap berkas.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ---------- § 1 cara kerja ---------- */}
        <section className="section" id="cara-kerja" aria-labelledby="cara-kerja-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 1</span>
              <h2 id="cara-kerja-title">Satu berkas karhutla, dari masalah sampai usulan terbaik.</h2>
              <p>
                Tur ini berjalan sendiri dalam 7 langkah. Jeda, mundur, atau pilih langkah kapan saja. Konteks [1], [2],
                [4], dan [5] merangkum berita nyata; akun dan usulan adalah contoh.
              </p>
            </div>
            <Walkthrough />
          </div>
        </section>

        {/* ---------- § 2 coba sendiri ---------- */}
        <section className="section section-alt" id="coba" aria-labelledby="coba-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 2</span>
              <h2 id="coba-title">Sekarang giliran Anda.</h2>
              <p>
                Tambahkan konteks dengan sumbernya, kunci konteks, lalu kirim usulan Anda sendiri untuk karhutla. Coba
                juga mengirim ulang, menjiplak, atau memerintah penilai untuk melihat aturan anti-kecurangan bekerja.
              </p>
            </div>
            <Simulator />
          </div>
        </section>

        {/* ---------- § 3 skala ---------- */}
        <section className="section" id="skala" aria-labelledby="skala-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 3</span>
              <h2 id="skala-title">Kalau usulannya ribuan, garisnya tetap terbaca.</h2>
              <p>
                Satu titik per akun hanya jelas sampai puluhan usulan. Setelah itu titik saling menutupi. Karena itu
                garis yang sama ditampilkan dalam tiga lapis.
              </p>
            </div>
            <div className="scale-layers">
              <ol className="ai-list">
                <li>
                  <span>
                    <strong>Sebaran.</strong> Batang di atas garis menunjukkan berapa banyak usulan di setiap rentang skor.
                    Terlihat sekilas bahwa kebanyakan usulan masih di sisi merah.
                  </span>
                </li>
                <li>
                  <span>
                    <strong>Klaster usulan mirip.</strong> AI mengelompokkan usulan yang isinya serupa menjadi satu
                    gelembung. Ukuran gelembung = jumlah usulan, posisi = rata-rata skornya. Pilih gelembung untuk melihat
                    isinya.
                  </span>
                </li>
                <li>
                  <span>
                    <strong>Posisi Anda.</strong> Usulan Anda selalu ditandai, lengkap dengan peringkatnya, walau ada
                    ribuan usulan lain.
                  </span>
                </li>
              </ol>
              <ScaleView />
            </div>
          </div>
        </section>

        {/* ---------- § 4 peran AI ---------- */}
        <section className="section section-alt" id="peran-ai" aria-labelledby="peran-ai-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 4</span>
              <h2 id="peran-ai-title">AI bekerja sebagai pemeriksa, bukan pengambil keputusan.</h2>
              <p>
                AI mengerjakan bagian yang melelahkan bagi manusia: membuka ratusan sumber dan membaca ribuan usulan
                dengan ukuran yang sama. Keputusan tetap di tangan orang yang bertanggung jawab.
              </p>
            </div>
            <div className="ai-role">
              <div>
                <h3>Yang dikerjakan AI</h3>
                <ol className="ai-list">
                  <li>
                    <strong>Memeriksa sumber konteks.</strong> Membuka sumber publik atau dokumen yang diunggah, lalu
                    menandai bila sumber tidak bisa dibuka, isinya meragukan, atau klaimnya melebihi sumber.
                  </li>
                  <li>
                    <strong>Menilai usulan.</strong> Rubrik yang sama untuk semua orang, dengan alasan yang merujuk nomor
                    konteks.
                  </li>
                  <li>
                    <strong>Menyaring kecurangan.</strong> Perintah tersembunyi, kiriman ulang, jiplakan, dan tumpukan
                    kata kunci.
                  </li>
                </ol>
              </div>
              <div>
                <h3>Yang tidak dikerjakan AI</h3>
                <ol className="ai-list not">
                  <li>
                    <strong>Tidak memutuskan kebijakan.</strong> Pemilik berkas dan panel manusia yang memilih usulan.
                  </li>
                  <li>
                    <strong>Tidak menentukan benar-salah politik.</strong> Skor hanya mengukur kecocokan dengan berkas.
                  </li>
                  <li>
                    <strong>Tidak menghapus peringatannya karena diminta.</strong> Peringatan tetap terlihat walau
                    pemilik berkas sudah mengonfirmasi.
                  </li>
                  <li>
                    <strong>Tidak masuk ke portal yang butuh login.</strong> Sumber seperti itu diunggah sebagai dokumen
                    bukti.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- § 4 penilaian ---------- */}
        <section className="section" id="penilaian" aria-labelledby="penilaian-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 5</span>
              <h2 id="penilaian-title">Skor mengukur kecocokan dengan berkas, bukan kebenaran mutlak.</h2>
              <p>
                Penilai AI membaca masalah dan konteks yang sudah dikunci, lalu menilai setiap usulan dengan rubrik yang
                sama. Hasilnya angka 0 sampai 100 beserta alasan per rubrik.
              </p>
            </div>
            <div className="split">
              <ol className="weights" aria-label="Rubrik penilaian">
                {RUBRIC.map((r) => (
                  <li key={r.title}>
                    <span className="w">{r.w}</span>
                    <div>
                      <h3>{r.title}</h3>
                      <p>{r.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <aside className="aside-note" aria-labelledby="batas-title">
                <h3 id="batas-title">Batas yang perlu diketahui</h3>
                <p>
                  Kalau konteksnya berat sebelah, skornya ikut berat sebelah. Karena itu konteks wajib bersumber,
                  diperiksa AI, bisa dibantah, dan dikunci sebelum usulan dibuka.
                </p>
                <p>Untuk keputusan penting, usulan teratas ditinjau panel manusia sebelum dipakai.</p>
                <h3 style={{ marginTop: 20 }}>Tingkat bukti konteks</h3>
                <p>
                  Sumber diperiksa AI dulu. Kalau AI ragu atau gagal mengakses, peringatannya tetap terlihat publik,
                  lalu pemilik berkas dan saksi menjadi lapis berikutnya.
                </p>
                <ul className="levels">
                  {([3, 2, 1, 0] as EvidenceLevel[]).map((l) => (
                    <li key={l}>
                      <LevelBars level={l} />
                      <span>{LEVEL_LABEL[l]}</span>
                      <small>{LEVEL_NOTE[l]}</small>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </section>

        {/* ---------- § 5 anti-kecurangan ---------- */}
        <section className="section section-alt" id="kecurangan" aria-labelledby="kecurangan-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 6</span>
              <h2 id="kecurangan-title">Pola kecurangan yang sudah diperhitungkan.</h2>
              <p>
                Setiap penolakan, karantina, dan tanda tercatat di catatan audit berkas. Di simulasi skor langsung terlihat
                supaya alurnya jelas. Di aplikasi, skor baru dibuka setelah fase usulan ditutup.
              </p>
            </div>
            <div className="table-wrap">
              <table className="stack-table">
                <thead>
                  <tr>
                    <th scope="col">Kode</th>
                    <th scope="col">Pola</th>
                    <th scope="col">Penangkal</th>
                    <th scope="col">Di simulasi</th>
                  </tr>
                </thead>
                <tbody>
                  {FRAUD.map((f) => (
                    <tr key={f.code}>
                      <td data-label="Kode">
                        <span className="mono">{f.code}</span>
                      </td>
                      <th scope="row">{f.pattern}</th>
                      <td data-label="Penangkal">{f.guard}</td>
                      <td data-label="Di simulasi">
                        {f.demo ? (
                          <a className="demo-link" href="#coba">
                            Bisa dicoba
                          </a>
                        ) : (
                          <span className="demo-link" style={{ color: "var(--ink-2)" }}>
                            Di rancangan sistem
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------- § 6 pengguna ---------- */}
        <section className="section" id="pengguna" aria-labelledby="pengguna-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 7</span>
              <h2 id="pengguna-title">Satu cara kerja, tiga jenis ruang.</h2>
              <p>
                Pemilik berkas mengatur siapa yang boleh menambah konteks, siapa yang boleh mengusulkan, dan siapa yang
                menjadi saksi.
              </p>
            </div>
            <div className="modes">
              <div className="mode">
                <h3>Pemerintah & lembaga publik</h3>
                <dl>
                  <dt>Yang mengusulkan</dt>
                  <dd>Publik terverifikasi, atau warga wilayah tertentu.</dd>
                  <dt>Yang memverifikasi konteks</dt>
                  <dd>AI lebih dulu, lalu pemilik berkas dan saksi independen dari publik terverifikasi.</dd>
                </dl>
                <p>
                  Untuk konsultasi kebijakan yang transparan, misalnya penanganan karhutla, banjir, atau tata ruang. Warga
                  bisa melihat konteks apa yang dipakai dan kenapa sebuah usulan dinilai tinggi.
                </p>
              </div>
              <div className="mode">
                <h3>Perusahaan</h3>
                <dl>
                  <dt>Yang mengusulkan</dt>
                  <dd>Karyawan lewat SSO atau undangan domain, bisa dibatasi per divisi.</dd>
                  <dt>Yang memverifikasi konteks</dt>
                  <dd>AI lebih dulu, lalu pemilik berkas dan saksi dari karyawan di luar tim pemilik berkas.</dd>
                </dl>
                <p>Berkas privat di dalam ruang kerja. Untuk masalah operasional, proses, dan layanan pelanggan.</p>
              </div>
              <div className="mode">
                <h3>Organisasi & komunitas</h3>
                <dl>
                  <dt>Yang mengusulkan</dt>
                  <dd>Anggota undangan, atau dibuka untuk publik.</dd>
                  <dt>Yang memverifikasi konteks</dt>
                  <dd>AI lebih dulu, lalu pemilik berkas dan saksi dari anggota.</dd>
                </dl>
                <p>Untuk program kerja, advokasi, dan keputusan bersama anggota.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- § 7 paket ---------- */}
        <section className="section section-alt" id="paket" aria-labelledby="paket-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 8</span>
              <h2 id="paket-title">Gratis untuk publik, berlangganan untuk ruang kerja.</h2>
              <p>
                Rancangan paket. Harga dan kuota belum ditetapkan, dan daftar fitur masih bisa berubah sebelum peluncuran.
              </p>
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

        {/* ---------- § 8 status ---------- */}
        <section className="section" id="status" aria-labelledby="status-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 9</span>
              <h2 id="status-title">Posisi pengerjaan saat ini.</h2>
              <p>
                Rancangan lengkap ada di folder <code>docs/</code> pada repositori.
              </p>
            </div>
            <div className="status-grid">
              <div>
                <h3>Sudah ada</h3>
                <ul className="checklist">
                  {[
                    "Rancangan produk, sistem, penilaian, verifikasi sumber, dan anti-kecurangan",
                    "Rancangan UI/UX dan paket",
                    "Landing page dengan tur animasi dan simulasi berkas di browser",
                  ].map((t) => (
                    <li key={t}>
                      <Check done />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Berikutnya</h3>
                <ul className="checklist">
                  {[
                    "Login dan ruang kerja organisasi",
                    "Berkas, konteks, dan usulan tersimpan di database",
                    "Pemeriksaan sumber dan penilaian dengan model AI sungguhan",
                    "Saksi independen, panel peninjau, dan banding skor",
                    "Pembayaran langganan",
                  ].map((t) => (
                    <li key={t}>
                      <Check done={false} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <span>Problem Thinker, rancangan v0.3, 2026.</span>
          <a href={REPO_URL} rel="noopener">
            Kode dan dokumen di GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
