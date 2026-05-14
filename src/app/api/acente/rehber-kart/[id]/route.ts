import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const rehber = await prisma.rehberProfile.findUnique({
    where: { id },
    include: {
      languages: true,
      licenses: true,
      tours: true,
      referanslar: {
        where: { durum: "ONAYLANDI" },
        include: { acente: { select: { companyName: true, city: true } } },
      },
    },
  });

  if (!rehber) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const acenteBaglantiSayisi = await prisma.referans.count({
    where: { rehberId: id, durum: "ONAYLANDI" },
  });

  return NextResponse.json({ rehber, acenteBaglantiSayisi });
}
