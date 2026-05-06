export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Star, CheckCircle, ArrowLeft, Building2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default async function RehberProfilPublic({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rehber = await prisma.rehberProfile.findUnique({
    where: { slug },
    include: {
      tours: { where: { isActive: true } },
      user: { select: { createdAt: true } },
      languages: { select: { dil: true, seviye: true } },
      referanslar: {
        where: { durum: "ONAYLANDI" },
        include: { acente: { select: { companyName: true, city: true, slug: true } } },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { tours: true } },
    },
  });

  if (!rehber) notFound();

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>
      <nav className="sticky top-0 z-30 border-b backdrop-blur-md px-4 h-14 flex items-center gap-4" style={{ background: "rgba(12,5,0,0.85)", borderColor: "rgba(255,255,255,0.08)" }}>
        <Logo size="sm" darkBg />
        <Link href="/kesfet/rehberler" className="text-white/50 hover:text-white flex items-center gap-1 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Rehberler
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Profil başlık */}
        <div className="backdrop-blur-sm rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shrink-0" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
              {rehber.photoUrl
                ? <img src={rehber.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                : rehber.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{rehber.name}</h1>
                {rehber.isAvailable ? (
                  <span className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Müsait
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full text-white/40" style={{ background: "rgba(255,255,255,0.08)" }}>Meşgul</span>
                )}
              </div>
              {rehber.city && (
                <p className="text-white/50 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {rehber.city}
                </p>
              )}
              <p className="text-sm text-white/40 mt-1">{rehber.experienceYears} yıl deneyim</p>
            </div>
          </div>

          {rehber.bio && (
            <p className="text-white/60 text-sm mt-4 leading-relaxed">{rehber.bio}</p>
          )}

          {rehber.languages.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Globe className="w-4 h-4 text-white/40" />
              <div className="flex flex-wrap gap-1">
                {rehber.languages.map((l) => (
                  <span key={l.dil} className="text-xs px-2 py-0.5 rounded-full text-white/60" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>{l.dil}</span>
                ))}
              </div>
            </div>
          )}

          {rehber.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {rehber.specialties.map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/mesaj/yeni?to=${rehber.userId}`}
            className="mt-5 inline-block text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors hover:brightness-110"
            style={{ background: "var(--primary)" }}
          >
            Mesaj Gönder
          </Link>
        </div>

        {/* Referans Acenteler */}
        {rehber.referanslar.length > 0 && (
          <div className="backdrop-blur-sm rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" style={{ color: "var(--primary)" }} /> Çalıştığı Acenteler
            </h2>
            <div className="flex flex-wrap gap-2">
              {rehber.referanslar.map((r) => (
                <div key={r.id} className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{r.acente.companyName}</p>
                    {r.acente.city && <p className="text-xs text-white/40">{r.acente.city}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Turlar */}
        {rehber.tours.length > 0 && (
          <div className="backdrop-blur-sm rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: "var(--primary)" }} /> Tur Hizmetleri
            </h2>
            <div className="space-y-3">
              {rehber.tours.map((t) => (
                <div key={t.id} className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="font-medium text-white">{t.title}</p>
                  {t.description && <p className="text-sm text-white/50 mt-1">{t.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-white/40">
                    {t.location && <span>📍 {t.location}</span>}
                    {t.duration && <span>⏱ {t.duration}</span>}
                    {t.priceRange && <span>💰 {t.priceRange}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
