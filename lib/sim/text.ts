// Utilitas teks untuk simulasi. Sengaja sederhana: ini bukan AI,
// hanya pendekatan heuristik supaya alur aplikasi bisa dicoba di browser.

const STOPWORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "ini", "itu",
  "atau", "juga", "akan", "agar", "dalam", "oleh", "karena", "sebagai", "ada",
  "tidak", "bisa", "harus", "lebih", "setiap", "para", "kita", "kami", "saya",
  "anda", "mereka", "sudah", "belum", "secara", "serta", "bagi", "lagi", "sangat",
  "maka", "jadi", "supaya", "hanya", "masih", "telah", "dapat", "tersebut",
  "the", "and", "for", "with",
]);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  if (!n) return [];
  return n.split(" ").filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** Kemiripan Jaccard antar himpunan kata (0..1). */
export function similarity(a: string, b: string): number {
  const sa = new Set(tokenize(a));
  const sb = new Set(tokenize(b));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

/** Apakah salah satu token diawali salah satu akar kata. */
export function matchesAnyRoot(tokens: string[], roots: string[]): string[] {
  const hits = new Set<string>();
  for (const root of roots) {
    if (tokens.some((t) => t.startsWith(root) || (root.length >= 5 && t.includes(root)))) {
      hits.add(root);
    }
  }
  return [...hits];
}

/** Ambil akar kata kasar dari kalimat konteks buatan pengguna. */
export function extractRoots(text: string, max = 6): string[] {
  const seen = new Set<string>();
  for (const t of tokenize(text)) {
    if (t.length < 5 || /^\d+$/.test(t)) continue;
    seen.add(t.slice(0, 6));
    if (seen.size >= max) break;
  }
  return [...seen];
}
