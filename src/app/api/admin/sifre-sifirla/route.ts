import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

function randomSifre(len = 10) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      rehberProfile: { select: { name: true } },
      acenteProfile: { select: { companyName: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const newPassword = randomSifre();
  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  const name = user.rehberProfile?.name ?? user.acenteProfile?.companyName ?? user.email;
  sendPasswordResetEmail({ to: user.email, name, newPassword }).catch(() => null);

  return NextResponse.json({ ok: true, newPassword });
}
