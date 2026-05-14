"use client";

import { useState } from "react";
import { Award, Check, X, MapPin, Trophy, Loader2 } from "lucide-react";
import Link from "next/link";

const UNVAN_LABEL: Record<string, string> = {
  YENI_REHBER: "Yeni Rehber",
  AKTIF_REHBER: "Aktif Rehber",
  DENEYIMLI_REHBER: "Deneyimli Rehber",
  UZMAN_REHBER: "Uzman Rehber",
  SUPER_REHBER: "Süper Rehber",
  ELIT_REHBER: "Elit Rehber",
};

type BekleyenRozet = {
  id: string;
  kazanildiAt: string;
  onaylandi: boolean;
  rehber: { name: string; slug: string; photoUrl: string | null; unvan: string; checkInSayisi: number };
  rozet: { id: string; baslik: string; ikon: string; aciklama: string | null; kategori: string };
};

export function RozetOnayClient({
  bekleyenler: ilkBekleyenler,
  toplamOnaylanan,
  toplamCheckin,
}: {
  bekleyenler: BekleyenRozet[];
  toplamOnaylanan: number;
  toplamCheckin: number;
}) {
  const [bekleyenler, setBekleyenler] = useState(ilkBekleyenler);
  const [yukleniyor, setYukleniyor] = useState<string | null>(null);

  async function islem(rozetId: string, onayla: boolean) {
    setYukleniyor(rozetId);
    try {
      await fetch("/api/admin/rozetler", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rozetId, onayla }),
      });
      setBekleyenler((prev) => prev.filter((r) => r.id !== rozetId));
    } finally {
      setYukleniyor(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Üst istatistikler */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <Award className="w-5 h-5 text-yellow-400 mb-2" />
          <div className="text-2xl font-bold text-white">{bekleyenler.length}</div>
          <div className="text-xs text-white/50 mt-1">Onay Bekliyor</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <Check className="w-5 h-5 text-green-400 mb-2" />
          <div className="text-2xl font-bold text-white">{toplamOnaylanan}</div>
          <div className="text-xs text-white/50 mt-1">Onaylanan Rozet</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <MapPin className="w-5 h-5 mb-2" style={{ color: "var(--primary)" }} />
          <div className="text-2xl font-bold text-white">{toplamCheckin}</div>
          <div className="text-xs text-white/50 mt-1">Toplam Check-in</div>
        </div>
      </div>

      {/* Bekleyen rozetler */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--card-inner-border)" }}>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Bekleyen Rozet Onayları
          </h2>
          <Link href="/kesfet/feed" target="_blank" className="text-xs hover:underline" style={{ color: "var(--primary)" }}>
            Feed'i gör →
          </Link>
        </div>

        {bekleyenler.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white/50 text-sm">Bekleyen rozet yok, hepsi temiz.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--card-inner-border)" }}>
            {bekleyenler.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                {/* Rehber */}
                <Link href={`/rehber/${r.rehber.slug}`} target="_blank"
                  className="flex items-center gap-3 flex-1 min-w-0 group">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                    {r.rehber.photoUrl
                      ? <img src={r.rehber.photoUrl} alt="" className="w-full h-full object-cover" />
                      : r.rehber.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white group-hover:underline truncate">{r.rehber.name}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {r.rehber.checkInSayisi} check-in</span>
                      <span className="flex items-center gap-0.5"><Trophy className="w-2.5 h-2.5 text-yellow-400" /> {UNVAN_LABEL[r.rehber.unvan]}</span>
                    </div>
                  </div>
                </Link>

                {/* Rozet */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0"
                  style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <span className="text-xl">{r.rozet.ikon}</span>
                  <div>
                    <p className="text-xs font-medium text-yellow-300">{r.rozet.baslik}</p>
                    <p className="text-[10px] text-white/30">{r.rozet.aciklama}</p>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => islem(r.id, true)}
                    disabled={yukleniyor === r.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-green-500/20"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}
                  >
                    {yukleniyor === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => islem(r.id, false)}
                    disabled={yukleniyor === r.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/20"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
