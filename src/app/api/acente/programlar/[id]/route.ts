import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getProgramOwned(id: string, userId: string) {
  const acente = await prisma.acenteProfile.findUnique({ where: { userId } });
  if (!acente) return null;
  return prisma.turProgrami.findFirst({ where: { id, acenteId: acente.id } });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const program = await getProgramOwned(id, session.user.id);
  if (!program) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const { ad, segmentler } = await req.json();
  if (!ad?.trim() || !Array.isArray(segmentler) || segmentler.length === 0) {
    return NextResponse.json({ error: "Ad ve en az bir lokasyon zorunlu." }, { status: 400 });
  }

  const sure = (segmentler as { gun: number }[]).reduce((s, seg) => s + (seg.gun || 0), 0);

  const updated = await prisma.turProgrami.update({
    where: { id },
    data: { ad: ad.trim(), sure, segmentler },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const program = await getProgramOwned(id, session.user.id);
  if (!program) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await prisma.turProgrami.update({ where: { id }, data: { aktif: false } });

  return NextResponse.json({ ok: true });
}
