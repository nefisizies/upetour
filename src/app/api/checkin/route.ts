import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { UnvanTip } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const profile = await prisma.rehberProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile)
    return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const { baslik, aciklama, fotografUrl, sehir, ulke, lat, lng } = await req.json();
  if (!baslik?.trim())
    return NextResponse.json({ error: "Başlık zorunlu" }, { status: 400 });

  const checkin = await prisma.checkIn.create({
    data: {
      rehberId: profile.id,
      baslik: baslik.trim(),
      aciklama: aciklama?.trim() || null,
      fotografUrl: fotografUrl || null,
      sehir: sehir?.trim() || null,
      ulke: ulke?.trim() || null,
      lat: lat ?? null,
      lng: lng ?? null,
    },
  });

  // Sayaçları güncelle
  const [toplamCheckin, benzersizSehirler] = await Promise.all([
    prisma.checkIn.count({ where: { rehberId: profile.id } }),
    prisma.checkIn.findMany({
      where: { rehberId: profile.id, sehir: { not: null } },
      select: { sehir: true },
      distinct: ["sehir"],
    }),
  ]);

  const benzersizSehir = benzersizSehirler.length;
  const unvan = hesaplaUnvan(toplamCheckin, benzersizSehir);

  await prisma.rehberProfile.update({
    where: { id: profile.id },
    data: { checkInSayisi: toplamCheckin, benzersizSehir, unvan: unvan as UnvanTip },
  });

  // Rozet kontrolü
  await kontrolEtRozetler(profile.id, toplamCheckin, benzersizSehir, fotografUrl);

  return NextResponse.json(checkin, { status: 201 });
}

function hesaplaUnvan(sayi: number, sehir: number): string {
  if (sayi >= 100 && sehir >= 10) return "ELIT_REHBER";
  if (sayi >= 50 && sehir >= 7) return "SUPER_REHBER";
  if (sayi >= 25 && sehir >= 5) return "UZMAN_REHBER";
  if (sayi >= 10 && sehir >= 3) return "DENEYIMLI_REHBER";
  if (sayi >= 3) return "AKTIF_REHBER";
  return "YENI_REHBER";
}

async function kontrolEtRozetler(rehberId: string, sayi: number, sehir: number, fotografUrl: string | null) {
  const kazanilacaklar: string[] = [];

  if (sayi >= 1) kazanilacaklar.push("ilk_checkin");
  if (sayi >= 10) kazanilacaklar.push("10_checkin");
  if (sayi >= 25) kazanilacaklar.push("25_checkin");
  if (sayi >= 50) kazanilacaklar.push("50_checkin");
  if (sayi >= 100) kazanilacaklar.push("100_checkin");
  if (sehir >= 5) kazanilacaklar.push("5_sehir");
  if (sehir >= 10) kazanilacaklar.push("10_sehir");

  if (fotografUrl) {
    const fotoSayisi = await prisma.checkIn.count({
      where: { rehberId, fotografUrl: { not: null } },
    });
    if (fotoSayisi >= 10) kazanilacaklar.push("foto_uzman");
  }

  const rozetler = await prisma.rozet.findMany({
    where: { kod: { in: kazanilacaklar } },
    select: { id: true, kod: true },
  });

  for (const rozet of rozetler) {
    await prisma.rehberRozet.upsert({
      where: { rehberId_rozetId: { rehberId, rozetId: rozet.id } },
      create: { rehberId, rozetId: rozet.id, onaylandi: false },
      update: {},
    });
  }
}
