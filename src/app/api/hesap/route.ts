import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { mevcutSifre, yeniEmail, yeniSifre } = await req.json();

  if (!mevcutSifre) {
    return NextResponse.json({ error: "Mevcut şifre zorunlu" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const sifreGecerli = await bcrypt.compare(mevcutSifre, user.password);
  if (!sifreGecerli) {
    return NextResponse.json({ error: "Mevcut şifre yanlış" }, { status: 400 });
  }

  const guncelleme: Record<string, string> = {};

  if (yeniEmail && yeniEmail !== user.email) {
    const emailVar = await prisma.user.findUnique({ where: { email: yeniEmail } });
    if (emailVar) {
      return NextResponse.json({ error: "Bu e-posta zaten kullanımda" }, { status: 400 });
    }
    guncelleme.email = yeniEmail;
  }

  if (yeniSifre) {
    if (yeniSifre.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
    }
    guncelleme.password = await bcrypt.hash(yeniSifre, 10);
  }

  if (Object.keys(guncelleme).length === 0) {
    return NextResponse.json({ error: "Değiştirilecek bir şey yok" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: guncelleme });

  return NextResponse.json({ ok: true });
}
