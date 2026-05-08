"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { RehberProfile, Tour, RehberLicense, RehberDil, Referans, AcenteProfile } from "@prisma/client";
import { COUNTRY_LICENSES, COUNTRY_NAMES } from "@/lib/licenses";
import { POPULER_DILLER, SEVIYELER, getSertifikalar } from "@/lib/diller";
import { CheckCircle, Clock, XCircle, Camera, X, Plus, ChevronDown, Building2, Search } from "lucide-react";

type ReferansWithAcente = Referans & { acente: Pick<AcenteProfile, "companyName" | "city"> };
type AcenteOption = Pick<AcenteProfile, "id" | "companyName" | "city">;
type DilEntry = { dil: string; seviye: string; sertifika: string; sonuc: string };

type FormState = {
  name: string; bio: string; city: string; diller: DilEntry[];
  specialties: string[]; experienceYears: number; isAvailable: boolean;
  operatingCountries: string[]; photoUrl: string;
};

type Props = {
  profile: (RehberProfile & { tours: Tour[]; licenses: RehberLicense[]; languages: RehberDil[]; referanslar: ReferansWithAcente[] }) | null;
  onFormChange?: (form: FormState) => void;
  adminMode?: boolean;
};

const UZMANLIKLAR = [
  "Tarihi Turlar","Kültür Turları","Müze Turları","Arkeoloji",
  "Doğa Turları","Trekking","Macera Turları","Dağ Turları",
  "Gastronomi Turları","Şarap Turları","Sokak Lezzetleri",
  "Şehir Turları","Tekne Turları","Bisiklet Turları",
  "Fuar Turları","Kongre & MICE Turları","Kurumsal Turlar",
  "Günübirlik Turlar","Özel Turlar","Grup Turları",
  "Çocuk & Aile Turları","Engelli Dostu Turlar",
  "Fotoğraf Turları","Gece Turları",
];

