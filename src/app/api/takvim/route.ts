import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const yil = parseInt(searchParams.get("yil") ?? String(new Date().getFullYear()));
  const ay = parseInt(searchParams.get("ay") ?? String(new Date().getMonth() + 1));

  const baslangic = new Date(yil, ay - 1, 1);
  const bitis = new Date(yil, ay, 1);

  const profile = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json([]);

  const etkinlikler = await prisma.takvimEtkinlik.findMany({
    where: {
      rehberId: profile.id,
      baslangic: { gte: baslangic, lt: bitis },
    },
    orderBy: { baslangic: "asc" },
  });

  return NextResponse.json(etkinlikler);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { baslik, baslangic, bitis, notlar } = await req.json();
  if (!baslik?.trim() || !baslangic) {
    return NextResponse.json({ error: "Başlık ve tarih zorunlu" }, { status: 400 });
  }

  const profile = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const etkinlik = await prisma.takvimEtkinlik.create({
    data: {
      rehberId: profile.id,
      baslik: baslik.trim(),
      baslangic: new Date(baslangic),
      bitis: bitis ? new Date(bitis) : null,
      notlar: notlar?.trim() || null,
    },
  });

  return NextResponse.json(etkinlik, { status: 201 });
}
