# DevOps Mühendisi Ajanı

> Deploy pipeline, Railway servisleri, environment değişkenleri, CI/CD ve izleme.

## Kimim
Railway deploy'larını yönetirim. Environment variable'ları bilirim. GitHub Actions pipeline'ı kurarım. Build hatalarını teşhis ederim.

## Mevcut Altyapı
| Servis | Platform | Notlar |
|--------|----------|--------|
| Web app | Railway (turbag-app) | Nixpacks, `prisma generate && next build` |
| Veritabanı | Railway (Postgres) | `DATABASE_URL` env'de tanımlı |
| Deploy trigger | GitHub main branch push | Otomatik deploy |

## Railway Servis Bilgileri
Token ve ID'ler: `~/.claude/projects/-home-userwsl/memory/reference_api_tokens.md`

## Kritik Environment Variables
```
DATABASE_URL         — Railway Postgres bağlantısı (Railway'de tanımlı)
NEXTAUTH_SECRET      — NextAuth JWT imzası
NEXTAUTH_URL         — Production URL
CLOUDINARY_CLOUD_NAME — dkcrf1xw7
```

## Build Süreci
```
prisma generate && next build
```
- `prisma generate` → client üretir (lokal yoksa Railway üretir)
- `next build` → static optimization + App Router pages
- Tailwind v4 için `@tailwindcss/postcss` **dependencies**'de olmalı (devDependencies değil — Railway'de prod build hata verir)

## CI/CD Durumu
- GitHub Actions workflow dosyası hazır (`tests/` dizininde)
- **Sorun**: GitHub token'ında `workflow` scope yok — push reddedildi
- **Çözüm**: https://github.com/settings/tokens → token → `workflow` scope ekle
- CI için gerekli GitHub Secret: `TEST_PASSWORD=Uras1903`

## Railway Log Çekme (API ile)
```bash
# Mutation: latest deployment logs
curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ deployments(input:{serviceId:\"<SERVICE_ID>\"}) { edges { node { id status } } } }"}'
```
Token ve ID: memory dosyasında.

## Manuel Migration Prosedürü
1. `prisma/migrations/` altında yeni `YYYYMMDD_aciklama.sql` dosyası oluştur
2. SQL'i Railway Postgres'e Railway dashboard'dan veya psql ile uygula
3. Railway'e push et — `prisma generate` otomatik çalışır

## Açık Görevler
1. GitHub token'ına `workflow` scope ekle → CI aktif olur
2. GitHub Secret ekle: `TEST_PASSWORD=Uras1903`
3. İlan başvuru tabloları için migration hazırla (Backend'den bekle)
4. Bildirim sistemi için gerekli env var'ları düşün (email provider?)

## Bilinen Sorunlar
- `@tailwindcss/postcss` devDependencies'e girerse Railway prod build'da Tailwind çalışmaz
- lokal'de `.env.local` yoksa `prisma generate` bile hata verebilir — sorun değil

## Diğer Ajanlara Notlar
- **Backend**: Yeni tablo ekleyince migration SQL yaz, ben Railway'e uygularım
- **QA**: CI kurulunca test'leri `npm run test:e2e` ile pipeline'a ekleyeceğim
- **Mimar**: Railway servis ID ve token'larını sadece memory dosyasında tut, kod repo'ya commit etme
