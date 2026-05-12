"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Pencil, Trash2, MapPin, Clock, Play, ChevronDown, ChevronUp, Check } from "lucide-react";
import { SEHIR_LISTESI } from "@/lib/sehirler";

type Segment = { lokasyon: string; gun: number };

type Program = {
  id: string;
  ad: string;
  sure: number;
  segmentler: Segment[];
  createdAt: string;
};

type Rehber = { id: string; name: string; city: string | null };

const cardStyle = { background: "var(--card-bg)", border: "1px solid var(--card-border)" };
const innerInputStyle = {
  background: "var(--card-inner-bg, rgba(0,0,0,0.04))",
  border: "1px solid var(--card-inner-border, rgba(0,0,0,0.1))",
  color: "var(--text-primary)",
} as React.CSSProperties;

const BOSH_SEGMENT = (): Segment => ({ lokasyon: "", gun: 1 });

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

  async function yukle() {
    setYukleniyor(true);
    const res = await fetch("/api/acente/programlar");
    const data = await res.json();
    setProgramlar(Array.isArray(data) ? data : []);
    setYukleniyor(false);
  }

  useEffect(() => { yukle(); }, []);

  function modalAc(p?: Program) {
    if (p) {
      setDuzenleId(p.id);
      setFormAd(p.ad);
      setFormSegmentler(p.segmentler.length > 0 ? p.segmentler : [BOSH_SEGMENT()]);
    } else {
      setDuzenleId(null);
      setFormAd("");
      setFormSegmentler([BOSH_SEGMENT()]);
    }
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

  function segmentGuncelle(i: number, alan: keyof Segment, deger: string | number) {
    setFormSegmentler((prev) => prev.map((s, idx) => idx === i ? { ...s, [alan]: deger } : s));
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
    const gecerliSegmentler = formSegmentler.filter((s) => s.lokasyon && s.gun > 0);
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
                            <span className="flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
                              <MapPin className="w-3 h-3 shrink-0" style={{ color: "var(--primary)" }} />
                              {seg.lokasyon}
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
          onClick={(e) => { if (e.target === e.currentTarget) modalKapat(); }}
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
                      onLokasyon={(v) => segmentGuncelle(i, "lokasyon", v)}
                      onGun={(v) => segmentGuncelle(i, "gun", v)}
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
                        <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>{seg.lokasyon}</span>
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

// ─── Segment Satırı ─────────────────────────────────────────────────────────
function SegmentSatir({
  segment,
  index,
  onLokasyon,
  onGun,
  onCikar,
  inputStyle,
}: {
  segment: Segment;
  index: number;
  onLokasyon: (v: string) => void;
  onGun: (v: number) => void;
  onCikar?: () => void;
  inputStyle: React.CSSProperties;
}) {
  const [arama, setArama] = useState("");
  const [acik, setAcik] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtrelenmis = SEHIR_LISTESI.filter(
    (s) =>
      s.sehir.toLowerCase().includes(arama.toLowerCase()) ||
      s.ulke.toLowerCase().includes(arama.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAcik(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex gap-2 items-start">
      <span
        className="text-xs font-bold w-5 h-8 flex items-center justify-center rounded shrink-0 mt-0.5"
        style={{ color: "var(--text-muted)" }}
      >
        {index + 1}
      </span>

      {/* Lokasyon picker */}
      <div ref={ref} className="flex-1 relative">
        {segment.lokasyon ? (
          <div
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer"
            style={inputStyle}
            onClick={() => { onLokasyon(""); setArama(""); }}
          >
            <span style={{ color: "var(--text-primary)" }}>{segment.lokasyon}</span>
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
        {acik && !segment.lokasyon && filtrelenmis.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-30 overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            {filtrelenmis.map((s) => (
              <button
                key={`${s.ulkeKod}-${s.sehir}`}
                type="button"
                onMouseDown={() => { onLokasyon(s.sehir); setArama(""); setAcik(false); }}
                className="w-full text-left px-4 py-2.5 hover:opacity-75 flex items-center justify-between"
              >
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{s.sehir}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.ulke}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gün sayısı */}
      <div className="flex items-center gap-1 shrink-0">
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
          className="p-1.5 rounded-lg hover:opacity-70 text-red-400 shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
