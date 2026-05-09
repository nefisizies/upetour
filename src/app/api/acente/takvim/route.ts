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
  const sehir = searchParams.get("sehir") ?? "";
  const siralama = searchParams.get("siralama") ?? "tarih_asc";
  const ay = searchParams.get("ay") ? parseInt(searchParams.get("ay")!) : null;
  const yil = searchParams.get("yil") ? parseInt(searchParams.get("yil")!) : new Date().getFullYear();

  const acenteProfile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!acenteProfile) return NextResponse.json({ etkinlikler: [], sehirler: [] });

  const referanslar = await prisma.referans.findMany({
    where: { acenteId: acenteProfile.id, durum: "ONAYLANDI" },
    select: { rehberId: true },
  });
  const rehberIds = referanslar.map((r) => r.rehberId);

  if (rehberIds.length === 0) {
    return NextResponse.json({ etkinlikler: [], sehirler: [], bosRehber: true });
  }

  const rehberler = await prisma.rehberProfile.findMany({
    where: { id: { in: rehberIds }, city: { not: null } },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  const sehirler = rehberler.map((r) => r.city).filter(Boolean) as string[];

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
  if (siralama === "sehir_asc") orderBy = { rehber: { city: "asc" } };

  const etkinlikler = await prisma.takvimEtkinlik.findMany({
    where: {
      rehberId: { in: rehberIds },
      ...dateWhere,
      ...(sehir ? { rehber: { city: sehir } } : {}),
    },
    include: {
      rehber: { select: { id: true, name: true, city: true, photoUrl: true, slug: true } },
    },
    orderBy,
  });

  return NextResponse.json({ etkinlikler, sehirler, bosRehber: false });
}
