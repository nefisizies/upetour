"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Pencil, Trash2, MapPin, Clock, Play, ChevronDown, ChevronUp, Check, Users } from "lucide-react";
import { sortSehirlerByProximity } from "@/lib/sehirler";

type Segment = { lokasyonlar: string[]; gun: number };

type Program = {
  id: string;
  ad: string;
  sure: number;
  segmentler: Segment[];
  createdAt: string;
};

type Turist = {
  id: string;
  ad: string;
  soyad: string;
  pasaportNo: string | null;
  uyruk: string | null;
  dogumTarihi: string | null;
  telefon: string | null;
  eposta: string | null;
  notlar: string | null;
};

const BOSH_TURIST = (): Omit<Turist, "id"> => ({
  ad: "", soyad: "", pasaportNo: null, uyruk: null,
  dogumTarihi: null, telefon: null, eposta: null, notlar: null,
});

function normalizeSegment(s: any): Segment {
  if (Array.isArray(s.lokasyonlar)) return s as Segment;
  return { lokasyonlar: s.lokasyon ? [s.lokasyon as string] : [""], gun: s.gun ?? 1 };
}

type Rehber = { id: string; name: string; city: string | null };

const cardStyle = { background: "var(--card-bg)", border: "1px solid var(--card-border)" };
const innerInputStyle = {
  background: "var(--card-inner-bg, rgba(0,0,0,0.04))",
  border: "1px solid var(--card-inner-border, rgba(0,0,0,0.1))",
  color: "var(--text-primary)",
} as React.CSSProperties;

const BOSH_SEGMENT = (): Segment => ({ lokasyonlar: [""], gun: 1 });

