export type SourceType = "berita" | "dokumen" | "narasumber" | "data";

/**
 * Tingkat bukti sebuah konteks. Di aplikasi nyata tingkat ini naik
 * lewat verifikasi (unggah dokumen, akun narasumber terverifikasi, moderator).
 * 0 = klaim belum diverifikasi, 1 = rujukan publik (URL),
 * 2 = dokumen terlampir, 3 = sumber terverifikasi.
 */
export type EvidenceLevel = 0 | 1 | 2 | 3;

export interface ContextItem {
  id: string;
  statement: string;
  sourceType: SourceType;
  sourceRef: string;
  level: EvidenceLevel;
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
