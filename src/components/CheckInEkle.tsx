"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Camera, X, Plus, Loader2, Search } from "lucide-react";
import { SEHIR_LISTESI } from "@/lib/sehirler";

const CLOUDINARY_CLOUD = "dkcrf1xw7";
const CLOUDINARY_PRESET = "rehbersepeti";

export function CheckInEkle({ onEklendi }: { onEklendi?: () => void }) {
  const [acik, setAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [sehir, setSehir] = useState("");
  const [ulke, setUlke] = useState("");
  const [sehirArama, setSehirArama] = useState("");
  const [sehirDropdown, setSehirDropdown] = useState(false);
  const [fotografUrl, setFotografUrl] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [fotoYukleniyor, setFotoYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtrelenmis = SEHIR_LISTESI.filter((s) =>
    s.sehir.toLowerCase().includes(sehirArama.toLowerCase()) ||
    s.ulke.toLowerCase().includes(sehirArama.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    function disariTikla(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSehirDropdown(false);
      }
    }
    document.addEventListener("mousedown", disariTikla);
    return () => document.removeEventListener("mousedown", disariTikla);
  }, []);

  function sehirSec(s: typeof SEHIR_LISTESI[0]) {
    setSehir(s.sehir);
    setUlke(s.ulke);
    setSehirArama(s.sehir);
    setSehirDropdown(false);
  }

  async function fotoYukle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoYukleniyor(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", CLOUDINARY_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      setFotografUrl(data.secure_url);
    } finally {
      setFotoYukleniyor(false);
    }
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik.trim()) { setHata("Başlık zorunlu"); return; }
    setYukleniyor(true);
    setHata("");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik, aciklama, fotografUrl, sehir, ulke }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setBaslik(""); setAciklama(""); setSehir(""); setUlke("");
      setSehirArama(""); setFotografUrl("");
      setAcik(false);
      onEklendi?.();
    } catch (err: unknown) {
      setHata(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  }

  if (!acik) {
    return (
      <button
        onClick={() => setAcik(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg"
        style={{ background: "var(--primary)", color: "white", boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent)" }}
      >
        <MapPin className="w-4 h-4" /> Check-in Yap
      </button>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: "var(--primary)" }} /> Neredesin?
        </h3>
        <button onClick={() => setAcik(false)} className="text-white/30 hover:text-white/60 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={gonder} className="space-y-4">

        {/* Fotoğraf — önce göster */}
        <div>
          {fotografUrl ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-1">
              <img src={fotografUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setFotografUrl("")}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-3 w-full h-32 rounded-xl cursor-pointer transition-colors border-2 border-dashed text-white/25 hover:text-white/50 hover:border-white/20"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {fotoYukleniyor
                ? <><Loader2 className="w-5 h-5 animate-spin" /> <span className="text-sm">Yükleniyor...</span></>
                : <><Camera className="w-5 h-5" /> <span className="text-sm">Fotoğraf ekle</span></>}
              <input type="file" accept="image/*" className="hidden" onChange={fotoYukle} disabled={fotoYukleniyor} />
            </label>
          )}
        </div>

        {/* Başlık */}
        <input
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          placeholder="Ne yapıyorsun? (Ayasofya turu, Kapadokya balon...)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/30"
        />

        {/* Konum seçici */}
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              value={sehirArama}
              onChange={(e) => { setSehirArama(e.target.value); setSehirDropdown(true); setSehir(""); setUlke(""); }}
              onFocus={() => setSehirDropdown(true)}
              placeholder="Şehir ara... (İstanbul, Kapadokya...)"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/30"
            />
            {sehir && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                <MapPin className="w-3 h-3" /> {sehir}
              </div>
            )}
          </div>

          {sehirDropdown && filtrelenmis.length > 0 && (
            <div className="absolute z-50 top-full mt-1 w-full rounded-xl overflow-hidden shadow-2xl"
              style={{ background: "#1a0f05", border: "1px solid rgba(255,255,255,0.12)" }}>
              {filtrelenmis.map((s) => (
                <button
                  key={`${s.sehir}-${s.ulke}`}
                  type="button"
                  onClick={() => sehirSec(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-white/30" />
                  <span className="text-white">{s.sehir}</span>
                  <span className="text-white/35 text-xs ml-auto">{s.ulke}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Açıklama */}
        <textarea
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          placeholder="Kısa bir not... (opsiyonel)"
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/30 resize-none"
        />

        {hata && <p className="text-xs text-red-400">{hata}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setAcik(false)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/70 transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={yukleniyor || !baslik.trim()}
            className="flex-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "var(--primary)", color: "white", flex: 2 }}
          >
            {yukleniyor ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {yukleniyor ? "Paylaşılıyor..." : "Paylaş"}
          </button>
        </div>
      </form>
    </div>
  );
}
