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
  const tumYil = searchParams.get("tumYil") === "1";

  const profile = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json(tumYil ? {} : []);

  if (tumYil) {
    const yilBaslangic = new Date(yil, 0, 1);
    const yilBitis = new Date(yil + 1, 0, 1);
    const tumEtkinlikler = await prisma.takvimEtkinlik.findMany({
      where: { rehberId: profile.id, baslangic: { gte: yilBaslangic, lt: yilBitis } },
      select: { baslangic: true, tur: true },
    });
    const aylar: Record<number, { toplam: number; manuel: number; rezervasyon: number }> = {};
    for (let i = 1; i <= 12; i++) aylar[i] = { toplam: 0, manuel: 0, rezervasyon: 0 };
    tumEtkinlikler.forEach((e) => {
      const m = new Date(e.baslangic).getMonth() + 1;
      aylar[m].toplam++;
      if (e.tur === "REZERVASYON") aylar[m].rezervasyon++;
      else aylar[m].manuel++;
    });
    return NextResponse.json(aylar);
  }

  const baslangic = new Date(yil, ay - 1, 1);
  const bitis = new Date(yil, ay, 1);

  const etkinlikler = await prisma.takvimEtkinlik.findMany({
    where: {
      rehberId: profile.id,
      baslangic: { lt: bitis },
      OR: [
        { bitis: null },
        { bitis: { gte: baslangic } },
        { baslangic: { gte: baslangic } },
      ],
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
