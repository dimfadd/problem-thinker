# 02. Rancangan Sistem

Status: draf v0.1, 23 Oktober 2026

## 1. Arsitektur

```
 Browser (HP / laptop)
   |
   v
 Next.js 16 di Vercel  (App Router, Server Components, Server Actions, Route Handlers)
   |            |                     |
   |            v                     v
   |     Supabase Auth          Supabase Storage (dokumen bukti, fase 2)
   v
 Supabase Postgres  (Row Level Security per ruang kerja, pgvector untuk kemiripan)
   ^
   |  antrean: tabel scoring_jobs + Vercel Cron / Supabase Edge Function worker
   |
 Worker penilaian  ->  Claude API (penilai)  +  model embedding (cek kemiripan)
```

Kenapa pilihan ini:

| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16 | Satu basis kode untuk UI dan API; preview otomatis per branch di Vercel |
| Hosting | Vercel | Diminta; preview deployment per push |
| Auth + DB | Supabase | Postgres + Auth + Storage + RLS dalam satu layanan; ada paket gratis untuk tahap awal |
| Kemiripan | pgvector | Cek duplikat/jiplakan di database yang sama, tanpa layanan tambahan |
| Penilai | Claude API | Mendukung keluaran terstruktur (JSON) untuk rubrik; model dikunci per berkas |
| Antrean | Tabel Postgres + worker | Cukup untuk MVP; bisa diganti layanan antrean bila volume naik |

## 2. Model data (Postgres)

```sql
-- akun & ruang kerja
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  phone_verified_at timestamptz,
  created_at timestamptz default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('pemerintah','perusahaan','organisasi')),
  allowed_email_domain text,           -- untuk undangan per domain
  ai_monthly_quota int not null default 500,
  created_at timestamptz default now()
);

create table memberships (
  workspace_id uuid references workspaces on delete cascade,
  user_id uuid references profiles on delete cascade,
  role text not null check (role in ('owner','moderator','member')),
  primary key (workspace_id, user_id)
);

-- berkas
create table problems (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  number text unique not null,         -- PT-2026-0007
  title text not null,
  body text not null,
  owner_id uuid not null references profiles,
  visibility text not null check (visibility in ('public','workspace')),
  proposer_policy text not null check (proposer_policy in ('public_verified','workspace','invited')),
  phase text not null default 'draft'
    check (phase in ('draft','context_open','proposals_open','closed','published','archived')),
  scoring_config jsonb not null,       -- model, versi prompt, bobot rubrik; dikunci saat proposals_open
  created_at timestamptz default now()
);

create table contexts (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems on delete cascade,
  author_id uuid not null references profiles,
  statement text not null check (char_length(statement) between 30 and 400),
  source_type text not null check (source_type in ('berita','dokumen','narasumber','data')),
  source_ref text not null check (char_length(source_ref) >= 8),
  source_file_path text,               -- fase 2, Supabase Storage
  evidence_level smallint not null default 0 check (evidence_level between 0 and 3),
  verified_by uuid references profiles,
  status text not null default 'active' check (status in ('active','disputed','withdrawn')),
  created_at timestamptz default now()
);

create table context_disputes (
  id uuid primary key default gen_random_uuid(),
  context_id uuid not null references contexts on delete cascade,
  author_id uuid not null references profiles,
  reason text not null,
  source_ref text not null,            -- bantahan juga wajib bersumber
  resolution text check (resolution in ('upheld','rejected')),
  created_at timestamptz default now()
);

-- usulan (setiap edit = baris baru, versi lama ditandai superseded)
create table proposals (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems on delete cascade,
  author_id uuid not null references profiles,
  version int not null default 1,
  supersedes uuid references proposals,
  body text not null check (char_length(body) between 60 and 1000),
  embedding vector(1024),
  status text not null default 'pending'
    check (status in ('pending','scored','flagged','quarantined','rejected','superseded')),
  created_at timestamptz default now()
);
create index on proposals using hnsw (embedding vector_cosine_ops);

create table scores (
  proposal_id uuid primary key references proposals on delete cascade,
  total smallint not null check (total between 0 and 100),
  rubric jsonb not null,               -- {akar_masalah, kelayakan, spesifik, risiko}
  reasons jsonb not null,              -- alasan per rubrik + konteks yang dirujuk
  model text not null,
  prompt_version text not null,
  context_snapshot_hash text not null, -- konteks yang dipakai saat menilai
  created_at timestamptz default now()
);

create table fraud_flags (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals on delete cascade,
  rule text not null,                  -- AF-01 .. AF-09
  detail jsonb not null,
  reviewed_by uuid references profiles,
  outcome text check (outcome in ('cleared','confirmed')),
  created_at timestamptz default now()
);

create table scoring_jobs (
  id bigserial primary key,
  proposal_id uuid not null references proposals on delete cascade,
  attempts int not null default 0,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz default now()
);

create table audit_log (
  id bigserial primary key,
  problem_id uuid references problems on delete cascade,
  actor_id uuid references profiles,
  action text not null,                -- context.added, proposal.rejected, phase.changed, ...
  payload jsonb not null,
  created_at timestamptz default now()
);
```

