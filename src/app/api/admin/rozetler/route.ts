import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { rozetId, onayla } = await req.json();

  if (onayla) {
    await prisma.rehberRozet.update({
      where: { id: rozetId },
      data: { onaylandi: true },
    });
  } else {
    await prisma.rehberRozet.delete({ where: { id: rozetId } });
  }

  return NextResponse.json({ ok: true });
}
