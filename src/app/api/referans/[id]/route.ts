import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Rehber: kendi referansını sil — Acente: onayladığı referansı geri çek
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const referans = await prisma.referans.findUnique({ where: { id } });
  if (!referans) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  if (session.user.role === "REHBER") {
    const profile = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile || referans.rehberId !== profile.id) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
  } else if (session.user.role === "ACENTE") {
    const acenteProfile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
    if (!acenteProfile || referans.acenteId !== acenteProfile.id || referans.durum !== "ONAYLANDI") {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    // Silmek yerine KALDIRILDI yap — acente geri ekleyebilsin
    const updated = await prisma.referans.update({ where: { id }, data: { durum: "KALDIRILDI" } });
    return NextResponse.json(updated);
  } else {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  await prisma.referans.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// Acente onay/red
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const { durum, blok } = await req.json();
  if (durum !== "ONAYLANDI" && durum !== "REDDEDILDI" && durum !== "KALDIRILDI") {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }

  const acenteProfile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const referans = await prisma.referans.findUnique({ where: { id } });
  if (!referans || referans.acenteId !== acenteProfile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const updated = await prisma.referans.update({
    where: { id },
    data: { durum },
    include: { rehber: { select: { name: true } } },
  });

  // Blok uygula (sadece red durumunda)
  if (durum === "REDDEDILDI" && blok && blok !== "YOK") {
    const banBitis = (() => {
      const now = new Date();
      if (blok === "GECICI_1AY") return new Date(now.setMonth(now.getMonth() + 1));
      if (blok === "GECICI_3AY") return new Date(now.setMonth(now.getMonth() + 3));
      if (blok === "GECICI_6AY") return new Date(now.setMonth(now.getMonth() + 6));
      if (blok === "GECICI_1YIL") return new Date(now.setFullYear(now.getFullYear() + 1));
      return null;
    })();

    await prisma.acenteRehberBlok.upsert({
      where: { acenteId_rehberId: { acenteId: acenteProfile.id, rehberId: referans.rehberId } },
      update: { tur: blok === "KALICI" ? "KALICI" : "GECICI", banBitis },
      create: { acenteId: acenteProfile.id, rehberId: referans.rehberId, tur: blok === "KALICI" ? "KALICI" : "GECICI", banBitis },
    });
  }

  return NextResponse.json(updated);
}
