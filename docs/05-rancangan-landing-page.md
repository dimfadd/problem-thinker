# 05. Rancangan Landing Page

Status: dibangun di `app/page.tsx` dan `components/Simulator.tsx`, v0.1

## 1. Tujuan halaman

1. Menjelaskan cara kerja Problem Thinker dalam satu kali baca.
2. Membiarkan pengunjung **mencoba** alurnya tanpa akun: tambah konteks bersumber, kunci konteks, kirim usulan, lihat skor dan aturan anti-kecurangan.
3. Jujur soal status: belum ada akun, data nyata, atau AI sungguhan.

## 2. Urutan bagian (v0.4, bahasa sederhana)

Masukan uji pengguna (pemilik produk mengetes ke orang baru): versi v0.3 membingungkan. Penyebab: istilah internal (berkas, konteks, rubrik, tingkat bukti, fase, karantina, kode AF), 9 bagian, dan tabel teknis. v0.4 ditulis ulang dengan aturan:

- Bahasa sehari-hari. "Konteks" menjadi "fakta", "skor" menjadi "nilai", "karantina" menjadi "ditahan untuk diperiksa admin".
- Satu gagasan per bagian, kalimat pendek.
- Pengunjung bisa paham hanya dari pembuka: contoh usulan merah dan hijau langsung terlihat.
- Fitur lengkap tetap ada, tetapi disembunyikan di bawah tombol "Mau mencoba fitur lengkapnya?".
- Tidak ada tautan ke repositori kode.

| # | Bagian | Isi |
|---|---|---|
| 0 | Pembuka | "Cari solusi terbaik untuk sebuah masalah, bersama-sama, berdasarkan fakta." + contoh garis dengan usulan D (merah, 15) dan A (hijau, 93) beserta alasan singkat |
| § 1 | Cara kerja | 4 langkah: tulis masalah, tambah fakta bersumber, orang mengusulkan, AI menilai di garis |
| § 2 | Contoh | Tur animasi 5 langkah kasus karhutla, berjalan sendiri |
| § 3 | Coba | Tulis usulan, lihat nilai, posisi di garis, dan 4 pertanyaan dengan tanda centang/silang. Fitur lengkap di dalam lipatan |
| § 4 | Peran AI | 4 pertanyaan penilaian (dengan bobot) + yang tidak dilakukan AI |
| § 5 | Sulit dicurangi | 6 pasangan "kalau ada yang ... / yang terjadi ..." |
| § 6 | Ribuan usulan | Gelembung kelompok usulan mirip |
| § 7 | Untuk siapa | Pemerintah, perusahaan, organisasi, dengan contoh |
| § 8 | Paket | Tabel gratis / berlangganan / kontrak, harga belum ditetapkan |

Dihapus dari halaman (tetap ada di dokumen): tabel kode anti-kecurangan, daftar tingkat bukti, bagian status pengerjaan, tautan GitHub.

Batas yang perlu diketahui: penyederhanaan ini belum diuji ulang ke orang baru. Uji berikutnya sebaiknya: minta 3 sampai 5 orang membuka halaman tanpa penjelasan, lalu tanyakan "aplikasi ini untuk apa?" dan "apa peran AI-nya?".

## 3. Skenario: karhutla

Berkas `PT-2026-0012` "Karhutla berulang setiap musim kemarau". Konteks [1], [2], [4], [5] merangkum berita nyata dan menautkan sumbernya. [3] adalah contoh klaim media sosial yang melebihi sumber.

| No | Pernyataan | Sumber | Status AI | Tingkat |
|---|---|---|---|---|
| [1] | 99% karhutla 2019 ulah manusia; 80% lahan terbakar jadi kebun | Sekretariat Kabinet, Sep 2019 | cocok | 2 |
| [2] | 64 lokasi disegel, 20 konsesi asing (sebagian besar Malaysia & Singapura), 5 tersangka | Bisnis.com, 1 Okt 2019 | cocok | 2 |
| [3] | "Perusahaan asing sengaja membakar" | Unggahan media sosial (fiktif) | melebihi sumber | 0 |
| [4] | Bantuan BNPB menunggu status darurat dari pemda (UU 24/2007 Ps. 50) | Antara Babel | cocok + 2 saksi | 3 |
| [5] | MA tolak kasasi pemerintah; negara wajib buat aturan pencegahan dan evaluasi izin | Mongabay, 22 Jul 2019 | cocok | 2 |

Angka kerugian di badan masalah: Bank Dunia, US$5,2 miliar untuk 2019 (dikutip CNBC, 11 Des 2019).

Pilihan kata disengaja: perusahaan asing ditulis "disegel" dan "tersangka", bukan "pembakar", karena itu status hukum yang diberitakan. Klaim "sengaja" dipakai sebagai contoh yang diberi peringatan AI.

Usulan contoh (skor heuristik terhadap konteks di atas):

| Akun | Inti usulan | Skor |
|---|---|---|
| A | Status darurat otomatis berbasis titik panas + audit izin + insentif buka lahan tanpa bakar + risiko | 93 |
| B | Evaluasi dan cabut izin konsesi yang terbakar 2 tahun berturut-turut | 60 |
| C | Tambah patroli dan water bombing | 40 |
| D | Usir semua perusahaan asing | 15 |
| E | Pemerintah harus lebih tegas | 0 |

## 3a. Tur animasi (§ 2)

