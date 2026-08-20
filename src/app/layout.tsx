import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vibelink-tools.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "VibeLink — Lihat Tujuan Link Sebelum Kamu Klik",
  description: "Periksa redirect, bersihkan tracking, dan lihat tujuan akhir sebuah link secara transparan.",
  alternates: { canonical: "/" },
  openGraph: { title: "VibeLink — Lihat tujuan link sebelum kamu klik", description: "Buka redirect biasa, bersihkan tracking, dan periksa tujuan akhirnya.", url: "/", siteName: "VibeLink", locale: "id_ID", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "VibeLink", description: "Lihat tujuan link sebelum kamu klik.", images: ["/opengraph-image"] },
};

export const viewport: Viewport = { themeColor: "#faf8f5", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body className={`${inter.variable} antialiased`}><TooltipProvider>{children}</TooltipProvider></body></html>;
}
