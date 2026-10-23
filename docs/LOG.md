# Log Pengerjaan dan Keputusan

Catatan kronologis: apa yang dikerjakan, keputusan yang diambil, dan alasannya. Entri terbaru di atas.

## 2026-10-23, v0.2 verifikasi sumber berlapis

### Keputusan

| Keputusan | Alasan | Alternatif yang ditolak |
|---|---|---|
| Sumber diperiksa AI lebih dulu (arahan pemilik produk) | Cepat, murah, konsisten untuk sumber publik | Moderator manusia untuk semua sumber |
| Peringatan AI tetap tampil meski sudah dikonfirmasi manusia | Pembaca bisa menilai sendiri seberapa kuat buktinya | Menghapus peringatan setelah konfirmasi |
| Konfirmasi pemilik berkas berbobot rendah (tingkat 1) dan tidak berlaku untuk temuan "bertentangan" | Pemilik berkas pihak berkepentingan, bisa menggiring hasil | Pemilik berkas sebagai verifikator penuh |
| Saksi independen (min. 2, dipilih acak untuk berkas publik) untuk tingkat tertinggi | Menangkal pemilik berkas yang mengakali verifikasi (kekhawatiran pemilik produk) | Saksi dipilih pemilik berkas |
| AI tidak login ke portal memakai akun siapa pun | Risiko kebocoran kredensial dan pelanggaran ketentuan situs; sumber berbalik login diunggah sebagai bukti | AI menyimpan kredensial portal |

### Dikerjakan

- Model `aiCheck`, `ownerConfirmed`, `witnesses` dan fungsi `deriveLevel` / `canOwnerConfirm` di `lib/sim/`.
- Simulasi: label peringatan AI per konteks, tombol konfirmasi pemilik berkas dan saksi.
- Landing page: penjelasan tingkat bukti dan verifikator per jenis ruang diperbarui.
- Perbaikan bug: ID konteks baru bisa bentrok dengan ID konteks awal, sehingga konfirmasi mengenai konteks yang salah.
- Dokumen 01, 02, 03, 05, 06 diperbarui. 13 uji lulus.

## 2026-10-23, v0.1 rancangan + landing page

### Dikerjakan

- Proyek Next.js 16.4.2 + React 19.3 + TypeScript 5.9, tanpa framework CSS.
- Landing page (`app/page.tsx`) dengan simulasi berkas interaktif (`components/Simulator.tsx`).
- Mesin simulasi penilaian dan anti-kecurangan (`lib/sim/`), 9 uji dengan test runner bawaan Node.
- Dokumen 01 sampai 06 di folder `docs/`.
- Favicon tanda §.

### Keputusan

| Keputusan | Alasan | Alternatif yang ditolak |
|---|---|---|
| Next.js 16.4.2, bukan 15.5 | Next 15.5 membawa PostCSS dengan kerentanan tingkat tinggi menurut `npm audit`; 16.4.2 bersih | Next 15.5 |
| Test runner bawaan Node (`node --test`), bukan Vitest | Vitest 3 punya kerentanan kritis di dependensinya; Node 22 sudah bisa menjalankan TypeScript langsung | Vitest 3, Vitest 5 (lompatan besar tanpa kebutuhan) |
| CSS biasa dengan token, bukan Tailwind | Sistem desain kecil dan spesifik; token warna dipakai juga di SVG | Tailwind |
| Supabase untuk Auth + DB (rencana) | Postgres + RLS + Auth + Storage dalam satu layanan; pgvector untuk kemiripan | Firebase (tanpa SQL/RLS), Auth.js + DB terpisah |
| Claude API untuk penilai (rencana) | Keluaran terstruktur, prompt caching untuk konteks berkas | |
| Simulasi memakai heuristik, bukan AI | Landing page harus jalan tanpa kunci API dan tanpa biaya; dilabeli jelas | Memanggil AI dari landing page |
| Konteks dikunci saat fase usulan dibuka | Mencegah penggiringan hasil lewat konteks | Konteks bisa ditambah kapan saja |
| Skor disembunyikan selama fase usulan (aplikasi nyata) | Penangkal jiplakan paling murah | Skor langsung terlihat |
| Palet marun, kuningan, hijau tembaga di atas gading | Membawa makna merah-hijau dari sketsa awal dengan rasa dokumen hukum | Merah-hijau terang seperti sketsa |
| Caslon + Plex Sans + Plex Mono | Caslon untuk rasa naskah resmi; Plex untuk keterbacaan antarmuka | Playfair (terlalu dekoratif), Times (terlalu umum) |
| Tidak ada tombol "Masuk" di landing page | Login belum dibangun; tombol mati menyesatkan | Tombol "Masuk" nonaktif |

### Verifikasi

- `npm run typecheck`, `npm test` (9 lulus), `npm run build` lulus.
- Uji Playwright di 375px dan 1280px, tema terang dan gelap: semua tombol simulasi, menu mobile (Escape menutup), tombol tema. Tidak ada scroll horizontal, tidak ada galat konsol.

### Belum

- Repo belum terhubung ke Vercel (perlu akun pemilik).
- Belum ada login, database, atau AI sungguhan.
