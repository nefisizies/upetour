"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Check, X, Eye, Clock } from "lucide-react";

type Rehber = {
  id: string;
  name: string;
  photoUrl: string | null;
  city: string | null;
  slug: string;
  user: { email: string };
};

type Basvuru = {
  id: string;
  mesaj: string | null;
  durum: string;
  createdAt: string | Date;
  rehber: Rehber;
};

type Ilan = {
  id: string;
  title: string;
  basvurular: Basvuru[];
};

const DURUM_LABEL: Record<string, { label: string; style: React.CSSProperties }> = {
  BEKLIYOR: { label: "Bekliyor", style: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" } },
  INCELENDI: { label: "İncelendi", style: { background: "rgba(96,165,250,0.15)", color: "#60a5fa" } },
  KABUL: { label: "Kabul", style: { background: "rgba(34,197,94,0.15)", color: "#4ade80" } },
  RED: { label: "Red", style: { background: "rgba(248,113,113,0.15)", color: "#f87171" } },
};

export function BasvuruYonetim({ ilanlar }: { ilanlar: Ilan[] }) {
  const [expanded, setExpanded] = useState<string | null>(ilanlar[0]?.id ?? null);
  const [durumlar, setDurumlar] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function guncelle(basvuruId: string, durum: string) {
    setLoading(basvuruId);
    try {
      await fetch(`/api/basvuru/${basvuruId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durum }),
      });
      setDurumlar(d => ({ ...d, [basvuruId]: durum }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {ilanlar.map(ilan => {
        const isOpen = expanded === ilan.id;
        const bekleyenSayi = ilan.basvurular.filter(b => (durumlar[b.id] ?? b.durum) === "BEKLIYOR").length;

        return (
          <div key={ilan.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <button
              onClick={() => setExpanded(isOpen ? null : ilan.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>{ilan.title}</span>
                {bekleyenSayi > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--primary)", color: "#fff" }}>
                    {bekleyenSayi} yeni
                  </span>
                )}
                <span className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{ilan.basvurular.length} başvuru</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
            </button>

            {isOpen && (
              <div className="border-t" style={{ borderColor: "var(--card-inner-border)" }}>
                {ilan.basvurular.map(basvuru => {
                  const durum = durumlar[basvuru.id] ?? basvuru.durum;
                  const d = DURUM_LABEL[durum] ?? DURUM_LABEL.BEKLIYOR;

                  return (
                    <div key={basvuru.id} className="flex items-start gap-4 px-5 py-4 border-b last:border-0" style={{ borderColor: "var(--card-inner-border)" }}>
                      {basvuru.rehber.photoUrl ? (
                        <Image src={basvuru.rehber.photoUrl} alt={basvuru.rehber.name} width={40} height={40} className="rounded-full shrink-0 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: "var(--primary)", color: "#fff" }}>
                          {basvuru.rehber.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/rehber/${basvuru.rehber.slug}`} className="font-semibold hover:underline" style={{ color: "var(--text-primary, #f1f5f9)" }} target="_blank">
                            {basvuru.rehber.name}
                          </Link>
                          {basvuru.rehber.city && (
                            <span className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{basvuru.rehber.city}</span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full" style={d.style}>{d.label}</span>
                        </div>
                        {basvuru.mesaj && (
                          <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--text-muted, #94a3b8)" }}>{basvuru.mesaj}</p>
                        )}
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>
                          {new Date(basvuru.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/rehber/${basvuru.rehber.slug}`}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--text-muted)" }}
                          title="Profili gör"
                          target="_blank"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {durum === "BEKLIYOR" && (
                          <>
                            <button
                              onClick={() => guncelle(basvuru.id, "INCELENDI")}
                              disabled={loading === basvuru.id}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "#60a5fa" }}
                              title="İncelendi"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => guncelle(basvuru.id, "KABUL")}
                              disabled={loading === basvuru.id}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "#4ade80" }}
                              title="Kabul et"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => guncelle(basvuru.id, "RED")}
                              disabled={loading === basvuru.id}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "#f87171" }}
                              title="Reddet"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {durum === "INCELENDI" && (
                          <>
                            <button onClick={() => guncelle(basvuru.id, "KABUL")} disabled={loading === basvuru.id} className="p-1.5 rounded-lg" style={{ color: "#4ade80" }} title="Kabul et">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => guncelle(basvuru.id, "RED")} disabled={loading === basvuru.id} className="p-1.5 rounded-lg" style={{ color: "#f87171" }} title="Reddet">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
