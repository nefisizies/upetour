import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PATCH — acente başvuru durumunu günceller
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;
  const profile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  const basvuru = await prisma.ilanBasvuru.findUnique({
    where: { id },
    include: { ilan: true, rehber: { include: { user: true } } },
  });

  if (!basvuru || !profile || basvuru.ilan.acenteId !== profile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const { durum } = await req.json();
  const updated = await prisma.ilanBasvuru.update({
    where: { id },
    data: { durum },
  });

  // Rehbere bildirim gönder
  if (durum === "KABUL" || durum === "RED") {
    await prisma.bildirim.create({
      data: {
        userId: basvuru.rehber.userId,
        tip: "BASVURU",
        baslik: durum === "KABUL" ? "Başvurunuz Kabul Edildi" : "Başvurunuz Reddedildi",
        metin: `"${basvuru.ilan.title}" ilanına yaptığınız başvuru ${durum === "KABUL" ? "kabul edildi" : "reddedildi"}.`,
        link: `/dashboard/rehber/basvurularim`,
      },
    });
  }

  return NextResponse.json(updated);
}
