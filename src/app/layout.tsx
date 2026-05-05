import type { Metadata } from "next";
import { Inter, Nunito, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getSiteSettings, settingsToCssVars } from "@/lib/siteSettings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  title: "RehberSepeti — Rehberler & Acenteler",
  description: "Tur rehberlerini ve seyahat acentelerini buluşturan platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const cssVars = settingsToCssVars(settings);

  return (
    <html
      lang="tr"
      style={cssVars as React.CSSProperties}
      data-bg-theme={settings.bg_theme}
      data-card-style={settings.card_style}
    >
      <body className={`${inter.variable} ${nunito.variable} ${poppins.variable} min-h-screen bg-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
