import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sekme = searchParams.get("sekme") ?? "gelecek";
  const lokasyon = searchParams.get("lokasyon") ?? "";
  const rehberId = searchParams.get("rehberId") ?? "";
  const siralama = searchParams.get("siralama") ?? "tarih_asc";
  const ay = searchParams.get("ay") ? parseInt(searchParams.get("ay")!) : null;
  const yil = searchParams.get("yil") ? parseInt(searchParams.get("yil")!) : new Date().getFullYear();

  const acenteProfile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!acenteProfile) return NextResponse.json({ etkinlikler: [], lokasyonlar: [], rehberler: [] });

  const now = new Date();
  let dateWhere: Record<string, unknown> = {};

  if (sekme === "buay") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    dateWhere = { baslangic: { gte: start, lt: end } };
  } else if (sekme === "gelecek") {
    dateWhere = { baslangic: { gte: now } };
  } else if (sekme === "gecmis") {
    dateWhere = { baslangic: { lt: now } };
  } else if (sekme === "tumu" && ay) {
    const start = new Date(yil, ay - 1, 1);
    const end = new Date(yil, ay, 1);
    dateWhere = { baslangic: { gte: start, lt: end } };
  } else {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    dateWhere = { baslangic: { gte: start, lt: end } };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { baslangic: "asc" };
  if (siralama === "tarih_desc") orderBy = { baslangic: "desc" };
  if (siralama === "lokasyon_asc") orderBy = { lokasyon: "asc" };

  const etkinlikler = await prisma.acenteTakvimEtkinlik.findMany({
    where: {
      acenteId: acenteProfile.id,
      ...dateWhere,
      ...(lokasyon ? { lokasyon } : {}),
      ...(rehberId ? { rehberId } : {}),
    },
    include: {
      rehber: { select: { id: true, name: true, city: true, photoUrl: true, slug: true } },
    },
    orderBy,
  });

  // Filter dropdown options — always from all events (not date-filtered)
  const tumEtkinlikler = await prisma.acenteTakvimEtkinlik.findMany({
    where: { acenteId: acenteProfile.id },
    select: { lokasyon: true, rehberId: true, rehber: { select: { id: true, name: true } } },
    distinct: ["lokasyon"],
  });
  const lokasyonlar = [...new Set(tumEtkinlikler.map((e) => e.lokasyon).filter(Boolean))] as string[];

  const rehberMap = new Map<string, string>();
  tumEtkinlikler.forEach((e) => {
    if (e.rehberId && e.rehber) rehberMap.set(e.rehberId, e.rehber.name);
  });
  const rehberler = [...rehberMap.entries()].map(([id, name]) => ({ id, name }));

  return NextResponse.json({ etkinlikler, lokasyonlar, rehberler });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { baslik, baslangic, bitis, lokasyon, rehberId, notlar } = await req.json();
  if (!baslik?.trim() || !baslangic) {
    return NextResponse.json({ error: "Başlık ve tarih zorunlu" }, { status: 400 });
  }

  const acenteProfile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const etkinlik = await prisma.acenteTakvimEtkinlik.create({
    data: {
      acenteId: acenteProfile.id,
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

  return NextResponse.json(etkinlik, { status: 201 });
}
