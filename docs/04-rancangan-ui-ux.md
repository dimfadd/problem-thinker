# 04. Rancangan UI/UX

Status: draf v0.1, 23 Oktober 2026

## 1. Arah visual: "berkas perkara"

Rasa yang dituju: hukum dan keadilan yang **tenang dan bisa dipercaya**, bukan megah atau menakutkan. Rujukannya adalah dokumen cetak resmi: kertas gading, tinta biru tua, catatan kaki sumber, nomor berkas, tanda pasal (§).

Yang sengaja dihindari: palu hakim, timbangan emas mengilap, pilar Yunani, ikon perisai. Simbol itu klise dan cenderung terasa mengintimidasi untuk aplikasi partisipasi.

Design Read: aplikasi civic-tech untuk pengambil keputusan dan warga, gaya dokumen hukum cetak, dial ENERGY 1 / RHYTHM 2 / MOTION 2.

## 2. Tipografi

| Peran | Huruf | Alasan |
|---|---|---|
| Judul, nomor besar, kutipan | **Libre Caslon Text** (400, 700, italic) | Caslon adalah huruf cetak naskah resmi dan dokumen hukum sejak abad ke-18. Memberi rasa "dokumen yang bisa dipertanggungjawabkan". |
| Teks antarmuka, isi | **IBM Plex Sans** (400 sampai 700) | Netral dan institusional, terbaca baik di layar HP, punya angka yang jelas. Menyeimbangkan Caslon supaya tidak terasa kuno. |
| Nomor berkas, kode aturan, angka skala | **IBM Plex Mono** (400, 500) | Hanya untuk penanda identitas yang perlu dibaca persis (PT-2026-0007, AF-03, [1]). Tidak dipakai besar-besar. |

Skala: judul hero `clamp(2.1rem, 6vw, 3.6rem)`, judul bagian `clamp(1.75rem, 4.2vw, 2.6rem)`, isi 16px, catatan 13 sampai 14px. Semua dimuat lewat `next/font` (di-host sendiri, tidak memanggil Google saat runtime).

## 3. Warna

Palet inti 3 warna + 1 aksen, plus netral kertas/tinta.

| Token | Terang | Gelap | Peran |
|---|---|---|---|
| `--paper` | `#F6F1E6` | `#11151D` | Latar, kertas gading / malam |
| `--card` | `#FFFCF5` | `#191F2B` | Permukaan panel |
| `--ink` | `#1A2232` | `#EEE7D7` | Teks utama |
| `--ink-2` | `#4B5466` | `#AEB4C1` | Teks sekunder |
| `--navy` (inti) | `#1E3A5F` | `#9DB8DE` | Tinta resmi: tombol utama, tautan, tingkat bukti |
| `--oxblood` (inti) | `#8B2433` | `#E58792` | Merah marun: ujung "jauh dari solusi", error, penolakan |
| `--verdigris` (inti) | `#2B6650` | `#78C7A8` | Hijau tembaga: ujung "dekat solusi", berhasil |
| `--brass` (aksen) | `#A9802A` / teks `#7A5A12` | `#D9B464` | Kuningan: satu-satunya aksen. Tanda §, titik milik Anda, status |

Kenapa merah marun dan hijau tembaga, bukan merah-hijau terang seperti gambar awal: tetap membawa makna merah = jauh dan hijau = dekat, tetapi lebih tenang dan cocok dengan rasa dokumen. Gradasi garis penilaian: marun, lalu kuningan di tengah, lalu hijau tembaga.

Warna bukan satu-satunya penanda: setiap titik juga punya skor angka dan label, supaya bisa dibaca pengguna buta warna.

### Kontras (WCAG AA, dihitung)

| Pasangan | Terang | Gelap |
|---|---|---|
| ink di paper | 14.1 | 14.8 |
| ink-2 di paper | 6.8 | 8.8 |
| navy di paper | 10.2 | 9.0 |
| oxblood di paper | 7.8 | 7.2 |
| verdigris di paper | 6.0 | 9.2 |
| brass-text di paper | 5.7 | 9.3 |
| teks di titik "Anda" | 6.6 | 8.1 |

## 4. Motif identitas

1. **Tanda pasal §** sebagai penomoran bagian dan logo kata.
2. **Rujukan bernomor [1] [2]** yang menghubungkan usulan, alasan skor, dan konteks.
3. **Garis bawah ganda** di kepala berkas dan detail skor, meniru garis penutup dokumen resmi.
4. **Map arsip**: kartu berkas punya tab kecil di atas.

## 5. Komponen

