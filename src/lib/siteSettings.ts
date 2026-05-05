import { prisma } from "./prisma";

export type SiteSettingsMap = {
  bg_theme: string;
  primary_color: string;
  sidebar_color: string;
  font_family: string;
  card_style: string;
};

const DEFAULTS: SiteSettingsMap = {
  bg_theme: "ocean",
  primary_color: "#0a7ea4",
  sidebar_color: "#ffffff",
  font_family: "inter",
  card_style: "rounded",
};

// Server-side: fetch all settings from DB
export async function getSiteSettings(): Promise<SiteSettingsMap> {
  try {
    const rows = await prisma.siteSettings.findMany();
    const map: Partial<SiteSettingsMap> = {};
    for (const row of rows) {
      (map as Record<string, string>)[row.key] = row.value;
    }
    return { ...DEFAULTS, ...map };
  } catch {
    return DEFAULTS;
  }
}

// Build CSS variable string from settings (injected into <html style>)
export function settingsToCssVars(s: SiteSettingsMap): Record<string, string> {
  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    nunito: "'Nunito', sans-serif",
    poppins: "'Poppins', sans-serif",
  };
  const radiusMap: Record<string, string> = {
    rounded: "1rem",
    sharp: "0.25rem",
    shadow: "0.5rem",
  };
  const shadowMap: Record<string, string> = {
    rounded: "0 1px 3px rgba(0,0,0,0.08)",
    sharp: "none",
    shadow: "0 4px 20px rgba(0,0,0,0.12)",
  };

  // Slightly darken primary for hover states
  return {
    "--primary": s.primary_color,
    "--sidebar-bg": s.sidebar_color,
    "--font-family": fontMap[s.font_family] ?? fontMap.inter,
    "--card-radius": radiusMap[s.card_style] ?? "1rem",
    "--card-shadow": shadowMap[s.card_style] ?? shadowMap.rounded,
  };
}

// C-level note: to add new settings, just add a key to SiteSettingsMap + DEFAULTS,
// add a line in settingsToCssVars(), and add a control in ThemeCustomizer.tsx.
// The DB schema (key/value) never needs to change.
