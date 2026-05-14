"use client";

import { useState } from "react";
import { MapPin, Camera, X, Plus, Loader2 } from "lucide-react";

const CLOUDINARY_CLOUD = "dkcrf1xw7";
const CLOUDINARY_PRESET = "rehbersepeti";

export function CheckInEkle({ onEklendi }: { onEklendi?: () => void }) {
  const [acik, setAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [sehir, setSehir] = useState("");
  const [fotografUrl, setFotografUrl] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [fotoYukleniyor, setFotoYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

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
        body: JSON.stringify({ baslik, aciklama, fotografUrl, sehir }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setBaslik(""); setAciklama(""); setSehir(""); setFotografUrl("");
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
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110 active:scale-95"
        style={{ background: "var(--primary)", color: "white" }}
      >
        <Plus className="w-4 h-4" /> Check-in Yap
      </button>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: "var(--primary)" }} /> Yeni Check-in
        </h3>
        <button onClick={() => setAcik(false)} className="text-white/40 hover:text-white/70 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={gonder} className="space-y-3">
        <input
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          placeholder="Neredesin? (örn: Ayasofya turu, Kapadokya balonlu tur...)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
        />

        <div className="flex gap-2">
          <input
            value={sehir}
            onChange={(e) => setSehir(e.target.value)}
            placeholder="Şehir"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>

        <textarea
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          placeholder="Kısa bir not... (opsiyonel)"
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
        />

        {/* Fotoğraf */}
        <div>
          {fotografUrl ? (
            <div className="relative w-full h-36 rounded-xl overflow-hidden">
              <img src={fotografUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setFotografUrl("")}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/40 hover:text-white/60 transition-colors">
              {fotoYukleniyor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {fotoYukleniyor ? "Yükleniyor..." : "Fotoğraf ekle"}
              <input type="file" accept="image/*" className="hidden" onChange={fotoYukle} disabled={fotoYukleniyor} />
            </label>
          )}
        </div>

        {hata && <p className="text-xs text-red-400">{hata}</p>}

        <button
          type="submit"
          disabled={yukleniyor || !baslik.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "var(--primary)", color: "white" }}
        >
          {yukleniyor ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          {yukleniyor ? "Paylaşılıyor..." : "Paylaş"}
        </button>
      </form>
    </div>
  );
}
