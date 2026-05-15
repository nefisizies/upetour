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
    include: {
      acente: { select: { companyName: true, city: true, logoUrl: true } },
      turistler: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!etkinlik || etkinlik.rehberId !== rehberProfile.id) redirect("/dashboard/rehber");

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
      turistler={etkinlik.turistler.map((t) => ({
        ad: t.ad,
        soyad: t.soyad,
        pasaportNo: t.pasaportNo,
        uyruk: t.uyruk,
        dogumTarihi: t.dogumTarihi,
        telefon: t.telefon,
        eposta: t.eposta,
      }))}
    />
  );
}
