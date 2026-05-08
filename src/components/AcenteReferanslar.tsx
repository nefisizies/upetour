"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, User, MapPin, Building2, ShieldBan, ShieldOff, RotateCcw, Minus } from "lucide-react";
import Link from "next/link";
import type { Referans, RehberProfile, AcenteRehberBlok } from "@prisma/client";

type ReferansWithRehber = Referans & { rehber: Pick<RehberProfile, "name" | "city" | "photoUrl" | "slug"> };
type BlokWithRehber = AcenteRehberBlok & { rehber: Pick<RehberProfile, "name" | "city" | "photoUrl" | "slug"> };
type BlokSecim = "YOK" | "GECICI_1AY" | "GECICI_3AY" | "GECICI_6AY" | "GECICI_1YIL" | "KALICI";

const BLOK_SECENEKLERI: { value: BlokSecim; label: string }[] = [
  { value: "YOK", label: "Hayır, tekrar başvurabilsin" },
  { value: "GECICI_1AY", label: "1 ay başvuru yollayamasın" },
  { value: "GECICI_3AY", label: "3 ay başvuru yollayamasın" },
  { value: "GECICI_6AY", label: "6 ay başvuru yollayamasın" },
  { value: "GECICI_1YIL", label: "1 yıl başvuru yollayamasın" },
  { value: "KALICI", label: "Bir daha hiç yollayamasın (ben kaldırana kadar)" },
];

const cardStyle = { background: "var(--card-bg)", border: "1px solid var(--card-border)" };
const subRowStyle = { background: "rgba(255,255,255,0.03)" };

