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

  const segmentler = program.segmentler as { lokasyon: string; gun: number }[];
  const baslangicDate = new Date(`${baslangic}T09:00`);

  let gunOffset = 0;
  const etkinlikler = await prisma.$transaction(
    segmentler.map((seg) => {
      const segBaslangic = new Date(baslangicDate);
      segBaslangic.setDate(segBaslangic.getDate() + gunOffset);

      const segBitis = new Date(segBaslangic);
      segBitis.setDate(segBitis.getDate() + seg.gun - 1);

      gunOffset += seg.gun;

      return prisma.acenteTakvimEtkinlik.create({
        data: {
          acenteId: acente.id,
          baslik: `${program.ad} — ${seg.lokasyon}`,
          baslangic: segBaslangic,
          bitis: segBitis,
          lokasyon: seg.lokasyon,
          rehberId: rehberId || null,
          notlar: `${program.ad} programından otomatik oluşturuldu.`,
        },
      });
    })
  );

  return NextResponse.json({ olusturulan: etkinlikler.length });
}
