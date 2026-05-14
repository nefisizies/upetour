import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const program = await prisma.turProgrami.findFirst({ where: { id, acenteId: acente.id } });
  if (!program) return NextResponse.json({ error: "Program bulunamadı" }, { status: 404 });

  const turistler = await prisma.turistKayit.findMany({
    where: { programId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(turistler);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const program = await prisma.turProgrami.findFirst({ where: { id, acenteId: acente.id } });
  if (!program) return NextResponse.json({ error: "Program bulunamadı" }, { status: 404 });

  const { ad, soyad, pasaportNo, uyruk, dogumTarihi, telefon, eposta, notlar } = await req.json();
  if (!ad?.trim() || !soyad?.trim()) return NextResponse.json({ error: "Ad ve soyad zorunlu." }, { status: 400 });

  const turist = await prisma.turistKayit.create({
    data: {
      programId: id,
      ad: ad.trim(),
      soyad: soyad.trim(),
      pasaportNo: pasaportNo?.trim() || null,
      uyruk: uyruk?.trim() || null,
      dogumTarihi: dogumTarihi?.trim() || null,
      telefon: telefon?.trim() || null,
      eposta: eposta?.trim() || null,
      notlar: notlar?.trim() || null,
    },
  });

  return NextResponse.json(turist, { status: 201 });
}
