"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

function pad2(n: number) { return String(n).padStart(2, "0"); }
function bugunStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function HizliEtkinlikEkle() {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [tarih, setTarih] = useState(bugunStr);
  const [ekleniyor, setEkleniyor] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (acik) setTimeout(() => inputRef.current?.focus(), 50);
  }, [acik]);

  const kapat = useCallback(() => { setAcik(false); setBaslik(""); setTarih(bugunStr()); }, []);

  async function ekle(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik.trim()) return;
    setEkleniyor(true);
    await fetch("/api/takvim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baslik: baslik.trim(), baslangic: `${tarih}T09:00`, bitis: "", notlar: "" }),
    });
    kapat();
    setEkleniyor(false);
    router.refresh();
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setAcik(o => !o)}
        className="text-xs hover:underline mt-1 inline-flex items-center gap-1"
        style={{ color: "var(--primary)" }}
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
          <form onSubmit={ekle} className="space-y-2">
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
            <input
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none"
              style={{
                background: "var(--card-inner-bg, rgba(0,0,0,0.04))",
                border: "1px solid var(--card-inner-border, rgba(0,0,0,0.08))",
                color: "var(--text-primary, #1e293b)",
              } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={ekleniyor || !baslik.trim()}
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
