-- Poyraz: AcenteRehberBlok, Bildirim, AcenteTakvimEtkinlik, TurProgrami + User.deletedAt

-- Enums
DO $$ BEGIN
  CREATE TYPE "BlokTur" AS ENUM ('GECICI', 'KALICI');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BildirimTip" AS ENUM ('MESAJ', 'REFERANS', 'SISTEM', 'DAVET');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RehberYanitDurum" AS ENUM ('BEKLIYOR', 'KABUL', 'RED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User.deletedAt
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- AcenteRehberBlok
CREATE TABLE IF NOT EXISTS "AcenteRehberBlok" (
    "id"        TEXT NOT NULL,
    "acenteId"  TEXT NOT NULL,
    "rehberId"  TEXT NOT NULL,
    "tur"       "BlokTur" NOT NULL,
    "banBitis"  TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AcenteRehberBlok_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AcenteRehberBlok_acenteId_rehberId_key"
    ON "AcenteRehberBlok"("acenteId", "rehberId");
ALTER TABLE "AcenteRehberBlok"
    DROP CONSTRAINT IF EXISTS "AcenteRehberBlok_acenteId_fkey";
ALTER TABLE "AcenteRehberBlok"
    ADD CONSTRAINT "AcenteRehberBlok_acenteId_fkey"
    FOREIGN KEY ("acenteId") REFERENCES "AcenteProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcenteRehberBlok"
    DROP CONSTRAINT IF EXISTS "AcenteRehberBlok_rehberId_fkey";
ALTER TABLE "AcenteRehberBlok"
    ADD CONSTRAINT "AcenteRehberBlok_rehberId_fkey"
    FOREIGN KEY ("rehberId") REFERENCES "RehberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bildirim
CREATE TABLE IF NOT EXISTS "Bildirim" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "tip"       "BildirimTip" NOT NULL,
    "baslik"    TEXT NOT NULL,
    "metin"     TEXT,
    "link"      TEXT,
    "okundu"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bildirim_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Bildirim"
    DROP CONSTRAINT IF EXISTS "Bildirim_userId_fkey";
ALTER TABLE "Bildirim"
    ADD CONSTRAINT "Bildirim_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AcenteTakvimEtkinlik
CREATE TABLE IF NOT EXISTS "AcenteTakvimEtkinlik" (
    "id"          TEXT NOT NULL,
    "acenteId"    TEXT NOT NULL,
    "baslik"      TEXT NOT NULL,
    "baslangic"   TIMESTAMP(3) NOT NULL,
    "bitis"       TIMESTAMP(3),
    "lokasyon"    TEXT,
    "rehberId"    TEXT,
    "notlar"      TEXT,
    "rehberYanit" "RehberYanitDurum",
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AcenteTakvimEtkinlik_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "AcenteTakvimEtkinlik"
    DROP CONSTRAINT IF EXISTS "AcenteTakvimEtkinlik_acenteId_fkey";
ALTER TABLE "AcenteTakvimEtkinlik"
    ADD CONSTRAINT "AcenteTakvimEtkinlik_acenteId_fkey"
    FOREIGN KEY ("acenteId") REFERENCES "AcenteProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcenteTakvimEtkinlik"
    DROP CONSTRAINT IF EXISTS "AcenteTakvimEtkinlik_rehberId_fkey";
ALTER TABLE "AcenteTakvimEtkinlik"
    ADD CONSTRAINT "AcenteTakvimEtkinlik_rehberId_fkey"
    FOREIGN KEY ("rehberId") REFERENCES "RehberProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- TurProgrami
CREATE TABLE IF NOT EXISTS "TurProgrami" (
    "id"         TEXT NOT NULL,
    "acenteId"   TEXT NOT NULL,
    "ad"         TEXT NOT NULL,
    "sure"       INTEGER NOT NULL,
    "segmentler" JSONB NOT NULL,
    "aktif"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TurProgrami_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "TurProgrami"
    DROP CONSTRAINT IF EXISTS "TurProgrami_acenteId_fkey";
ALTER TABLE "TurProgrami"
    ADD CONSTRAINT "TurProgrami_acenteId_fkey"
    FOREIGN KEY ("acenteId") REFERENCES "AcenteProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
