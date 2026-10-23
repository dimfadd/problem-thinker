# 06. Roadmap

Status: draf v0.1, 23 Oktober 2026. Urutan dan cakupan bisa berubah setelah uji dengan pengguna.

## Fase 0: Rancangan (selesai di v0.1)

- [x] Rancangan produk, sistem, penilaian & anti-kecurangan, UI/UX, landing page
- [x] Landing page dengan simulasi di browser
- [x] Uji logika simulasi (`npm test`)
- [x] Hubungkan repo ke Vercel (problem-thinker.vercel.app)
- [x] Merge PR #1 ke `main`; sejak 2026-10-23 setiap update di-push langsung ke `main`

## Fase 1: MVP

1. Supabase: skema tabel, RLS, Auth (email, magic link, Google)
2. Ruang kerja dan undangan anggota
3. CRUD berkas + pengaturan visibilitas dan kebijakan pengusul
4. Konteks bersumber + pemeriksaan sumber oleh AI + konfirmasi pemilik berkas
5. Usulan + versi + batas 3 aktif + batas laju
6. Worker penilaian dengan Claude API, keluaran JSON tervalidasi
7. Embedding + cek duplikat/jiplakan
8. Garis penilaian, detail skor, catatan audit
9. Halaman kelola: fase, karantina, tanda

Selesai bila: satu ruang kerja uji bisa menjalankan satu berkas dari draf sampai hasil diumumkan, dengan semua aturan MVP di dokumen 03 aktif.

## Fase 2: Kepercayaan

- Unggah dokumen bukti, saksi independen + pool saksi acak, bantahan konteks dan kesaksian
- Verifikasi HP, SSO, undangan per domain
- Panel peninjau, banding skor
- Deteksi koordinasi (brigading), notifikasi email

## Fase 3: Skala

- Klaster usulan mirip (tampilan tiga lapis), ekspor PDF, API integrasi, multi-bahasa, pembayaran langganan

## Pertanyaan terbuka

1. ~~Siapa yang memverifikasi sumber di berkas publik?~~ Diputuskan 2026-10-23: AI dulu, pemilik berkas sebagai cadangan, saksi independen untuk verifikasi lanjutan (dokumen 03 bagian 5). Sisa pertanyaan: dari mana pool saksi untuk berkas publik di awal, saat penggunanya masih sedikit?
2. Apakah publik boleh melihat garis penilaian berkas pemerintah, atau hanya instansi?
3. ~~Model bisnis~~ Arah diputuskan 2026-10-23: gratis untuk publik, berlangganan untuk organisasi/perusahaan, kontrak tahunan untuk instansi (dokumen 01 bagian 10). Sisa: angka harga dan kuota, jalur pengadaan pemerintah.