export function AcenteReferanslar({ referanslar: initial, bloklar: initialBloklar }: { referanslar: ReferansWithRehber[]; bloklar: BlokWithRehber[] }) {
  const [referanslar, setReferanslar] = useState(initial);
  const [bloklar, setBloklar] = useState(initialBloklar);
  const [islemYapiliyor, setIslemYapiliyor] = useState<string | null>(null);
  const [redModal, setRedModal] = useState<{ id: string; rehberAdi: string } | null>(null);
  const [blokSecim, setBlokSecim] = useState<BlokSecim>("YOK");

  async function onayla(id: string) {
    setIslemYapiliyor(id);
    const res = await fetch(`/api/referans/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum: "ONAYLANDI" }) });
    setIslemYapiliyor(null);
    if (!res.ok) return;
    setReferanslar((prev) => prev.map((r) => r.id === id ? { ...r, durum: "ONAYLANDI" } : r));
  }

  async function reddetOnayla() {
    if (!redModal) return;
    setIslemYapiliyor(redModal.id);
    const res = await fetch(`/api/referans/${redModal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum: "REDDEDILDI", blok: blokSecim }) });
    setIslemYapiliyor(null);
    if (!res.ok) { setRedModal(null); return; }
    setReferanslar((prev) => prev.map((r) => r.id === redModal.id ? { ...r, durum: "REDDEDILDI" } : r));
    if (blokSecim !== "YOK") { const blokRes = await fetch("/api/referans/blok"); if (blokRes.ok) setBloklar(await blokRes.json()); }
    setRedModal(null); setBlokSecim("YOK");
  }

  async function kaldir(id: string) {
    setIslemYapiliyor(id);
    const res = await fetch(`/api/referans/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum: "KALDIRILDI" }) });
    setIslemYapiliyor(null);
    if (!res.ok) return;
    setReferanslar((prev) => prev.map((r) => r.id === id ? { ...r, durum: "KALDIRILDI" } : r));
  }

  async function geriAl(id: string) {
    setIslemYapiliyor(id);
    const res = await fetch(`/api/referans/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum: "ONAYLANDI" }) });
    setIslemYapiliyor(null);
    if (!res.ok) return;
    setReferanslar((prev) => prev.map((r) => r.id === id ? { ...r, durum: "ONAYLANDI" } : r));
  }

  async function blokKaldir(blokId: string) {
    const res = await fetch("/api/referans/blok", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blokId }) });
    if (!res.ok) return;
    setBloklar((prev) => prev.filter((b) => b.id !== blokId));
  }

  const bekleyenler = referanslar.filter((r) => r.durum === "BEKLIYOR");
  const gecmisler = referanslar.filter((r) => r.durum !== "BEKLIYOR" && r.durum !== "KALDIRILDI");
  const kaldirilanlar = referanslar.filter((r) => r.durum === "KALDIRILDI");

  return (
    <>
      {/* Red Modal */}
      {redModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-xl" style={cardStyle}>
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary, #f1f5f9)" }}>Başvuruyu Reddet</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted, #94a3b8)" }}>
              <span className="font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>{redModal.rehberAdi}</span> için kısıtlama seçin:
            </p>
            <div className="space-y-2 mb-5">
              {BLOK_SECENEKLERI.map((s) => (
                <label key={s.value} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                  <input type="radio" name="blok" value={s.value} checked={blokSecim === s.value} onChange={() => setBlokSecim(s.value)} className="accent-[#0a7ea4]" />
                  <span className="text-sm" style={{ color: "var(--text-primary, #f1f5f9)" }}>{s.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setRedModal(null); setBlokSecim("YOK"); }}
                className="flex-1 text-sm py-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ border: "1px solid var(--card-inner-border, rgba(255,255,255,0.1))", color: "var(--text-muted, #94a3b8)" }}>
                Vazgeç
              </button>
              <button onClick={reddetOnayla} disabled={islemYapiliyor === redModal.id}
                className="flex-1 text-sm bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60">
                {islemYapiliyor === redModal.id ? "İşleniyor..." : "Reddet"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Referans İstekleri */}
        <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0a7ea4]" />
            <h1 className="font-semibold text-lg" style={{ color: "var(--text-primary, #f1f5f9)" }}>Referans İstekleri</h1>
            {bekleyenler.length > 0 && <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">{bekleyenler.length}</span>}
          </div>

          {referanslar.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted, #94a3b8)" }}>Henüz referans isteği yok.</p>
          ) : (
            <div className="space-y-3">
              {bekleyenler.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(10,126,164,0.15)" }}>
                      {r.rehber.photoUrl ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <User className="w-4 h-4 text-[#0a7ea4]" />}
                    </div>
                    <div>
                      <Link href={`/rehber/${r.rehber.slug}`} target="_blank" className="text-sm font-medium hover:underline" style={{ color: "var(--text-primary, #f1f5f9)" }}>{r.rehber.name}</Link>
                      {r.rehber.city && <p className="text-xs flex items-center gap-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}><MapPin className="w-3 h-3" /> {r.rehber.city}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-400 flex items-center gap-1 mr-1"><Clock className="w-3 h-3" /> Bekliyor</span>
                    <button onClick={() => onayla(r.id)} disabled={islemYapiliyor === r.id}
                      className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      <CheckCircle className="w-3.5 h-3.5" /> Onayla
                    </button>
                    <button onClick={() => setRedModal({ id: r.id, rehberAdi: r.rehber.name })} disabled={islemYapiliyor === r.id}
                      className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      <XCircle className="w-3.5 h-3.5" /> Reddet
                    </button>
                  </div>
                </div>
              ))}

              {gecmisler.length > 0 && (
                <>
                  {bekleyenler.length > 0 && <div className="border-t" style={{ borderColor: "var(--card-inner-border, rgba(255,255,255,0.06))" }} />}
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted, #94a3b8)" }}>Geçmiş</p>
                  {gecmisler.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={subRowStyle}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                          {r.rehber.photoUrl ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <User className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                        </div>
                        <div>
                          <Link href={`/rehber/${r.rehber.slug}`} target="_blank" className="text-sm font-medium hover:underline" style={{ color: "var(--text-primary, #f1f5f9)" }}>{r.rehber.name}</Link>
                          {r.rehber.city && <p className="text-xs flex items-center gap-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}><MapPin className="w-3 h-3" /> {r.rehber.city}</p>}
                        </div>
                      </div>
                      {r.durum === "ONAYLANDI" ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Onaylandı</span>
                          <button onClick={() => kaldir(r.id)} disabled={islemYapiliyor === r.id}
                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 hover:text-red-400"
                            style={{ border: "1px solid var(--card-inner-border)", color: "var(--text-muted)" }}>
                            <Minus className="w-3 h-3" /> Kaldır
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Reddedildi</span>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Kaldırılanlar */}
        {kaldirilanlar.length > 0 && (
          <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h2 className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Kaldırılan Referanslar</h2>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>({kaldirilanlar.length})</span>
            </div>
            <div className="space-y-3">
              {kaldirilanlar.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ ...subRowStyle, border: "1px solid var(--card-inner-border, rgba(255,255,255,0.06))" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                      {r.rehber.photoUrl ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <User className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                    </div>
                    <div>
                      <Link href={`/rehber/${r.rehber.slug}`} target="_blank" className="text-sm font-medium hover:underline" style={{ color: "var(--text-primary, #f1f5f9)" }}>{r.rehber.name}</Link>
                      {r.rehber.city && <p className="text-xs flex items-center gap-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}><MapPin className="w-3 h-3" /> {r.rehber.city}</p>}
                    </div>
                  </div>
                  <button onClick={() => geriAl(r.id)} disabled={islemYapiliyor === r.id}
                    className="flex items-center gap-1 text-xs text-[#0a7ea4] hover:bg-[#0a7ea4]/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    style={{ border: "1px solid rgba(10,126,164,0.3)" }}>
                    <RotateCcw className="w-3.5 h-3.5" /> Geri Al
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engellenenler */}
        {bloklar.length > 0 && (
          <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
            <div className="flex items-center gap-2">
              <ShieldBan className="w-4 h-4 text-red-400" />
              <h2 className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Engellenenler</h2>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>({bloklar.length})</span>
            </div>
            <div className="space-y-3">
              {bloklar.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
                      {b.rehber.photoUrl ? <img src={b.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <User className="w-4 h-4 text-red-400" />}
                    </div>
                    <div>
                      <Link href={`/rehber/${b.rehber.slug}`} target="_blank" className="text-sm font-medium hover:underline" style={{ color: "var(--text-primary, #f1f5f9)" }}>{b.rehber.name}</Link>
                      <p className="text-xs text-red-400">
                        {b.tur === "KALICI" ? "Kalıcı engel" : `${new Date(b.banBitis!).toLocaleDateString("tr-TR")} tarihine kadar`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => blokKaldir(b.id)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-red-400"
                    style={{ border: "1px solid var(--card-inner-border)", color: "var(--text-muted)" }}>
                    <ShieldOff className="w-3.5 h-3.5" /> Engeli Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
