import { SiteHeader } from "@/components/SiteHeader";
import { LevelBars, Simulator } from "@/components/Simulator";
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
  0: "Narasumber disebut tapi belum terverifikasi. Bobot 0,5.",
  1: "URL berita atau publikasi yang bisa dibuka siapa saja. Bobot 1.",
  2: "Dokumen diunggah dan bisa diperiksa peninjau. Bobot 1,5.",
  3: "Akun narasumber terverifikasi atau dikonfirmasi moderator. Bobot 2.",
};

const FRAUD = [
  { code: "AF-01", pattern: "Mengirim usulan yang sama berulang kali", guard: "Usulan yang kemiripannya di atas ambang dengan usulan sendiri ditolak. Perubahan dilakukan lewat versi baru.", demo: true },
  { code: "AF-02", pattern: "Membanjiri satu berkas dari satu akun", guard: "Maksimal 3 usulan aktif per akun per berkas, ditambah batas laju pengiriman.", demo: true },
  { code: "AF-03", pattern: "Menjiplak usulan yang sudah berada di sisi hijau", guard: "Isi dan skor usulan lain disembunyikan selama fase usulan. Jiplakan ditandai, kredit untuk pengirim pertama.", demo: true },
  { code: "AF-04", pattern: "Memerintah penilai AI (prompt injection)", guard: "Usulan diperlakukan sebagai data, bukan instruksi. Kalimat perintah membuat usulan dikarantina untuk moderator.", demo: true },
  { code: "AF-05", pattern: "Menumpuk kata kunci dari konteks", guard: "Rubrik memotong skor usulan yang mengulang konteks tanpa langkah tindakan.", demo: true },
  { code: "AF-06", pattern: "Memakai banyak akun (sybil)", guard: "Verifikasi email dan nomor HP. Organisasi memakai SSO atau undangan per domain. Sinyal perangkat dan IP dipantau.", demo: false },
  { code: "AF-07", pattern: "Menggiring hasil lewat konteks berat sebelah", guard: "Konteks wajib bersumber, berjenjang bukti, bisa dibantah, dan dikunci sebelum usulan dibuka.", demo: true },
  { code: "AF-08", pattern: "Mengedit usulan setelah dinilai", guard: "Usulan terkunci setelah dinilai. Edit menjadi versi baru yang dinilai ulang, riwayatnya terlihat.", demo: false },
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

export default function Home() {
  return (
    <>
      <a className="skip" href="#simulasi">
        Langsung ke simulasi
      </a>
      <SiteHeader />
      <main id="top">
        {/* ---------- pembuka ---------- */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="status-line">
                <span className="dot" aria-hidden="true" />
                Tahap rancangan v0.1. Belum ada akun atau data nyata.
              </p>
              <h1>
                Keputusan atas masalah bersama, diambil dari <em>bukti</em>, bukan dari suara paling keras.
              </h1>
              <p className="lede">
                Problem Thinker menyusun satu masalah menjadi berkas. Setiap konteks wajib menyebut sumbernya. Setiap
                usulan solusi dinilai terhadap berkas itu, dan setiap skor bisa ditelusuri alasannya.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#simulasi">
                  Coba simulasi berkas
                </a>
                <a className="btn btn-ghost" href="#penilaian">
                  Lihat cara penilaian
                </a>
              </div>
            </div>

            <figure className="dossier" aria-label="Contoh tampilan berkas">
              <div className="dossier-head mono">
                <span>BERKAS PT-2026-0007</span>
                <span>Fase: usulan</span>
              </div>
              <h3>Banjir tahunan di Kelurahan Sukamaju</h3>
              <ol>
                <li>
                  <span className="cite">[1]</span>
                  <span>
                    Saluran drainase menyempit dari 2 m menjadi 0,8 m.
                    <span className="src">Dokumen resmi, laporan kajian genangan</span>
                  </span>
                </li>
                <li>
                  <span className="cite">[2]</span>
                  <span>
                    Sampah menumpuk di pintu air, diangkut seminggu sekali.
                    <span className="src">Narasumber terverifikasi, Ketua RW 05</span>
                  </span>
                </li>
                <li>
                  <span className="cite">[3]</span>
                  <span>
                    Lahan resapan beralih menjadi perumahan sejak 2019.
                    <span className="src">Berita, media lokal</span>
                  </span>
                </li>
              </ol>
              <div className="scale" style={{ marginTop: 20 }} aria-hidden="true">
                <div className="scale-track" />
                <div className="scale-field" style={{ height: 36, marginTop: 8 }}>
                  {[
                    { s: 5, t: "C" },
                    { s: 31, t: "B" },
                    { s: 43, t: "D" },
                    { s: 90, t: "A" },
                  ].map((d) => (
                    <span key={d.t} className="scale-dot" style={{ left: `${d.s}%`, top: 0, cursor: "default" }}>
                      {d.t}
                    </span>
                  ))}
                </div>
              </div>
              <figcaption className="mono" style={{ color: "var(--ink-2)", marginTop: 4 }}>
                Contoh fiktif. Titik = usulan, posisi = skor terhadap berkas.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ---------- § 1 simulasi ---------- */}
        <section className="section" id="simulasi" aria-labelledby="simulasi-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 1</span>
              <h2 id="simulasi-title">Satu berkas, dari masalah sampai usulan.</h2>
              <p>
                Tambahkan konteks dengan sumbernya, kunci konteks, lalu kirim usulan. Coba juga mengirim ulang, menjiplak,
                atau memerintah penilai untuk melihat aturan anti-kecurangan bekerja.
              </p>
            </div>
            <Simulator />
          </div>
        </section>

        {/* ---------- § 2 penilaian ---------- */}
        <section className="section section-alt" id="penilaian" aria-labelledby="penilaian-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 2</span>
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
                  Kalau konteksnya berat sebelah, skornya ikut berat sebelah. Karena itu konteks wajib bersumber, bisa
                  dibantah, dan dikunci sebelum usulan dibuka.
                </p>
                <p>Untuk keputusan penting, usulan teratas ditinjau panel manusia sebelum dipakai.</p>
                <h3 style={{ marginTop: 20 }}>Tingkat bukti konteks</h3>
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

        {/* ---------- § 3 anti-kecurangan ---------- */}
        <section className="section" id="kecurangan" aria-labelledby="kecurangan-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 3</span>
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
                          <a className="demo-link" href="#simulasi">
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

        {/* ---------- § 4 pengguna ---------- */}
        <section className="section section-alt" id="pengguna" aria-labelledby="pengguna-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 4</span>
              <h2 id="pengguna-title">Satu cara kerja, tiga jenis ruang.</h2>
              <p>
                Pemilik berkas mengatur siapa yang boleh menambah konteks, siapa yang boleh mengusulkan, dan siapa yang
                memverifikasi sumber.
              </p>
            </div>
            <div className="modes">
              <div className="mode">
                <h3>Pemerintah & lembaga publik</h3>
                <dl>
                  <dt>Yang mengusulkan</dt>
                  <dd>Publik terverifikasi, atau warga wilayah tertentu.</dd>
                  <dt>Yang memverifikasi konteks</dt>
                  <dd>Moderator instansi.</dd>
                </dl>
                <p>Untuk konsultasi kebijakan, aduan wilayah, dan musyawarah perencanaan.</p>
              </div>
              <div className="mode">
                <h3>Perusahaan</h3>
                <dl>
                  <dt>Yang mengusulkan</dt>
                  <dd>Karyawan lewat SSO atau undangan domain, bisa dibatasi per divisi.</dd>
                  <dt>Yang memverifikasi konteks</dt>
                  <dd>Pemilik berkas atau manajer yang ditunjuk.</dd>
                </dl>
                <p>Berkas privat di dalam ruang kerja. Untuk masalah operasional, proses, dan layanan pelanggan.</p>
              </div>
              <div className="mode">
                <h3>Organisasi & komunitas</h3>
                <dl>
                  <dt>Yang mengusulkan</dt>
                  <dd>Anggota undangan, atau dibuka untuk publik.</dd>
                  <dt>Yang memverifikasi konteks</dt>
                  <dd>Pengurus.</dd>
                </dl>
                <p>Untuk program kerja, advokasi, dan keputusan bersama anggota.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- § 5 status ---------- */}
        <section className="section" id="status" aria-labelledby="status-title">
          <div className="wrap">
            <div className="section-head">
              <span className="section-mark">§ 5</span>
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
                    "Rancangan produk, sistem, penilaian, dan anti-kecurangan",
                    "Rancangan UI/UX: huruf, warna, komponen, layar",
                    "Landing page dengan simulasi berkas di browser",
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
                    "Penilaian dengan model AI sungguhan memakai rubrik di atas",
                    "Unggah dokumen bukti dan verifikasi narasumber",
                    "Panel tinjauan manusia dan banding skor",
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
          <span>Problem Thinker, rancangan v0.1, 2026.</span>
          <a href={REPO_URL} rel="noopener">
            Kode dan dokumen di GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
