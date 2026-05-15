import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAcente(userId: string) {
  return prisma.acenteProfile.findUnique({ where: { userId } });
}

async function getEtkinlik(id: string, acenteId: string) {
  return prisma.acenteTakvimEtkinlik.findFirst({ where: { id, acenteId } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  // Hem acente hem rehber görebilir
  if (session.user.role === "ACENTE") {
    const acente = await getAcente(session.user.id);
    if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
    const etkinlik = await getEtkinlik(id, acente.id);
    if (!etkinlik) return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });
  } else if (session.user.role === "REHBER") {
    const rehber = await prisma.rehberProfile.findUnique({ where: { userId: session.user.id } });
    if (!rehber) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
    const etkinlik = await prisma.acenteTakvimEtkinlik.findFirst({ where: { id, rehberId: rehber.id } });
    if (!etkinlik) return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });
  } else {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const turistler = await prisma.etkinlikTurist.findMany({
    where: { etkinlikId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(turistler);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const acente = await getAcente(session.user.id);
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const etkinlik = await getEtkinlik(id, acente.id);
  if (!etkinlik) return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });

  const body = await req.json();

  if (Array.isArray(body)) {
    const gecerli = body.filter((t: any) => t.ad?.trim() && t.soyad?.trim());
    if (gecerli.length === 0) return NextResponse.json({ error: "Geçerli kayıt yok." }, { status: 400 });
    const eklenenler = await prisma.$transaction(
      gecerli.map((t: any) =>
        prisma.etkinlikTurist.create({
          data: {
            etkinlikId: id,
            ad: t.ad.trim(),
            soyad: t.soyad.trim(),
            pasaportNo: t.pasaportNo || null,
            uyruk: t.uyruk || null,
            dogumTarihi: t.dogumTarihi || null,
            telefon: t.telefon || null,
            eposta: t.eposta || null,
            notlar: t.notlar || null,
            ekAlanlar: t.ekAlanlar && Object.keys(t.ekAlanlar).length > 0 ? t.ekAlanlar : undefined,
          },
        })
      )
    );
    return NextResponse.json(eklenenler, { status: 201 });
  }

  if (!body.ad?.trim() || !body.soyad?.trim()) {
    return NextResponse.json({ error: "Ad ve soyad zorunlu" }, { status: 400 });
  }

  const turist = await prisma.etkinlikTurist.create({
    data: {
      etkinlikId: id,
      ad: body.ad.trim(),
      soyad: body.soyad.trim(),
      pasaportNo: body.pasaportNo || null,
      uyruk: body.uyruk || null,
      dogumTarihi: body.dogumTarihi || null,
      telefon: body.telefon || null,
      eposta: body.eposta || null,
      notlar: body.notlar || null,
      ekAlanlar: body.ekAlanlar && Object.keys(body.ekAlanlar).length > 0 ? body.ekAlanlar : undefined,
    },
  });

  return NextResponse.json(turist, { status: 201 });
}
