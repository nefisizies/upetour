export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Wallet, Globe, ArrowRight } from "lucide-react";

const DURUM: Record<string, { label: string; style: React.CSSProperties }> = {
  BEKLIYOR: { label: "Bekliyor", style: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" } },
  INCELENDI: { label: "İnceleniyor", style: { background: "rgba(96,165,250,0.15)", color: "#60a5fa" } },
  KABUL: { label: "Kabul Edildi", style: { background: "rgba(34,197,94,0.15)", color: "#4ade80" } },
  RED: { label: "Reddedildi", style: { background: "rgba(248,113,113,0.15)", color: "#f87171" } },
};

export default async function BasvurularimPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const rehber = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!rehber) redirect("/dashboard/rehber");

  const basvurular = await prisma.ilanBasvuru.findMany({
    where: { rehberId: rehber.id },
    include: {
      ilan: {
        include: { acente: { select: { companyName: true, slug: true, logoUrl: true, city: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6" data-layout="dashboard">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Başvurularım</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>
          {basvurular.length} başvuru
        </p>
      </div>

      {basvurular.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <p className="font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>Henüz başvuru yok</p>
          <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-muted, #94a3b8)" }}>İlanları keşfedin ve başvurun.</p>
          <Link
            href="/dashboard/rehber/ilanlar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            İlanları Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {basvurular.map(b => {
            const d = DURUM[b.durum] ?? DURUM.BEKLIYOR;
            return (
              <div key={b.id} className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-start gap-4">
                  {b.ilan.acente.logoUrl ? (
                    <Image src={b.ilan.acente.logoUrl} alt={b.ilan.acente.companyName} width={40} height={40} className="rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: "var(--primary)", color: "#fff" }}>
                      {b.ilan.acente.companyName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary, #f1f5f9)" }}>{b.ilan.title}</p>
                        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>{b.ilan.acente.companyName}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full shrink-0" style={d.style}>{d.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>
                      {b.ilan.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{b.ilan.location}</span>}
                      {b.ilan.budget && <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />{b.ilan.budget}</span>}
                      {b.ilan.languages.length > 0 && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{b.ilan.languages.join(", ")}</span>}
                    </div>
                    {b.mesaj && (
                      <p className="text-sm mt-2 line-clamp-2 italic" style={{ color: "var(--text-muted, #94a3b8)" }}>"{b.mesaj}"</p>
                    )}
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted, #94a3b8)" }}>
                      {new Date(b.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
