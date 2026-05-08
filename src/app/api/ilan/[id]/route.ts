import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PATCH — acente ilanı günceller (toggle active, edit)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;
  const profile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  const ilan = await prisma.ilan.findUnique({ where: { id } });

  if (!ilan || !profile || ilan.acenteId !== profile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.ilan.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.languages !== undefined ? { languages: body.languages } : {}),
      ...(body.budget !== undefined ? { budget: body.budget } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
  });

  return NextResponse.json(updated);
}

// DELETE — acente ilanı siler
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;
  const profile = await prisma.acenteProfile.findUnique({ where: { userId: session.user.id } });
  const ilan = await prisma.ilan.findUnique({ where: { id } });

  if (!ilan || !profile || ilan.acenteId !== profile.id) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  await prisma.ilan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
