-- CheckIn, Rozet, RehberRozet + UnvanTip enum + RehberProfile unvan/checkInSayisi/benzersizSehir

DO $$ BEGIN
  CREATE TYPE "UnvanTip" AS ENUM (
    'YENI_REHBER','AKTIF_REHBER','DENEYIMLI_REHBER',
    'UZMAN_REHBER','SUPER_REHBER','ELIT_REHBER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "RehberProfile"
  ADD COLUMN IF NOT EXISTS "unvan"          "UnvanTip" NOT NULL DEFAULT 'YENI_REHBER',
  ADD COLUMN IF NOT EXISTS "checkInSayisi"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "benzersizSehir" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "CheckIn" (
    "id"          TEXT NOT NULL,
    "rehberId"    TEXT NOT NULL,
    "baslik"      TEXT NOT NULL,
    "aciklama"    TEXT,
    "fotografUrl" TEXT,
    "sehir"       TEXT,
    "ulke"        TEXT,
    "lat"         DOUBLE PRECISION,
    "lng"         DOUBLE PRECISION,
    "dogrulandi"  BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "CheckIn"
  DROP CONSTRAINT IF EXISTS "CheckIn_rehberId_fkey";
ALTER TABLE "CheckIn"
  ADD CONSTRAINT "CheckIn_rehberId_fkey"
  FOREIGN KEY ("rehberId") REFERENCES "RehberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "Rozet" (
    "id"       TEXT NOT NULL,
    "kod"      TEXT NOT NULL,
    "baslik"   TEXT NOT NULL,
    "aciklama" TEXT,
    "ikon"     TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    CONSTRAINT "Rozet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Rozet_kod_key" ON "Rozet"("kod");

CREATE TABLE IF NOT EXISTS "RehberRozet" (
    "id"          TEXT NOT NULL,
    "rehberId"    TEXT NOT NULL,
    "rozetId"     TEXT NOT NULL,
    "kazanildiAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onaylandi"   BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RehberRozet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "RehberRozet_rehberId_rozetId_key"
  ON "RehberRozet"("rehberId", "rozetId");
ALTER TABLE "RehberRozet"
  DROP CONSTRAINT IF EXISTS "RehberRozet_rehberId_fkey";
ALTER TABLE "RehberRozet"
  ADD CONSTRAINT "RehberRozet_rehberId_fkey"
  FOREIGN KEY ("rehberId") REFERENCES "RehberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RehberRozet"
  DROP CONSTRAINT IF EXISTS "RehberRozet_rozetId_fkey";
ALTER TABLE "RehberRozet"
  ADD CONSTRAINT "RehberRozet_rozetId_fkey"
  FOREIGN KEY ("rozetId") REFERENCES "Rozet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rozet seed datası
INSERT INTO "Rozet" ("id","kod","baslik","aciklama","ikon","kategori") VALUES
  ('rozet_ilk',        'ilk_checkin',      'İlk Adım',         'İlk check-in''ini yaptın',                  '📍','baslangic'),
  ('rozet_10ci',       '10_checkin',       'Gezgin',           '10 check-in tamamlandı',                    '🗺️','sayi'),
  ('rozet_25ci',       '25_checkin',       'Kaşif',            '25 check-in tamamlandı',                    '🧭','sayi'),
  ('rozet_50ci',       '50_checkin',       'Usta Rehber',      '50 check-in tamamlandı',                    '🏆','sayi'),
  ('rozet_100cu',      '100_checkin',      'Efsane',           '100 check-in tamamlandı',                   '⭐','sayi'),
  ('rozet_5sehir',     '5_sehir',          'Çok Şehirli',      '5 farklı şehirde check-in',                 '🏙️','cografya'),
  ('rozet_10sehir',    '10_sehir',         'Şehir Avcısı',     '10 farklı şehirde check-in',                '🌍','cografya'),
  ('rozet_fotograf',   'foto_uzman',       'Fotoğrafçı',       '10 fotoğraflı check-in',                    '📸','kalite'),
  ('rozet_dogrulama',  'tam_dogrulama',    'Güvenilir',        'Tüm check-in''leri doğrulandı (min 5)',      '✅','kalite')
ON CONFLICT ("kod") DO NOTHING;
