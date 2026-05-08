import type { RehberProfile, RehberDil, RehberLicense, Tour, Referans, AcenteProfile } from "@prisma/client";
import { MapPin, Globe, Briefcase, CheckCircle, Star, Building2, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";

type Profile = (RehberProfile & {
  languages: RehberDil[];
  licenses: RehberLicense[];
  tours: Tour[];
  referanslar: (Referans & { acente: Pick<AcenteProfile, "companyName" | "city"> })[];
}) | null;

// RehberKarti always has white background in both light and dark modes.
// All text colors are hardcoded to ensure readability on white — do NOT use
// Tailwind text-gray-* classes here because globals.css dark mode overrides
// lighten them, making them invisible on white.
const C = {
  text:       "#111827",
  secondary:  "#374151",
  muted:      "#6b7280",
  faint:      "#9ca3af",
  lighter:    "#d1d5db",
};

export function RehberKarti({
  profile,
  acenteBaglantiSayisi,
}: {
  profile: Profile;
  acenteBaglantiSayisi: number;
}) {
  const onaylananReferanslar = profile?.referanslar.filter((r) => r.durum === "ONAYLANDI") ?? [];
  const verifiedLicenses = profile?.licenses.filter((l) => l.status === "VERIFIED") ?? [];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>

      {/* Üst bant */}
      <Link
        href={profile?.slug ? `/rehber/${profile.slug}` : "#"}
        target="_blank"
        className="block h-16 relative group rounded-t-2xl overflow-hidden"
        style={{ background: "linear-gradient(to right, var(--primary), color-mix(in srgb, var(--primary) 70%, white))" }}
      >
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <span className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/30 px-3 py-1.5 rounded-full">
            <ExternalLink className="w-3.5 h-3.5" /> Profile Git
          </span>
        </span>
      </Link>

      {/* Fotoğraf + temel bilgi */}
      <div className="px-5 pb-5">
        <div className="-mt-10 mb-4 flex items-end justify-between relative z-10">
          <div className="w-20 h-20 rounded-2xl border-4 shadow-md flex items-center justify-center overflow-hidden shrink-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--primary) 10%, white)", borderColor: "white" }}>
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </span>
            )}
          </div>
          {profile?.isAvailable ? (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: "rgba(34,197,94,0.12)", color: "#15803d", border: "1px solid rgba(34,197,94,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#16a34a" }} /> Müsait
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ color: C.faint, background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.lighter }} /> Müsait Değil
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg leading-tight" style={{ color: C.text }}>
          {profile?.name || <span style={{ color: C.lighter }}>Ad Soyad</span>}
        </h3>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {profile?.city && (
            <span className="text-sm flex items-center gap-1" style={{ color: C.muted }}>
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {profile.city}
            </span>
          )}
          {(profile?.experienceYears ?? 0) > 0 && (
            <span className="text-sm flex items-center gap-1" style={{ color: C.muted }}>
              <Briefcase className="w-3.5 h-3.5 shrink-0" /> {profile!.experienceYears} yıl
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3">

          {/* Diller */}
          {(profile?.languages?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1" style={{ color: C.faint }}>
                <Globe className="w-3 h-3" /> Diller
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile!.languages.map((l) => (
                  <span key={l.id} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                    {l.dil}{l.seviye ? ` · ${l.seviye}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Uzmanlıklar */}
          {(profile?.specialties?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1" style={{ color: C.faint }}>
                <Star className="w-3 h-3" /> Uzmanlıklar
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile!.specialties.slice(0, 5).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "color-mix(in srgb, var(--primary) 10%, white)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                    {s}
                  </span>
                ))}
                {profile!.specialties.length > 5 && (
                  <span className="text-xs" style={{ color: C.faint }}>+{profile!.specialties.length - 5} daha</span>
                )}
              </div>
            </div>
          )}

          {/* Onaylı Lisanslar */}
          {verifiedLicenses.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1" style={{ color: C.faint }}>
                <CheckCircle className="w-3 h-3" /> Doğrulanmış Lisanslar
              </p>
              <div className="flex flex-wrap gap-1.5">
                {verifiedLicenses.map((l) => (
                  <span key={l.id} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                    <CheckCircle className="w-2.5 h-2.5" /> {l.country}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Referans Acenteler */}
          {onaylananReferanslar.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1" style={{ color: C.faint }}>
                <Building2 className="w-3 h-3" /> Çalıştığı Acenteler
              </p>
              <div className="space-y-1.5">
                {onaylananReferanslar.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 shrink-0" style={{ color: "#16a34a" }} />
                    <span className="text-sm font-medium" style={{ color: C.secondary }}>{r.acente.companyName}</span>
                    {r.acente.city && <span className="text-xs" style={{ color: C.faint }}>{r.acente.city}</span>}
                  </div>
                ))}
                {onaylananReferanslar.length > 4 && (
                  <p className="text-xs pl-5" style={{ color: C.faint }}>+{onaylananReferanslar.length - 4} acente daha</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alt çizgi — acentelere görünen istatistik */}
      <div className="border-t px-5 py-4" style={{ background: "rgba(0,0,0,0.03)", borderColor: "rgba(0,0,0,0.08)" }}>
        <p className="text-xs mb-2 flex items-center gap-1" style={{ color: C.faint }}>
          <Zap className="w-3 h-3" style={{ color: "var(--primary)" }} />
          <span className="font-medium" style={{ color: C.muted }}>Sadece acentelere görünür</span>
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: C.muted }}>Bu siteden bağlantı</span>
          <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>{acenteBaglantiSayisi}</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: C.faint }}>farklı acente iletişime geçti</p>
      </div>
    </div>
  );
}
