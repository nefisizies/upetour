import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, name } = body;

    if (!email || !password || !role || !name) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
    }

    if (!["REHBER", "ACENTE"].includes(role)) {
      return NextResponse.json({ error: "Geçersiz rol." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Bu email zaten kayıtlı." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: role as Role,
      },
    });

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    if (role === "REHBER") {
      while (await prisma.rehberProfile.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      await prisma.rehberProfile.create({
        data: { userId: user.id, slug, name },
      });
    } else {
      while (await prisma.acenteProfile.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      await prisma.acenteProfile.create({
        data: { userId: user.id, slug, companyName: name },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
