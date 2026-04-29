"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";

type Etkinlik = {
  id: string;
  baslik: string;
  baslangic: Date | string;
  bitis: Date | string | null;
  notlar: string | null;
  tur: string;
};

function pad2(n: number) { return String(n).padStart(2, "0"); }
function toDateStr(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function formatGun(dateStr: string) {
  const d = new Date(dateStr + "T00:00");
  const gunler = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  const aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  return `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}, ${gunler[d.getDay()]}`;
}

const GUNLER = ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"];
const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

export function MiniTakvim({
  etkinlikler: initialEtkinlikler,
  yil: yilProp,
  ay: ayProp,
}: {
  etkinlikler: Etkinlik[];
  yil: number;
  ay: number;
}) {
  const [yil, setYil] = useState(yilProp);
  const [ay, setAy] = useState(ayProp);
  const [etkinlikler, setEtkinlikler] = useState(initialEtkinlikler);
  const ilkRender = useRef(true);

  // Popup state
  const [secilenGun, setSecilenGun] = useState<string | null>(null);
  const [formAcik, setFormAcik] = useState(false);
  const [form, setForm] = useState({ baslik: "", bitis: "", notlar: "" });
  const [kaydediyor, setKaydediyor] = useState(false);
  const [hata, setHata] = useState("");

  useEffect(() => {
    if (ilkRender.current) { ilkRender.current = false; return; }
    fetch(`/api/takvim?yil=${yil}&ay=${ay}`)
      .then((r) => r.json())
      .then(setEtkinlikler);
  }, [yil, ay]);

  async function yenile() {
    const data = await fetch(`/api/takvim?yil=${yil}&ay=${ay}`).then((r) => r.json());
    setEtkinlikler(data);
  }

  async function kaydet() {
    if (!form.baslik.trim() || !secilenGun) { setHata("Başlık zorunlu"); return; }
    setKaydediyor(true); setHata("");
    const res = await fetch("/api/takvim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baslik: form.baslik.trim(),
        baslangic: `${secilenGun}T09:00`,
        bitis: form.bitis || null,
        notlar: form.notlar.trim() || null,
      }),
    });
    if (res.ok) {
      await yenile();
      setFormAcik(false);
      setForm({ baslik: "", bitis: "", notlar: "" });
    } else {
      const d = await res.json();
      setHata(d.error || "Hata oluştu");
    }
    setKaydediyor(false);
  }

  async function sil(id: string) {
    await fetch(`/api/takvim/${id}`, { method: "DELETE" });
    await yenile();
  }

  function gunAc(tarihStr: string) {
    setSecilenGun(tarihStr);
    setFormAcik(false);
    setForm({ baslik: "", bitis: "", notlar: "" });
    setHata("");
  }

  function ayDegistir(fark: number) {
    const d = new Date(yil, ay - 1 + fark, 1);
    setYil(d.getFullYear()); setAy(d.getMonth() + 1);
  }

  // Grid hesapla
  const bugunStr = toDateStr(new Date());
  const ilkGun = new Date(yil, ay - 1, 1);
  const baslangicOffset = (ilkGun.getDay() + 6) % 7;
  const ayGunSayisi = new Date(yil, ay, 0).getDate();
  const hucreler: (number | null)[] = [
    ...Array(baslangicOffset).fill(null),
    ...Array.from({ length: ayGunSayisi }, (_, i) => i + 1),
  ];
  while (hucreler.length % 7 !== 0) hucreler.push(null);

  // Her gün için etkinlik listesi
  const gunEtkinlikMap = new Map<string, Etkinlik[]>();
  const eventDays = new Set<string>();
  const rezervasyonDays = new Set<string>();

  etkinlikler.forEach((e) => {
    const bas = new Date(e.baslangic as string); bas.setHours(0, 0, 0, 0);
    const bit = e.bitis ? new Date(e.bitis as string) : null;
    if (bit) bit.setHours(0, 0, 0, 0);
    const gun = new Date(bas);
    while (!bit || gun <= bit) {
      const k = toDateStr(gun);
      if (!gunEtkinlikMap.has(k)) gunEtkinlikMap.set(k, []);
      if (!gunEtkinlikMap.get(k)!.find(x => x.id === e.id)) gunEtkinlikMap.get(k)!.push(e);
      if (e.tur === "REZERVASYON") rezervasyonDays.add(k);
      else eventDays.add(k);
      gun.setDate(gun.getDate() + 1);
      if (!bit) break;
    }
  });

  const secilenGunEtkinlikleri = secilenGun ? (gunEtkinlikMap.get(secilenGun) ?? []) : [];

  return (
    <>
      <div className="select-none">
        {/* Ay navigasyonu */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => ayDegistir(-1)} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <p className="text-[11px] font-semibold text-gray-500">{AYLAR[ay - 1]} {yil}</p>
          <button onClick={() => ayDegistir(1)} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px">
          {GUNLER.map((g) => (
            <div key={g} className="text-[9px] text-center text-gray-300 font-medium pb-1">{g}</div>
          ))}
          {hucreler.map((gun, i) => {
            if (!gun) return <div key={i} className="aspect-square" />;
            const tarihStr = `${yil}-${pad2(ay)}-${pad2(gun)}`;
            const bugunMu = tarihStr === bugunStr;
            const secilenMu = tarihStr === secilenGun;
            const hasRez = rezervasyonDays.has(tarihStr);
            const hasManuel = eventDays.has(tarihStr);
            const hasEvent = hasRez || hasManuel;
            return (
              <button
                key={i}
                onClick={() => gunAc(tarihStr)}
                className={`aspect-square flex items-center justify-center rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  secilenMu
                    ? "ring-2 ring-[#0a7ea4] bg-[#0a7ea4]/10 text-[#0a7ea4]"
                    : bugunMu
                    ? "bg-[#0a7ea4] text-white"
                    : hasEvent
                    ? hasRez
                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      : "bg-[#0a7ea4]/10 text-[#0a7ea4] hover:bg-[#0a7ea4]/20"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                {gun}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gün Popup */}
      {secilenGun && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm"
          onClick={() => setSecilenGun(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başlık */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">{formatGun(secilenGun)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {secilenGunEtkinlikleri.length === 0
                    ? "Etkinlik yok"
                    : `${secilenGunEtkinlikleri.length} etkinlik`}
                </p>
              </div>
              <button onClick={() => setSecilenGun(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Etkinlik listesi */}
            {secilenGunEtkinlikleri.length > 0 && (
              <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                {secilenGunEtkinlikleri.map((e) => (
                  <div key={e.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${e.tur === "REZERVASYON" ? "bg-purple-500" : "bg-[#0a7ea4]"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{e.baslik}</p>
                      {e.notlar && <p className="text-xs text-gray-400 truncate">{e.notlar}</p>}
                    </div>
                    {e.tur !== "REZERVASYON" && (
                      <button onClick={() => sil(e.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0 p-0.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Form */}
            {formAcik ? (
              <div className="px-5 py-4 space-y-3">
                {hata && <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{hata}</p>}
                <input
                  type="text"
                  autoFocus
                  value={form.baslik}
                  onChange={(e) => setForm({ ...form, baslik: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && kaydet()}
                  placeholder="Etkinlik başlığı..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
                />
                <input
                  type="datetime-local"
                  value={form.bitis}
                  onChange={(e) => setForm({ ...form, bitis: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
                  placeholder="Bitiş (opsiyonel)"
                />
                <textarea
                  value={form.notlar}
                  onChange={(e) => setForm({ ...form, notlar: e.target.value })}
                  rows={2}
                  placeholder="Not ekle (opsiyonel)..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] resize-none"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => setFormAcik(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5">
                    İptal
                  </button>
                  <button
                    onClick={kaydet}
                    disabled={kaydediyor}
                    className="bg-[#0a7ea4] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#065f7d] disabled:opacity-60 transition-colors"
                  >
                    {kaydediyor ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-3">
                <button
                  onClick={() => setFormAcik(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-[#0a7ea4] hover:text-[#065f7d] py-2 border border-dashed border-[#0a7ea4]/30 rounded-lg hover:bg-[#0a7ea4]/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Etkinlik Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
