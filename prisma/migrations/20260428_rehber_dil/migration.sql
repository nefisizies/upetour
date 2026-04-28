-- RehberDil tablosu: dil yeterlilikleri ve sertifikalar
CREATE TABLE "RehberDil" (
    "id" TEXT NOT NULL,
    "rehberId" TEXT NOT NULL,
    "dil" TEXT NOT NULL,
    "seviye" TEXT,
    "sertifika" TEXT,
    "sonuc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RehberDil_pkey" PRIMARY KEY ("id")
);

-- Unique: bir rehberin aynı dili iki kez ekleyememesi
CREATE UNIQUE INDEX "RehberDil_rehberId_dil_key" ON "RehberDil"("rehberId", "dil");

-- Foreign key
ALTER TABLE "RehberDil" ADD CONSTRAINT "RehberDil_rehberId_fkey"
    FOREIGN KEY ("rehberId") REFERENCES "RehberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Eski languages String[] kolonunu kaldır
ALTER TABLE "RehberProfile" DROP COLUMN IF EXISTS "languages";
