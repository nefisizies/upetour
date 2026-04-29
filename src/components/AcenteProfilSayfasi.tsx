"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AcenteProfile, Referans, RehberProfile } from "@prisma/client";
import { CheckCircle, XCircle, Clock, User, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

type ReferansWithRehber = Referans & {
  rehber: Pick<RehberProfile, "name" | "city" | "photoUrl" | "slug">;
};

type Props = {
  profile: AcenteProfile & { referanslar: ReferansWithRehber[] };
};

export function AcenteProfilSayfasi({ profile }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: profile.companyName,
    description: profile.description ?? "",
    city: profile.city ?? "",
    logoUrl: profile.logoUrl ?? "",
    website: profile.website ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [referanslar, setReferanslar] = useState<ReferansWithRehber[]>(profile.referanslar);
  const [islemYapiliyor, setIslemYapiliyor] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile/acente", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Kaydedilemedi, tekrar dene."); return; }
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  }

  async function referansKarar(id: string, durum: "ONAYLANDI" | "REDDEDILDI") {
    setIslemYapiliyor(id);
    const res = await fetch(`/api/referans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum }),
    });
    setIslemYapiliyor(null);
    if (!res.ok) return;
    setReferanslar((prev) => prev.map((r) => r.id === id ? { ...r, durum } : r));
  }

  const bekleyenler = referanslar.filter((r) => r.durum === "BEKLIYOR");
  const gecmisler = referanslar.filter((r) => r.durum !== "BEKLIYOR");

  return (
    <div className="space-y-6">
      {/* Profil Formu */}
      <form onSubmit={handleSave} className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Şirket Profili</h1>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">Profil kaydedildi.</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Şirket Bilgileri</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
            <input type="text" value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
            <input type="text" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="İstanbul, Antalya..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hakkında</label>
            <textarea value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} placeholder="Şirketinizi kısaca tanıtın..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="url" value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input type="url" value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-[#0a7ea4] text-white font-medium py-2.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60">
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </form>

      {/* Referans Onay Bölümü */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0a7ea4]" />
          <h2 className="font-semibold text-gray-900">Referans İstekleri</h2>
          {bekleyenler.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {bekleyenler.length}
            </span>
          )}
        </div>

        {referanslar.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Henüz referans isteği yok.</p>
        ) : (
          <div className="space-y-3">
            {/* Bekleyenler */}
            {bekleyenler.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0a7ea4]/10 flex items-center justify-center shrink-0">
                    {r.rehber.photoUrl
                      ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                      : <User className="w-4 h-4 text-[#0a7ea4]" />}
                  </div>
                  <div>
                    <Link href={`/rehber/${r.rehber.slug}`} target="_blank"
                      className="text-sm font-medium text-gray-900 hover:underline">
                      {r.rehber.name}
                    </Link>
                    {r.rehber.city && (
                      <p className="text-xs text-gray-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {r.rehber.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-600 flex items-center gap-1 mr-1">
                    <Clock className="w-3 h-3" /> Bekliyor
                  </span>
                  <button
                    onClick={() => referansKarar(r.id, "ONAYLANDI")}
                    disabled={islemYapiliyor === r.id}
                    className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    <CheckCircle className="w-3.5 h-3.5" /> Onayla
                  </button>
                  <button
                    onClick={() => referansKarar(r.id, "REDDEDILDI")}
                    disabled={islemYapiliyor === r.id}
                    className="flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    <XCircle className="w-3.5 h-3.5" /> Reddet
                  </button>
                </div>
              </div>
            ))}

            {/* Geçmiş kararlar */}
            {gecmisler.length > 0 && (
              <>
                {bekleyenler.length > 0 && <div className="border-t border-gray-100 pt-2" />}
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Geçmiş</p>
                {gecmisler.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        {r.rehber.photoUrl
                          ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : <User className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <Link href={`/rehber/${r.rehber.slug}`} target="_blank"
                          className="text-sm font-medium text-gray-900 hover:underline">
                          {r.rehber.name}
                        </Link>
                        {r.rehber.city && (
                          <p className="text-xs text-gray-400 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {r.rehber.city}
                          </p>
                        )}
                      </div>
                    </div>
                    {r.durum === "ONAYLANDI"
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Onaylandı</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Reddedildi</span>}
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
