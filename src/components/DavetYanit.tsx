"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, FileText, Building2, CheckCircle, XCircle, Clock } from "lucide-react";

type Acente = { companyName: string; city: string | null; logoUrl: string | null };

type Props = {
  etkinlik: {
    id: string;
    baslik: string;
    baslangic: string;
    bitis: string | null;
    lokasyon: string | null;
    notlar: string | null;
    rehberYanit: string | null;
    acente: Acente;
  };
};

const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

function formatTarih(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`;
}

export function DavetYanit({ etkinlik: e }: Props) {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState<"KABUL" | "RED" | null>(null);
  const [sonuc, setSonuc] = useState<"KABUL" | "RED" | null>(
    e.rehberYanit === "KABUL" || e.rehberYanit === "RED" ? e.rehberYanit as "KABUL" | "RED" : null
  );

  async function yanitle(yanit: "KABUL" | "RED") {
    setYukleniyor(yanit);
    const res = await fetch(`/api/davet/${e.id}/yanit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yanit }),
    });
    if (res.ok) {
      setSonuc(yanit);
      if (yanit === "KABUL") {
        setTimeout(() => router.push("/dashboard/rehber/takvim"), 1500);
      }
    }
    setYukleniyor(null);
  }

  const bekliyor = !sonuc && e.rehberYanit === "BEKLIYOR";

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Tur Daveti</h1>

      {/* Acente bilgisi */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--primary)", color: "white" }}>
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{e.acente.companyName}</p>
          {e.acente.city && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{e.acente.city}</p>}
        </div>
      </div>

      {/* Etkinlik detayları */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>{e.baslik}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>
              {formatTarih(e.baslangic)}
              {e.bitis && ` → ${formatTarih(e.bitis)}`}
            </span>
          </div>
          {e.lokasyon && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{e.lokasyon}</span>
            </div>
          )}
          {e.notlar && (
            <div className="flex items-start gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <FileText className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{e.notlar}</span>
            </div>
          )}
        </div>
      </div>

      {/* Yanıt durumu / butonlar */}
      {sonuc === "KABUL" && (
        <div className="rounded-2xl p-5 text-center space-y-2"
          style={{ background: "color-mix(in srgb, #22c55e 10%, transparent)", border: "1px solid #22c55e" }}>
          <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
          <p className="font-medium text-sm text-green-600">Daveti kabul ettiniz!</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Bu tarihler takviminizdeki rezervasyonlara eklendi. Takvim sayfasına yönlendiriliyorsunuz...
          </p>
        </div>
      )}

      {sonuc === "RED" && (
        <div className="rounded-2xl p-5 text-center space-y-2"
          style={{ background: "color-mix(in srgb, #ef4444 10%, transparent)", border: "1px solid #ef4444" }}>
          <XCircle className="w-8 h-8 mx-auto text-red-500" />
          <p className="font-medium text-sm text-red-600">Daveti reddettiniz.</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Acente bilgilendirildi.</p>
        </div>
      )}

      {bekliyor && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <Clock className="w-4 h-4" />
            Bu davete henüz yanıt vermediniz.
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => yanitle("RED")}
              disabled={!!yukleniyor}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50"
              style={{ borderColor: "#ef4444", color: "#ef4444" }}
            >
              {yukleniyor === "RED" ? "..." : "Reddet"}
            </button>
            <button
              onClick={() => yanitle("KABUL")}
              disabled={!!yukleniyor}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: "#22c55e" }}
            >
              {yukleniyor === "KABUL" ? "..." : "Kabul Et"}
            </button>
          </div>
        </div>
      )}

      {!bekliyor && !sonuc && (
        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Bu davete daha önce yanıt verildi.
        </p>
      )}
    </div>
  );
}
