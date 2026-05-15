-- ekAlanlar JSON sütunu: TuristKayit ve EtkinlikTurist tablolarına eklendi
ALTER TABLE "TuristKayit" ADD COLUMN IF NOT EXISTS "ekAlanlar" JSONB;
ALTER TABLE "EtkinlikTurist" ADD COLUMN IF NOT EXISTS "ekAlanlar" JSONB;
