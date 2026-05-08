"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Calendar, Clock } from "lucide-react";

type Etkinlik = {
  id: string; baslik: string; baslangic: string; bitis: string | null;
  notlar: string | null; tur: "MANUEL" | "REZERVASYON";
};

const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const GUNLER = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

function pad2(n: number) { return String(n).padStart(2, "0"); }
function toDateStr(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function toInputDatetime(iso: string) { return iso.slice(0, 16); }

const cardStyle = { background: "var(--card-bg)", border: "1px solid var(--card-border)" };
const inputStyle = { background: "var(--card-inner-bg, rgba(255,255,255,0.06))", border: "1px solid var(--card-inner-border, rgba(255,255,255,0.1))", color: "var(--text-primary, #f1f5f9)" };
const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]";

export function Takvim({ initialTarih }: { initialTarih: string | null }) {
  const bugun = new Date();
  const [yil, setYil] = useState(() => initialTarih ? new Date(initialTarih + "T00:00").getFullYear() : bugun.getFullYear());
  const [ay, setAy] = useState(() => initialTarih ? new Date(initialTarih + "T00:00").getMonth() + 1 : bugun.getMonth() + 1);
  const [vurgulananTarih] = useState<string | null>(initialTarih);
  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const modalAcildi = useRef(false);
  const [modal, setModal] = useState<{ mod: "ekle" | "duzenle"; etkinlik?: Etkinlik; tarih?: string } | null>(null);
  const [form, setForm] = useState({ baslik: "", baslangic: "", bitis: "", notlar: "" });
  const [kaydediyor, setKaydediyor] = useState(false);
  const [formHata, setFormHata] = useState("");

  function modalAc(tarih: string) {
    setForm({ baslik: "", baslangic: `${tarih}T09:00`, bitis: "", notlar: "" });
    setFormHata(""); setModal({ mod: "ekle", tarih });
  }

  const etkinlikleriYukle = useCallback(async () => {
    setYukleniyor(true);
    const res = await fetch(`/api/takvim?yil=${yil}&ay=${ay}`);
    setEtkinlikler(await res.json());
    setYukleniyor(false);
  }, [yil, ay]);

  useEffect(() => {
    etkinlikleriYukle().then(() => {
      if (initialTarih && !modalAcildi.current) { modalAcildi.current = true; modalAc(initialTarih); }
    });
  }, [etkinlikleriYukle]); // eslint-disable-line react-hooks/exhaustive-deps

  function ayDegistir(fark: number) { const d = new Date(yil, ay - 1 + fark, 1); setYil(d.getFullYear()); setAy(d.getMonth() + 1); }

  function duzenleAc(e: Etkinlik) {
    setForm({ baslik: e.baslik, baslangic: toInputDatetime(e.baslangic), bitis: e.bitis ? toInputDatetime(e.bitis) : "", notlar: e.notlar ?? "" });
    setFormHata(""); setModal({ mod: "duzenle", etkinlik: e });
  }

  async function kaydet() {
    if (!form.baslik.trim()) { setFormHata("Başlık zorunlu"); return; }
    if (!form.baslangic) { setFormHata("Tarih zorunlu"); return; }
    setKaydediyor(true); setFormHata("");
    if (modal?.mod === "ekle") {
      const res = await fetch("/api/takvim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { await etkinlikleriYukle(); setModal(null); }
      else { const d = await res.json(); setFormHata(d.error || "Hata"); }
    } else if (modal?.etkinlik) {
      const res = await fetch(`/api/takvim/${modal.etkinlik.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { await etkinlikleriYukle(); setModal(null); }
      else { const d = await res.json(); setFormHata(d.error || "Hata"); }
    }
    setKaydediyor(false);
  }

  async function sil(id: string) { await fetch(`/api/takvim/${id}`, { method: "DELETE" }); setEtkinlikler((prev) => prev.filter((e) => e.id !== id)); setModal(null); }

  const ilkGun = new Date(yil, ay - 1, 1);
  const baslangicOffset = (ilkGun.getDay() + 6) % 7;
  const ayGunSayisi = new Date(yil, ay, 0).getDate();
  const hucreler: (number | null)[] = [...Array(baslangicOffset).fill(null), ...Array.from({ length: ayGunSayisi }, (_, i) => i + 1)];
  while (hucreler.length % 7 !== 0) hucreler.push(null);

  type GunEtkinlik = { etkinlik: Etkinlik; pozisyon: "baslangic" | "devam" | "bitis" | "tekgun" };
  const etkinlikMap = new Map<string, GunEtkinlik[]>();
  etkinlikler.forEach((e) => {
    const bas = new Date(e.baslangic); bas.setHours(0,0,0,0);
    const bit = e.bitis ? new Date(e.bitis) : null; if (bit) bit.setHours(0,0,0,0);
    const gun = new Date(bas);
    while (!bit || gun <= bit) {
      const k = toDateStr(gun);
      const esBaslangic = toDateStr(gun) === toDateStr(bas);
      const esBitis = bit ? toDateStr(gun) === toDateStr(bit) : false;
      const pozisyon: GunEtkinlik["pozisyon"] = !bit || (esBaslangic && esBitis) ? "tekgun" : esBaslangic ? "baslangic" : esBitis ? "bitis" : "devam";
      if (!etkinlikMap.has(k)) etkinlikMap.set(k, []);
      etkinlikMap.get(k)!.push({ etkinlik: e, pozisyon });
      gun.setDate(gun.getDate() + 1);
      if (!bit) break;
    }
  });

  const bugunStr = toDateStr(bugun);

  return (
    <div className="space-y-4">
      {/* Navigasyon */}
      <div className="rounded-2xl p-4 flex items-center justify-between" style={cardStyle}>
        <button onClick={() => ayDegistir(-1)} className="p-2 rounded-lg transition-colors hover:bg-white/5">
          <ChevronLeft className="w-5 h-5" style={{ color: "var(--text-muted, #94a3b8)" }} />
        </button>
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>
          {AYLAR[ay - 1]} {yil}
          {yukleniyor && <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-muted, #94a3b8)" }}>yükleniyor...</span>}
        </h2>
        <button onClick={() => ayDegistir(1)} className="p-2 rounded-lg transition-colors hover:bg-white/5">
          <ChevronRight className="w-5 h-5" style={{ color: "var(--text-muted, #94a3b8)" }} />
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--card-inner-border, rgba(255,255,255,0.06))" }}>
          {GUNLER.map((g) => (
            <div key={g} className="py-3 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted, #94a3b8)" }}>{g}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {hucreler.map((gun, i) => {
            if (!gun) return <div key={i} className="min-h-[96px] border-r border-b" style={{ borderColor: "var(--card-inner-border, rgba(255,255,255,0.04))", background: "rgba(255,255,255,0.01)" }} />;
            const tarihStr = `${yil}-${pad2(ay)}-${pad2(gun)}`;
            const gunEtkinlikleri = etkinlikMap.get(tarihStr) ?? [];
            const bugunMu = tarihStr === bugunStr;
            const vurgulananMu = tarihStr === vurgulananTarih;
            return (
              <div key={i} onClick={() => modalAc(tarihStr)}
                className={`min-h-[96px] border-r border-b p-2 cursor-pointer hover:bg-white/5 transition-colors group ${i % 7 === 6 ? "border-r-0" : ""} ${vurgulananMu ? "ring-2 ring-inset ring-amber-400" : ""}`}
                style={{ borderColor: "var(--card-inner-border, rgba(255,255,255,0.06))", background: vurgulananMu ? "rgba(251,191,36,0.08)" : undefined }}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${bugunMu ? "bg-[#0a7ea4] text-white" : vurgulananMu ? "bg-amber-400 text-white" : ""}`}
                    style={bugunMu || vurgulananMu ? {} : { color: "var(--text-muted, #94a3b8)" }}>
                    {gun}
                  </span>
                  <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }} />
                </div>
                <div className="space-y-0.5">
                  {gunEtkinlikleri.slice(0, 3).map((ge) => {
                    const { etkinlik: e, pozisyon } = ge;
                    const isRez = e.tur === "REZERVASYON";
                    const chipBase = isRez ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "bg-[#0a7ea4]/15 text-[#0a7ea4] hover:bg-[#0a7ea4]/25";
                    const barBase = isRez ? "bg-purple-500/20 hover:bg-purple-500/30" : "bg-[#0a7ea4]/20 hover:bg-[#0a7ea4]/30";
                    if (pozisyon === "baslangic" || pozisyon === "tekgun") {
                      return <div key={e.id} onClick={(ev) => { ev.stopPropagation(); duzenleAc(e); }} className={`text-xs px-1.5 py-0.5 rounded truncate font-medium cursor-pointer ${chipBase}`}>{e.baslik}</div>;
                    }
                    return <div key={e.id} onClick={(ev) => { ev.stopPropagation(); duzenleAc(e); }} title={e.baslik} className={`h-5 w-full rounded-sm cursor-pointer ${barBase} ${pozisyon === "bitis" ? "opacity-70" : ""}`} />;
                  })}
                  {gunEtkinlikleri.length > 3 && <p className="text-xs px-1" style={{ color: "var(--text-muted)" }}>+{gunEtkinlikleri.length - 3} daha</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bu ay özeti */}
      {etkinlikler.length > 0 && (
        <div className="rounded-2xl p-5" style={cardStyle}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary, #f1f5f9)" }}>
            <Calendar className="w-4 h-4 text-[#0a7ea4]" /> Bu Ay — {etkinlikler.length} Etkinlik
          </h3>
          <div className="space-y-2">
            {etkinlikler.map((e) => {
              const d = new Date(e.baslangic);
              return (
                <div key={e.id} onClick={() => duzenleAc(e)}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${e.tur === "REZERVASYON" ? "bg-purple-400" : "bg-[#0a7ea4]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary, #f1f5f9)" }}>{e.baslik}</p>
                    {e.notlar && <p className="text-xs truncate" style={{ color: "var(--text-muted, #94a3b8)" }}>{e.notlar}</p>}
                  </div>
                  <span className="text-xs shrink-0 flex items-center gap-1" style={{ color: "var(--text-muted, #94a3b8)" }}>
                    <Clock className="w-3 h-3" />{pad2(d.getDate())} {AYLAR[d.getMonth()].slice(0,3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl shadow-xl w-full max-w-md" style={cardStyle}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--card-inner-border, rgba(255,255,255,0.08))" }}>
              <h3 className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>
                {modal.mod === "ekle" ? "Etkinlik Ekle" : "Etkinliği Düzenle"}
              </h3>
              <button onClick={() => setModal(null)} className="hover:text-white/80 transition-colors" style={{ color: "var(--text-muted, #94a3b8)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {formHata && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{formHata}</p>}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Başlık *</label>
                <input type="text" value={form.baslik} onChange={(e) => setForm({ ...form, baslik: e.target.value })}
                  placeholder="Kapadokya Turu, Efes Rezervasyonu..." className={inputCls} style={inputStyle} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Başlangıç *</label>
                  <input type="datetime-local" value={form.baslangic} onChange={(e) => setForm({ ...form, baslangic: e.target.value })} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Bitiş</label>
                  <input type="datetime-local" value={form.bitis} onChange={(e) => setForm({ ...form, bitis: e.target.value })} className={inputCls} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Notlar</label>
                <textarea value={form.notlar} onChange={(e) => setForm({ ...form, notlar: e.target.value })}
                  rows={3} placeholder="Acente adı, lokasyon, grup bilgisi..."
                  className={`${inputCls} resize-none`} style={inputStyle} />
              </div>
              {modal.etkinlik?.tur === "REZERVASYON" && (
                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <p className="text-xs text-purple-300">Bu etkinlik acente tarafından oluşturuldu.</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-6 pb-5 pt-2">
              {modal.mod === "duzenle" && modal.etkinlik?.tur !== "REZERVASYON"
                ? <button onClick={() => sil(modal.etkinlik!.id)} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /> Sil</button>
                : <div />}
              <div className="flex items-center gap-3">
                <button onClick={() => setModal(null)} className="text-sm px-4 py-2 transition-colors" style={{ color: "var(--text-muted, #94a3b8)" }}>İptal</button>
                <button onClick={kaydet} disabled={kaydediyor}
                  className="bg-[#0a7ea4] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60">
                  {kaydediyor ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
