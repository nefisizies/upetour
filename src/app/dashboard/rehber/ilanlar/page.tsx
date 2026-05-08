export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { IlanlarKesfetClient } from "@/components/IlanlarKesfetClient";

export default async function RehberIlanlarPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const rehber = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!rehber) redirect("/dashboard/rehber");

  const [ilanlar, mevcutBasvurular] = await Promise.all([
    prisma.ilan.findMany({
      where: { isActive: true },
      include: { acente: { select: { companyName: true, slug: true, logoUrl: true, city: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ilanBasvuru.findMany({
      where: { rehberId: rehber.id },
      select: { ilanId: true, durum: true },
    }),
  ]);

  const basvuruMap = Object.fromEntries(mevcutBasvurular.map(b => [b.ilanId, b.durum]));

  return (
    <div data-layout="dashboard">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>İlanlar</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>
          Seyahat acentelerinin rehber arama ilanlarına başvur
        </p>
      </div>
      <IlanlarKesfetClient ilanlar={ilanlar} basvuruMap={basvuruMap} />
    </div>
  );
}
