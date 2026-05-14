import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ rehberId: string }> }
) {
  const { rehberId } = await params;

  const checkInler = await prisma.checkIn.findMany({
    where: { rehberId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(checkInler);
}
