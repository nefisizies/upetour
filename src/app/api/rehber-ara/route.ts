import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sehirdenUlkeBul } from "@/lib/sehirler";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const baslangicStr = searchParams.get("baslangic");
  const bitisStr = searchParams.get("bitis");
  const sehir = searchParams.get("sehir");

  if (!baslangicStr || !bitisStr) {
    return NextResponse.json({ error: "Tarih aralığı zorunlu" }, { status: 400 });
  }

  const baslangic = new Date(baslangicStr);
  const bitis = new Date(bitisStr);
  bitis.setHours(23, 59, 59, 999);

  if (isNaN(baslangic.getTime()) || isNaN(bitis.getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 });
  }

  const ulke = sehir ? sehirdenUlkeBul(sehir) : null;
  if (sehir && !ulke) {
    return NextResponse.json({ error: "Şehir bulunamadı" }, { status: 400 });
  }

  // O tarih aralığında etkinliği olan rehber id'leri
  const mesgulRehberler = await prisma.takvimEtkinlik.findMany({
    where: {
      baslangic: { lt: bitis },
      OR: [
        { bitis: null },
        { bitis: { gte: baslangic } },
        { baslangic: { gte: baslangic } },
      ],
    },
    select: { rehberId: true },
  });

  const mesgulIds = [...new Set(mesgulRehberler.map((e) => e.rehberId))];

  const rehberler = await prisma.rehberProfile.findMany({
    where: {
      id: { notIn: mesgulIds },
      isAvailable: true,
      ...(ulke ? { operatingCountries: { has: ulke } } : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      photoUrl: true,
      bio: true,
      specialties: true,
      experienceYears: true,
      operatingCountries: true,
      languages: { select: { dil: true, seviye: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(rehberler);
}
