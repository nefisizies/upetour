export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, Globe, Star, CheckCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

export default async function RehberlerPage({
  searchParams,
}: {
  searchParams: Promise<{ sehir?: string; dil?: string; uzmanlik?: string }>;
}) {
  const params = await searchParams;

  const rehberler = await prisma.rehberProfile.findMany({
    where: {
      ...(params.sehir ? { city: { contains: params.sehir, mode: "insensitive" } } : {}),
      ...(params.dil ? { languages: { some: { dil: params.dil } } } : {}),
      ...(params.uzmanlik ? { specialties: { has: params.uzmanlik } } : {}),
    },
    include: {
      user: { select: { createdAt: true } },
      languages: { select: { dil: true } },
      _count: { select: { tours: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b backdrop-blur-md px-4 h-14 flex items-center gap-3" style={{ background: "rgba(12,5,0,0.85)", borderColor: "rgba(255,255,255,0.08)" }}>
        <Logo size="sm" darkBg />
        <span className="text-white/20">/</span>
        <span className="text-white/60 text-sm">Rehber Ara</span>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Tur Rehberleri</h1>
          <span className="text-sm text-white/50">{rehberler.length} rehber bulundu</span>
        </div>

        {rehberler.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-lg">Henüz kayıtlı rehber yok.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rehberler.map((r) => (
              <Link
                key={r.id}
                href={`/rehber/${r.slug}`}
                className="backdrop-blur-sm rounded-2xl p-5 hover:bg-white/5 transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {/* Avatar */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-white truncate">{r.name}</p>
                      {r.isAvailable && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      )}
                    </div>
                    {r.city && (
                      <p className="text-sm text-white/40 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.city}
                      </p>
                    )}
                  </div>
                </div>

                {r.bio && (
                  <p className="text-sm text-white/60 line-clamp-2 mb-3">{r.bio}</p>
                )}

                {/* Diller */}
                {r.languages.length > 0 && (
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    <Globe className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs text-white/50">{r.languages.slice(0, 3).map((l) => l.dil).join(", ")}</span>
                  </div>
                )}

                {/* Uzmanlıklar */}
                {r.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.specialties.slice(0, 3).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="text-xs text-white/40">{r.experienceYears} yıl deneyim</span>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Star className="w-3 h-3" /> {r._count.tours} tur
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
