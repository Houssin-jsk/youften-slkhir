import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const brandFont = localFont({
  src: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2",
  weight: "500",
  variable: "--font-brand",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const bodyFont = localFont({
  src: "../node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: "Youften Slkhir | Site officiel en préparation",
  description:
    "Le site officiel de Youften Slkhir, marque marocaine de miel, d’amlou et de produits naturels, est en préparation.",
  icons: { icon: { url: "/logo.png", type: "image/png" }, apple: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${brandFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
