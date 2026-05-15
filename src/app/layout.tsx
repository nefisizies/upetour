import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getSiteSettings, settingsToCssVars } from "@/lib/siteSettings";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

export const metadata: Metadata = {
  title: "UpeTour — Rehberler & Acenteler",
  description: "Tur rehberlerini ve seyahat acentelerini buluşturan platform",
  icons: { icon: "/logo_icon.png" },
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
      <body className={`${figtree.variable} min-h-screen bg-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
