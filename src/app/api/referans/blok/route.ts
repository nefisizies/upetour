import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const acenteProfile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acenteProfile) return NextResponse.json([]);

  const bloklar = await prisma.acenteRehberBlok.findMany({
    where: { acenteId: acenteProfile.id },
    include: { rehber: { select: { name: true, city: true, photoUrl: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bloklar);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { blokId } = await req.json();
  const acenteProfile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const blok = await prisma.acenteRehberBlok.findUnique({ where: { id: blokId } });
  if (!blok || blok.acenteId !== acenteProfile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  await prisma.acenteRehberBlok.delete({ where: { id: blokId } });
  return NextResponse.json({ ok: true });
}
