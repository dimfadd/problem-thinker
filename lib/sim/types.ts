export type SourceType = "berita" | "dokumen" | "narasumber" | "data";

/**
 * Tingkat bukti sebuah konteks (lihat docs/03, bagian verifikasi sumber).
 * 0 = belum terverifikasi (AI ragu / gagal akses, belum dikonfirmasi)
 * 1 = dikonfirmasi pemilik berkas saja (pihak berkepentingan)
 * 2 = dicek AI: sumber terbuka dan isinya cocok dengan pernyataan
 * 3 = disaksikan: minimal 2 saksi independen membenarkan
 */
export type EvidenceLevel = 0 | 1 | 2 | 3;

/** Hasil pemeriksaan sumber oleh AI, lapis pertama verifikasi. */
export type AiCheckStatus = "cocok" | "ragu" | "gagal_akses" | "bertentangan";

export interface AiCheck {
  status: AiCheckStatus;
  note: string;
}

export interface ContextItem {
  id: string;
  statement: string;
  sourceType: SourceType;
  sourceRef: string;
  level: EvidenceLevel;
  aiCheck: AiCheck;
  /** Jumlah saksi independen yang membenarkan. */
  witnesses: number;
  ownerConfirmed: boolean;
  /** Akar kata yang mewakili konsep konteks ini. */
  roots: string[];
  /** Label pendek konsep, dipakai di alasan penilaian. */
  concept: string;
  addedBy: string;
}

export interface Account {
  id: string;
  label: string;
  initials: string;
  isYou?: boolean;
}

export interface Rubric {
  akarMasalah: number; // 0..35
  kelayakan: number; // 0..25
  spesifik: number; // 0..20
  risiko: number; // 0..20
}

export type ProposalStatus = "dinilai" | "ditandai";

export interface Proposal {
  id: string;
  accountId: string;
  text: string;
  createdAt: number;
  status: ProposalStatus;
  score: number;
  rubric: Rubric;
  reasons: string[];
  flags: string[];
}

export type Verdict =
  | { kind: "ditolak"; rule: string; message: string }
  | { kind: "dikarantina"; rule: string; message: string }
  | { kind: "diterima"; proposal: Proposal };
