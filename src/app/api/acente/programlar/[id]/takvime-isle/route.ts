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
  const toplamGun = segmentler.reduce((sum, s) => sum + s.gun, 0);
  const bitisTarihi = new Date(baslangicDate);
  bitisTarihi.setDate(bitisTarihi.getDate() + toplamGun - 1);

  // Güzergah notları: her segment için tarih + lokasyon
  let gunOffset = 0;
  const guzergahSatirlari = segmentler.map((seg) => {
    const segBaslangic = new Date(baslangicDate);
    segBaslangic.setDate(segBaslangic.getDate() + gunOffset);
    const segBitis = new Date(segBaslangic);
    segBitis.setDate(segBitis.getDate() + seg.gun - 1);
    gunOffset += seg.gun;

    const basTarih = segBaslangic.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
    const bitTarih = segBitis.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
    const tarihStr = basTarih === bitTarih ? basTarih : `${basTarih} – ${bitTarih}`;
    return `${seg.lokasyonlar.join(", ")}: ${tarihStr}`;
  });
  const notlar = `Güzergah: ${guzergahSatirlari.join(" • ")}`;

  const etkinlik = await prisma.acenteTakvimEtkinlik.create({
    data: {
      acenteId: acente.id,
      baslik: program.ad,
      baslangic: baslangicDate,
      bitis: bitisTarihi,
      lokasyon: segmentler[0]?.lokasyonlar[0] ?? null,
      rehberId: rehberId || null,
      rehberYanit: rehberId ? "BEKLIYOR" : null,
      programId: program.id,
      notlar,
    },
  });

  // Rehbere tek özet davet bildirimi gönder
  if (rehberId) {
    const rehberUser = await prisma.user.findFirst({ where: { rehberProfile: { id: rehberId } } });
    if (rehberUser) {
      const ilkTarih = baslangicDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
      const sonTarih = bitisTarihi.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
      const lokasyonlar = [...new Set(segmentler.flatMap((s) => s.lokasyonlar))].join(" · ");
      await prisma.bildirim.create({
        data: {
          userId: rehberUser.id,
          tip: "DAVET",
          baslik: `Tur Daveti: ${program.ad}`,
          metin: `${acente.companyName} sizi ${ilkTarih} – ${sonTarih} tarihleri için "${program.ad}" turuna davet etti. Güzergah: ${lokasyonlar}`,
          link: `/dashboard/rehber/davet/${etkinlik.id}`,
        },
      });
    }
  }

  return NextResponse.json({ olusturulan: 1 });
}
