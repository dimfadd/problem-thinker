# 05. Rancangan Landing Page

Status: dibangun di `app/page.tsx` dan `components/Simulator.tsx`, v0.1

## 1. Tujuan halaman

1. Menjelaskan cara kerja Problem Thinker dalam satu kali baca.
2. Membiarkan pengunjung **mencoba** alurnya tanpa akun: tambah konteks bersumber, kunci konteks, kirim usulan, lihat skor dan aturan anti-kecurangan.
3. Jujur soal status: belum ada akun, data nyata, atau AI sungguhan.

## 2. Urutan bagian

Urutan mengikuti alur berkas, bukan template landing page.

| # | Bagian | Isi | Alasan ada |
|---|---|---|---|
| 0 | Pembuka | Judul, penjelasan 3 kalimat, 2 tombol, pratinjau kartu berkas | Menyatakan janji produk dan memperlihatkan bentuk berkas |
| § 1 | Simulasi | Berkas interaktif: konteks, kunci, usulan, garis, detail skor, catatan audit | Fokus utama halaman; menunjukkan, bukan menceritakan |
| § 2 | Cara menilai | Rubrik 35/25/20/20, batas skor, tingkat bukti | Menjawab "kenapa skor saya segini?" |
| § 3 | Anti-kecurangan | Tabel AF-01 sampai AF-09, mana yang bisa dicoba | Menjawab kekhawatiran utama pemilik berkas |
| § 4 | Untuk siapa | Pemerintah, perusahaan, organisasi: siapa mengusulkan, siapa memverifikasi | Menunjukkan pengaturan per jenis ruang |
| § 5 | Status | Sudah ada vs berikutnya | Kejujuran tahap pengerjaan |
| | Kaki halaman | Versi, tautan repo | |

Sengaja tidak ada: testimoni, angka pengguna, logo klien, FAQ, harga. Belum ada data nyata untuk semua itu.

## 3. Spesifikasi simulasi

Data awal (fiktif): berkas `PT-2026-0007` "Banjir tahunan di Kelurahan Sukamaju", 3 konteks:

| No | Pernyataan | Sumber | Tingkat |
|---|---|---|---|
| [1] | Drainase menyempit dari 2 m ke 0,8 m | Dokumen resmi | 2 |
| [2] | Sampah menumpuk di pintu air, angkut seminggu sekali | Narasumber terverifikasi | 3 |
| [3] | Lahan resapan beralih jadi perumahan | Berita (URL) | 1 |

Alur:

1. **Fase konteks.** Pengunjung bisa menambah konteks. Validasi: pernyataan >= 30 karakter, rujukan wajib, jenis berita wajib URL. Narasumber yang ditambahkan pengunjung masuk tingkat 0.
2. **Kunci konteks, buka usulan.** 4 usulan akun simulasi dinilai terhadap konteks saat itu (termasuk konteks tambahan pengunjung) dan muncul di garis.
3. **Kirim usulan.** Jeda 0,9 detik (status memuat), lalu salah satu hasil: dinilai, ditandai, ditolak, atau dikarantina.
4. **Pilih titik** untuk melihat rincian rubrik dan alasan.
5. **Ulang simulasi** mengembalikan semua ke awal.

Tombol isi cepat:

| Tombol | Yang terjadi |
|---|---|
| Usulan lengkap | Skor tinggi (sekitar 90) |
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
