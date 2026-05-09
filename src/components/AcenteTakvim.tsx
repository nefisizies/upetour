"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, SlidersHorizontal, MapPin, User, Clock, UserCheck } from "lucide-react";
import Link from "next/link";

type Rehber = {
  id: string;
  name: string;
  city: string | null;
  photoUrl: string | null;
  slug: string;
};

type Etkinlik = {
  id: string;
  baslik: string;
  baslangic: string;
  bitis: string | null;
  notlar: string | null;
  tur: "MANUEL" | "REZERVASYON";
  rehber: Rehber;
};

const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const AYLAR_KISA = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

const SEKMELER = [
  { id: "gelecek", label: "Gelecek" },
  { id: "buay", label: "Bu Ay" },
  { id: "tumu", label: "Tümü" },
  { id: "gecmis", label: "Geçmiş" },
] as const;

type SekmeId = typeof SEKMELER[number]["id"];

export function AcenteTakvim() {
  const [sekme, setSekme] = useState<SekmeId>("gelecek");
  const [filtrePanelAcik, setFiltrePanelAcik] = useState(false);
  const [sehir, setSehir] = useState("");
  const [siralama, setSiralama] = useState("tarih_asc");
  const [ay, setAy] = useState<number | null>(null);
  const [yil, setYil] = useState(new Date().getFullYear());
  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [sehirler, setSehirler] = useState<string[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [bosRehber, setBosRehber] = useState(false);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    const params = new URLSearchParams({ sekme, siralama });
    if (sehir) params.set("sehir", sehir);
    if (sekme === "tumu" && ay) {
      params.set("ay", String(ay));
      params.set("yil", String(yil));
    }
    const res = await fetch(`/api/acente/takvim?${params}`);
    const data = await res.json();
    setEtkinlikler(data.etkinlikler ?? []);
    setSehirler(data.sehirler ?? []);
    setBosRehber(data.bosRehber ?? false);
    setYukleniyor(false);
  }, [sekme, sehir, siralama, ay, yil]);

  useEffect(() => { yukle(); }, [yukle]);

  function grupla(liste: Etkinlik[]) {
    const gruplar: Record<string, Etkinlik[]> = {};
    liste.forEach((e) => {
      const d = new Date(e.baslangic);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!gruplar[key]) gruplar[key] = [];
      gruplar[key].push(e);
    });
    return gruplar;
  }

  function temizle() {
    setSehir("");
    setSiralama("tarih_asc");
    setAy(null);
    setYil(new Date().getFullYear());
  }

  const aktifFiltreSayisi = [
    sehir !== "",
    siralama !== "tarih_asc",
    sekme === "tumu" && ay !== null,
  ].filter(Boolean).length;

  const gruplar = grupla(etkinlikler);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <CalendarDays className="w-5 h-5" style={{ color: "var(--primary)" }} />
          Takvim
        </h1>
        <button
          onClick={() => setFiltrePanelAcik((o) => !o)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors"
          style={{
            color: aktifFiltreSayisi > 0 ? "white" : "var(--primary)",
            borderColor: "var(--primary)",
            background: aktifFiltreSayisi > 0 ? "var(--primary)" : "transparent",
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtrele
          {aktifFiltreSayisi > 0 && (
            <span className="text-xs bg-white/25 rounded-full px-1.5 py-px">{aktifFiltreSayisi}</span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--card-inner-bg, rgba(0,0,0,0.05))" }}>
        {SEKMELER.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSekme(t.id); if (t.id !== "tumu") setAy(null); }}
            className="flex-1 text-sm py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: sekme === t.id ? "var(--primary)" : "transparent",
              color: sekme === t.id ? "white" : "var(--text-muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Panel */}
      {filtrePanelAcik && (
        <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Şehir/Bölge */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Şehir / Bölge
              </label>
              <select
                value={sehir}
                onChange={(e) => setSehir(e.target.value)}
                className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--card-inner-bg, rgba(0,0,0,0.04))",
                  border: "1px solid var(--card-inner-border, rgba(0,0,0,0.1))",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Tüm şehirler</option>
                {sehirler.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Dönem — sadece "Tümü" sekmesinde */}
            {sekme === "tumu" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Dönem
                </label>
                <div className="flex gap-2">
                  <select
                    value={ay ?? ""}
                    onChange={(e) => setAy(e.target.value ? parseInt(e.target.value) : null)}
                    className="flex-1 text-sm rounded-lg px-2 py-2 focus:outline-none"
                    style={{
                      background: "var(--card-inner-bg, rgba(0,0,0,0.04))",
                      border: "1px solid var(--card-inner-border, rgba(0,0,0,0.1))",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">Tüm aylar</option>
                    {AYLAR.map((a, i) => (
                      <option key={i} value={i + 1}>{a}</option>
                    ))}
                  </select>
                  <select
                    value={yil}
                    onChange={(e) => setYil(parseInt(e.target.value))}
                    className="w-24 text-sm rounded-lg px-2 py-2 focus:outline-none"
                    style={{
                      background: "var(--card-inner-bg, rgba(0,0,0,0.04))",
                      border: "1px solid var(--card-inner-border, rgba(0,0,0,0.1))",
                      color: "var(--text-primary)",
                    }}
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Sıralama */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Sıralama
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "tarih_asc", label: "Tarihe göre ↑" },
                { value: "tarih_desc", label: "Tarihe göre ↓" },
                { value: "sehir_asc", label: "Şehre göre A-Z" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSiralama(opt.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                  style={{
                    background: siralama === opt.value ? "var(--primary)" : "transparent",
                    color: siralama === opt.value ? "white" : "var(--text-muted)",
                    borderColor: siralama === opt.value ? "var(--primary)" : "var(--card-inner-border, rgba(0,0,0,0.1))",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={temizle}
              className="text-xs hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              Filtreleri temizle
            </button>
          </div>
        </div>
      )}

      {/* İçerik */}
      {yukleniyor ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Yükleniyor...
        </div>
      ) : bosRehber ? (
        <div className="py-16 text-center space-y-3">
          <UserCheck className="w-10 h-10 mx-auto opacity-25" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Henüz onaylı rehberiniz yok
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Takvimi görmek için rehber referansı ekleyin.
          </p>
          <Link
            href="/dashboard/acente/rehber-bul"
            className="inline-block mt-2 text-xs px-4 py-2 rounded-lg text-white"
            style={{ background: "var(--primary)" }}
          >
            Rehber Bul
          </Link>
        </div>
      ) : etkinlikler.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <CalendarDays className="w-10 h-10 mx-auto opacity-25" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Bu dönemde etkinlik bulunamadı
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Farklı bir sekme veya filtre deneyin.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(gruplar).map(([key, liste]) => {
            const [y, m] = key.split("-");
            return (
              <div key={key} className="space-y-2">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest px-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {AYLAR[parseInt(m) - 1]} {y}
                </h3>
                <div className="space-y-2">
                  {liste.map((e) => (
                    <EtkinlikKart key={e.id} etkinlik={e} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EtkinlikKart({ etkinlik: e }: { etkinlik: Etkinlik }) {
  const baslangic = new Date(e.baslangic);
  const bitis = e.bitis ? new Date(e.bitis) : null;

  return (
    <div
      className="rounded-xl p-4 flex gap-4 items-start"
      style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
    >
      {/* Tarih rozeti */}
      <div
        className="shrink-0 w-12 text-center rounded-lg py-1.5"
        style={{ background: "var(--primary)", color: "white" }}
      >
        <div className="text-lg font-bold leading-none">{baslangic.getDate()}</div>
        <div className="text-xs opacity-75">{AYLAR_KISA[baslangic.getMonth()]}</div>
      </div>

      {/* İçerik */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
            {e.baslik}
          </p>
          {e.tur === "REZERVASYON" && (
            <span
              className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
            >
              Rezervasyon
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <User className="w-3 h-3" />
            {e.rehber.name}
          </span>
          {e.rehber.city && (
            <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <MapPin className="w-3 h-3" />
              {e.rehber.city}
            </span>
          )}
          {bitis && (
            <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Clock className="w-3 h-3" />
              {bitis.getDate()} {AYLAR_KISA[bitis.getMonth()]}'a kadar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
