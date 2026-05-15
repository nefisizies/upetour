import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const program = await prisma.turProgrami.findFirst({ where: { id, acenteId: acente.id } });
  if (!program) return NextResponse.json({ error: "Program bulunamadı" }, { status: 404 });

  const turistler = await prisma.turistKayit.findMany({
    where: { programId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(turistler);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const program = await prisma.turProgrami.findFirst({ where: { id, acenteId: acente.id } });
  if (!program) return NextResponse.json({ error: "Program bulunamadı" }, { status: 404 });

  const body = await req.json();

  // Toplu ekleme
  if (Array.isArray(body)) {
    const gecerli = body.filter((t: any) => t.ad?.trim() && t.soyad?.trim());
    if (gecerli.length === 0) return NextResponse.json({ error: "Geçerli kayıt yok." }, { status: 400 });
    const eklenenler = await prisma.$transaction(
      gecerli.map((t: any) =>
        prisma.turistKayit.create({
          data: {
            programId: id,
            ad: t.ad.trim(),
            soyad: t.soyad.trim(),
            pasaportNo: t.pasaportNo?.trim() || null,
            uyruk: t.uyruk?.trim() || null,
            dogumTarihi: t.dogumTarihi?.trim() || null,
            telefon: t.telefon?.trim() || null,
            eposta: t.eposta?.trim() || null,
            notlar: t.notlar?.trim() || null,
            ekAlanlar: t.ekAlanlar && Object.keys(t.ekAlanlar).length > 0 ? t.ekAlanlar : undefined,
          },
        })
      )
    );
    return NextResponse.json(eklenenler, { status: 201 });
  }

  const { ad, soyad, pasaportNo, uyruk, dogumTarihi, telefon, eposta, notlar, ekAlanlar } = body;
  if (!ad?.trim() || !soyad?.trim()) return NextResponse.json({ error: "Ad ve soyad zorunlu." }, { status: 400 });

  const turist = await prisma.turistKayit.create({
    data: {
      programId: id,
      ad: ad.trim(),
      soyad: soyad.trim(),
      pasaportNo: pasaportNo?.trim() || null,
      uyruk: uyruk?.trim() || null,
      dogumTarihi: dogumTarihi?.trim() || null,
      telefon: telefon?.trim() || null,
      eposta: eposta?.trim() || null,
      notlar: notlar?.trim() || null,
      ekAlanlar: ekAlanlar && Object.keys(ekAlanlar).length > 0 ? ekAlanlar : undefined,
    },
  });

  return NextResponse.json(turist, { status: 201 });
}