const STATUS_UI = {
  PENDING:  { icon: <Clock className="w-3.5 h-3.5" />,       label: "Doğrulama Bekliyor", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  VERIFIED: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Doğrulandı",         color: "text-green-400 bg-green-500/10 border-green-500/30" },
  REJECTED: { icon: <XCircle className="w-3.5 h-3.5" />,     label: "Reddedildi",         color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]";
const inputStyle = { background: "var(--card-inner-bg, rgba(255,255,255,0.06))", border: "1px solid var(--card-inner-border, rgba(255,255,255,0.1))", color: "var(--text-primary, #f1f5f9)" };
const sectionStyle = { background: "var(--card-bg)", border: "1px solid var(--card-border)" };
const subBgStyle = { background: "rgba(255,255,255,0.04)" };

export function RehberProfilForm({ profile, onFormChange, adminMode = false }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: profile?.name ?? "",
    bio: profile?.bio ?? "",
    city: profile?.city ?? "",
    diller: profile?.languages?.map((d) => ({ dil: d.dil, seviye: d.seviye ?? "", sertifika: d.sertifika ?? "", sonuc: d.sonuc ?? "" })) ?? [],
    specialties: profile?.specialties ?? [],
    experienceYears: profile?.experienceYears ?? 0,
    isAvailable: profile?.isAvailable ?? true,
    operatingCountries: profile?.operatingCountries ?? [],
    photoUrl: profile?.photoUrl ?? "",
  });

  const [licenses, setLicenses] = useState<{ country: string; licenseNo: string }[]>([]);
  const [ozelDil, setOzelDil] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [referanslar, setReferanslar] = useState<ReferansWithAcente[]>(profile?.referanslar ?? []);
  const [acenteArama, setAcenteArama] = useState("");
  const [acenteSonuclar, setAcenteSonuclar] = useState<AcenteOption[]>([]);
  const [acenteYukleniyor, setAcenteYukleniyor] = useState(false);
  const [referansEkleniyor, setReferansEkleniyor] = useState(false);
  const aramaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateForm(next: typeof form) { setForm(next); onFormChange?.(next); }
  function toggleArray(arr: string[], val: string) { return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]; }
  function dilEkle(dil: string) { if (form.diller.find((d) => d.dil === dil)) return; updateForm({ ...form, diller: [...form.diller, { dil, seviye: "", sertifika: "", sonuc: "" }] }); }
  function dilCikar(dil: string) { updateForm({ ...form, diller: form.diller.filter((d) => d.dil !== dil) }); }
  function dilGuncelle(dil: string, alan: keyof Omit<DilEntry, "dil">, deger: string) {
    updateForm({ ...form, diller: form.diller.map((d) => d.dil === dil ? { ...d, [alan]: deger } : d) });
  }

  function toggleCountry(code: string) {
    const next = toggleArray(form.operatingCountries, code);
    updateForm({ ...form, operatingCountries: next });
    const cfg = COUNTRY_LICENSES.find((c) => c.country === code);
    if (!next.includes(code)) { setLicenses((prev) => prev.filter((l) => l.country !== code)); }
    else if (cfg && !licenses.find((l) => l.country === code)) { setLicenses((prev) => [...prev, { country: code, licenseNo: "" }]); }
  }

  function setLicenseNo(country: string, val: string) { setLicenses((prev) => prev.map((l) => (l.country === country ? { ...l, licenseNo: val } : l))); }

  function acenteAramaGuncelle(val: string) {
    setAcenteArama(val);
    if (aramaTimeout.current) clearTimeout(aramaTimeout.current);
    if (!val.trim()) { setAcenteSonuclar([]); return; }
    aramaTimeout.current = setTimeout(async () => {
      setAcenteYukleniyor(true);
      const res = await fetch(`/api/acenteler?q=${encodeURIComponent(val)}`);
      setAcenteSonuclar(await res.json());
      setAcenteYukleniyor(false);
    }, 300);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoUploading(true);
    const data = new FormData(); data.append("file", file); data.append("upload_preset", "rehbersepeti");
    const res = await fetch("https://api.cloudinary.com/v1_1/dkcrf1xw7/image/upload", { method: "POST", body: data });
    const json = await res.json();
    if (json.secure_url) updateForm({ ...form, photoUrl: json.secure_url });
    setPhotoUploading(false);
  }

  async function referansEkle(acente: AcenteOption) {
    setReferansEkleniyor(true);
    const res = await fetch("/api/referans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acenteId: acente.id }) });
    setReferansEkleniyor(false);
    if (!res.ok) return;
    const yeni = await res.json();
    setReferanslar((prev) => [yeni, ...prev]);
    setAcenteArama(""); setAcenteSonuclar([]);
  }

  async function referansSil(id: string) {
    await fetch(`/api/referans/${id}`, { method: "DELETE" });
    setReferanslar((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true); setSuccess(false);
    const res = await fetch("/api/profile/rehber", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, licenses }) });
    setSaving(false);
    if (!res.ok) { setError("Kaydedilemedi, tekrar dene."); return; }
    setSuccess(true); router.refresh(); setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">Profil kaydedildi.</div>}
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Temel Bilgiler */}
      <div className="rounded-xl p-6 space-y-4" style={sectionStyle}>
        <h2 className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Temel Bilgiler</h2>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-muted, #94a3b8)" }}>Profil Fotoğrafı</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 relative"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.15)" }}>
              {photoUploading
                ? <div className="w-6 h-6 border-2 border-[#0a7ea4] border-t-transparent rounded-full animate-spin" />
                : form.photoUrl
                ? <img src={form.photoUrl} alt="Profil" className="w-full h-full object-cover" />
                : <Camera className="w-7 h-7" style={{ color: "rgba(255,255,255,0.2)" }} />}
            </div>
            <div className="flex-1 space-y-2">
              <label className={`flex items-center gap-2 w-fit px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${photoUploading ? "opacity-50 pointer-events-none" : "border-[#0a7ea4] text-[#0a7ea4] hover:bg-[#0a7ea4]/10"}`}>
                <Camera className="w-4 h-4" />
                {photoUploading ? "Yükleniyor..." : "Fotoğraf Seç"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
              </label>
              <p className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>JPG, PNG, WEBP — max 10MB</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Ad Soyad</label>
          <input type="text" value={form.name} onChange={(e) => updateForm({ ...form, name: e.target.value })} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Şehir</label>
          <input type="text" value={form.city} onChange={(e) => updateForm({ ...form, city: e.target.value })}
            placeholder="İstanbul, Antalya, Kapadokya..." className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Hakkımda</label>
          <textarea value={form.bio} onChange={(e) => updateForm({ ...form, bio: e.target.value })} rows={4}
            placeholder="Kendinizi kısaca tanıtın..." className={`${inputCls} resize-none`} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Deneyim (Yıl)</label>
          <input type="number" min={0} max={50} value={form.experienceYears}
            onChange={(e) => updateForm({ ...form, experienceYears: Number(e.target.value) })}
            className="w-32 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" style={inputStyle} />
        </div>
      </div>

      {/* Diller */}
      <div className="rounded-xl p-6 space-y-4" style={sectionStyle}>
        <div>
          <h2 className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Konuştuğum Diller</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>Dili seç, seviyeni ve varsa sertifikanı ekle</p>
        </div>

        {form.diller.length > 0 && (
          <div className="space-y-3">
            {form.diller.map((entry) => {
              const sertifikalar = getSertifikalar(entry.dil);
              return (
                <div key={entry.dil} className="rounded-xl p-4 space-y-3" style={subBgStyle}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm" style={{ color: "var(--text-primary, #f1f5f9)" }}>{entry.dil}</span>
                    <button type="button" onClick={() => dilCikar(entry.dil)} className="transition-colors hover:text-red-400" style={{ color: "var(--text-muted, #94a3b8)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select value={entry.seviye} onChange={(e) => dilGuncelle(entry.dil, "seviye", e.target.value)}
                        className="w-full appearance-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] pr-8" style={inputStyle}>
                        <option value="">Seviye seç</option>
                        {SEVIYELER.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                    </div>
                    <div className="relative">
                      <select value={entry.sertifika} onChange={(e) => dilGuncelle(entry.dil, "sertifika", e.target.value)}
                        className="w-full appearance-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] pr-8" style={inputStyle}>
                        <option value="">Sertifika (isteğe bağlı)</option>
                        {sertifikalar.map((s) => <option key={s} value={s}>{s}</option>)}
                        {sertifikalar.length > 0 && <option value="Diğer">Diğer</option>}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {POPULER_DILLER.filter((d) => !form.diller.find((e) => e.dil === d)).map((d) => (
            <button key={d} type="button" onClick={() => dilEkle(d)}
              className="text-sm px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 hover:border-[#0a7ea4] hover:text-[#0a7ea4]"
              style={{ borderColor: "var(--card-inner-border, rgba(255,255,255,0.1))", color: "var(--text-muted, #94a3b8)" }}>
              <Plus className="w-3 h-3" />{d}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input type="text" value={ozelDil} onChange={(e) => setOzelDil(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (ozelDil.trim()) { dilEkle(ozelDil.trim()); setOzelDil(""); } } }}
            placeholder="Listede olmayan bir dil yaz..."
            className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" style={inputStyle} />
          <button type="button" onClick={() => { if (ozelDil.trim()) { dilEkle(ozelDil.trim()); setOzelDil(""); } }}
            className="px-4 py-2 text-sm rounded-lg transition-colors font-medium"
            style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-primary, #f1f5f9)" }}>
            Ekle
          </button>
        </div>
      </div>

      {/* Uzmanlıklar */}
      <div className="rounded-xl p-6" style={sectionStyle}>
        <h2 className="font-semibold mb-3" style={{ color: "var(--text-primary, #f1f5f9)" }}>Uzmanlık Alanlarım</h2>
        <div className="flex flex-wrap gap-2">
          {UZMANLIKLAR.map((u) => (
            <button key={u} type="button"
              onClick={() => updateForm({ ...form, specialties: toggleArray(form.specialties, u) })}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${form.specialties.includes(u) ? "bg-[#0a7ea4] text-white border-[#0a7ea4]" : "hover:border-[#0a7ea4] hover:text-[#0a7ea4]"}`}
              style={form.specialties.includes(u) ? {} : { borderColor: "var(--card-inner-border, rgba(255,255,255,0.1))", color: "var(--text-muted, #94a3b8)" }}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Ülkeler + Lisanslar */}
      <div className="rounded-xl p-6 space-y-4" style={sectionStyle}>
        <div>
          <h2 className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Hizmet Verdiğim Ülkeler</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>Seçtiğin ülkelerde hizmet verebilmek için lisans belgesi gerekir.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COUNTRY_LICENSES.map((c) => (
            <button key={c.country} type="button" onClick={() => toggleCountry(c.country)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${form.operatingCountries.includes(c.country) ? "border-[#0a7ea4] bg-[#0a7ea4]/10 text-[#0a7ea4] font-medium" : ""}`}
              style={form.operatingCountries.includes(c.country) ? {} : { borderColor: "var(--card-inner-border, rgba(255,255,255,0.1))", color: "var(--text-muted, #94a3b8)" }}>
              <span className="text-lg">{c.flag}</span>
              <span>{COUNTRY_NAMES[c.country]}</span>
            </button>
          ))}
        </div>

        {form.operatingCountries.length > 0 && (
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--card-inner-border, rgba(255,255,255,0.08))" }}>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>Lisans Bilgileri</p>
            {form.operatingCountries.map((code) => {
              const cfg = COUNTRY_LICENSES.find((c) => c.country === code)!;
              const existing = profile?.licenses.find((l) => l.country === code);
              const licenseEntry = licenses.find((l) => l.country === code);
              return (
                <div key={code} className="rounded-xl p-4 space-y-2" style={subBgStyle}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>{cfg.flag} {COUNTRY_NAMES[code]}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{cfg.licenseType}</p>
                    </div>
                    {existing && (
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_UI[existing.status].color}`}>
                        {STATUS_UI[existing.status].icon} {STATUS_UI[existing.status].label}
                      </span>
                    )}
                  </div>
                  {!existing && (
                    <div className="space-y-1.5">
                      <input type="text" value={licenseEntry?.licenseNo ?? ""}
                        onChange={(e) => setLicenseNo(code, e.target.value)}
                        placeholder={code === "TR" ? "Örn: TR-12345" : `${cfg.licenseType} numarası`}
                        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]" style={inputStyle} />
                      <p className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{cfg.description}</p>
                      {cfg.required
                        ? <p className="text-xs text-orange-400">⚠️ Zorunlu — belge olmadan profil bu ülkede görünmez.</p>
                        : <p className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>İsteğe bağlı — belgeniz varsa girin, yoksa boş bırakabilirsiniz.</p>}
                    </div>
                  )}
                  {existing?.status === "REJECTED" && <p className="text-xs text-red-400">Belgeniz reddedildi. Doğru bilgileri tekrar girin.</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Referanslar */}
      <div className="rounded-xl p-6 space-y-4" style={sectionStyle}>
        <div>
          <h2 className="font-semibold flex items-center gap-2" style={{ color: "var(--text-primary, #f1f5f9)" }}>
            <Building2 className="w-4 h-4 text-[#0a7ea4]" /> Çalıştığım Acenteler
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>Seçtiğiniz acente onayladıktan sonra profilinizde görünür.</p>
        </div>

        {referanslar.length > 0 && (
          <div className="space-y-2">
            {referanslar.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={subBgStyle}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>{r.acente.companyName}</p>
                  {r.acente.city && <p className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{r.acente.city}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {r.durum === "BEKLIYOR" && (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Onay Bekliyor
                    </span>
                  )}
                  {r.durum === "ONAYLANDI" && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Onaylandı
                    </span>
                  )}
                  {r.durum === "REDDEDILDI" && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" /> Reddedildi
                    </span>
                  )}
                  {r.durum !== "ONAYLANDI" && (
                    <button type="button" onClick={() => referansSil(r.id)} className="transition-colors hover:text-red-400" style={{ color: "rgba(255,255,255,0.2)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <div className="flex items-center rounded-lg px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-[#0a7ea4]"
            style={{ background: "var(--card-inner-bg, rgba(255,255,255,0.06))", border: "1px solid var(--card-inner-border, rgba(255,255,255,0.1))" }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted, #94a3b8)" }} />
            <input type="text" value={acenteArama} onChange={(e) => acenteAramaGuncelle(e.target.value)}
              placeholder="Acente adıyla ara..."
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "var(--text-primary, #f1f5f9)" }} />
            {acenteYukleniyor && <div className="w-3.5 h-3.5 border-2 border-[#0a7ea4] border-t-transparent rounded-full animate-spin shrink-0" />}
          </div>

          {acenteSonuclar.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl shadow-lg overflow-hidden"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              {acenteSonuclar
                .filter((a) => !referanslar.find((r) => r.acenteId === a.id))
                .map((a) => (
                  <button key={a.id} type="button" disabled={referansEkleniyor} onClick={() => referansEkle(a)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>{a.companyName}</p>
                      {a.city && <p className="text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{a.city}</p>}
                    </div>
                    <Plus className="w-4 h-4 text-[#0a7ea4]" />
                  </button>
                ))}
              {acenteSonuclar.filter((a) => !referanslar.find((r) => r.acenteId === a.id)).length === 0 && (
                <p className="text-sm px-4 py-3" style={{ color: "var(--text-muted, #94a3b8)" }}>Tüm sonuçlar zaten eklendi.</p>
              )}
            </div>
          )}

          {acenteArama.trim() && !acenteYukleniyor && acenteSonuclar.length === 0 && (
            <p className="text-xs mt-1.5 px-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Sistemde kayıtlı acente bulunamadı.</p>
          )}
        </div>
      </div>

      {/* Müsaitlik */}
      <div className="rounded-xl p-6 flex items-center justify-between" style={sectionStyle}>
        <div>
          <p className="font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>Müsaitlik Durumu</p>
          <p className="text-sm" style={{ color: "var(--text-muted, #94a3b8)" }}>Kapalıyken acenteler mesaj gönderemez</p>
        </div>
        <button type="button" onClick={() => updateForm({ ...form, isAvailable: !form.isAvailable })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isAvailable ? "bg-[#0a7ea4]" : "bg-white/20"}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isAvailable ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      <button type="submit" disabled={saving}
        className={`w-full font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 ${adminMode ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0a7ea4] hover:bg-[#065f7d] text-white"}`}>
        {saving ? "Kaydediliyor..." : adminMode ? "⚡ Admin Kaydet" : "Değişiklikleri Kaydet"}
      </button>
    </form>
  );
}
