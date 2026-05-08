"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Globe, Wallet, Search, Send } from "lucide-react";

type Acente = { companyName: string; slug: string; logoUrl: string | null; city: string | null };
type Ilan = { id: string; title: string; description: string | null; location: string | null; languages: string[]; budget: string | null; createdAt: string | Date; acente: Acente };

export function IlanlarKesfetClient({ ilanlar, basvuruMap }: { ilanlar: Ilan[]; basvuruMap: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [basvuruDurumu, setBasvuruDurumu] = useState<Record<string, string>>(basvuruMap);
  const [loading, setLoading] = useState<string | null>(null);
  const [aktifBasvuru, setAktifBasvuru] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState("");

  const filtered = ilanlar.filter(i =>
    !q || i.title.toLowerCase().includes(q.toLowerCase()) ||
    i.acente.companyName.toLowerCase().includes(q.toLowerCase()) ||
    (i.location || "").toLowerCase().includes(q.toLowerCase())
  );

  async function basvur(ilanId: string) {
    setLoading(ilanId);
    try {
      const r = await fetch("/api/basvuru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ilanId, mesaj }),
      });
      if (r.ok) {
        setBasvuruDurumu(d => ({ ...d, [ilanId]: "BEKLIYOR" }));
        setAktifBasvuru(null);
        setMesaj("");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
        <input
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary, #f1f5f9)" }}
          placeholder="İlan, acente veya konum ara..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <p className="font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>İlan bulunamadı</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Arama kriterlerini değiştirmeyi deneyin.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(ilan => {
          const durumu = basvuruDurumu[ilan.id];
          const isOpen = aktifBasvuru === ilan.id;

          return (
            <div key={ilan.id} className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {ilan.acente.logoUrl ? (
                      <Image src={ilan.acente.logoUrl} alt={ilan.acente.companyName} width={32} height={32} className="rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "var(--primary)", color: "#fff" }}>
                        {ilan.acente.companyName[0]}
                      </div>
                    )}
                    <span className="text-sm" style={{ color: "var(--text-muted, #94a3b8)" }}>{ilan.acente.companyName}</span>
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary, #f1f5f9)" }}>{ilan.title}</h3>
                  {ilan.description && (
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--text-muted, #94a3b8)" }}>{ilan.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>
                    {ilan.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ilan.location}</span>}
                    {ilan.budget && <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />{ilan.budget}</span>}
                    {ilan.languages.length > 0 && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{ilan.languages.join(", ")}</span>}
                  </div>
                </div>

                <div className="shrink-0">
                  {durumu ? (
                    <span className="text-xs px-3 py-1.5 rounded-full" style={
                      durumu === "KABUL" ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" } :
                      durumu === "RED" ? { background: "rgba(248,113,113,0.15)", color: "#f87171" } :
                      { background: "rgba(251,191,36,0.15)", color: "#fbbf24" }
                    }>
                      {durumu === "BEKLIYOR" ? "Başvuruldu" : durumu === "KABUL" ? "Kabul Edildi" : durumu === "RED" ? "Reddedildi" : "İnceleniyor"}
                    </span>
                  ) : (
                    <button
                      onClick={() => setAktifBasvuru(isOpen ? null : ilan.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{ background: "var(--primary)", color: "#fff" }}
                    >
                      <Send className="w-3.5 h-3.5" /> Başvur
                    </button>
                  )}
                </div>
              </div>

              {isOpen && !durumu && (
                <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: "var(--card-inner-border)" }}>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary, #f1f5f9)" }}
                    placeholder="Kendinizi tanıtın, deneyimlerinizden bahsedin... (isteğe bağlı)"
                    value={mesaj}
                    onChange={e => setMesaj(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => basvur(ilan.id)}
                      disabled={loading === ilan.id}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
                      style={{ background: "var(--primary)", color: "#fff" }}
                    >
                      {loading === ilan.id ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                    </button>
                    <button
                      onClick={() => { setAktifBasvuru(null); setMesaj(""); }}
                      className="px-4 py-2 rounded-xl text-sm transition-colors"
                      style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
