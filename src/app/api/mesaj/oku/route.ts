import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — belirli bir kullanıcıdan gelen okunmamış mesajları oku
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { fromUserId } = await req.json();
  if (!fromUserId) return NextResponse.json({ error: "fromUserId gerekli" }, { status: 400 });

  await prisma.message.updateMany({
    where: { fromUserId, toUserId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