export function AcenteProgramlar({ referansRehberler }: { referansRehberler: Rehber[] }) {
  const [programlar, setProgramlar] = useState<Program[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Form modal
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenleId, setDuzenleId] = useState<string | null>(null);
  const [formAd, setFormAd] = useState("");
  const [formSegmentler, setFormSegmentler] = useState<Segment[]>([BOSH_SEGMENT()]);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [formHata, setFormHata] = useState("");

  // Takvime işle modal
  const [takvimeModalId, setTakvimeModalId] = useState<string | null>(null);
  const [takvimeBaslangic, setTakvimeBaslangic] = useState("");
  const [takvimeRehber, setTakvimeRehber] = useState("");
  const [takvimeIsleniyor, setTakvimeIsleniyor] = useState(false);
  const [takvimeHata, setTakvimeHata] = useState("");
  const [takvimeBasarili, setTakvimeBasarili] = useState<number | null>(null);

  // Silme
  const [silmeId, setSilmeId] = useState<string | null>(null);
  const [siliyor, setSiliyor] = useState(false);

  // Detay açık/kapalı
  const [acikId, setAcikId] = useState<string | null>(null);

  // Turist modal
  const [turistModalProgram, setTuristModalProgram] = useState<Program | null>(null);
  const [turistler, setTuristler] = useState<Turist[]>([]);
  const [turistYukleniyor, setTuristYukleniyor] = useState(false);
  const [turistEkleRow, setTuristEkleRow] = useState<Omit<Turist, "id"> | null>(null);
  const [turistKaydediyor, setTuristKaydediyor] = useState(false);
  const [turistDuzenleId, setTuristDuzenleId] = useState<string | null>(null);
  const [turistDuzenleData, setTuristDuzenleData] = useState<Omit<Turist, "id"> | null>(null);

  async function yukle() {
    setYukleniyor(true);
    const res = await fetch("/api/acente/programlar");
    const data = await res.json();
    const normalized = Array.isArray(data)
      ? data.map((p: any) => ({ ...p, segmentler: (p.segmentler as any[]).map(normalizeSegment) }))
      : [];
    setProgramlar(normalized);
    setYukleniyor(false);
  }

  useEffect(() => { yukle(); }, []);

  function modalAc(p?: Program) {
    if (p) {
      // Mevcut programı düzenle — her zaman o programın verisini yükle
      setDuzenleId(p.id);
      setFormAd(p.ad);
      setFormSegmentler(p.segmentler.length > 0 ? p.segmentler.map(normalizeSegment) : [BOSH_SEGMENT()]);
    } else if (duzenleId !== null) {
      // Düzenleme modundayken "Yeni Program"'a basıldı — sıfırla
      setDuzenleId(null);
      setFormAd("");
      setFormSegmentler([BOSH_SEGMENT()]);
    }
    // else: yeni program draft'ı var, koru
    setFormHata("");
    setModalAcik(true);
  }

  function modalKapat() {
    setModalAcik(false);
    setDuzenleId(null);
    setFormAd("");
    setFormSegmentler([BOSH_SEGMENT()]);
    setFormHata("");
  }

  function segmentGunGuncelle(segIdx: number, gun: number) {
    setFormSegmentler((prev) => prev.map((s, i) => i === segIdx ? { ...s, gun } : s));
  }

  function lokasyonGuncelle(segIdx: number, lokIdx: number, val: string) {
    setFormSegmentler((prev) => prev.map((s, i) =>
      i === segIdx ? { ...s, lokasyonlar: s.lokasyonlar.map((l, j) => j === lokIdx ? val : l) } : s
    ));
  }

  function lokasyonEkle(segIdx: number) {
    setFormSegmentler((prev) => prev.map((s, i) =>
      i === segIdx ? { ...s, lokasyonlar: [...s.lokasyonlar, ""] } : s
    ));
  }

  function lokasyonCikar(segIdx: number, lokIdx: number) {
    setFormSegmentler((prev) => prev.map((s, i) =>
      i === segIdx ? { ...s, lokasyonlar: s.lokasyonlar.filter((_, j) => j !== lokIdx) } : s
    ));
  }

  function segmentEkle() {
    setFormSegmentler((prev) => [...prev, BOSH_SEGMENT()]);
  }

  function segmentCikar(i: number) {
    setFormSegmentler((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    if (!formAd.trim()) { setFormHata("Program adı zorunlu."); return; }
    const gecerliSegmentler = formSegmentler
      .filter((s) => s.lokasyonlar.some((l) => l.trim()) && s.gun > 0)
      .map((s) => ({ ...s, lokasyonlar: s.lokasyonlar.filter((l) => l.trim()) }));
    if (gecerliSegmentler.length === 0) { setFormHata("En az bir lokasyon ekleyin."); return; }

    setKaydediyor(true);
    setFormHata("");

    const url = duzenleId ? `/api/acente/programlar/${duzenleId}` : "/api/acente/programlar";
    const method = duzenleId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad: formAd, segmentler: gecerliSegmentler }),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormHata(data.error ?? "Bir hata oluştu.");
      setKaydediyor(false);
      return;
    }

    modalKapat();
    await yukle();
    setKaydediyor(false);
  }

  async function sil() {
    if (!silmeId) return;
    setSiliyor(true);
    await fetch(`/api/acente/programlar/${silmeId}`, { method: "DELETE" });
    setSilmeId(null);
    setSiliyor(false);
    await yukle();
  }

  async function turistAc(p: Program) {
    setTuristModalProgram(p);
    setTuristYukleniyor(true);
    setTuristEkleRow(null);
    setTuristDuzenleId(null);
    const res = await fetch(`/api/acente/programlar/${p.id}/turistler`);
    const data = await res.json();
    setTuristler(Array.isArray(data) ? data : []);
    setTuristYukleniyor(false);
  }

  async function turistEkle() {
    if (!turistEkleRow || !turistModalProgram) return;
    if (!turistEkleRow.ad.trim() || !turistEkleRow.soyad.trim()) return;
    setTuristKaydediyor(true);
    const res = await fetch(`/api/acente/programlar/${turistModalProgram.id}/turistler`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(turistEkleRow),
    });
    if (res.ok) {
      const yeni = await res.json();
      setTuristler((prev) => [...prev, yeni]);
      setTuristEkleRow(null);
    }
    setTuristKaydediyor(false);
  }

  async function turistGuncelle() {
    if (!turistDuzenleId || !turistDuzenleData || !turistModalProgram) return;
    setTuristKaydediyor(true);
    const res = await fetch(`/api/acente/programlar/${turistModalProgram.id}/turistler/${turistDuzenleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(turistDuzenleData),
    });
    if (res.ok) {
      const guncellendi = await res.json();
      setTuristler((prev) => prev.map((t) => t.id === turistDuzenleId ? guncellendi : t));
      setTuristDuzenleId(null);
      setTuristDuzenleData(null);
    }
    setTuristKaydediyor(false);
  }

  async function turistSil(turistId: string) {
    if (!turistModalProgram) return;
    await fetch(`/api/acente/programlar/${turistModalProgram.id}/turistler/${turistId}`, { method: "DELETE" });
    setTuristler((prev) => prev.filter((t) => t.id !== turistId));
  }

  function takvimeAc(id: string) {
    setTakvimeModalId(id);
    setTakvimeBaslangic(new Date().toISOString().split("T")[0]);
    setTakvimeRehber("");
    setTakvimeHata("");
    setTakvimeBasarili(null);
  }

  async function takvimeIsle() {
    if (!takvimeBaslangic || !takvimeModalId) { setTakvimeHata("Başlangıç tarihi zorunlu."); return; }
    setTakvimeIsleniyor(true);
    setTakvimeHata("");
    const res = await fetch(`/api/acente/programlar/${takvimeModalId}/takvime-isle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baslangic: takvimeBaslangic, rehberId: takvimeRehber || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setTakvimeHata(data.error ?? "Bir hata oluştu.");
    } else {
      setTakvimeBasarili(data.olusturulan);
    }
    setTakvimeIsleniyor(false);
  }

  const takvimeProgram = programlar.find((p) => p.id === takvimeModalId);
  const toplamGun = formSegmentler.reduce((s, seg) => s + (Number(seg.gun) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Play className="w-5 h-5" style={{ color: "var(--primary)" }} />
          Tur Programları
        </h1>
        <button
          onClick={() => modalAc()}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-white"
          style={{ background: "var(--primary)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Yeni Program
        </button>
      </div>

      {/* Liste */}
      {yukleniyor ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>Yükleniyor...</div>
      ) : programlar.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Play className="w-10 h-10 mx-auto opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Henüz program yok</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Tur programı oluşturarak takvime hızlıca işleyebilirsin.
          </p>
          <button
            onClick={() => modalAc()}
            className="text-xs px-4 py-2 rounded-lg text-white"
            style={{ background: "var(--primary)" }}
          >
            İlk programı oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {programlar.map((p) => {
            const acik = acikId === p.id;
            return (
              <div key={p.id} className="rounded-2xl overflow-hidden" style={cardStyle}>
                {/* Kart başlık */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                  onClick={() => setAcikId(acik ? null : p.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{p.ad}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Clock className="w-3 h-3" /> {p.sure} gün
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <MapPin className="w-3 h-3" /> {p.segmentler.length} lokasyon
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); takvimeAc(p.id); }}
                      className="text-xs px-3 py-1.5 rounded-lg text-white font-medium flex items-center gap-1"
                      style={{ background: "var(--primary)" }}
                      title="Takvime İşle"
                    >
                      <Play className="w-3 h-3" /> Takvime İşle
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); turistAc(p); }}
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: "var(--text-muted)" }}
                      title="Turist Listesi"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); modalAc(p); }}
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSilmeId(p.id); }}
                      className="p-1.5 rounded-lg hover:opacity-70 text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {acik ? (
                      <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    ) : (
                      <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    )}
                  </div>
                </div>

                {/* Detay */}
                {acik && (
                  <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: "var(--card-border)" }}>
                    <p className="text-xs font-semibold pt-3 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      Lokasyon Planı
                    </p>
                    <div className="space-y-1.5">
                      {p.segmentler.map((seg, i) => {
                        const oncekiGunler = p.segmentler.slice(0, i).reduce((s, x) => s + x.gun, 0);
                        return (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: "var(--card-inner-bg, rgba(0,0,0,0.05))", color: "var(--text-muted)" }}
                            >
                              {oncekiGunler + 1}. gün{seg.gun > 1 ? ` – ${oncekiGunler + seg.gun}. gün` : ""}
                            </span>
                            <span className="flex items-center gap-1 flex-wrap" style={{ color: "var(--text-primary)" }}>
                              <MapPin className="w-3 h-3 shrink-0" style={{ color: "var(--primary)" }} />
                              {seg.lokasyonlar.join(" · ")}
                            </span>
                            <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                              {seg.gun} gün
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Program Oluştur / Düzenle Modal ───────────────────────────────── */}
      {modalAcik && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalAcik(false); }}
        >
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={cardStyle}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                {duzenleId ? "Programı Düzenle" : "Yeni Tur Programı"}
              </h2>
              <button onClick={modalKapat} style={{ color: "var(--text-muted)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={kaydet} className="space-y-4">
              {/* Program adı */}
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Program Adı *</label>
                <input
                  type="text"
                  value={formAd}
                  onChange={(e) => setFormAd(e.target.value)}
                  placeholder="10 Günlük İtalya Turu"
                  className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none"
                  style={innerInputStyle}
                />
              </div>

              {/* Segmentler */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Lokasyonlar *
                  </label>
                  {toplamGun > 0 && (
                    <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                      Toplam: {toplamGun} gün
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {formSegmentler.map((seg, i) => (
                    <SegmentSatir
                      key={i}
                      segment={seg}
                      index={i}
                      onLokasyonGuncelle={(lokIdx, v) => lokasyonGuncelle(i, lokIdx, v)}
                      onLokasyonEkle={() => lokasyonEkle(i)}
                      onLokasyonCikar={(lokIdx) => lokasyonCikar(i, lokIdx)}
                      onGun={(v) => segmentGunGuncelle(i, v)}
                      onCikar={formSegmentler.length > 1 ? () => segmentCikar(i) : undefined}
                      inputStyle={innerInputStyle}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={segmentEkle}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed transition-colors hover:opacity-70 w-full justify-center"
                  style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                >
                  <Plus className="w-3.5 h-3.5" /> Lokasyon Ekle
                </button>
              </div>

              {formHata && <p className="text-xs text-red-500">{formHata}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={modalKapat}
                  className="flex-1 text-sm py-2 rounded-lg border"
                  style={{ borderColor: "var(--card-inner-border, rgba(0,0,0,0.1))", color: "var(--text-muted)" }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={kaydediyor}
                  className="flex-1 text-sm py-2 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ background: "var(--primary)" }}
                >
                  {kaydediyor ? "Kaydediliyor..." : duzenleId ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Takvime İşle Modal ─────────────────────────────────────────────── */}
      {takvimeModalId && takvimeProgram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !takvimeBasarili) setTakvimeModalId(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={cardStyle}>
            {takvimeBasarili !== null ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: "color-mix(in srgb, #22c55e 15%, transparent)" }}>
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                  Takvime İşlendi
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {takvimeBasarili} etkinlik takvime eklendi.
                </p>
                <button
                  onClick={() => setTakvimeModalId(null)}
                  className="text-sm px-6 py-2 rounded-lg text-white"
                  style={{ background: "var(--primary)" }}
                >
                  Kapat
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                      Takvime İşle
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {takvimeProgram.ad} · {takvimeProgram.sure} gün
                    </p>
                  </div>
                  <button onClick={() => setTakvimeModalId(null)} style={{ color: "var(--text-muted)" }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Önizleme */}
                <div className="rounded-xl p-3 space-y-1.5" style={{ background: "var(--card-inner-bg, rgba(0,0,0,0.04))" }}>
                  {takvimeProgram.segmentler.map((seg, i) => {
                    const oncekiGun = takvimeProgram.segmentler.slice(0, i).reduce((s, x) => s + x.gun, 0);
                    const segBaslangic = takvimeBaslangic
                      ? (() => {
                          const d = new Date(`${takvimeBaslangic}T00:00`);
                          d.setDate(d.getDate() + oncekiGun);
                          return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                        })()
                      : `+${oncekiGun}. gün`;
                    const segBitis = takvimeBaslangic
                      ? (() => {
                          const d = new Date(`${takvimeBaslangic}T00:00`);
                          d.setDate(d.getDate() + oncekiGun + seg.gun - 1);
                          return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                        })()
                      : `+${oncekiGun + seg.gun - 1}. gün`;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" style={{ color: "var(--primary)" }} />
                        <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                          {seg.lokasyonlar.join(", ")}
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>{segBaslangic} – {segBitis}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {/* Başlangıç tarihi */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Başlangıç Tarihi *</label>
                    <input
                      type="date"
                      value={takvimeBaslangic}
                      onChange={(e) => setTakvimeBaslangic(e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none"
                      style={innerInputStyle}
                    />
                  </div>

                  {/* Rehber (isteğe bağlı) */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      Rehber <span className="font-normal">(isteğe bağlı — tüm segmentlere atanır)</span>
                    </label>
                    <select
                      value={takvimeRehber}
                      onChange={(e) => setTakvimeRehber(e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none"
                      style={innerInputStyle}
                    >
                      <option value="">— Rehber seçin</option>
                      {referansRehberler.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}{r.city ? ` — ${r.city}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {takvimeHata && <p className="text-xs text-red-500">{takvimeHata}</p>}

                <div className="flex gap-2">
                  <button
                    onClick={() => setTakvimeModalId(null)}
                    className="flex-1 text-sm py-2 rounded-lg border"
                    style={{ borderColor: "var(--card-inner-border, rgba(0,0,0,0.1))", color: "var(--text-muted)" }}
                  >
                    İptal
                  </button>
                  <button
                    onClick={takvimeIsle}
                    disabled={takvimeIsleniyor || !takvimeBaslangic}
                    className="flex-1 text-sm py-2 rounded-lg text-white font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
                    style={{ background: "var(--primary)" }}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {takvimeIsleniyor ? "İşleniyor..." : "Takvime İşle"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Turist Listesi Modal ─────────────────────────────────────────── */}
      {turistModalProgram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="w-full max-w-5xl rounded-2xl flex flex-col" style={{ ...cardStyle, maxHeight: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--card-border)" }}>
              <div>
                <h2 className="font-semibold text-base flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <Users className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  Turist Listesi
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{turistModalProgram.ad}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setTuristEkleRow(BOSH_TURIST()); setTuristDuzenleId(null); }}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-white"
                  style={{ background: "var(--primary)" }}
                >
                  <Plus className="w-3.5 h-3.5" /> Turist Ekle
                </button>
                <button onClick={() => setTuristModalProgram(null)} style={{ color: "var(--text-muted)" }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tablo */}
            <div className="flex-1 overflow-auto">
              {turistYukleniyor ? (
                <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>Yükleniyor...</div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "var(--card-inner-bg, rgba(0,0,0,0.04))" }}>
                      {["Ad", "Soyad", "Pasaport No", "Uyruk", "Doğum Tarihi", "Telefon", "E-posta", "Notlar", ""].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-semibold px-3 py-2.5 whitespace-nowrap"
                          style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {turistler.map((t) => {
                      const duzenle = turistDuzenleId === t.id && turistDuzenleData;
                      return (
                        <tr
                          key={t.id}
                          style={{ borderBottom: "1px solid var(--card-border)" }}
                          className="hover:opacity-90 transition-opacity"
                        >
                          {duzenle ? (
                            <>
                              {(["ad", "soyad", "pasaportNo", "uyruk", "dogumTarihi", "telefon", "eposta", "notlar"] as const).map((field) => (
                                <td key={field} className="px-2 py-1.5">
                                  <input
                                    type="text"
                                    value={turistDuzenleData[field] ?? ""}
                                    onChange={(e) => setTuristDuzenleData((prev) => prev ? { ...prev, [field]: e.target.value || null } : prev)}
                                    className="w-full text-sm rounded px-2 py-1 focus:outline-none min-w-[80px]"
                                    style={innerInputStyle}
                                  />
                                </td>
                              ))}
                              <td className="px-2 py-1.5 whitespace-nowrap">
                                <div className="flex gap-1">
                                  <button
                                    onClick={turistGuncelle}
                                    disabled={turistKaydediyor}
                                    className="text-xs px-2 py-1 rounded text-white disabled:opacity-50"
                                    style={{ background: "var(--primary)" }}
                                  >
                                    Kaydet
                                  </button>
                                  <button
                                    onClick={() => { setTuristDuzenleId(null); setTuristDuzenleData(null); }}
                                    className="text-xs px-2 py-1 rounded border"
                                    style={{ borderColor: "var(--card-inner-border, rgba(0,0,0,0.1))", color: "var(--text-muted)" }}
                                  >
                                    İptal
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              {[t.ad, t.soyad, t.pasaportNo, t.uyruk, t.dogumTarihi, t.telefon, t.eposta, t.notlar].map((val, i) => (
                                <td key={i} className="px-3 py-2.5" style={{ color: val ? "var(--text-primary)" : "var(--text-muted)" }}>
                                  {val ?? <span className="text-xs">—</span>}
                                </td>
                              ))}
                              <td className="px-2 py-2.5 whitespace-nowrap">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => { setTuristDuzenleId(t.id); setTuristDuzenleData({ ad: t.ad, soyad: t.soyad, pasaportNo: t.pasaportNo, uyruk: t.uyruk, dogumTarihi: t.dogumTarihi, telefon: t.telefon, eposta: t.eposta, notlar: t.notlar }); setTuristEkleRow(null); }}
                                    className="p-1 rounded hover:opacity-70"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => turistSil(t.id)}
                                    className="p-1 rounded hover:opacity-70 text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}

                    {/* Yeni satır ekleme */}
                    {turistEkleRow && (
                      <tr style={{ borderBottom: "1px solid var(--card-border)", background: "color-mix(in srgb, var(--primary) 5%, transparent)" }}>
                        {(["ad", "soyad", "pasaportNo", "uyruk", "dogumTarihi", "telefon", "eposta", "notlar"] as const).map((field, i) => (
                          <td key={field} className="px-2 py-1.5">
                            <input
                              type="text"
                              value={turistEkleRow[field] ?? ""}
                              placeholder={["Ad *", "Soyad *", "Pasaport No", "Uyruk", "Doğum Tarihi", "Telefon", "E-posta", "Notlar"][i]}
                              onChange={(e) => setTuristEkleRow((prev) => prev ? { ...prev, [field]: e.target.value || null } : prev)}
                              className="w-full text-sm rounded px-2 py-1 focus:outline-none min-w-[80px]"
                              style={innerInputStyle}
                            />
                          </td>
                        ))}
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <div className="flex gap-1">
                            <button
                              onClick={turistEkle}
                              disabled={turistKaydediyor || !turistEkleRow.ad.trim() || !turistEkleRow.soyad.trim()}
                              className="text-xs px-2 py-1 rounded text-white disabled:opacity-50"
                              style={{ background: "var(--primary)" }}
                            >
                              Ekle
                            </button>
                            <button
                              onClick={() => setTuristEkleRow(null)}
                              className="text-xs px-2 py-1 rounded border"
                              style={{ borderColor: "var(--card-inner-border, rgba(0,0,0,0.1))", color: "var(--text-muted)" }}
                            >
                              İptal
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {turistler.length === 0 && !turistEkleRow && (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                          Henüz turist kaydı yok. Turist Ekle butonuna tıkla.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t" style={{ borderColor: "var(--card-border)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {turistler.length} turist kayıtlı
              </span>
              <button
                onClick={() => setTuristModalProgram(null)}
                className="text-sm px-4 py-1.5 rounded-lg border"
                style={{ borderColor: "var(--card-inner-border, rgba(0,0,0,0.1))", color: "var(--text-muted)" }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Silme Onay Modal ─────────────────────────────────────────────── */}
      {silmeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 text-center" style={cardStyle}>
            <Trash2 className="w-8 h-8 mx-auto text-red-500" />
            <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
              Bu programı silmek istiyor musun?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSilmeId(null)}
                disabled={siliyor}
                className="flex-1 text-sm py-2 rounded-lg border"
                style={{ borderColor: "var(--card-inner-border, rgba(0,0,0,0.1))", color: "var(--text-muted)" }}
              >
                İptal
              </button>
              <button
                onClick={sil}
                disabled={siliyor}
                className="flex-1 text-sm py-2 rounded-lg text-white font-medium bg-red-500 disabled:opacity-50"
              >
                {siliyor ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lokasyon Picker ────────────────────────────────────────────────────────
function LokasyonPicker({
  value,
  onChange,
  inputStyle,
  segmentLokasyonlar = [],
}: {
  value: string;
  onChange: (v: string) => void;
  inputStyle: React.CSSProperties;
  segmentLokasyonlar?: string[];
}) {
  const [arama, setArama] = useState("");
  const [acik, setAcik] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const diger = segmentLokasyonlar.filter((l) => l && l !== value);
  const filtrelenmis = sortSehirlerByProximity(arama, diger, diger);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAcik(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="flex-1 relative">
      {value ? (
        <div
          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer"
          style={inputStyle}
          onClick={() => { onChange(""); setArama(""); }}
        >
          <span style={{ color: "var(--text-primary)" }}>{value}</span>
          <X className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <input
          type="text"
          value={arama}
          placeholder="Şehir ara..."
          onChange={(e) => { setArama(e.target.value); setAcik(true); }}
          onFocus={() => setAcik(true)}
          className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none"
          style={inputStyle}
        />
      )}
      {acik && !value && filtrelenmis.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-30 overflow-hidden"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          {filtrelenmis.map((s) => (
            <button
              key={`${s.ulkeKod}-${s.sehir}`}
              type="button"
              onMouseDown={() => { onChange(s.sehir); setArama(""); setAcik(false); }}
              className="w-full text-left px-4 py-2.5 hover:opacity-75 flex items-center justify-between"
            >
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>{s.sehir}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.ulke}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Segment Satırı ─────────────────────────────────────────────────────────
function SegmentSatir({
  segment,
  index,
  onLokasyonGuncelle,
  onLokasyonEkle,
  onLokasyonCikar,
  onGun,
  onCikar,
  inputStyle,
}: {
  segment: Segment;
  index: number;
  onLokasyonGuncelle: (lokIdx: number, v: string) => void;
  onLokasyonEkle: () => void;
  onLokasyonCikar: (lokIdx: number) => void;
  onGun: (v: number) => void;
  onCikar?: () => void;
  inputStyle: React.CSSProperties;
}) {
  return (
    <div className="flex gap-2 items-start">
      <span
        className="text-xs font-bold w-5 flex items-center justify-center shrink-0 pt-2.5"
        style={{ color: "var(--text-muted)" }}
      >
        {index + 1}
      </span>

      {/* Lokasyonlar kolonu */}
      <div className="flex-1 space-y-1.5">
        {segment.lokasyonlar.map((lok, lokIdx) => (
          <div key={lokIdx} className="flex gap-1.5 items-center">
            <LokasyonPicker
              value={lok}
              onChange={(v) => onLokasyonGuncelle(lokIdx, v)}
              inputStyle={inputStyle}
              segmentLokasyonlar={segment.lokasyonlar}
            />
            {segment.lokasyonlar.length > 1 && (
              <button
                type="button"
                onClick={() => onLokasyonCikar(lokIdx)}
                className="p-1 rounded hover:opacity-70 text-red-400 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onLokasyonEkle}
          className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
          style={{ color: "var(--primary)" }}
        >
          <Plus className="w-3 h-3" /> Aynı güne şehir ekle
        </button>
      </div>

      {/* Gün sayısı */}
      <div className="flex items-center gap-1 shrink-0 pt-1">
        <input
          type="number"
          min={1}
          max={365}
          value={segment.gun}
          onChange={(e) => onGun(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-sm rounded-lg px-2 py-2 text-center focus:outline-none"
          style={inputStyle}
        />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>gün</span>
      </div>

      {onCikar && (
        <button
          type="button"
          onClick={onCikar}
          className="p-1.5 rounded-lg hover:opacity-70 text-red-400 shrink-0 mt-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
