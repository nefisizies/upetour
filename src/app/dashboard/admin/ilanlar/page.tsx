export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MapPin, Globe, Banknote } from "lucide-react";
import { IlanToggleButonu } from "@/components/IlanToggleButonu";

export default async function AdminIlanlarPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const ilanlar = await prisma.ilan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      acente: { select: { companyName: true, city: true } },
    },
  });

  const aktif = ilanlar.filter(i => i.isActive).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--card-text, #f1f5f9)" }}>İlanlar</h1>
        <p className="text-sm mt-1" style={{ color: "var(--card-text-muted, #94a3b8)" }}>{aktif} aktif · {ilanlar.length - aktif} pasif</p>
      </div>

      <div className="backdrop-blur-sm rounded-2xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="divide-y divide-white/5">
          {ilanlar.map(ilan => (
            <div key={ilan.id} className="flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white">{ilan.title}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    ilan.isActive
                      ? "bg-green-500/15 text-green-400 border border-green-500/25"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}>{ilan.isActive ? "Aktif" : "Pasif"}</span>
                </div>
                <p className="text-xs text-white/50">{ilan.acente.companyName}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {ilan.location && (
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{ilan.location}
                    </span>
                  )}
                  {ilan.budget && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Banknote className="w-3 h-3" />{ilan.budget}
                    </span>
                  )}
                  {ilan.languages.length > 0 && (
                    <span className="text-xs text-blue-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />{ilan.languages.join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <IlanToggleButonu ilanId={ilan.id} isActive={ilan.isActive} />
            </div>
          ))}
          {ilanlar.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-white/40">Henüz ilan yok</div>
          )}
        </div>
      </div>
    </div>
  );
}