- Berjalan sendiri saat panggung tur terlihat minimal 30% di layar; berhenti saat keluar layar. Tidak berjalan sendiri bila pengguna memilih gerak minimal (`prefers-reduced-motion`).
- Kontrol: putar/jeda, mundur, maju, lompat ke langkah mana pun. Setelah disentuh pengguna, tur tidak lagi dikendalikan posisi scroll.
- Langkah (v0.4): (1) ada masalah, (2) orang menambahkan fakta dengan sumber, (3) AI mengecek sumber dan menandai klaim media sosial "sumbernya tidak bilang begitu", (4) orang mengirim usulan dan AI menilai dengan 4 pertanyaan, (5) contoh merah (D) dan hijau (A) dengan alasan dalam bahasa sehari-hari.
- Di HP: narasi dan kontrol di atas panggung, hanya langkah aktif yang tampil.

## 3b. Tampilan ribuan usulan (§ 6)

Satu titik per akun hanya terbaca sampai sekitar 30 sampai 50 usulan. Untuk berkas besar, garis yang sama ditampilkan dalam tiga lapis:

1. **Sebaran**: histogram 50 rentang skor di atas garis.
2. **Klaster usulan mirip**: AI mengelompokkan usulan berdasarkan kemiripan isi. Satu gelembung per klaster, ukuran = jumlah usulan (luas sebanding jumlah), posisi = rata-rata skor, warna mengikuti posisi di garis. Gelembung ditempatkan tanpa tumpang tindih.
3. **Posisi Anda**: garis kuningan + peringkat.

Aturan peralihan di aplikasi: <= 50 usulan memakai titik per akun; > 50 memakai tiga lapis; selalu bisa membuka daftar usulan satu per satu dari klaster atau rentang skor.

## 3c. Simulasi lengkap (di dalam lipatan § 3)

Alur:

1. **Fase konteks.** Pengunjung bisa menambah konteks. Validasi: pernyataan >= 30 karakter, rujukan wajib, jenis berita wajib URL. AI (simulasi) memeriksa sumber: URL dianggap cocok, dokumen tanpa unggahan dan narasumber memicu peringatan. Konteks berperingatan punya tombol "Konfirmasi sebagai pemilik berkas" (naik ke tingkat 1) dan "Saksi membenarkan" (2 saksi = tingkat 3).
2. **Kunci konteks, buka usulan.** 5 usulan akun simulasi dinilai terhadap konteks saat itu (termasuk konteks tambahan pengunjung) dan muncul di garis.
3. **Kirim usulan.** Jeda 0,9 detik (status memuat), lalu salah satu hasil: dinilai, ditandai, ditolak, atau dikarantina.
4. **Pilih titik** untuk melihat rincian rubrik dan alasan.
5. **Ulang simulasi** mengembalikan semua ke awal.

Tombol isi cepat:

| Tombol | Yang terjadi |
|---|---|
| Usulan lengkap | Skor tinggi (sekitar 80) |
| Coba kirim ulang | Mengisi usulan terakhir Anda, lalu ditolak AF-01 |
| Jiplak usulan Akun A | Diterima tapi ditandai AF-03, tidak masuk garis |
| Perintah ke penilai | Dikarantina AF-04 |
| Tumpuk kata kunci | Kena penalti AF-05, skor rendah |

Usulan keempat dari akun "Anda" ditolak AF-02 (batas 3).

## 4. Keputusan desain (alasan satu baris)

| Keputusan | Alasan |
|---|---|
| Latar gading, bukan putih | Meniru kertas dokumen; lebih lembut untuk bacaan panjang |
| Judul Caslon | Huruf naskah resmi; membawa rasa hukum tanpa simbol klise |
| Satu aksen kuningan | Menandai milik Anda dan penomoran pasal; tidak dipakai di tempat lain |
| Bayangan hanya di kartu berkas hero | Satu-satunya "dokumen yang diangkat"; elemen lain datar |
| Tabel untuk anti-kecurangan | Isinya memang data berbaris (kode, pola, penangkal); di HP berubah jadi daftar berlabel |
| Mode pengguna sebagai baris, bukan 3 kartu kembar | Isinya perbandingan aturan, lebih mudah dibandingkan bila sejajar |
| Rubrik sebagai daftar berangka besar | Angka bobot adalah informasi utamanya |
| Tidak ada ilustrasi | Kartu berkas dan garis penilaian sudah merupakan gambaran produk |
| Garis ticks 0/25/50/75/100 | Posisi titik bisa dibaca tanpa bergantung warna |

## 5. Laporan Delivery Gate (antislop), v0.1

Hard Gate:

- R-02 PASS: teks UI tidak memakai tanda pisah panjang.
- R-03 PASS: diuji Playwright di lebar 375px dan 1280px, `scrollWidth - innerWidth = 0`.
- R-17 / R-18 / R-36 / R-38 PASS: tidak ada statistik, testimoni, atau klaim keamanan. Semua data simulasi dilabeli fiktif.
- R-24 PASS: navigasi hanya ke 5 bagian yang ada.
- R-25 PASS: kontras dihitung, tabel di dokumen 04.
- R-26 PASS: semua tombol diuji otomatis (tambah konteks, kunci, 5 isi cepat, kirim, ulang, titik, menu, tema).
- R-27 PASS: garis punya status kosong, memuat (bilah), galat (pemberitahuan penolakan).
- R-32 PASS: kontrol berupa `button`/`a`/`input` asli, fokus terlihat, menu tertutup Escape.
- R-34 PASS: tema terang dan gelap diuji tangkapan layar.
- R-35 PASS: `npm run build`, `npm test`, uji Playwright tanpa galat konsol.

Liveliness: dial ENERGY 1 / RHYTHM 2 / MOTION 2; fokus per layar (judul hero, simulasi); aksen tunggal kuningan; motif § dan rujukan bernomor.
