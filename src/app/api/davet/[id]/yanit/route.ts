import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const { yanit, ozelBaslik, ozelNotlar } = await req.json();
  if (yanit !== "KABUL" && yanit !== "RED") {
    return NextResponse.json({ error: "Geçersiz yanıt" }, { status: 400 });
  }

  const rehberProfile = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
  if (!rehberProfile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const etkinlik = await prisma.acenteTakvimEtkinlik.findUnique({
    where: { id },
    include: { acente: true },
  });

  if (!etkinlik || etkinlik.rehberId !== rehberProfile.id) {
    return NextResponse.json({ error: "Bu davete erişim yetkiniz yok" }, { status: 403 });
  }

  if (etkinlik.rehberYanit !== "BEKLIYOR") {
    return NextResponse.json({ error: "Bu davete zaten yanıt verildi" }, { status: 400 });
  }

  // Aynı programa ait tüm segmentler (programId varsa), yoksa sadece bu etkinlik
  const tumSegmentler = etkinlik.programId
    ? await prisma.acenteTakvimEtkinlik.findMany({
        where: { programId: etkinlik.programId, rehberId: rehberProfile.id },
        orderBy: { baslangic: "asc" },
      })
    : [etkinlik];

  // Tüm segmentlerin rehberYanit'ini güncelle
  await prisma.acenteTakvimEtkinlik.updateMany({
    where: { id: { in: tumSegmentler.map((s) => s.id) } },
    data: { rehberYanit: yanit },
  });

  const tarihStr = new Date(etkinlik.baslangic).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });

  if (yanit === "KABUL") {
    // Her segment için rehberin takvimine REZERVASYON ekle
    await prisma.$transaction(
      tumSegmentler.map((seg, i) => {
        const baslik = i === 0 && ozelBaslik?.trim()
          ? ozelBaslik.trim()
          : `${etkinlik.acente.companyName} — ${seg.baslik}`;
        const notlar = i === 0 && ozelNotlar?.trim()
          ? ozelNotlar.trim()
          : [seg.lokasyon, seg.notlar].filter(Boolean).join(" • ") || null;
        return prisma.takvimEtkinlik.create({
          data: {
            rehberId: rehberProfile.id,
            baslik,
            baslangic: seg.baslangic,
            bitis: seg.bitis,
            notlar,
            tur: "REZERVASYON",
          },
        });
      })
    );

    const acenteUser = await prisma.user.findUnique({ where: { id: etkinlik.acente.userId } });
    if (acenteUser) {
      await prisma.bildirim.create({
        data: {
          userId: acenteUser.id,
          tip: "DAVET",
          baslik: `${rehberProfile.name} daveti kabul etti`,
          metin: `${etkinlik.baslik} — ${tarihStr} turu için ${rehberProfile.name} daveti kabul etti.`,
          link: `/dashboard/acente/takvim`,
        },
      });
    }
  } else {
    const acenteUser = await prisma.user.findUnique({ where: { id: etkinlik.acente.userId } });
    if (acenteUser) {
      await prisma.bildirim.create({
        data: {
          userId: acenteUser.id,
          tip: "DAVET",
          baslik: `${rehberProfile.name} daveti reddetti`,
          metin: `${etkinlik.baslik} — ${tarihStr} turu için ${rehberProfile.name} daveti reddetti.`,
          link: `/dashboard/acente/takvim`,
        },
      });
    }
  }

  return NextResponse.json({ ok: true, yanit });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  const rehberProfile = session.user.role === "REHBER"
    ? await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  const etkinlik = await prisma.acenteTakvimEtkinlik.findUnique({
    where: { id },
    include: {
      acente: { select: { companyName: true, city: true, logoUrl: true } },
      rehber: { select: { id: true, name: true } },
    },
  });

  if (!etkinlik) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  if (rehberProfile && etkinlik.rehberId !== rehberProfile.id) {
    return NextResponse.json({ error: "Erişim yetkiniz yok" }, { status: 403 });
  }

  return NextResponse.json(etkinlik);
}
