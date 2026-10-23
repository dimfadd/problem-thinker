# Problem Thinker

Aplikasi web untuk menyusun satu masalah menjadi **berkas**: konteks wajib bersumber, usulan solusi dinilai AI terhadap masalah + konteks, lalu ditampilkan di garis penilaian dari "jauh dari solusi" ke "dekat dengan solusi". Untuk pemerintah, perusahaan, dan organisasi.

Status: **v0.1, tahap rancangan.** Isinya landing page dengan simulasi di browser. Belum ada login, database, atau AI sungguhan.

## Dokumen rancangan

| Dokumen | Isi |
|---|---|
| [01 Rancangan produk](docs/01-rancangan-produk.md) | Visi, peran, siklus berkas, fitur per fase, risiko |
| [02 Rancangan sistem](docs/02-rancangan-sistem.md) | Arsitektur, skema database, RLS, alur penilaian, rute, keamanan, deploy |
| [03 Penilaian AI & anti-kecurangan](docs/03-penilaian-ai-dan-anti-fraud.md) | Rubrik, prompt penilai, kalibrasi, daftar AF-00 sampai AF-12 |
| [04 Rancangan UI/UX](docs/04-rancangan-ui-ux.md) | Huruf, warna + kontras, komponen, wireframe layar, responsif, aksesibilitas |
| [05 Rancangan landing page](docs/05-rancangan-landing-page.md) | Struktur halaman, spesifikasi simulasi, keputusan desain |
| [06 Roadmap](docs/06-roadmap.md) | Fase 0 sampai 3, pertanyaan terbuka |
| [LOG](docs/LOG.md) | Log pengerjaan dan keputusan |

## Menjalankan di komputer

Butuh Node.js 22.18 atau lebih baru.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # uji logika simulasi
npm run typecheck
npm run build
```

## Deploy ke Vercel (sekali saja)

1. Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub.
2. **Add New → Project**, pilih repo `dimfadd/problem-thinker`, lalu **Import**.
3. Framework terdeteksi otomatis sebagai Next.js. Biarkan Build Command, Output, dan Root Directory bawaan. Tidak perlu variabel lingkungan untuk v0.1.
4. **Deploy**.

Setelah terhubung:

- Setiap push ke branch selain `main` (misalnya `claude/nice-edison-xndgop`) otomatis membuat **Preview Deployment** dengan URL sendiri. Kalau ada pull request, URL-nya juga muncul di halaman PR.
- Push atau merge ke `main` menjadi **Production**.
- Kalau production ingin dari branch lain sementara waktu: Project → Settings → Environments → Production → Branch Tracking.

## Struktur

```
app/              layout, halaman, gaya global, favicon
components/       SiteHeader (navigasi + tema), Simulator (simulasi berkas)
lib/sim/          data fiktif, mesin penilaian heuristik, anti-kecurangan, uji
docs/             dokumen rancangan dan log
```
