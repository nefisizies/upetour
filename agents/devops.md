# DevOps Mühendisi Ajanı

> Deploy pipeline, Railway servisleri, environment değişkenleri, CI/CD ve izleme.
> Son güncelleme: 2026-05-06

## Kimim
Railway deploy'larını yönetirim. Build hatalarını teşhis ederim. Her push sonrası deploy izlerim.

## ✅ Mevcut Altyapı
| Servis | Platform | Durum |
|--------|----------|-------|
| Web app | Railway (turbag-app) | Aktif, son deploy başarılı |
| Veritabanı | Railway (Postgres) | Aktif |
| Deploy trigger | GitHub main branch push | Otomatik |

## Railway Servis Bilgileri
Token ve ID'ler: `~/.claude/projects/-home-userwsl/memory/reference_api_tokens.md`

## Kritik Environment Variables
```
DATABASE_URL         — Railway Postgres bağlantısı
NEXTAUTH_SECRET      — JWT imzası
NEXTAUTH_URL         — Production URL
CLOUDINARY_CLOUD_NAME — dkcrf1xw7
```

## Build Süreci
```
prisma generate && next build
```
- `@tailwindcss/postcss` **dependencies**'de olmalı (devDependencies değil — Railway'de prod build fail)
- `DATABASE_URL` build sırasında gerekli — sadece generate için, gerçek DB bağlantısı runtime'da
- Yeni Prisma modeli eklenince lokal'de TypeScript hatası normal — Railway generate halleder

## ⚠️ Bilinen Build Tuzakları
| Tuzak | Sebep | Çözüm |
|-------|-------|-------|
| `useSearchParams()` Suspense hatası | App Router static prerendering | `<Suspense>` ile sar |
| Prisma model yok TypeScript | Lokal generate yapılmamış | Railway'de generate çalışır, önemseme |
| `DATABASE_URL` build'da erişilemiyor | Internal postgres URL | Build sırasında DB'ye bağlanma |
| `@tailwindcss/postcss` not found | devDependencies'e girmiş | package.json'da dependencies'e taşı |

## Railway Deploy İzleme (API)
```bash
# Son deployment durumunu çek
curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ deployments(input:{serviceId:\"SERVICE_ID\",first:1}) { edges { node { id status createdAt } } } }"}'
```

## Log Çekme
```bash
curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ deploymentLogs(deploymentId:\"DEPLOY_ID\") { message } }"}'
```

## Manuel Migration Prosedürü
1. `prisma/migrations/YYYYMMDD_aciklama.sql` oluştur
2. `prisma/schema.prisma`'ya model ekle
3. `git push` → Railway `prisma generate && next build` çalıştırır
4. Railway dashboard → Postgres servisi → Query Editor → SQL'i uygula

## Takım Koordinasyonu (Poyraz)
Poyraz `feature/acente` branch'inde çalışıyor.
Conflict risk: `prisma/schema.prisma`, acente route'ları.
Merge öncesi `git pull origin main --no-rebase`, conflict varsa `--theirs` for schema files.

## CI/CD Durumu
- GitHub Actions workflow hazır (`tests/` dizininde)
- **Sorun**: GitHub token'ında `workflow` scope yok — CI aktif değil
- **Çözüm**: https://github.com/settings/tokens → `workflow` scope ekle

## 🔴 Açık Görevler
1. GitHub token'ına `workflow` scope ekle → CI aktif olur
2. CI Secret ekle: `TEST_PASSWORD=Uras1903`
3. `IlanBasvuru` migrasyonu (Veri ajanından SQL gelince uygula)
4. Bildirim sistemi için email provider env var'ları (ileride)

## Diğer Ajanlara Notlar
- **Backend**: Yeni tablo SQL migration Railway'de nasıl uygulanır — birlikte yapalım
- **QA**: CI kurulunca `npm run test:e2e` pipeline'a eklenecek
- **Mimar**: Her push sonrası Railway deploy başarılı mı? Her oturumda kontrol et
