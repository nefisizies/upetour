import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user: URAS
  const adminEmail = "uras@turbag.app";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash("uras1903", 10);
    await prisma.user.create({
      data: { email: adminEmail, password: hashed, role: "ADMIN" },
    });
    console.log("✅ Admin oluşturuldu:", adminEmail);
  } else {
    console.log("ℹ️ Admin zaten mevcut:", adminEmail);
  }

  // Default site settings
  const defaults: { key: string; value: string }[] = [
    { key: "bg_theme",       value: "ocean"    },
    { key: "primary_color",  value: "#0a7ea4"  },
    { key: "sidebar_color",  value: "#ffffff"  },
    { key: "font_family",    value: "inter"    },
    { key: "card_style",     value: "rounded"  },
  ];

  for (const s of defaults) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✅ Site ayarları başlatıldı");
}

main().catch(console.error).finally(() => prisma.$disconnect());
