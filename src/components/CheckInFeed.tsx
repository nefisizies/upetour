"use client";

import { useEffect, useState } from "react";
import { MapPin, Camera, Clock } from "lucide-react";

type CheckIn = {
  id: string;
  baslik: string;
  aciklama: string | null;
  fotografUrl: string | null;
  sehir: string | null;
  ulke: string | null;
  dogrulandi: boolean;
  createdAt: string;
};

function zaman(dateStr: string) {
  const fark = Date.now() - new Date(dateStr).getTime();
  const dakika = Math.floor(fark / 60000);
  if (dakika < 60) return `${dakika}dk önce`;
  const saat = Math.floor(dakika / 60);
  if (saat < 24) return `${saat}s önce`;
  const gun = Math.floor(saat / 24);
  if (gun < 30) return `${gun}g önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function CheckInFeed({ rehberId, yenile }: { rehberId: string; yenile?: number }) {
  const [checkInler, setCheckInler] = useState<CheckIn[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    fetch(`/api/checkin/${rehberId}`)
      .then((r) => r.json())
      .then((data) => { setCheckInler(data); setYukleniyor(false); });
  }, [rehberId, yenile]);

  if (yukleniyor) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
    );
  }

  if (checkInler.length === 0) {
    return (
      <div className="text-center py-10">
        <MapPin className="w-8 h-8 text-white/20 mx-auto mb-2" />
        <p className="text-sm text-white/40">Henüz check-in yok</p>
        <p className="text-xs text-white/25 mt-1">Tur yaparken paylaşım yap, profilin güçlensin</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {checkInler.map((ci) => (
        <div key={ci.id} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {ci.fotografUrl && (
            <img src={ci.fotografUrl} alt="" className="w-full h-40 object-cover" />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{ci.baslik}</p>
                {ci.sehir && (
                  <p className="text-xs text-white/50 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {ci.ulke ? `${ci.sehir}, ${ci.ulke}` : ci.sehir}
                  </p>
                )}
                {ci.aciklama && (
                  <p className="text-xs text-white/40 mt-1.5 leading-relaxed">{ci.aciklama}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {zaman(ci.createdAt)}
                </span>
                {ci.fotografUrl && (
                  <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <Camera className="w-2.5 h-2.5" /> Fotoğraflı
                  </span>
                )}
                {ci.dogrulandi && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1">✅ Doğrulandı</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
