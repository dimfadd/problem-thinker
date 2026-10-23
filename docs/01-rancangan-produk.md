# 01. Rancangan Produk

Status: draf v0.1, 23 Oktober 2026

## 1. Ringkasan

Problem Thinker adalah aplikasi web (responsif, HP sampai laptop) untuk menyusun satu masalah menjadi **berkas**:

1. **Masalah** ditulis oleh pemilik berkas.
2. **Konteks** ditambahkan dan **wajib bersumber** (berita, dokumen, narasumber, data).
3. **Usulan solusi** dikirim oleh pihak yang diizinkan (publik, karyawan, anggota, akun tertentu).
4. **AI menilai** setiap usulan terhadap masalah + konteks, lalu menaruhnya di **garis penilaian** dari merah (jauh dari solusi) ke hijau (dekat solusi).

Target pengguna: pemerintah dan lembaga publik, perusahaan, organisasi dan komunitas.

## 2. Masalah yang diselesaikan

- Diskusi masalah publik atau internal sering didominasi suara paling keras, bukan bukti.
- Konteks masalah tersebar dan tidak jelas asal-usulnya.
- Usulan solusi menumpuk tanpa cara menilai yang konsisten dan bisa diaudit.

## 3. Prinsip produk

| Prinsip | Konsekuensi di produk |
|---|---|
| Bukti dulu | Konteks tanpa sumber tidak bisa disimpan. Bobot konteks ikut tingkat bukti. |
| Skor bisa ditelusuri | Setiap skor punya rincian per rubrik dan alasan tertulis. |
| Skor bukan kebenaran mutlak | Skor mengukur kecocokan dengan berkas. Keputusan penting tetap ditinjau manusia. |
| Aturan sama untuk semua | Model, prompt, dan rubrik dikunci per berkas. |
| Tahan manipulasi | Fase konteks dikunci sebelum usulan dibuka. Daftar kecurangan di dokumen 03. |

## 4. Istilah

| Istilah | Arti |
|---|---|
| Ruang kerja (workspace) | Wadah milik satu organisasi/instansi/perusahaan. Punya anggota dan peran. |
| Berkas | Satu masalah beserta konteks, usulan, dan catatan auditnya. Bernomor, misal `PT-2026-0007`. |
| Konteks | Pernyataan fakta atau sebab yang menempel pada berkas, wajib bersumber. |
| Tingkat bukti | 0 belum terverifikasi, 1 dikonfirmasi pemilik berkas, 2 dicek AI, 3 disaksikan (lihat dokumen 03 bagian 5). |
| Saksi | Akun independen yang membenarkan sebuah konteks, dengan nama dan dasar kesaksian tercatat. |
| Usulan | Solusi yang diajukan satu akun untuk satu berkas. |
| Garis penilaian | Visual sebaran skor usulan 0 sampai 100. |
| Catatan audit | Log semua kejadian berkas: konteks masuk/ditolak, usulan dinilai/ditolak/dikarantina. |

## 5. Peran

| Peran | Lingkup | Hak utama |
|---|---|---|
| Pemilik ruang kerja | Ruang kerja | Atur anggota, peran, SSO/domain, kuota AI |
| Pemilik berkas | Berkas | Buat berkas, atur siapa boleh menambah konteks/mengusulkan, ganti fase |
| Moderator | Ruang kerja / berkas | Tinjau karantina, tanda, bantahan kesaksian; putuskan banding |
| Saksi | Berkas | Membenarkan konteks bila memenuhi syarat independensi |
| Kontributor konteks | Berkas | Menambah konteks bersumber, membantah konteks |
| Pengusul | Berkas | Mengirim usulan (maks 3 aktif per berkas) |
| Panel peninjau | Berkas | Meninjau usulan teratas sebelum dipakai keputusan |
| Publik | Berkas publik | Membaca; mengusulkan bila diizinkan dan akun terverifikasi |

## 6. Siklus hidup berkas

```
DRAF -> KONTEKS DIBUKA -> USULAN DIBUKA (konteks dikunci) -> PENILAIAN DITUTUP -> HASIL DIUMUMKAN -> DIARSIPKAN
                                                       \-> (opsional) TINJAUAN PANEL sebelum diumumkan
```

- **Konteks dibuka**: konteks boleh ditambah dan dibantah. Sumber diperiksa AI, lalu bila perlu dikonfirmasi pemilik berkas dan saksi.
- **Usulan dibuka**: konteks dikunci. Usulan dinilai saat masuk, tetapi **skor dan isi usulan lain disembunyikan** dari pengusul (mencegah jiplakan).
- **Penilaian ditutup**: tidak ada usulan baru. Garis penilaian dibuka untuk yang berhak melihat.
- **Hasil diumumkan**: pemilik berkas menandai usulan yang dipakai, beserta alasannya.

Pemilik berkas boleh membuka ulang fase konteks; semua usulan lalu **dinilai ulang** dan kejadian ini tercatat di audit.

## 7. Fitur

### MVP (fase 1)

- Daftar/masuk: email + kata sandi, magic link, Google. Verifikasi email wajib.
- Ruang kerja: buat, undang anggota, peran dasar.
- Berkas: buat, edit (saat draf), atur visibilitas (publik/privat ruang kerja) dan siapa yang boleh mengusulkan.
- Konteks: tambah dengan sumber wajib (jenis + rujukan), pemeriksaan sumber oleh AI dengan peringatan publik, konfirmasi pemilik berkas.
- Usulan: kirim, batas 3 aktif, versi baru menggantikan versi lama.
- Penilaian AI dengan rubrik 4 dimensi + alasan; antrean asinkron.
- Anti-kecurangan: duplikat, batas laju, karantina injeksi, penanda jiplakan, penalti kata kunci.
- Garis penilaian + detail skor; catatan audit.

### Fase 2

- Unggah dokumen bukti untuk diperiksa AI, saksi independen (tingkat 3), pool saksi acak.
- Bantahan konteks dan alur moderasi.
- Verifikasi nomor HP; SSO (Google Workspace / Microsoft) dan undangan per domain.
- Panel peninjau dan banding skor.
- Notifikasi email.

### Fase 3

- Laporan ekspor (PDF) untuk rapat/keputusan.
- Pengelompokan usulan mirip (klaster) untuk berkas dengan ribuan usulan.
- API untuk integrasi sistem aduan instansi.
- Multi-bahasa (Indonesia, Inggris).

## 8. Metrik keberhasilan (untuk diukur setelah ada pengguna)

Belum ada data. Yang akan diukur:

- Persentase konteks yang naik ke tingkat bukti 2 atau 3.
- Persentase usulan yang ditolak/dikarantina (indikator tekanan kecurangan).
- Selisih skor AI vs penilaian panel manusia pada sampel (indikator kalibrasi penilai).
- Jumlah berkas yang sampai ke "hasil diumumkan".

## 9. Risiko produk

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Skor dianggap "kebenaran" | Keputusan buruk dibenarkan oleh angka | Teks penjelas di UI, alasan per rubrik, panel manusia untuk keputusan penting |
| Konteks digiring satu pihak | Solusi tertentu otomatis menang | Sumber wajib, tingkat bukti, bantahan, kunci konteks |
| Biaya AI membengkak | Tidak berkelanjutan | Kuota per ruang kerja, cek duplikat sebelum memanggil AI, cache hasil |
| Isu politik sensitif | Tekanan, serangan akun palsu | Verifikasi berlapis, moderasi, catatan audit |
| Data pribadi narasumber | Pelanggaran UU PDP | Persetujuan narasumber, nama bisa disamarkan ke publik, retensi data |
