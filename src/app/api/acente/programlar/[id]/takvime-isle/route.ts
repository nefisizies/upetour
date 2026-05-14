import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const program = await prisma.turProgrami.findFirst({ where: { id, acenteId: acente.id } });
  if (!program) return NextResponse.json({ error: "Program bulunamadı" }, { status: 404 });

  const { baslangic, rehberId } = await req.json();
  if (!baslangic) return NextResponse.json({ error: "Başlangıç tarihi zorunlu." }, { status: 400 });

  const rawSegmentler = program.segmentler as any[];
  const segmentler = rawSegmentler.map((s) => ({
    lokasyonlar: Array.isArray(s.lokasyonlar) ? (s.lokasyonlar as string[]) : [s.lokasyon as string],
    gun: s.gun as number,
  }));

  const baslangicDate = new Date(`${baslangic}T09:00`);

  let gunOffset = 0;
  const etkinlikData = segmentler.map((seg) => {
    const segBaslangic = new Date(baslangicDate);
    segBaslangic.setDate(segBaslangic.getDate() + gunOffset);

    const segBitis = new Date(segBaslangic);
    segBitis.setDate(segBitis.getDate() + seg.gun - 1);

    gunOffset += seg.gun;

    return {
      lokasyonText: seg.lokasyonlar.join(", "),
      lokasyon: seg.lokasyonlar[0],
      segBaslangic,
      segBitis,
    };
  });

  const etkinlikler = await prisma.$transaction(
    etkinlikData.map(({ lokasyonText, lokasyon, segBaslangic, segBitis }) =>
      prisma.acenteTakvimEtkinlik.create({
        data: {
          acenteId: acente.id,
          baslik: `${program.ad} — ${lokasyonText}`,
          baslangic: segBaslangic,
          bitis: segBitis,
          lokasyon,
          rehberId: rehberId || null,
          rehberYanit: rehberId ? "BEKLIYOR" : null,
          programId: program.id,
          notlar: `${program.ad} programından otomatik oluşturuldu.`,
        },
      })
    )
  );

  // Her segment için rehbere ayrı davet bildirimi gönder
  if (rehberId && etkinlikler.length > 0) {
    const rehberUser = await prisma.user.findFirst({ where: { rehberProfile: { id: rehberId } } });
    if (rehberUser) {
      await prisma.$transaction(
        etkinlikler.map((etkinlik, i) => {
          const { segBaslangic, segBitis, lokasyonText } = etkinlikData[i];
          const tarihStr = segBaslangic.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
          const bitisStr = segBitis.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
          return prisma.bildirim.create({
            data: {
              userId: rehberUser.id,
              tip: "DAVET",
              baslik: `Tur Daveti: ${program.ad}`,
              metin: `${acente.companyName} sizi ${tarihStr}${tarihStr !== bitisStr ? ` – ${bitisStr}` : ""} (${lokasyonText}) için tur rehberliğine davet etti.`,
              link: `/dashboard/rehber/davet/${etkinlik.id}`,
            },
          });
        })
      );
    }
  }

  return NextResponse.json({ olusturulan: etkinlikler.length });
}