### Row Level Security (inti)

- `problems` publik bisa dibaca siapa saja; `workspace` hanya oleh anggota.
- `contexts` insert hanya bila fase `context_open` dan pengguna punya hak kontributor.
- `proposals` insert hanya bila fase `proposals_open`, pengguna lolos `proposer_policy`, dan jumlah usulan aktif miliknya < 3.
- `proposals` + `scores` milik orang lain **tidak bisa dibaca pengusul** selama `proposals_open`. Pemilik berkas dan moderator bisa.
- `audit_log` hanya bisa ditulis oleh server (service role), tidak oleh klien.

## 3. Alur pengiriman usulan

```
1. Klien kirim usulan (Server Action)
2. Server: cek sesi, fase, kebijakan pengusul, batas laju (per akun + per IP)
3. Server: cek pola injeksi (regex + klasifikasi ringan)    -> quarantined, berhenti
4. Server: hitung embedding
5. Server: kemiripan dengan usulan sendiri >= 0,90 cosine   -> rejected (AF-01)
6. Server: hitung usulan aktif >= 3                         -> rejected (AF-02)
7. Simpan proposals(status=pending) + scoring_jobs
8. Worker: ambil job, susun prompt (masalah + konteks terkunci + rubrik + usulan sebagai data)
9. Worker: panggil Claude, validasi JSON keluaran (skema ketat), ulang maks 2 kali bila gagal
10. Worker: kemiripan dengan usulan orang lain >= 0,90       -> flagged (AF-03), skor disimpan tapi tidak masuk garis
11. Simpan scores, ubah status, tulis audit_log
```

Ambang 0,90 cosine adalah titik awal; dikalibrasi dengan data nyata. Simulasi di landing page memakai Jaccard kata dengan ambang 0,6 karena tidak ada embedding di browser.

## 4. Halaman dan rute

| Rute | Isi | Akses |
|---|---|---|
| `/` | Landing page + simulasi | Publik |
| `/masuk`, `/daftar` | Auth | Publik |
| `/r/[workspace]` | Daftar berkas ruang kerja | Anggota |
| `/r/[workspace]/pengaturan` | Anggota, peran, domain, kuota | Pemilik |
| `/b/[number]` | Berkas: masalah, konteks, garis, usulan saya | Sesuai visibilitas |
| `/b/[number]/kelola` | Fase, moderasi, karantina, audit | Pemilik berkas, moderator |
| `/b/[number]/hasil` | Garis penilaian final + usulan terpilih | Setelah `closed` |
| `/akun` | Profil, verifikasi HP, usulan saya | Masuk |

## 5. Keamanan

- Semua penulisan lewat server (Server Actions/Route Handlers), validasi skema di server.
- RLS aktif di semua tabel; service role key hanya ada di server dan worker.
- Kunci API (Claude, Supabase service role) hanya di Environment Variables Vercel, tidak pernah di klien.
- Batas laju: per akun dan per IP pada kirim usulan, tambah konteks, daftar akun.
- Data pribadi: nomor HP disimpan di Supabase Auth; nama narasumber bisa disamarkan di tampilan publik.
- Catatan audit tidak bisa diubah klien.

## 6. Lingkungan dan deploy (Vercel)

| Lingkungan | Branch | Database |
|---|---|---|
| Production | `main` | Supabase project produksi |
| Preview | branch lain (termasuk `claude/*`) | Supabase project staging |
| Lokal | apa saja | Supabase lokal (CLI) atau staging |

Variabel lingkungan yang akan dipakai (belum dibutuhkan untuk landing page saat ini):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # server saja
ANTHROPIC_API_KEY              # server saja
SCORING_MODEL                  # dikunci per berkas, ini nilai default
```

Langkah deploy pertama ada di `README.md`.

## 7. Biaya (perkiraan kasar, perlu dihitung ulang)

[Menebak] Biaya terbesar adalah panggilan AI per usulan. Cara menekan:

- Cek duplikat dan injeksi **sebelum** memanggil AI.
- Prompt caching untuk bagian masalah + konteks (sama untuk semua usulan di satu berkas).
- Kuota bulanan per ruang kerja.
