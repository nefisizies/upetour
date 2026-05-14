import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; turistId: string }> }) {
  const { id, turistId } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const program = await prisma.turProgrami.findFirst({ where: { id, acenteId: acente.id } });
  if (!program) return NextResponse.json({ error: "Program bulunamadı" }, { status: 404 });

  const { ad, soyad, pasaportNo, uyruk, dogumTarihi, telefon, eposta, notlar } = await req.json();

  const turist = await prisma.turistKayit.update({
    where: { id: turistId, programId: id },
    data: {
      ad: ad?.trim(),
      soyad: soyad?.trim(),
      pasaportNo: pasaportNo?.trim() || null,
      uyruk: uyruk?.trim() || null,
      dogumTarihi: dogumTarihi?.trim() || null,
      telefon: telefon?.trim() || null,
      eposta: eposta?.trim() || null,
      notlar: notlar?.trim() || null,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(turist);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; turistId: string }> }) {
  const { id, turistId } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const program = await prisma.turProgrami.findFirst({ where: { id, acenteId: acente.id } });
  if (!program) return NextResponse.json({ error: "Program bulunamadı" }, { status: 404 });

  await prisma.turistKayit.delete({ where: { id: turistId, programId: id } });

  return NextResponse.json({ ok: true });
}
