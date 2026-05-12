import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAcente(userId: string) {
  return prisma.acenteProfile.findUnique({ where: { userId } });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await getAcente(session.user.id);
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const programlar = await prisma.turProgrami.findMany({
    where: { acenteId: acente.id, aktif: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(programlar);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const acente = await getAcente(session.user.id);
  if (!acente) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });

  const { ad, segmentler } = await req.json();
  if (!ad?.trim() || !Array.isArray(segmentler) || segmentler.length === 0) {
    return NextResponse.json({ error: "Ad ve en az bir lokasyon zorunlu." }, { status: 400 });
  }

  const sure = (segmentler as { gun: number }[]).reduce((s, seg) => s + (seg.gun || 0), 0);

  const program = await prisma.turProgrami.create({
    data: { acenteId: acente.id, ad: ad.trim(), sure, segmentler },
  });

  return NextResponse.json(program, { status: 201 });
}
