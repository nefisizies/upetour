import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — rehberin kendi başvuruları
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const rehber = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!rehber) return NextResponse.json([]);

  const basvurular = await prisma.ilanBasvuru.findMany({
    where: { rehberId: rehber.id },
    include: {
      ilan: {
        include: { acente: { select: { companyName: true, slug: true, logoUrl: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(basvurular);
}

// POST — rehber ilana başvurur
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const rehber = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!rehber) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const { ilanId, mesaj } = await req.json();
  if (!ilanId) return NextResponse.json({ error: "İlan ID zorunlu" }, { status: 400 });

  const ilan = await prisma.ilan.findUnique({
    where: { id: ilanId },
    include: { acente: { include: { user: true } } },
  });
  if (!ilan || !ilan.isActive) return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });

  try {
    const basvuru = await prisma.ilanBasvuru.create({
      data: { ilanId, rehberId: rehber.id, mesaj: mesaj?.trim() || null },
    });

    // Acente'ye bildirim gönder
    await prisma.bildirim.create({
      data: {
        userId: ilan.acente.userId,
        tip: "BASVURU",
        baslik: "Yeni Başvuru",
        metin: `${rehber.name} "${ilan.title}" ilanınıza başvurdu.`,
        link: `/dashboard/acente/basvurular`,
      },
    });

    return NextResponse.json(basvuru, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Zaten başvuruldu" }, { status: 409 });
  }
}