| Komponen | Catatan |
|---|---|
| Tombol utama | Latar navy, radius 4px, tinggi min 44px. Teks spesifik aksi ("Kirim usulan untuk dinilai"). |
| Tombol sekunder | Garis tepi, transparan. |
| Chip isi cepat | Garis putus-putus, menandakan "contoh, bukan aksi final". |
| Kartu berkas | Radius 6px, tab arsip, garis ganda di kepala. Satu-satunya elemen dengan bayangan (menandai "dokumen yang diangkat"). |
| Daftar konteks | Nomor rujukan mono kuningan, sumber dalam italic serif, indikator tingkat bukti 3 bar. |
| Garis penilaian | Gradasi marun ke hijau, ticks 0/25/50/75/100, titik 32px (area sentuh 44px), titik yang berdekatan turun lajur. |
| Detail skor | Angka besar serif, kutipan usulan, 4 meter rubrik, daftar alasan. |
| Pemberitahuan | Garis kiri berwarna: hijau (berhasil), kuningan (ditandai), marun (ditolak/karantina). |
| Catatan audit | `<details>` yang bisa dibuka, waktu dalam mono. |

Status wajib di setiap tampilan data: kosong, memuat, galat.

## 6. Layar aplikasi (rancangan)

### 6.1 Berkas (`/b/[number]`), HP

```
+---------------------------------+
| § Problem Thinker        [=]    |
+---------------------------------+
| PT-2026-0007     Fase: usulan   |
| Banjir tahunan di Sukamaju      |
| Setiap musim hujan ...          |
| [Masalah] [Konteks] [Usulan]    |  <- tab di HP
+---------------------------------+
| [1] Saluran menyempit ...       |
|     Dokumen resmi, hlm. 14      |
|     ||| Dokumen terlampir       |
| [2] ...                         |
+---------------------------------+
| Usulan saya (1 dari 3)          |
| [ tulis usulan .............. ] |
| [Kirim usulan untuk dinilai]    |
+---------------------------------+
```

### 6.2 Berkas, laptop

```
+-------------------------------------------------------------------+
| § Problem Thinker   Ruang kerja v   Berkas   Moderasi     [akun]  |
+-------------------------------+-----------------------------------+
| PT-2026-0007                  | Garis penilaian (setelah ditutup) |
| Banjir tahunan ...            | 0 ---- 25 ---- 50 ---- 75 ---- 100 |
| Konteks [1] [2] [3]           |   C      B   D            A        |
| + Tambah konteks (fase 2)     | Detail usulan terpilih            |
|                               | Rubrik: 35 / 25 / 20 / 20          |
+-------------------------------+-----------------------------------+
```

### 6.3 Kelola berkas (`/b/[number]/kelola`)

- Pengubah fase dengan konfirmasi (mengunci konteks).
- Antrean: konteks menunggu verifikasi, usulan dikarantina, usulan ditandai.
- Catatan audit lengkap dengan filter.

### 6.4 Masuk/daftar

- Satu kolom, maks 400px. Email + kata sandi, magic link, Google.
- Setelah daftar: verifikasi email; untuk mengusulkan di berkas publik: verifikasi HP (fase 2).

## 7. Responsif

| Breakpoint | Perilaku |
|---|---|
| < 560px | Satu kolom, formulir bertumpuk, tabel menjadi daftar berlabel |
| 560 sampai 899px | Formulir 2 kolom, navigasi masih di menu |
| >= 900px | Navigasi penuh di header |
| >= 1000px | Simulasi/berkas dua kolom |

Gutter 16px di HP, 32px di tablet ke atas. Lebar isi maks 1160px.

## 8. Aksesibilitas

- Semua kontrol bisa dipakai dengan keyboard; menu mobile tertutup dengan Escape.
- Fokus terlihat (garis 2px navy, kuningan di tema gelap).
- `aria-live` untuk hasil penilaian dan catatan audit.
- Tautan "Langsung ke simulasi" di awal halaman.
- `prefers-reduced-motion` mematikan animasi titik dan scroll halus.

## 9. Gerak (MOTION 2)

| Gerak | Tujuan |
|---|---|
| Titik meluncur ke posisi skor (0,7 detik) | Menunjukkan bahwa posisi adalah hasil penilaian |
| Bilah memuat saat menilai | Memberi tahu ada proses yang sedang berjalan |
| Hover tombol | Umpan balik dasar |

Tidak ada animasi muncul-saat-scroll; halaman ini dibaca, bukan ditonton.

## 10. Tema

Terang adalah bawaan (rasa kertas). Gelap tersedia lewat tombol di header dan mengikuti pengaturan sistem bila belum dipilih. Pilihan disimpan di `localStorage` (`pt-theme`).
