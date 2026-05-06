import type { RehberProfile, RehberDil, RehberLicense, Tour, Referans, AcenteProfile } from "@prisma/client";
import { MapPin, Globe, Briefcase, CheckCircle, Star, Building2, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";

type Profile = (RehberProfile & {
  languages: RehberDil[];
  licenses: RehberLicense[];
  tours: Tour[];
  referanslar: (Referans & { acente: Pick<AcenteProfile, "companyName" | "city"> })[];
}) | null;

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
    <div className="backdrop-blur-sm rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>

      {/* Üst bant — profile git linki */}
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
          <div className="w-20 h-20 rounded-2xl border-4 shadow-md flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)", borderColor: "rgba(255,255,255,0.15)" }}>
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </span>
            )}
          </div>
          {profile?.isAvailable ? (
            <span className="inline-flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Müsait
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white/40" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} /> Müsait Değil
            </span>
          )}
        </div>

        <h3 className="font-bold text-white text-lg leading-tight">
          {profile?.name || <span className="text-white/20">Ad Soyad</span>}
        </h3>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {profile?.city && (
            <span className="text-sm text-white/60 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {profile.city}
            </span>
          )}
          {(profile?.experienceYears ?? 0) > 0 && (
            <span className="text-sm text-white/60 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 shrink-0" /> {profile!.experienceYears} yıl
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3">

          {/* Diller */}
          {(profile?.languages?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Diller
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile!.languages.map((l) => (
                  <span key={l.id} className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    {l.dil}{l.seviye ? ` · ${l.seviye}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Uzmanlıklar */}
          {(profile?.specialties?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Star className="w-3 h-3" /> Uzmanlıklar
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile!.specialties.slice(0, 5).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                    {s}
                  </span>
                ))}
                {profile!.specialties.length > 5 && (
                  <span className="text-xs text-white/40">+{profile!.specialties.length - 5} daha</span>
                )}
              </div>
            </div>
          )}

          {/* Onaylı Lisanslar */}
          {verifiedLicenses.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Doğrulanmış Lisanslar
              </p>
              <div className="flex flex-wrap gap-1.5">
                {verifiedLicenses.map((l) => (
                  <span key={l.id} className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5" /> {l.country}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Referans Acenteler */}
          {onaylananReferanslar.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Çalıştığı Acenteler
              </p>
              <div className="space-y-1.5">
                {onaylananReferanslar.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                    <span className="text-sm text-white/70 font-medium">{r.acente.companyName}</span>
                    {r.acente.city && <span className="text-xs text-white/40">{r.acente.city}</span>}
                  </div>
                ))}
                {onaylananReferanslar.length > 4 && (
                  <p className="text-xs text-white/40 pl-5">+{onaylananReferanslar.length - 4} acente daha</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alt çizgi — sadece acentelere görünen istatistik */}
      <div className="border-t px-5 py-4 rounded-b-2xl" style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
          <Zap className="w-3 h-3" style={{ color: "var(--primary)" }} />
          <span className="font-medium text-white/50">Sadece acentelere görünür</span>
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Bu siteden bağlantı</span>
          <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>{acenteBaglantiSayisi}</span>
        </div>
        <p className="text-xs text-white/40 mt-0.5">farklı acente iletişime geçti</p>
      </div>
    </div>
  );
}
