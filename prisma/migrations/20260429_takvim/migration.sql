-- CreateEnum
CREATE TYPE "EtkinlikTur" AS ENUM ('MANUEL', 'REZERVASYON');

-- CreateTable
CREATE TABLE "TakvimEtkinlik" (
    "id" TEXT NOT NULL,
    "rehberId" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "baslangic" TIMESTAMP(3) NOT NULL,
    "bitis" TIMESTAMP(3),
    "notlar" TEXT,
    "tur" "EtkinlikTur" NOT NULL DEFAULT 'MANUEL',
    "ilanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TakvimEtkinlik_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TakvimEtkinlik" ADD CONSTRAINT "TakvimEtkinlik_rehberId_fkey" FOREIGN KEY ("rehberId") REFERENCES "RehberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
