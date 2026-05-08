"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Calendar, MapPin, X, User, ChevronDown, ChevronUp } from "lucide-react";
import { SEHIR_LISTESI, type SehirBilgi } from "@/lib/sehirler";
import { RehberKarti } from "@/components/RehberKarti";
import type { RehberProfile, RehberDil, RehberLicense, Tour, Referans, AcenteProfile } from "@prisma/client";

type Rehber = RehberProfile & {
  languages: RehberDil[];
  licenses: RehberLicense[];
  tours: Tour[];
  referanslar: (Referans & { acente: Pick<AcenteProfile, "companyName" | "city"> })[];
  acenteBaglantiSayisi: number;
  _puan: number;
  _ulkeEslesmesi: number;
  _uzmanlikEslesmesi: number;
};

const UZMANLIKLAR = [
  "Tarihi Turlar", "Kültür Turları", "Müze Turları", "Arkeoloji",
  "Doğa Turları", "Trekking", "Macera Turları", "Dağ Turları",
  "Gastronomi Turları", "Şarap Turları", "Sokak Lezzetleri",
  "Şehir Turları", "Tekne Turları", "Bisiklet Turları",
  "Fuar Turları", "Kongre & MICE Turları", "Kurumsal Turlar",
  "Günübirlik Turlar", "Özel Turlar", "Grup Turları",
  "Çocuk & Aile Turları", "Engelli Dostu Turlar",
  "Fotoğraf Turları", "Gece Turları",
];

export function RehberAra() {
  const bugun = new Date().toISOString().split("T")[0];

  const [baslangic, setBaslangic] = useState(bugun);
  const [bitis, setBitis] = useState(bugun);
  const [sehirArama, setSehirArama] = useState("");
  const [secilenSehirler, setSecilenSehirler] = useState<SehirBilgi[]>([]);
  const [secilenUzmanliklar, setSecilenUzmanliklar] = useState<string[]>([]);
  const [dropdown, setDropdown] = useState(false);
  const [uzmanlikAcik, setUzmanlikAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [rehberler, setRehberler] = useState<Rehber[] | null>(null);
  const [hata, setHata] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtreliSehirler = SEHIR_LISTESI.filter(
    (s) =>
      !secilenSehirler.find((x) => x.sehir === s.sehir) &&
      (s.sehir.toLowerCase().includes(sehirArama.toLowerCase()) ||
        s.ulke.toLowerCase().includes(sehirArama.toLowerCase()))
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

  function sehirEkle(s: SehirBilgi) {
    setSecilenSehirler((prev) => [...prev, s]);
    setSehirArama("");
    setDropdown(false);
  }

  function sehirCikar(sehir: string) {
    setSecilenSehirler((prev) => prev.filter((s) => s.sehir !== sehir));
  }

  function uzmanlikToggle(u: string) {
    setSecilenUzmanliklar((prev) =>
      prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]
    );
  }

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
    if (secilenSehirler.length > 0)
      params.set("sehirler", secilenSehirler.map((s) => s.sehir).join(","));
    if (secilenUzmanliklar.length > 0)
      params.set("uzmanliklar", secilenUzmanliklar.join(","));

    const res = await fetch(`/api/rehber-ara?${params}`);
    setYukleniyor(false);

    if (!res.ok) {
      const data = await res.json();
      setHata(data.error ?? "Bir hata oluştu.");
      return;
    }

    setRehberler(await res.json());
  }

  const secilenUlkeler = [...new Set(secilenSehirler.map((s) => s.ulke))];

  return (
    <div className="space-y-6">
      {/* Filtre kartı */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-800">Müsait Rehber Ara</h2>

        {/* Tarihler */}
        <div className="grid md:grid-cols-2 gap-4">
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
        </div>

        {/* Şehir seçimi */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Şehirler
            <span className="text-gray-400 font-normal">(birden fazla seçilebilir)</span>
          </label>

          {/* Seçilenler */}
          {secilenSehirler.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1">
              {secilenSehirler.map((s) => (
                <span
                  key={s.sehir}
                  className="inline-flex items-center gap-1.5 text-sm bg-[#0a7ea4]/10 text-[#0a7ea4] border border-[#0a7ea4]/20 px-2.5 py-1 rounded-full"
                >
                  {s.sehir}
                  <span className="text-xs text-[#0a7ea4]/60">{s.ulke}</span>
                  <button onClick={() => sehirCikar(s.sehir)} className="hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {secilenUlkeler.length > 0 && (
                <span className="text-xs text-gray-400 self-center">
                  → {secilenUlkeler.join(", ")} aranacak
                </span>
              )}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              placeholder="Şehir veya ülke ara ve ekle..."
              value={sehirArama}
              onChange={(e) => { setSehirArama(e.target.value); setDropdown(true); }}
              onFocus={() => setDropdown(true)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]/30 focus:border-[#0a7ea4]"
            />
            {dropdown && filtreliSehirler.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                {filtreliSehirler.map((s) => (
                  <button
                    key={`${s.ulkeKod}-${s.sehir}`}
                    onMouseDown={() => sehirEkle(s)}
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

        {/* Uzmanlık alanları */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setUzmanlikAcik((v) => !v)}
            className="text-xs font-medium text-gray-500 flex items-center gap-1.5 hover:text-gray-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Uzmanlık Alanları
            {secilenUzmanliklar.length > 0 && (
              <span className="bg-[#0a7ea4] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {secilenUzmanliklar.length}
              </span>
            )}
            {uzmanlikAcik ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {uzmanlikAcik && (
            <div className="flex flex-wrap gap-2 pt-1">
              {UZMANLIKLAR.map((u) => {
                const secili = secilenUzmanliklar.includes(u);
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => uzmanlikToggle(u)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      secili
                        ? "bg-[#0a7ea4] text-white border-[#0a7ea4]"
                        : "border-gray-200 text-gray-600 hover:border-[#0a7ea4] hover:text-[#0a7ea4]"
                    }`}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          )}

          {secilenUzmanliklar.length > 0 && !uzmanlikAcik && (
            <div className="flex flex-wrap gap-1.5">
              {secilenUzmanliklar.map((u) => (
                <span key={u} className="inline-flex items-center gap-1 text-xs bg-[#0a7ea4]/10 text-[#0a7ea4] border border-[#0a7ea4]/20 px-2 py-0.5 rounded-full">
                  {u}
                  <button onClick={() => uzmanlikToggle(u)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {hata && <p className="text-sm text-red-500">{hata}</p>}

        <button
          onClick={ara}
          disabled={yukleniyor}
          className="w-full md:w-auto bg-[#0a7ea4] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#065f7d] transition-colors disabled:opacity-60 flex items-center gap-2"
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
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{rehberler.length}</span> müsait rehber bulundu
                {secilenSehirler.length > 0 && (
                  <span> — <span className="text-[#0a7ea4]">{secilenSehirler.map((s) => s.sehir).join(", ")}</span></span>
                )}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rehberler.map((r) => (
                  <div key={r.id} className="relative">
                    {r._puan > 0 && (
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#0a7ea4] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                        {r._puan} eşleşme
                      </div>
                    )}
                    <RehberKarti profile={r} acenteBaglantiSayisi={r.acenteBaglantiSayisi} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
