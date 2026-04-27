"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RehberProfile, Tour, RehberLicense } from "@prisma/client";
import { COUNTRY_LICENSES, COUNTRY_NAMES } from "@/lib/licenses";
import { CheckCircle, Clock, XCircle, Plus, Trash2, Camera } from "lucide-react";

type FormState = {
  name: string;
  bio: string;
  city: string;
  languages: string[];
  specialties: string[];
  experienceYears: number;
  operatingCountries: string[];
  photoUrl: string;
};

type Props = {
  profile: (RehberProfile & { tours: Tour[]; licenses: RehberLicense[] }) | null;
  onFormChange?: (form: FormState) => void;
};

const POPULER_DILLER = ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Rusça", "Arapça", "İspanyolca", "İtalyanca", "Japonca", "Çince", "Portekizce", "Korece", "Hollandaca", "Lehçe", "İsveççe"];

const UZMANLIKLAR = [
  "Tarihi Turlar", "Kültür Turları", "Müze Turları", "Arkeoloji",
  "Doğa Turları", "Trekking", "Macera Turları", "Dağ Turları",
  "Gastronomi Turları", "Şarap Turları", "Sokak Lezzetleri",
  "Şehir Turları", "Tekne Turları", "Bisiklet Turları",
  "Fuar Turları", "Kongre & MICE Turları", "Kurumsal Turlar",
  "Günübirlik Turlar", "Özel Turlar", "Grup Turları",
  "Çocuk & Aile Turları", "Engelli Dostu Turlar",
  "Fotografi Turları", "Gece Turları",
];

