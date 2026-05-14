export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DavetYanit } from "@/components/DavetYanit";

export default async function DavetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const { id } = await params;
  const rehberProfile = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!rehberProfile) redirect("/dashboard");

  const etkinlik = await prisma.acenteTakvimEtkinlik.findUnique({
    where: { id },
    include: { acente: { select: { companyName: true, city: true, logoUrl: true } } },
  });

  if (!etkinlik || etkinlik.rehberId !== rehberProfile.id) redirect("/dashboard/rehber");

  // Aynı programa ait diğer segmentler
  const programSegmentler = etkinlik.programId
    ? await prisma.acenteTakvimEtkinlik.findMany({
        where: { programId: etkinlik.programId, rehberId: rehberProfile.id },
        orderBy: { baslangic: "asc" },
        select: { id: true, baslik: true, baslangic: true, bitis: true, lokasyon: true },
      })
    : [];

  return (
    <DavetYanit
      etkinlik={{
        id: etkinlik.id,
        baslik: etkinlik.baslik,
        baslangic: etkinlik.baslangic.toISOString(),
        bitis: etkinlik.bitis?.toISOString() ?? null,
        lokasyon: etkinlik.lokasyon,
        notlar: etkinlik.notlar,
        rehberYanit: etkinlik.rehberYanit,
        acente: etkinlik.acente,
      }}
      programSegmentler={programSegmentler.map((s) => ({
        id: s.id,
        baslik: s.baslik,
        baslangic: s.baslangic.toISOString(),
        bitis: s.bitis?.toISOString() ?? null,
        lokasyon: s.lokasyon,
      }))}
    />
  );
}
