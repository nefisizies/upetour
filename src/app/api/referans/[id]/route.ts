import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Rehber referans sil (sadece BEKLIYOR durumundakini)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const profile = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const referans = await prisma.referans.findUnique({ where: { id } });
  if (!referans || referans.rehberId !== profile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  await prisma.referans.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// Acente onay/red
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const { durum } = await req.json();
  if (durum !== "ONAYLANDI" && durum !== "REDDEDILDI") {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }

  const acenteProfile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const referans = await prisma.referans.findUnique({ where: { id } });
  if (!referans || referans.acenteId !== acenteProfile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const updated = await prisma.referans.update({
    where: { id },
    data: { durum },
    include: { rehber: { select: { name: true } } },
  });

  return NextResponse.json(updated);
}