const STATUS_UI = {
  PENDING:  { icon: <Clock className="w-3.5 h-3.5" />,        label: "Doğrulama Bekliyor", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  VERIFIED: { icon: <CheckCircle className="w-3.5 h-3.5" />,  label: "Doğrulandı",         color: "text-green-600 bg-green-50 border-green-200" },
  REJECTED: { icon: <XCircle className="w-3.5 h-3.5" />,      label: "Reddedildi",         color: "text-red-600 bg-red-50 border-red-200" },
};

export function RehberProfilForm({ profile, onFormChange }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    bio: profile?.bio ?? "",
    city: profile?.city ?? "",
    languages: profile?.languages ?? [],
    specialties: profile?.specialties ?? [],
    experienceYears: profile?.experienceYears ?? 0,
    isAvailable: profile?.isAvailable ?? true,
    operatingCountries: profile?.operatingCountries ?? [],
    photoUrl: profile?.photoUrl ?? "",
  });

  const [licenses, setLicenses] = useState<{ country: string; licenseNo: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [ozelDil, setOzelDil] = useState("");

  function updateForm(next: typeof form) {
    setForm(next);
    onFormChange?.(next);
  }

  function toggleArray(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  function toggleCountry(code: string) {
    const next = toggleArray(form.operatingCountries, code);
    updateForm({ ...form, operatingCountries: next });

    const cfg = COUNTRY_LICENSES.find((c) => c.country === code);
    if (!next.includes(code)) {
      setLicenses((prev) => prev.filter((l) => l.country !== code));
    } else if (cfg && !licenses.find((l) => l.country === code)) {
      setLicenses((prev) => [...prev, { country: code, licenseNo: "" }]);
    }
  }

  function setLicenseNo(country: string, val: string) {
    setLicenses((prev) =>
      prev.map((l) => (l.country === country ? { ...l, licenseNo: val } : l))
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSuccess(false);

    const res = await fetch("/api/profile/rehber", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, licenses }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Kaydedilemedi, tekrar dene.");
      return;
    }
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          Profil kaydedildi.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Temel Bilgiler */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>

        {/* Profil Fotoğrafı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profil Fotoğrafı</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {form.photoUrl ? (
                <img src={form.photoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-7 h-7 text-gray-300" />
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <input
                type="url"
                value={form.photoUrl}
                onChange={(e) => updateForm({ ...form, photoUrl: e.target.value })}
                placeholder="Fotoğraf URL'si yapıştır (https://...)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
              />
              <p className="text-xs text-gray-400">
                Fotoğrafını bir yere yükle (Google Drive, Imgur vb.) ve linkini buraya yapıştır.
                Yakında doğrudan yükleme özelliği eklenecek.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
          <input type="text" value={form.name} onChange={(e) => updateForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
          <input type="text" value={form.city} onChange={(e) => updateForm({ ...form, city: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
            placeholder="İstanbul, Antalya, Kapadokya..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hakkımda</label>
          <textarea value={form.bio} onChange={(e) => updateForm({ ...form, bio: e.target.value })} rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] resize-none"
            placeholder="Kendinizi kısaca tanıtın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim (Yıl)</label>
          <input type="number" min={0} max={50} value={form.experienceYears}
            onChange={(e) => updateForm({ ...form, experienceYears: Number(e.target.value) })}
            className="w-32 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" />
        </div>
      </div>

      {/* Diller */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Konuştuğum Diller</h2>
          <p className="text-xs text-gray-500 mt-0.5">Popüler dillerden seç veya kendin ekle</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULER_DILLER.map((d) => (
            <button key={d} type="button" onClick={() => updateForm({ ...form, languages: toggleArray(form.languages, d) })}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${form.languages.includes(d) ? "bg-[#0a7ea4] text-white border-[#0a7ea4]" : "border-gray-200 text-gray-600 hover:border-[#0a7ea4]"}`}>
              {d}
            </button>
          ))}
          {/* Popüler listede olmayan ama eklenmiş diller */}
          {form.languages.filter(l => !POPULER_DILLER.includes(l)).map((d) => (
            <button key={d} type="button" onClick={() => updateForm({ ...form, languages: toggleArray(form.languages, d) })}
              className="text-sm px-3 py-1.5 rounded-full border bg-[#0a7ea4] text-white border-[#0a7ea4]">
              {d} ✕
            </button>
          ))}
        </div>
        {/* Özel dil ekleme */}
        <div className="flex gap-2">
          <input
            type="text"
            value={ozelDil}
            onChange={(e) => setOzelDil(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const dil = ozelDil.trim();
                if (dil && !form.languages.includes(dil)) {
                  updateForm({ ...form, languages: [...form.languages, dil] });
                }
                setOzelDil("");
              }
            }}
            placeholder="Başka bir dil yaz, Enter'a bas..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
          />
          <button
            type="button"
            onClick={() => {
              const dil = ozelDil.trim();
              if (dil && !form.languages.includes(dil)) {
                updateForm({ ...form, languages: [...form.languages, dil] });
              }
              setOzelDil("");
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors font-medium"
          >
            Ekle
          </button>
        </div>
      </div>

      {/* Uzmanlıklar */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Uzmanlık Alanlarım</h2>
        <div className="flex flex-wrap gap-2">
          {UZMANLIKLAR.map((u) => (
            <button key={u} type="button" onClick={() => updateForm({ ...form, specialties: toggleArray(form.specialties, u) })}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${form.specialties.includes(u) ? "bg-[#0a7ea4] text-white border-[#0a7ea4]" : "border-gray-200 text-gray-600 hover:border-[#0a7ea4]"}`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Hizmet Verilen Ülkeler + Lisanslar */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Hizmet Verdiğim Ülkeler</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Seçtiğin ülkelerde hizmet verebilmek için o ülkenin lisans belgesi gerekir.
            Belge olmadan profilin o ülkede "Doğrulanmamış" olarak görünür.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COUNTRY_LICENSES.map((c) => (
            <button key={c.country} type="button" onClick={() => toggleCountry(c.country)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${
                form.operatingCountries.includes(c.country)
                  ? "border-[#0a7ea4] bg-[#0a7ea4]/5 text-[#0a7ea4] font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}>
              <span className="text-lg">{c.flag}</span>
              <span>{COUNTRY_NAMES[c.country]}</span>
            </button>
          ))}
        </div>

        {/* Seçilen ülkelerin lisans alanları */}
        {form.operatingCountries.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700">Lisans Bilgileri</p>
            {form.operatingCountries.map((code) => {
              const cfg = COUNTRY_LICENSES.find((c) => c.country === code)!;
              const existing = profile?.licenses.find((l) => l.country === code);
              const licenseEntry = licenses.find((l) => l.country === code);

              return (
                <div key={code} className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {cfg.flag} {COUNTRY_NAMES[code]}
                      </p>
                      <p className="text-xs text-gray-500">{cfg.licenseType}</p>
                    </div>
                    {existing && (
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_UI[existing.status].color}`}>
                        {STATUS_UI[existing.status].icon}
                        {STATUS_UI[existing.status].label}
                      </span>
                    )}
                  </div>

                  {!existing && (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={licenseEntry?.licenseNo ?? ""}
                        onChange={(e) => setLicenseNo(code, e.target.value)}
                        placeholder={code === "TR" ? "Örn: TR-12345" : `${cfg.licenseType} numarası`}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] bg-white"
                      />
                      <p className="text-xs text-gray-400">{cfg.description}</p>
                      {cfg.required && (
                        <p className="text-xs text-orange-600">
                          ⚠️ Bu ülkede hizmet vermek için zorunlu — belge olmadan profil bu ülkede görünmez.
                        </p>
                      )}
                    </div>
                  )}

                  {existing?.status === "REJECTED" && (
                    <p className="text-xs text-red-600">
                      Belgeniz reddedildi. Lütfen doğru bilgileri tekrar girin.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Müsaitlik */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Müsaitlik Durumu</p>
          <p className="text-sm text-gray-500">Kapalıyken acenteler mesaj gönderemez</p>
        </div>
        <button type="button" onClick={() => updateForm({ ...form, isAvailable: !form.isAvailable })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isAvailable ? "bg-[#0a7ea4]" : "bg-gray-200"}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isAvailable ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      <button type="submit" disabled={saving}
        className="w-full bg-[#0a7ea4] text-white font-medium py-2.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60">
        {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </button>
    </form>
  );
}
