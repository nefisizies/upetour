import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — kullanıcının bildirimleri
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const bildirimler = await prisma.bildirim.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const okunmamisSayi = await prisma.bildirim.count({
    where: { userId: session.user.id, okundu: false },
  });

  return NextResponse.json({ bildirimler, okunmamisSayi });
}

// PATCH — bildirimleri okundu işaretle
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await req.json();

  if (id === "all") {
    await prisma.bildirim.updateMany({
      where: { userId: session.user.id, okundu: false },
      data: { okundu: true },
    });
  } else {
    await prisma.bildirim.updateMany({
      where: { id, userId: session.user.id },
      data: { okundu: true },
    });
  }

  return NextResponse.json({ ok: true });
}
