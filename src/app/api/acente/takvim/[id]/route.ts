import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAcenteProfile(userId: string) {
  return prisma.acenteProfile.findUnique({ where: { userId } });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const acenteProfile = await getAcenteProfile(session.user.id);
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const etkinlik = await prisma.acenteTakvimEtkinlik.findUnique({ where: { id: params.id } });
  if (!etkinlik || etkinlik.acenteId !== acenteProfile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const { baslik, baslangic, bitis, lokasyon, rehberId, notlar } = await req.json();
  if (!baslik?.trim() || !baslangic) {
    return NextResponse.json({ error: "Başlık ve tarih zorunlu" }, { status: 400 });
  }

  const updated = await prisma.acenteTakvimEtkinlik.update({
    where: { id: params.id },
    data: {
      baslik: baslik.trim(),
      baslangic: new Date(baslangic),
      bitis: bitis ? new Date(bitis) : null,
      lokasyon: lokasyon?.trim() || null,
      rehberId: rehberId || null,
      notlar: notlar?.trim() || null,
    },
    include: {
      rehber: { select: { id: true, name: true, city: true, photoUrl: true, slug: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const acenteProfile = await getAcenteProfile(session.user.id);
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const etkinlik = await prisma.acenteTakvimEtkinlik.findUnique({ where: { id: params.id } });
  if (!etkinlik || etkinlik.acenteId !== acenteProfile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  await prisma.acenteTakvimEtkinlik.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
