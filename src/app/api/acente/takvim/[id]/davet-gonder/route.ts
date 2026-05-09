import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const acenteProfile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const etkinlik = await prisma.acenteTakvimEtkinlik.findUnique({
    where: { id: params.id },
    include: { rehber: { select: { id: true, name: true } } },
  });

  if (!etkinlik || etkinlik.acenteId !== acenteProfile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  if (!etkinlik.rehberId) {
    return NextResponse.json({ error: "Bu etkinliğe rehber atanmamış" }, { status: 400 });
  }

  const rehberUser = await prisma.user.findFirst({ where: { rehberProfile: { id: etkinlik.rehberId } } });
  if (!rehberUser) return NextResponse.json({ error: "Rehber bulunamadı" }, { status: 404 });

  const tarihStr = new Date(etkinlik.baslangic).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });

  await prisma.$transaction([
    prisma.acenteTakvimEtkinlik.update({
      where: { id: params.id },
      data: { rehberYanit: "BEKLIYOR" },
    }),
    prisma.bildirim.create({
      data: {
        userId: rehberUser.id,
        tip: "DAVET",
        baslik: `Tur Daveti: ${etkinlik.baslik}`,
        metin: `${acenteProfile.companyName} sizi ${tarihStr}${etkinlik.lokasyon ? ` (${etkinlik.lokasyon})` : ""} için tur rehberliğine davet etti.`,
        link: `/dashboard/rehber/davet/${etkinlik.id}`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
