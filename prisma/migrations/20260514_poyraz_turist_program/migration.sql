-- Poyraz: TuristKayit modeli + TurProgrami ilişkileri + AcenteTakvimEtkinlik.programId

CREATE TABLE IF NOT EXISTS "TuristKayit" (
    "id"          TEXT NOT NULL,
    "programId"   TEXT NOT NULL,
    "ad"          TEXT NOT NULL,
    "soyad"       TEXT NOT NULL,
    "pasaportNo"  TEXT,
    "uyruk"       TEXT,
    "dogumTarihi" TEXT,
    "telefon"     TEXT,
    "eposta"      TEXT,
    "notlar"      TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TuristKayit_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "TuristKayit"
  DROP CONSTRAINT IF EXISTS "TuristKayit_programId_fkey";
ALTER TABLE "TuristKayit"
  ADD CONSTRAINT "TuristKayit_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "TurProgrami"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AcenteTakvimEtkinlik"
  ADD COLUMN IF NOT EXISTS "programId" TEXT;
ALTER TABLE "AcenteTakvimEtkinlik"
  DROP CONSTRAINT IF EXISTS "AcenteTakvimEtkinlik_programId_fkey";
ALTER TABLE "AcenteTakvimEtkinlik"
  ADD CONSTRAINT "AcenteTakvimEtkinlik_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "TurProgrami"("id") ON DELETE SET NULL ON UPDATE CASCADE;
