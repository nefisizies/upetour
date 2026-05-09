"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

function formatTarihMask(val: string): string {
  const raw = val.replace(/\D/g, "");
  if (!raw) return "";

  // Gün: ilk rakam 0-3 olmalı
  if (parseInt(raw[0]) > 3) return "";
  if (raw.length === 1) return raw[0];

  const d1 = parseInt(raw[0]), d2 = parseInt(raw[1]);
  const gun = d1 === 0 && d2 === 0 ? "01" : d1 === 3 && d2 > 1 ? "31" : raw[0] + raw[1];
  if (raw.length === 2) return gun;

  // Ay: ilk rakam 2-9 ise otomatik "0X" pad, yıla geç
  const m1 = parseInt(raw[2]);
  if (m1 >= 2) {
    const ay = "0" + raw[2];
    const yRaw = raw.slice(3, 7);
    const yil = yRaw.length > 0 && yRaw[0] !== "2" ? "2" + yRaw.slice(1) : yRaw;
    return `${gun}/${ay}/${yil}`;
  }

  if (raw.length === 3) return `${gun}/${raw[2]}`;

  const m2 = parseInt(raw[3]);
  const ay = m1 === 0 && m2 === 0 ? "01" : m1 === 1 && m2 > 2 ? "12" : raw[2] + raw[3];
  if (raw.length === 4) return `${gun}/${ay}`;

  // Yıl: 2 ile başlamalı
  const yRaw = raw.slice(4, 8);
  const yil = yRaw[0] !== "2" ? "2" + yRaw.slice(1) : yRaw;
  return `${gun}/${ay}/${yil}`;
}

function tarihToISO(val: string): string {
  const p = val.split("/");
  if (p.length !== 3 || p[2].length !== 4) return "";
  return `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
}

export function HizliEtkinlikEkle() {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [baslangic, setBaslangic] = useState("");
  const [bitis, setBitis] = useState("");
  const [ekleniyor, setEkleniyor] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (acik) setTimeout(() => inputRef.current?.focus(), 50);
  }, [acik]);

  const kapat = useCallback(() => { setAcik(false); setBaslik(""); setBaslangic(""); setBitis(""); }, []);

  async function ekle(e: React.FormEvent) {
    e.preventDefault();
    const baslangicISO = tarihToISO(baslangic);
    if (!baslik.trim() || !baslangicISO) return;
    const bitisISO = tarihToISO(bitis);
    setEkleniyor(true);
    await fetch("/api/takvim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baslik: baslik.trim(), baslangic: `${baslangicISO}T09:00`, bitis: bitisISO ? `${bitisISO}T09:00` : "", notlar: "" }),
    });
    kapat();
    setEkleniyor(false);
    router.refresh();
  }

  const tarihInputStyle = {
    background: "transparent",
    borderBottom: "1px solid var(--card-inner-border, rgba(0,0,0,0.15))",
    color: "var(--text-primary, #1e293b)",
  } as React.CSSProperties;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setAcik(o => !o)}
        className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
        style={{ color: "var(--primary)", borderColor: "var(--primary)", background: "transparent" }}
      >
        <Plus className="w-3 h-3" /> Etkinlik ekle
      </button>

      {acik && (
        <div
          className="absolute left-0 top-full mt-2 z-50 rounded-xl shadow-xl p-3 w-72"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary, #1e293b)" }}>Hızlı Ekle</span>
            <button type="button" onClick={kapat} style={{ color: "var(--text-muted)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form onSubmit={ekle} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Etkinlik başlığı..."
              className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                background: "var(--card-inner-bg, rgba(0,0,0,0.04))",
                border: "1px solid var(--card-inner-border, rgba(0,0,0,0.08))",
                color: "var(--text-primary, #1e293b)",
              } as React.CSSProperties}
            />
            <div className="space-y-1">
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Başlangıç tarihi</label>
              <input
                type="text"
                value={baslangic}
                onChange={(e) => setBaslangic(formatTarihMask(e.target.value))}
                placeholder="gg/aa/yyyy"
                maxLength={10}
                className="w-full text-sm px-1 py-1.5 focus:outline-none"
                style={tarihInputStyle}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs" style={{ color: "var(--text-muted)" }}>Bitiş tarihi</label>
              <input
                type="text"
                value={bitis}
                onChange={(e) => setBitis(formatTarihMask(e.target.value))}
                placeholder="gg/aa/yyyy"
                maxLength={10}
                className="w-full text-sm px-1 py-1.5 focus:outline-none"
                style={tarihInputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={ekleniyor || !baslik.trim() || !tarihToISO(baslangic)}
              className="w-full text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40 text-white"
              style={{ background: "var(--primary)" }}
            >
              {ekleniyor ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
