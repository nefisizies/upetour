import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Returns only busy dates for the rehber — no event details exposed
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rehberId = searchParams.get("rehberId");
  const baslangic = searchParams.get("baslangic");
  const bitis = searchParams.get("bitis");

  if (!rehberId || !baslangic || !bitis) {
    return NextResponse.json({ mesgulGunler: [] });
  }

  // Verify the rehber has an approved referans with this acente
  const acenteProfile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!acenteProfile) return NextResponse.json({ mesgulGunler: [] });

  const referans = await prisma.referans.findFirst({
    where: { acenteId: acenteProfile.id, rehberId, durum: "ONAYLANDI" },
  });
  if (!referans) return NextResponse.json({ mesgulGunler: [] });

  const start = new Date(baslangic);
  const end = new Date(bitis);
  end.setDate(end.getDate() + 1); // inclusive

  const etkinlikler = await prisma.takvimEtkinlik.findMany({
    where: {
      rehberId,
      OR: [
        { baslangic: { gte: start, lte: end } },
        { bitis: { gte: start, lte: end } },
        { AND: [{ baslangic: { lte: start } }, { bitis: { gte: end } }] },
      ],
    },
    select: { baslangic: true, bitis: true },
  });

  // Expand to individual busy dates
  const mesgulSet = new Set<string>();
  for (const e of etkinlikler) {
    const from = new Date(e.baslangic);
    const to = e.bitis ? new Date(e.bitis) : new Date(e.baslangic);
    const cur = new Date(from);
    while (cur <= to) {
      mesgulSet.add(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
  }

  return NextResponse.json({ mesgulGunler: [...mesgulSet] });
}
