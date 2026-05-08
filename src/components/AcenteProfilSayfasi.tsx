"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AcenteProfile, Referans, RehberProfile } from "@prisma/client";
import { CheckCircle, XCircle, Clock, User, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

type ReferansWithRehber = Referans & { rehber: Pick<RehberProfile, "name" | "city" | "photoUrl" | "slug"> };
type Props = { profile: AcenteProfile & { referanslar: ReferansWithRehber[] } };

const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]";
const inputStyle = { background: "var(--card-inner-bg, rgba(255,255,255,0.06))", border: "1px solid var(--card-inner-border, rgba(255,255,255,0.1))", color: "var(--text-primary, #f1f5f9)" };
const cardStyle = { background: "var(--card-bg)", border: "1px solid var(--card-border)" };

export function AcenteProfilSayfasi({ profile }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ companyName: profile.companyName, description: profile.description ?? "", city: profile.city ?? "", logoUrl: profile.logoUrl ?? "", website: profile.website ?? "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [referanslar, setReferanslar] = useState<ReferansWithRehber[]>(profile.referanslar);
  const [islemYapiliyor, setIslemYapiliyor] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    const res = await fetch("/api/profile/acente", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (!res.ok) { setError("Kaydedilemedi, tekrar dene."); return; }
    setSuccess(true); router.refresh(); setTimeout(() => setSuccess(false), 3000);
  }

  async function referansKarar(id: string, durum: "ONAYLANDI" | "REDDEDILDI") {
    setIslemYapiliyor(id);
    const res = await fetch(`/api/referans/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum }) });
    setIslemYapiliyor(null);
    if (!res.ok) return;
    setReferanslar((prev) => prev.map((r) => r.id === id ? { ...r, durum } : r));
  }

  const bekleyenler = referanslar.filter((r) => r.durum === "BEKLIYOR");
  const gecmisler = referanslar.filter((r) => r.durum !== "BEKLIYOR");

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Şirket Profili</h1>

        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">Profil kaydedildi.</div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

        <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
          <h2 className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Şirket Bilgileri</h2>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Şirket Adı</label>
            <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Şehir</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="İstanbul, Antalya..." className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Hakkında</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
              placeholder="Şirketinizi kısaca tanıtın..." className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Website</label>
            <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Logo URL</label>
            <input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." className={inputCls} style={inputStyle} />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-[#0a7ea4] text-white font-medium py-2.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60">
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </form>

      {/* Referans Onay */}
      <div className="rounded-xl p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0a7ea4]" />
          <h2 className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Referans İstekleri</h2>
          {bekleyenler.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">{bekleyenler.length}</span>
          )}
        </div>

        {referanslar.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted, #94a3b8)" }}>Henüz referans isteği yok.</p>
        ) : (
          <div className="space-y-3">
            {bekleyenler.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(10,126,164,0.15)" }}>
                    {r.rehber.photoUrl ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <User className="w-4 h-4 text-[#0a7ea4]" />}
                  </div>
                  <div>
                    <Link href={`/rehber/${r.rehber.slug}`} target="_blank" className="text-sm font-medium hover:underline" style={{ color: "var(--text-primary, #f1f5f9)" }}>
                      {r.rehber.name}
                    </Link>
                    {r.rehber.city && <p className="text-xs flex items-center gap-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}><MapPin className="w-3 h-3" /> {r.rehber.city}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-yellow-400 flex items-center gap-1 mr-1"><Clock className="w-3 h-3" /> Bekliyor</span>
                  <button onClick={() => referansKarar(r.id, "ONAYLANDI")} disabled={islemYapiliyor === r.id}
                    className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    <CheckCircle className="w-3.5 h-3.5" /> Onayla
                  </button>
                  <button onClick={() => referansKarar(r.id, "REDDEDILDI")} disabled={islemYapiliyor === r.id}
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
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                        {r.rehber.photoUrl ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <User className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                      </div>
                      <div>
                        <Link href={`/rehber/${r.rehber.slug}`} target="_blank" className="text-sm font-medium hover:underline" style={{ color: "var(--text-primary, #f1f5f9)" }}>{r.rehber.name}</Link>
                        {r.rehber.city && <p className="text-xs flex items-center gap-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}><MapPin className="w-3 h-3" /> {r.rehber.city}</p>}
                      </div>
                    </div>
                    {r.durum === "ONAYLANDI"
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Onaylandı</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Reddedildi</span>}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
