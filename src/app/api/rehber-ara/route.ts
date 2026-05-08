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
  const sehirlerParam = searchParams.get("sehirler"); // virgülle ayrılmış
  const uzmanliklarParam = searchParams.get("uzmanliklar"); // virgülle ayrılmış

  if (!baslangicStr || !bitisStr) {
    return NextResponse.json({ error: "Tarih aralığı zorunlu" }, { status: 400 });
  }

  const baslangic = new Date(baslangicStr);
  const bitis = new Date(bitisStr);
  bitis.setHours(23, 59, 59, 999);

  if (isNaN(baslangic.getTime()) || isNaN(bitis.getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 });
  }

  const secilenSehirler = sehirlerParam ? sehirlerParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const secilenUzmanliklar = uzmanliklarParam ? uzmanliklarParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

  // Şehirlerden ülke kodlarını çıkar (tekrarsız)
  const secilenUlkeler = [...new Set(
    secilenSehirler.map((s) => sehirdenUlkeBul(s)?.ulkeKod).filter(Boolean) as string[]
  )];

  // O tarih aralığında meşgul rehberler
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
      // En az 1 seçilen ülkeye hizmet vermeli (şehir seçildiyse)
      ...(secilenUlkeler.length > 0 ? {
        operatingCountries: { hasSome: secilenUlkeler },
      } : {}),
      // En az 1 seçilen uzmanlık alanına sahip olmalı (uzmanlık seçildiyse)
      ...(secilenUzmanliklar.length > 0 ? {
        specialties: { hasSome: secilenUzmanliklar },
      } : {}),
    },
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

  const acenteSayilari = await Promise.all(
    rehberler.map((r) =>
      prisma.message.groupBy({
        by: ["fromUserId"],
        where: { toUserId: r.userId },
      }).then((rows) => rows.length)
    )
  );

  // Puanlama: eşleşen ülke sayısı + eşleşen uzmanlık sayısı
  const puanli = rehberler.map((r, i) => {
    const ulkePuani = secilenUlkeler.length > 0
      ? secilenUlkeler.filter((u) => r.operatingCountries.includes(u)).length
      : 0;
    const uzmanlikPuani = secilenUzmanliklar.length > 0
      ? secilenUzmanliklar.filter((u) => r.specialties.includes(u)).length
      : 0;
    return {
      ...r,
      acenteBaglantiSayisi: acenteSayilari[i],
      _puan: ulkePuani + uzmanlikPuani,
      _ulkeEslesmesi: ulkePuani,
      _uzmanlikEslesmesi: uzmanlikPuani,
    };
  });

  // Yüksek puandan düşüğe sırala, eşit puanda deneyim yılı tiebreak
  puanli.sort((a, b) => {
    if (b._puan !== a._puan) return b._puan - a._puan;
    return b.experienceYears - a.experienceYears;
  });

  return NextResponse.json(puanli);
}
