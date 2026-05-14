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
  const etkinlikler = await prisma.$transaction(
    segmentler.map((seg) => {
      const segBaslangic = new Date(baslangicDate);
      segBaslangic.setDate(segBaslangic.getDate() + gunOffset);

      const segBitis = new Date(segBaslangic);
      segBitis.setDate(segBitis.getDate() + seg.gun - 1);

      gunOffset += seg.gun;

      const lokasyonText = seg.lokasyonlar.join(", ");

      return prisma.acenteTakvimEtkinlik.create({
        data: {
          acenteId: acente.id,
          baslik: `${program.ad} — ${lokasyonText}`,
          baslangic: segBaslangic,
          bitis: segBitis,
          lokasyon: seg.lokasyonlar[0],
          rehberId: rehberId || null,
          programId: program.id,
          notlar: `${program.ad} programından otomatik oluşturuldu.`,
        },
      });
    })
  );

  return NextResponse.json({ olusturulan: etkinlikler.length });
}
