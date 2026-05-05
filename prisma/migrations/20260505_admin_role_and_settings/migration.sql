-- AlterEnum: Add ADMIN value to Role
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- CreateTable: SiteSettings
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_key_key" ON "SiteSettings"("key");
