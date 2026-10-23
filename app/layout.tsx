import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";

// Caslon: huruf cetak dokumen hukum dan naskah resmi, untuk judul.
const serif = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Plex Sans: teks antarmuka. Netral, institusional, terbaca di layar kecil.
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Plex Mono: hanya untuk nomor berkas, nomor rujukan, dan angka skala.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Problem Thinker",
  description:
    "Ruang kerja untuk menyusun masalah, konteks bersumber, dan usulan solusi yang dinilai terhadap konteks tersebut.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e6" },
    { media: "(prefers-color-scheme: dark)", color: "#11151d" },
  ],
};

// Pasang tema tersimpan sebelum halaman dilukis, supaya tidak berkedip.
const themeScript = `try{var t=localStorage.getItem("pt-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
