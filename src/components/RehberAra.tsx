"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Calendar, MapPin, X, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SEHIR_LISTESI, type SehirBilgi } from "@/lib/sehirler";

type Rehber = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  photoUrl: string | null;
  bio: string | null;
  specialties: string[];
  experienceYears: number;
  operatingCountries: string[];
  languages: { dil: string; seviye: string | null }[];
};

export function RehberAra() {
  const bugun = new Date().toISOString().split("T")[0];

  const [baslangic, setBaslangic] = useState(bugun);
  const [bitis, setBitis] = useState(bugun);
  const [sehirArama, setSehirArama] = useState("");
  const [secilenSehir, setSecilenSehir] = useState<SehirBilgi | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [rehberler, setRehberler] = useState<Rehber[] | null>(null);
  const [hata, setHata] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtreliSehirler = SEHIR_LISTESI.filter((s) =>
    s.sehir.toLowerCase().includes(sehirArama.toLowerCase()) ||
    s.ulke.toLowerCase().includes(sehirArama.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function ara() {
    if (!baslangic || !bitis) {
      setHata("Lütfen tarih aralığı seçin.");
      return;
    }
    if (new Date(bitis) < new Date(baslangic)) {
      setHata("Bitiş tarihi başlangıçtan önce olamaz.");
      return;
    }
    setHata("");
    setYukleniyor(true);
    setRehberler(null);

    const params = new URLSearchParams({ baslangic, bitis });
    if (secilenSehir) params.set("sehir", secilenSehir.sehir);

    const res = await fetch(`/api/rehber-ara?${params}`);
    setYukleniyor(false);

    if (!res.ok) {
      const data = await res.json();
      setHata(data.error ?? "Bir hata oluştu.");
      return;
    }

    setRehberler(await res.json());
  }

  return (
    <div className="space-y-6">
      {/* Filtre kartı */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Müsait Rehber Ara</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Başlangıç tarihi */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Başlangıç
            </label>
            <input
              type="date"
              value={baslangic}
              min={bugun}
              onChange={(e) => setBaslangic(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]/30 focus:border-[#0a7ea4]"
            />
          </div>

          {/* Bitiş tarihi */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Bitiş
            </label>
            <input
              type="date"
              value={bitis}
              min={baslangic}
              onChange={(e) => setBitis(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]/30 focus:border-[#0a7ea4]"
            />
          </div>

          {/* Şehir arama */}
          <div className="space-y-1.5" ref={dropdownRef}>
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Şehir (opsiyonel)
            </label>
            <div className="relative">
              {secilenSehir ? (
                <div className="flex items-center gap-2 border border-[#0a7ea4] rounded-xl px-3 py-2.5 bg-[#0a7ea4]/5">
                  <span className="text-sm font-medium text-[#0a7ea4] flex-1">
                    {secilenSehir.sehir}
                    <span className="text-xs text-gray-400 ml-1">— {secilenSehir.ulke}</span>
                  </span>
                  <button onClick={() => { setSecilenSehir(null); setSehirArama(""); }}>
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Şehir veya ülke ara..."
                  value={sehirArama}
                  onChange={(e) => { setSehirArama(e.target.value); setDropdown(true); }}
                  onFocus={() => setDropdown(true)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]/30 focus:border-[#0a7ea4]"
                />
              )}

              {dropdown && !secilenSehir && filtreliSehirler.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                  {filtreliSehirler.map((s) => (
                    <button
                      key={`${s.ulkeKod}-${s.sehir}`}
                      onMouseDown={() => { setSecilenSehir(s); setSehirArama(""); setDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between group"
                    >
                      <span className="text-sm text-gray-800">{s.sehir}</span>
                      <span className="text-xs text-gray-400 group-hover:text-gray-600">{s.ulke}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {hata && <p className="text-sm text-red-500 mt-3">{hata}</p>}

        <button
          onClick={ara}
          disabled={yukleniyor}
          className="mt-4 w-full md:w-auto bg-[#0a7ea4] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#065f7d] transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          {yukleniyor ? "Aranıyor..." : "Rehber Ara"}
        </button>
      </div>

      {/* Sonuçlar */}
      {rehberler !== null && (
        <div>
          {rehberler.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Bu kriterlere uygun müsait rehber bulunamadı.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                <span className="font-semibold text-gray-800">{rehberler.length}</span> müsait rehber bulundu
                {secilenSehir && <span> — <span className="text-[#0a7ea4]">{secilenSehir.sehir}, {secilenSehir.ulke}</span></span>}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {rehberler.map((r) => (
                  <Link
                    key={r.id}
                    href={`/rehber/${r.slug}`}
                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex gap-4 group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                      {r.photoUrl ? (
                        <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-[#0a7ea4] transition-colors">{r.name}</p>
                          {r.city && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {r.city}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0a7ea4] shrink-0 mt-1" />
                      </div>
                      {r.bio && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{r.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.languages.slice(0, 3).map((l) => (
                          <span key={l.dil} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {l.dil}
                          </span>
                        ))}
                        {r.experienceYears > 0 && (
                          <span className="text-xs bg-[#0a7ea4]/10 text-[#0a7ea4] px-2 py-0.5 rounded-full">
                            {r.experienceYears} yıl deneyim
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
