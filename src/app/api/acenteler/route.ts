import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const acenteler = await prisma.acenteProfile.findMany({
    where: q ? { companyName: { contains: q, mode: "insensitive" } } : undefined,
    select: { id: true, companyName: true, city: true },
    orderBy: { companyName: "asc" },
    take: 20,
  });

  return NextResponse.json(acenteler);
}
