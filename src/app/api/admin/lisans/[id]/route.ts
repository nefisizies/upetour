import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["PENDING", "VERIFIED"].includes(status)) {
    return NextResponse.json({ error: "Geçersiz status" }, { status: 400 });
  }

  const lisans = await prisma.rehberLicense.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(lisans);
}
