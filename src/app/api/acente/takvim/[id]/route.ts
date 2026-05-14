import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const acenteProfile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const mevcut = await prisma.acenteTakvimEtkinlik.findUnique({ where: { id } });
  if (!mevcut || mevcut.acenteId !== acenteProfile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const { baslik, baslangic, bitis, lokasyon, rehberId, notlar } = await req.json();
  if (!baslik?.trim() || !baslangic) {
    return NextResponse.json({ error: "Başlık ve tarih zorunlu" }, { status: 400 });
  }

  const rehberDegisti = rehberId !== mevcut.rehberId;
  const yeniYanit = rehberId
    ? rehberDegisti ? "BEKLIYOR" : mevcut.rehberYanit
    : null;

  const updated = await prisma.acenteTakvimEtkinlik.update({
    where: { id },
    data: {
      baslik: baslik.trim(),
      baslangic: new Date(baslangic),
      bitis: bitis ? new Date(bitis) : null,
      lokasyon: lokasyon?.trim() || null,
      rehberId: rehberId || null,
      notlar: notlar?.trim() || null,
      rehberYanit: yeniYanit as "BEKLIYOR" | "KABUL" | "RED" | null,
    },
    include: { rehber: { select: { id: true, name: true, city: true, photoUrl: true, slug: true } } },
  });

  if (rehberId && rehberDegisti) {
    const rehberUser = await prisma.user.findFirst({ where: { rehberProfile: { id: rehberId } } });
    if (rehberUser) {
      const tarihStr = new Date(baslangic).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
      await prisma.bildirim.create({
        data: {
          userId: rehberUser.id,
          tip: "DAVET",
          baslik: `Tur Daveti: ${baslik.trim()}`,
          metin: `${acenteProfile.companyName} sizi ${tarihStr}${lokasyon ? ` (${lokasyon})` : ""} için tur rehberliğine davet etti.`,
          link: `/dashboard/rehber/davet/${id}`,
        },
      });
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const acenteProfile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acenteProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const etkinlik = await prisma.acenteTakvimEtkinlik.findUnique({
    where: { id },
    include: { rehber: { select: { id: true, name: true, userId: true } } },
  });
  if (!etkinlik || etkinlik.acenteId !== acenteProfile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  await prisma.acenteTakvimEtkinlik.delete({ where: { id } });

  if (etkinlik.rehberId && etkinlik.rehber) {
    // Rehber kabul ettiyse takviminden REZERVASYON etkinliğini sil
    if (etkinlik.rehberYanit === "KABUL") {
      await prisma.takvimEtkinlik.deleteMany({
        where: {
          rehberId: etkinlik.rehberId,
          tur: "REZERVASYON",
          baslangic: etkinlik.baslangic,
        },
      });
    }

    // Rehbere bildirim gönder
    const tarihStr = new Date(etkinlik.baslangic).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
    await prisma.bildirim.create({
      data: {
        userId: etkinlik.rehber.userId,
        tip: "SISTEM",
        baslik: "Tur İptal Edildi",
        metin: `${acenteProfile.companyName} tarafından "${etkinlik.baslik}" (${tarihStr}) turu iptal edildi.`,
        link: `/dashboard/rehber/takvim`,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
