import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = await req.json();
  const { name, bio, city, languages, specialties, experienceYears, isAvailable } = body;

  const profile = await prisma.rehberProfile.update({
    where: { userId: session.user.id },
    data: {
      name: name || undefined,
      bio: bio || undefined,
      city: city || undefined,
      languages: languages || undefined,
      specialties: specialties || undefined,
      experienceYears: experienceYears !== undefined ? Number(experienceYears) : undefined,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
    },
  });

  return NextResponse.json({ success: true, profile });
}
