# Ortak Ekip Bilgisi — RehberSepeti

> Tüm ajanlar bu dosyayı okur. Proje genelindeki kararlar ve mevcut durum burada tutulur.

## Proje Özeti
Tur rehberleri (REHBER) ile seyahat acentelerini (ACENTE) buluşturan web platformu.
- Canlı URL: https://turbag-app-production.up.railway.app
- Repo: https://github.com/nefisizies/turbag
- Branch: `main` → Railway otomatik deploy

## Teknik Stack
- **Framework**: Next.js 16 App Router (`force-dynamic` sayfalarda)
- **ORM**: Prisma 5 + PostgreSQL (Railway Postgres servisi)
- **Auth**: NextAuth v4, JWT strategy, credentials provider, `expiresAt` ile sliding session engeli
- **Stil**: Tailwind CSS v4 (`@tailwindcss/postcss` — `dependencies`'de olmalı, devDependencies'de değil)
- **Upload**: Cloudinary unsigned preset (`rehbersepeti` preset, cloud: `dkcrf1xw7`)
- **Deploy**: Railway, Nixpacks, `prisma generate && next build`

## Klasör Yapısı (önemli)
```
src/
  app/
    api/           — API route'ları
    dashboard/     — Rehber & acente dashboard'ları
    giris/         — Login
    kayit/         — Kayıt (2-adım: rol seçimi → form)
    kesfet/        — Public rehber/ilan listeleri
    rehber/[slug]/ — Public rehber profili
  components/      — Shared bileşenler
  lib/             — auth.ts, prisma.ts, utils.ts, licenses.ts
agents/            — Ajan hafıza dosyaları (BU KLASÖR)
tests/e2e/         — Playwright testleri
prisma/
  schema.prisma
  migrations/      — Manuel SQL migration'lar (lokal DB yok)
```

## Veritabanı Temel Modeller
- `User` (email, role: REHBER|ACENTE)
- `RehberProfile` (slug, name, city, bio, photoUrl, specialties[], operatingCountries[], experienceYears, isAvailable)
- `RehberDil` (dil, seviye, sertifika)
- `RehberLisans` (country, licenseNo, status: PENDING|VERIFIED)
- `TakvimEtkinlik` (rehberId, baslik, baslangic, bitis, notlar, tur: MANUEL|REZERVASYON)
- `Referans` (rehberId, acenteId, durum: BEKLIYOR|ONAYLANDI|REDDEDILDI)
- `AcenteProfile` (slug, companyName, city, logoUrl, website)
- `Message`, `Review`, `Ilan`

## Kritik Kararlar (değiştirilmez)
1. Tailwind v4 kullanıyoruz — v3 syntax'ı çalışmaz, `@apply` sınırlı
2. Migration'lar manuel SQL olarak yazılır (lokal DB yok, Railway'de çalışır)
3. Prisma client Railway'de `prisma generate` ile üretilir — lokal TS hataları beklenen
4. `next-auth` sliding session YASAK — `expiresAt` token field'ı ile kontrol edilir
5. Fotoğraf upload: Cloudinary unsigned, backend'e dosya gitmez

## Bilinen Açık Sorunlar
- Playwright WSL2'de çalışmıyor (libnspr4 eksik — kullanıcı `sudo apt-get install` yapmalı)
- NextAuth API'sinden token almak zor (CSRF cookie flow) — browser testleri için Playwright kullanılmalı

## Ajan Sistemi
Her ajan `agents/<rol>.md` dosyasını tutar.
Format: Kimim → Uzmanlık → Son Kararlar → Açık Görevler → Diğer Ajanlara Notlar
Her önemli işlemden sonra kendi dosyasını günceller.
