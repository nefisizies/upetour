"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RehberProfile, Tour } from "@prisma/client";

type Props = {
  profile: (RehberProfile & { tours: Tour[] }) | null;
};

const DILLER = ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Rusça", "Arapça", "İspanyolca", "İtalyanca"];
const UZMANLIKLAR = ["Tarihi Turlar", "Doğa Turlar", "Gastronomi", "Kültür Turlar", "Macera", "Tekne Turları", "Şehir Turları", "Müze Turları"];

export function RehberProfilForm({ profile }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    bio: profile?.bio ?? "",
    city: profile?.city ?? "",
    languages: profile?.languages ?? [],
    specialties: profile?.specialties ?? [],
    experienceYears: profile?.experienceYears ?? 0,
    isAvailable: profile?.isAvailable ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function toggleArray(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    await fetch("/api/profile/rehber", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
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

      {/* Temel Bilgiler */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
            placeholder="İstanbul, Antalya, Kapadokya..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hakkımda</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] resize-none"
            placeholder="Kendinizi kısaca tanıtın..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim (Yıl)</label>
          <input
            type="number"
            min={0}
            max={50}
            value={form.experienceYears}
            onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
            className="w-32 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
          />
        </div>
      </div>

      {/* Diller */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Konuştuğum Diller</h2>
        <div className="flex flex-wrap gap-2">
          {DILLER.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setForm({ ...form, languages: toggleArray(form.languages, d) })}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                form.languages.includes(d)
                  ? "bg-[#0a7ea4] text-white border-[#0a7ea4]"
                  : "border-gray-200 text-gray-600 hover:border-[#0a7ea4]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Uzmanlıklar */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Uzmanlık Alanlarım</h2>
        <div className="flex flex-wrap gap-2">
          {UZMANLIKLAR.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setForm({ ...form, specialties: toggleArray(form.specialties, u) })}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                form.specialties.includes(u)
                  ? "bg-[#0a7ea4] text-white border-[#0a7ea4]"
                  : "border-gray-200 text-gray-600 hover:border-[#0a7ea4]"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Müsaitlik */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Müsaitlik Durumu</p>
          <p className="text-sm text-gray-500">Kapalıyken acenteler mesaj gönderemez</p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.isAvailable ? "bg-[#0a7ea4]" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              form.isAvailable ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#0a7ea4] text-white font-medium py-2.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60"
      >
        {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </button>
    </form>
  );
}
