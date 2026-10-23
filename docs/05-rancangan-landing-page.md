# 05. Rancangan Landing Page

Status: dibangun di `app/page.tsx` dan `components/Simulator.tsx`, v0.1

## 1. Tujuan halaman

1. Menjelaskan cara kerja Problem Thinker dalam satu kali baca.
2. Membiarkan pengunjung **mencoba** alurnya tanpa akun: tambah konteks bersumber, kunci konteks, kirim usulan, lihat skor dan aturan anti-kecurangan.
3. Jujur soal status: belum ada akun, data nyata, atau AI sungguhan.

## 2. Urutan bagian (v0.3)

Urutan mengikuti pertanyaan pengunjung: "ini apa?", "bagaimana cara kerjanya?", "boleh saya coba?", "kalau ramai bagaimana?", "AI-nya ngapain?", "bisa dicurangi?", "untuk siapa?", "berapa?".

| # | Bagian | Isi | Alasan ada |
|---|---|---|---|
| 0 | Pembuka | Judul, penjelasan, tombol "Tonton cara kerjanya" dan "Coba simulasi sendiri", pratinjau berkas karhutla | Janji produk + bentuk berkas |
| § 1 | Cara kerja | Tur animasi 7 langkah yang berjalan sendiri | Pengunjung paham tanpa harus mengklik apa pun |
| § 2 | Coba sendiri | Simulasi interaktif berkas karhutla | Pengunjung merasakan aturan bekerja |
| § 3 | Ribuan usulan | Sebaran + klaster + posisi Anda (1.562 usulan simulasi) | Menjawab "kalau usulannya banyak, titiknya bertumpuk?" |
| § 4 | Peran AI | Yang dikerjakan dan yang tidak dikerjakan AI | Menjawab "kenapa ada AI dan seberapa jauh perannya?" |
| § 5 | Cara menilai | Rubrik 35/25/20/20, batas skor, tingkat bukti | "Kenapa skor saya segini?" |
| § 6 | Anti-kecurangan | Tabel AF-01 sampai AF-13 | Kekhawatiran utama pemilik berkas |
| § 7 | Untuk siapa | Pemerintah, perusahaan, organisasi | Pengaturan per jenis ruang |
| § 8 | Paket | Gratis / berlangganan / kontrak (harga belum ditetapkan) | Dasar komersialisasi |
| § 9 | Status | Sudah ada vs berikutnya | Kejujuran tahap pengerjaan |

Sengaja tidak ada: testimoni, angka pengguna, logo klien, FAQ, angka harga. Belum ada data nyata untuk semua itu.

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

## 3a. Tur animasi (§ 1)

- Berjalan sendiri saat panggung tur terlihat minimal 30% di layar; berhenti saat keluar layar. Tidak berjalan sendiri bila pengguna memilih gerak minimal (`prefers-reduced-motion`).
- Kontrol: putar/jeda, mundur, maju, lompat ke langkah mana pun. Setelah disentuh pengguna, tur tidak lagi dikendalikan posisi scroll.
- Langkah: (1) masalah dibuka, (2) konteks bersumber, (3) AI memeriksa sumber dan menandai [3], (4) pemilik berkas tidak bisa membatalkan peringatan, saksi, konteks dikunci, (5) usulan masuk dan dinilai dengan rubrik, (6) kiriman ulang ditolak dan perintah ke AI dikarantina, (7) contoh merah (D) dan hijau (A) beserta alasannya.
- Di HP: narasi dan kontrol di atas panggung, hanya langkah aktif yang tampil.

## 3b. Tampilan ribuan usulan (§ 3)

Satu titik per akun hanya terbaca sampai sekitar 30 sampai 50 usulan. Untuk berkas besar, garis yang sama ditampilkan dalam tiga lapis:

1. **Sebaran**: histogram 50 rentang skor di atas garis.
2. **Klaster usulan mirip**: AI mengelompokkan usulan berdasarkan kemiripan isi. Satu gelembung per klaster, ukuran = jumlah usulan (luas sebanding jumlah), posisi = rata-rata skor, warna mengikuti posisi di garis. Gelembung ditempatkan tanpa tumpang tindih.
3. **Posisi Anda**: garis kuningan + peringkat.

Aturan peralihan di aplikasi: <= 50 usulan memakai titik per akun; > 50 memakai tiga lapis; selalu bisa membuka daftar usulan satu per satu dari klaster atau rentang skor.

## 3c. Spesifikasi simulasi interaktif (§ 2)

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
