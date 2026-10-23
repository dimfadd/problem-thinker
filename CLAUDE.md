# Problem Thinker

## Alur kerja

- Push setiap update langsung ke `main` (arahan pemilik repo, 2026-10-23). Vercel otomatis redeploy production dari `main`.
- Sebelum push: `npm run typecheck`, `npm test`, `npm run build` harus lulus. Untuk perubahan UI, cek juga di lebar 375px dan 1280px, tema terang dan gelap.
- Jangan rewrite history atau force-push ke `main`.
- Catat setiap perubahan dan keputusan di `docs/LOG.md`.

## Konten landing page

- Bahasa sehari-hari untuk orang awam. Hindari istilah internal (berkas, konteks, rubrik, fase, karantina, kode AF) di halaman.
- Jangan tampilkan tautan GitHub atau rujukan ke repositori di halaman.
- Jangan pakai tanda pisah panjang di teks UI.
- Angka, statistik, dan kutipan harus bersumber nyata; data contoh dilabeli simulasi.
