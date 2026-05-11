import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getEtkinlik(id: string, userId: string) {
  const profile = await prisma.rehberProfile.findUnique({ where: { userId } });
  if (!profile) return null;
  const etkinlik = await prisma.takvimEtkinlik.findUnique({ where: { id } });
  if (!etkinlik || etkinlik.rehberId !== profile.id) return null;
  return etkinlik;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const etkinlik = await getEtkinlik(id, session.user.id);
  if (!etkinlik) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  if (etkinlik.tur === "REZERVASYON") {
    return NextResponse.json({ error: "Rezervasyonlar düzenlenemez" }, { status: 403 });
  }

  const { baslik, baslangic, bitis, notlar } = await req.json();

  const updated = await prisma.takvimEtkinlik.update({
    where: { id },
    data: {
      baslik: baslik?.trim() || etkinlik.baslik,
      baslangic: baslangic ? new Date(baslangic) : etkinlik.baslangic,
      bitis: bitis ? new Date(bitis) : null,
      notlar: notlar?.trim() || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const etkinlik = await getEtkinlik(id, session.user.id);
  if (!etkinlik) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  // Sadece manuel etkinlikler silinebilir
  if (etkinlik.tur === "REZERVASYON") {
    return NextResponse.json({ error: "Rezervasyonlar silinemez" }, { status: 403 });
  }

  await prisma.takvimEtkinlik.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
