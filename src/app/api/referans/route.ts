import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Rehber referans ekle
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { acenteId } = await req.json();
  if (!acenteId) {
    return NextResponse.json({ error: "Acente seçilmedi" }, { status: 400 });
  }

  const profile = await prisma.rehberProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
  }

  const acente = await prisma.acenteProfile.findUnique({ where: { id: acenteId } });
  if (!acente) {
    return NextResponse.json({ error: "Acente bulunamadı" }, { status: 404 });
  }

  const mevcut = await prisma.referans.findUnique({
    where: { rehberId_acenteId: { rehberId: profile.id, acenteId } },
  });
  if (mevcut) {
    return NextResponse.json({ error: "Bu acenteye zaten başvuru yapıldı" }, { status: 409 });
  }

  const referans = await prisma.referans.create({
    data: { rehberId: profile.id, acenteId },
    include: { acente: { select: { companyName: true, city: true } } },
  });

  return NextResponse.json(referans, { status: 201 });
}

// Rehberin referanslarını listele
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const profile = await prisma.rehberProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return NextResponse.json([]);

  const referanslar = await prisma.referans.findMany({
    where: { rehberId: profile.id },
    include: { acente: { select: { companyName: true, city: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(referanslar);
}
