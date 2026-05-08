export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BasvuruYonetim } from "@/components/BasvuruYonetim";

export default async function AcenteBasvurularPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") redirect("/dashboard");

  const profile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      ilanlar: {
        where: { basvurular: { some: {} } },
        include: {
          basvurular: {
            include: {
              rehber: {
                include: { user: { select: { email: true } } },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const ilanlar = profile?.ilanlar ?? [];

  return (
    <div className="space-y-6" data-layout="dashboard">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Gelen Başvurular</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>
          İlanlarınıza yapılan başvuruları inceleyin
        </p>
      </div>

      {ilanlar.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <p className="font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>Henüz başvuru yok</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Aktif ilanlarınıza rehberler başvurduğunda burada görünecek.</p>
        </div>
      ) : (
        <BasvuruYonetim ilanlar={ilanlar} />
      )}
    </div>
  );
}
