import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COUNTRY_LICENSES } from "@/lib/licenses";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = await req.json();
  const { name, bio, city, telefon, diller, specialties, experienceYears, isAvailable, operatingCountries, licenses, photoUrl } = body;

  const profile = await prisma.rehberProfile.update({
    where: { userId: session.user.id },
    data: {
      name: name || undefined,
      bio: bio || undefined,
      city: city || undefined,
      telefon: telefon?.trim() || null,
      specialties: specialties ?? undefined,
      experienceYears: experienceYears !== undefined ? Number(experienceYears) : undefined,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      operatingCountries: operatingCountries ?? undefined,
      photoUrl: photoUrl || null,
    },
  });

  // Dil kayıtlarını güncelle: mevcut olanları upsert et, listede olmayanları sil
  if (Array.isArray(diller)) {
    // Listede olmayan dilleri sil
    await prisma.rehberDil.deleteMany({
      where: {
        rehberId: profile.id,
        dil: { notIn: diller.map((d: { dil: string }) => d.dil) },
      },
    });

    for (const entry of diller as { dil: string; seviye: string; sertifika: string; sonuc: string }[]) {
      if (!entry.dil) continue;
      await prisma.rehberDil.upsert({
        where: { rehberId_dil: { rehberId: profile.id, dil: entry.dil } },
        create: {
          rehberId: profile.id,
          dil: entry.dil,
          seviye: entry.seviye || null,
          sertifika: entry.sertifika || null,
          sonuc: entry.sonuc || null,
        },
        update: {
          seviye: entry.seviye || null,
          sertifika: entry.sertifika || null,
          sonuc: entry.sonuc || null,
        },
      });
    }
  }

  // Yeni lisansları kaydet (zaten kayıtlı olanları atla)
  if (Array.isArray(licenses)) {
    for (const lic of licenses) {
      if (!lic.country || !lic.licenseNo?.trim()) continue;

      const existing = await prisma.rehberLicense.findFirst({
        where: { rehberId: profile.id, country: lic.country },
      });
      if (existing) continue;

      const cfg = COUNTRY_LICENSES.find((c) => c.country === lic.country);
      await prisma.rehberLicense.create({
        data: {
          rehberId: profile.id,
          country: lic.country,
          licenseType: cfg?.licenseType ?? "Lisans Belgesi",
          licenseNo: lic.licenseNo.trim(),
          status: "PENDING",
        },
      });
    }
  }

  return NextResponse.json({ success: true, profile });
}
