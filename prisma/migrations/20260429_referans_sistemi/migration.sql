-- CreateEnum
CREATE TYPE "ReferansDurum" AS ENUM ('BEKLIYOR', 'ONAYLANDI', 'REDDEDILDI');

-- CreateTable
CREATE TABLE "Referans" (
    "id" TEXT NOT NULL,
    "rehberId" TEXT NOT NULL,
    "acenteId" TEXT NOT NULL,
    "durum" "ReferansDurum" NOT NULL DEFAULT 'BEKLIYOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referans_rehberId_acenteId_key" ON "Referans"("rehberId", "acenteId");

-- AddForeignKey
ALTER TABLE "Referans" ADD CONSTRAINT "Referans_rehberId_fkey" FOREIGN KEY ("rehberId") REFERENCES "RehberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referans" ADD CONSTRAINT "Referans_acenteId_fkey" FOREIGN KEY ("acenteId") REFERENCES "AcenteProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
