import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — tüm aktif ilanlar (rehber keşfet veya public)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const konum = searchParams.get("konum") || "";
  const dil = searchParams.get("dil") || "";

  const ilanlar = await prisma.ilan.findMany({
    where: {
      isActive: true,
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(konum ? { location: { contains: konum, mode: "insensitive" } } : {}),
      ...(dil ? { languages: { has: dil } } : {}),
    },
    include: { acente: { select: { companyName: true, slug: true, logoUrl: true, city: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ilanlar);
}

// POST — acente yeni ilan oluşturur
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const profile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const { title, description, location, languages, budget } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Başlık zorunlu" }, { status: 400 });

  const ilan = await prisma.ilan.create({
    data: {
      acenteId: profile.id,
      title: title.trim(),
      description: description?.trim() || null,
      location: location?.trim() || null,
      languages: Array.isArray(languages) ? languages : [],
      budget: budget?.trim() || null,
    },
  });

  return NextResponse.json(ilan, { status: 201 });
}
