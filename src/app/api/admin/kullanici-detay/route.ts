import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      createdAt: true,
      rehberProfile: { select: { name: true } },
      acenteProfile: { select: { companyName: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(user);
}
