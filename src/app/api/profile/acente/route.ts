import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { companyName, description, city, logoUrl, website } = await req.json();

  const profile = await prisma.acenteProfile.update({
    where: { userId: session.user.id },
    data: {
      companyName: companyName?.trim() || undefined,
      description: description?.trim() || null,
      city: city?.trim() || null,
      logoUrl: logoUrl?.trim() || null,
      website: website?.trim() || null,
    },
  });

  return NextResponse.json(profile);
}
