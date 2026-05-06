export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { MapPin, Globe, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ReferansButonu } from "@/components/ReferansButonu";

export default async function AcentelerPage() {
  const session = await getServerSession(authOptions);
  const isRehber = session?.user.role === "REHBER";

  const acenteler = await prisma.acenteProfile.findMany({
    orderBy: { createdAt: "desc" },
  });

  let referansMap: Record<string, { id: string; durum: string; banBitis?: Date | null }> = {};
  if (isRehber) {
    const profile = await prisma.rehberProfile.findUnique({
      where: { userId: session!.user.id },
      select: { id: true },
    });
    if (profile) {
      const [referanslar, bloklar] = await Promise.all([
        prisma.referans.findMany({
          where: { rehberId: profile.id },
          select: { id: true, acenteId: true, durum: true },
        }),
        prisma.acenteRehberBlok.findMany({
          where: {
            rehberId: profile.id,
            OR: [{ tur: "KALICI" }, { banBitis: { gt: new Date() } }],
          },
          select: { acenteId: true, banBitis: true, tur: true },
        }),
      ]);
      for (const r of referanslar) {
        referansMap[r.acenteId] = { id: r.id, durum: r.durum };
      }
      for (const b of bloklar) {
        referansMap[b.acenteId] = { id: "", durum: "BLOKLU", banBitis: b.banBitis };
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>
      <nav className="sticky top-0 z-30 border-b backdrop-blur-md px-4 h-14 flex items-center gap-3" style={{ background: "rgba(12,5,0,0.85)", borderColor: "rgba(255,255,255,0.08)" }}>
        <Logo size="sm" darkBg />
        <span className="text-white/20">/</span>
        <Link href="/kesfet/rehberler" className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Rehberler
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-white/60 text-sm">Acenteler</span>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Seyahat Acenteleri</h1>
          <span className="text-sm text-white/50">{acenteler.length} acente bulundu</span>
        </div>

        {acenteler.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-lg">Henüz kayıtlı acente yok.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {acenteler.map((a) => {
              const ref = referansMap[a.id];
              const durum = ref ? (ref.durum as "BEKLIYOR" | "ONAYLANDI" | "REDDEDILDI" | "BLOKLU") : "YOK";
              return (
                <div
                  key={a.id}
                  className="backdrop-blur-sm rounded-2xl p-5 flex flex-col gap-3"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                      {a.logoUrl
                        ? <img src={a.logoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                        : a.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{a.companyName}</p>
                      {a.city && (
                        <p className="text-sm text-white/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {a.city}
                        </p>
                      )}
                      {a.website && (
                        <a
                          href={a.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center gap-1 hover:underline"
                          style={{ color: "var(--primary)" }}
                        >
                          <Globe className="w-3 h-3" /> Website
                        </a>
                      )}
                    </div>
                  </div>

                  {a.description && (
                    <p className="text-sm text-white/60 line-clamp-2">{a.description}</p>
                  )}

                  {isRehber && (
                    <div className="pt-1">
                      <ReferansButonu
                        acenteId={a.id}
                        referansId={ref?.id}
                        baslangicDurum={durum}
                        banBitis={ref?.banBitis ? new Date(ref.banBitis).toLocaleDateString("tr-TR") : undefined}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
