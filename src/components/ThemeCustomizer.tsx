"use client";

import { useState, useTransition } from "react";
import { HexColorPicker } from "react-colorful";
import { Check, Loader2, Monitor, Type, Layers, Palette } from "lucide-react";
import type { SiteSettingsMap } from "@/lib/siteSettings";

const BG_THEMES = [
  { key: "ocean",      label: "Okyanus",        emoji: "🌊" },
  { key: "desert",     label: "Çöl",             emoji: "🏜️" },
  { key: "rainforest", label: "Yağmur Ormanı",   emoji: "🌿" },
  { key: "mountain",   label: "Dağ Zirvesi",     emoji: "🏔️" },
  { key: "aurora",     label: "Kuzey Işıkları",  emoji: "🌌" },
  { key: "spring",     label: "İlkbahar",        emoji: "🌸" },
];

const FONTS = [
  { key: "inter",   label: "Inter",   sample: "Modern & temiz" },
  { key: "nunito",  label: "Nunito",  sample: "Yumuşak & yuvarlak" },
  { key: "poppins", label: "Poppins", sample: "Geometrik & şık" },
];

const CARD_STYLES = [
  { key: "rounded", label: "Yuvarlak",   desc: "Büyük radius, hafif gölge" },
  { key: "sharp",   label: "Keskin",     desc: "Minimal, köşeli" },
  { key: "shadow",  label: "Derin Gölge",desc: "Belirgin gölge efekti" },
];

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2 text-white font-semibold">
        <Icon className="w-4 h-4 text-white/50" />
        {title}
      </div>
      {children}
    </div>
  );
}

export function ThemeCustomizer({ initial }: { initial: SiteSettingsMap }) {
  const [settings, setSettings] = useState<SiteSettingsMap>(initial);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSidebarPicker, setShowSidebarPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof SiteSettingsMap>(key: K, value: SiteSettingsMap[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    // Live preview: update CSS vars immediately
    const root = document.documentElement;
    if (key === "primary_color") root.style.setProperty("--primary", value as string);
    if (key === "sidebar_color") root.style.setProperty("--sidebar-bg", value as string);
    if (key === "bg_theme")      root.setAttribute("data-bg-theme", value as string);
    if (key === "card_style")    root.setAttribute("data-card-style", value as string);
    if (key === "font_family") {
      const fontMap: Record<string, string> = { inter: "'Inter',sans-serif", nunito: "'Nunito',sans-serif", poppins: "'Poppins',sans-serif" };
      root.style.setProperty("--font-family", fontMap[value as string] ?? fontMap.inter);
    }
  }

  async function save() {
    startTransition(async () => {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="space-y-5">
      {/* Background Theme */}
      <Section icon={Monitor} title="Arka Plan Teması">
        <div className="grid grid-cols-3 gap-2">
          {BG_THEMES.map(t => (
            <button
              key={t.key}
              onClick={() => set("bg_theme", t.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                settings.bg_theme === t.key
                  ? ""
                  : "border-white/15 text-white/60 hover:border-white/30 hover:bg-white/5"
              }`}
              style={settings.bg_theme === t.key ? {
                borderColor: "var(--primary)",
                backgroundColor: "color-mix(in srgb, var(--primary) 5%, transparent)",
                color: "var(--primary)",
              } : undefined}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Colors */}
      <Section icon={Palette} title="Renkler">
        <div className="space-y-4">
          {/* Primary color */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-2 block">Ana Renk</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowPrimaryPicker(v => !v); setShowSidebarPicker(false); }}
                className="w-10 h-10 rounded-xl border-2 shadow-sm"
                style={{ backgroundColor: settings.primary_color, borderColor: "rgba(255,255,255,0.2)" }}
              />
              <span className="text-sm font-mono text-white/60">{settings.primary_color.toUpperCase()}</span>
            </div>
            {showPrimaryPicker && (
              <div className="mt-3">
                <HexColorPicker color={settings.primary_color} onChange={c => set("primary_color", c)} />
              </div>
            )}
          </div>
          {/* Sidebar color */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-2 block">Sidebar Arka Planı</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowSidebarPicker(v => !v); setShowPrimaryPicker(false); }}
                className="w-10 h-10 rounded-xl border-2 shadow-sm"
                style={{ backgroundColor: settings.sidebar_color, borderColor: "rgba(255,255,255,0.2)" }}
              />
              <span className="text-sm font-mono text-white/60">{settings.sidebar_color.toUpperCase()}</span>
            </div>
            {showSidebarPicker && (
              <div className="mt-3">
                <HexColorPicker color={settings.sidebar_color} onChange={c => set("sidebar_color", c)} />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Font */}
      <Section icon={Type} title="Yazı Tipi">
        <div className="space-y-2">
          {FONTS.map(f => (
            <button
              key={f.key}
              onClick={() => set("font_family", f.key)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                settings.font_family === f.key ? "" : "border-white/15 hover:border-white/30 hover:bg-white/5"
              }`}
              style={settings.font_family === f.key ? {
                borderColor: "var(--primary)",
                backgroundColor: "color-mix(in srgb, var(--primary) 5%, transparent)",
              } : undefined}
            >
              <div>
                <div className="font-medium text-sm text-white">{f.label}</div>
                <div className="text-xs text-white/40">{f.sample}</div>
              </div>
              {settings.font_family === f.key && <Check className="w-4 h-4" style={{ color: "var(--primary)" }} />}
            </button>
          ))}
        </div>
      </Section>

      {/* Card Style */}
      <Section icon={Layers} title="Kart Stili">
        <div className="space-y-2">
          {CARD_STYLES.map(s => (
            <button
              key={s.key}
              onClick={() => set("card_style", s.key)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                settings.card_style === s.key ? "" : "border-white/15 hover:border-white/30 hover:bg-white/5"
              }`}
              style={settings.card_style === s.key ? {
                borderColor: "var(--primary)",
                backgroundColor: "color-mix(in srgb, var(--primary) 5%, transparent)",
              } : undefined}
            >
              <div>
                <div className="font-medium text-sm text-white">{s.label}</div>
                <div className="text-xs text-white/40">{s.desc}</div>
              </div>
              {settings.card_style === s.key && <Check className="w-4 h-4" style={{ color: "var(--primary)" }} />}
            </button>
          ))}
        </div>
      </Section>

      {/* Save button */}
      <button
        onClick={save}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-all hover:brightness-110 disabled:opacity-60"
        style={{ background: "var(--primary)" }}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {isPending ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
      </button>
      <p className="text-xs text-center text-white/40">
        Değişiklikler anında önizlenir — kaydet butonuyla kalıcı hale gelir
      </p>
    </div>
  );
}
