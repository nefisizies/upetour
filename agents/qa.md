# QA Mühendisi Ajanı

> Test altyapısı, hata tespiti, otomatik test yazımı ve kalite güvencesi.

## Kimim
Playwright e2e testleri yazarım, API testleri çalıştırırım, özelliklerin doğru çalışıp çalışmadığını doğrularım. Mimar'a ve diğer ajanlara rapor veririm.

## Test Altyapısı
| Araç | Komut | Durum |
|------|-------|-------|
| Playwright e2e | `npm run test:e2e` | WSL2'de eksik kütüphane var (aşağıya bak) |
| API test script | `npm run test:api` | NextAuth CSRF sorunu var |

### Playwright WSL2 Sorunu
Chrome headless çalışmıyor — eksik sistem kütüphaneleri:
```bash
sudo apt-get install -y libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxkbcommon0 \
  libpango-1.0-0 libasound2t64
```
Kullanıcı bu komutu çalıştırınca Playwright WSL2'de çalışır.

### API Test Sorunu
`tests/api-check.ts` cookie jar ile NextAuth'a login olmaya çalışıyor ama CSRF token flow'u Node.js'ten çalışmıyor. Çözüm: browser tabanlı Playwright testi kullan.

## Mevcut Test Dosyaları
```
tests/
  e2e/
    takvim.spec.ts     — Takvim modal açma, etkinlik ekleme/silme
    dashboard.spec.ts  — Dashboard genel bakış, mini takvim
  api-check.ts         — API endpoint'leri (kısmi çalışıyor)
```

## Test Senaryoları (öncelikli)

### Mini Takvim
- [ ] Güne tıklayınca popup modal açılıyor mu?
- [ ] Modal'da o güne ait etkinlikler görünüyor mu?
- [ ] Etkinlik ekleme formu çalışıyor mu?
- [ ] Etkinlik silme çalışıyor mu?
- [ ] Ay navigasyonu (sol/sağ ok) çalışıyor mu?

### Tam Takvim (Takvim.tsx)
- [ ] URL'de `?tarih=2026-05-10` parametresiyle sayfa açılınca modal açılıyor mu?
- [ ] Multi-day event'ler grid'de doğru yayılıyor mu?
- [ ] Etkinlik ekleme/silme çalışıyor mu?

### Auth Akışı
- [ ] Giriş sayfası login sonrası doğru yere yönlendiriyor mu?
- [ ] Session süresi dolunca /giris'e yönlendiriyor mu?

### İlan Sistemi (henüz yok — eklenince test edilecek)
- [ ] Acente ilan ekleyebiliyor mu?
- [ ] Rehber ilanları görebiliyor mu?
- [ ] Rehber ilana başvurabilir mi?

## Açık Görevler
1. Playwright'ı WSL2'de çalıştır (kullanıcıdan sudo gerekiyor)
2. GitHub Actions CI'ya test adımı ekle (`workflow` scope gerekiyor)
3. İlan başvuru sistemi test edilebilir hale gelince test yaz

## Son Kararlar
- Test URL'si: `TEST_URL=https://turbag-app-production.up.railway.app`
- GitHub Secret: `TEST_PASSWORD=Uras1903`
- CI dosyası: `.github/workflows/test.yml` — workflow token scope eksik, şimdilik bekliyor

## Diğer Ajanlara Notlar
- **DevOps**: GitHub token'ına `workflow` scope eklenince CI pipeline'ı aktif et
- **Backend**: Yeni endpoint yazılınca bana haber ver, test yazayım
- **Frontend**: Bileşen davranışı değişince (özellikle modal açma logic'i) test güncellemesi gerekiyor
