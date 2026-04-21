-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable: RehberProfile'a ülkeler eklendi
ALTER TABLE "RehberProfile" ADD COLUMN "operatingCountries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable: RehberLicense
CREATE TABLE "RehberLicense" (
    "id" TEXT NOT NULL,
    "rehberId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RehberLicense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RehberLicense" ADD CONSTRAINT "RehberLicense_rehberId_fkey" FOREIGN KEY ("rehberId") REFERENCES "RehberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
