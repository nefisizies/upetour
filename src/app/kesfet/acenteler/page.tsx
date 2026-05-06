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

  let referansMap: Record<string, { id: string; durum: string }> = {};
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
          select: { acenteId: true },
        }),
      ]);
      for (const r of referanslar) {
        referansMap[r.acenteId] = { id: r.id, durum: r.durum };
      }
      for (const b of bloklar) {
        referansMap[b.acenteId] = { id: "", durum: "BLOKLU" };
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3">
        <Logo size="sm" />
        <span className="text-gray-300">/</span>
        <Link href="/kesfet/rehberler" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Rehberler
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 text-sm">Acenteler</span>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Seyahat Acenteleri</h1>
          <span className="text-sm text-gray-500">{acenteler.length} acente bulundu</span>
        </div>

        {acenteler.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
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
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#0a7ea4]/10 flex items-center justify-center text-[#0a7ea4] font-bold text-lg shrink-0">
                      {a.logoUrl
                        ? <img src={a.logoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                        : a.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{a.companyName}</p>
                      {a.city && (
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {a.city}
                        </p>
                      )}
                      {a.website && (
                        <a
                          href={a.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#0a7ea4] flex items-center gap-1 hover:underline"
                        >
                          <Globe className="w-3 h-3" /> Website
                        </a>
                      )}
                    </div>
                  </div>

                  {a.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{a.description}</p>
                  )}

                  {isRehber && (
                    <div className="pt-1">
                      <ReferansButonu
                        acenteId={a.id}
                        referansId={ref?.id}
                        baslangicDurum={durum}
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
