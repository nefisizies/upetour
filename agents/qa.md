# QA Mühendisi Ajanı

> Test altyapısı, hata tespiti, otomatik test yazımı ve kalite güvencesi.

## Kimim
Playwright e2e testleri yazarım, API testleri çalıştırırım, özelliklerin doğru çalışıp çalışmadığını doğrularım. Mimar'a ve diğer ajanlara rapor veririm.

---

## ⚠️ ZORUNLU KONTROL LİSTESİ — Her UI değişikliğinde uygula

Her CSS, bileşen veya tema değişikliğinden sonra aşağıdaki 4 senaryoyu test et:

### 1. Landing page (/) — ışık modu
- Hero section yazıları beyaz görünüyor mu? (`text-white` gradient üstünde)
- Nav linkleri okunuyor mu?
- Stats rakamları (teal renk) görünüyor mu?
- Feature kart başlıkları ve açıklamaları okunuyor mu?

### 2. Landing page (/) — karanlık mod (`html[data-dark="true"]` ayarla)
- Aynı kontroller + arka planlar doğru karardı mı?

### 3. Dashboard — ışık modu
- Nav + sidebar arka plan doğru mu?
- Kart içi yazılar okunuyor mu?
- Amber/kırmızı/yeşil badge metinleri görünüyor mu?

### 4. Dashboard — karanlık mod
- Nav koyu mu (beyaz kalmadı mı)?
- Badge metinleri (amber, red, green) okunuyor mu?
- Tüm gri tonlar yeterli kontrast veriyor mu?

---

## 🚨 BİLİNEN CSS TUZAKLARI (bir daha yapma)

### Tuzak 1: Geniş attribute seçiciler gradient/from sınıflarını etkiler
**Ne oldu:** `[class*="bg-"][class*="0a7ea4"]` seçicisi, `bg-gradient-to-br from-[#0a7ea4]` içeren hero section'a da uydu. `background-color: var(--primary)` ile gradient override edildi, tüm hero solid teal oldu.

Aynı anda `[class*="text-"][class*="0a7ea4"]` de `text-white from-[#0a7ea4]` içeren elemente uydu → beyaz yazı teal oldu → teal zemin üstünde görünmez oldu.

**Kural:** Attribute seçicilerde `[class*="bg-["]` ve `[class*="text-["]` kullan (açık köşeli parantezle). Bu şekilde yalnızca `bg-[#...]` ve `text-[#...]` sınıfları eşleşir; `from-[#...]`, `via-[#...]`, `to-[#...]`, `bg-gradient-*` etkilenmez.

```css
/* YANLIŞ — çok geniş */
[class*="text-"][class*="0a7ea4"]  { color: var(--primary); }
[class*="bg-"][class*="0a7ea4"]    { background-color: var(--primary); }

/* DOĞRU — yalnızca gerçek custom renk sınıfları */
[class*="text-["][class*="0a7ea4"] { color: var(--primary); }
[class*="bg-["][class*="0a7ea4"]   { background-color: var(--primary); }
```

### Tuzak 2: `text-gray-400/500` dark mode eşleme tersine çevrilmeli
**Ne oldu:** Dark mode'da `text-gray-400 → #475569` (slate-600) atandı. `#1e293b` (slate-800) zemin üstünde kontrast oranı ~2.1:1 — WCAG'ı geçemiyor, yazı neredeyse görünmez.

**Kural:** Dark mode'da muted yazı renkleri AÇIK olmalı (light mode'daki mantıkla aynı ama tersine):
- `text-gray-500` → `#94a3b8` (slate-400) — 6:1 kontrast ✓  
- `text-gray-400` → `#64748b` (slate-500) — 3.3:1 kontrast (ikon/dekoratif için kabul edilebilir)

### Tuzak 3: Dark mode nav/sidebar class-tabanlı değil, selector-tabanlı override gerekiyor
**Ne oldu:** DashboardNav `backdrop-blur-md` + inline `style` ile `color-mix(in srgb, var(--sidebar-bg) 80%, transparent)` kullanıyor. `--sidebar-bg` CSS değişkeni dark mode'da değişiyor AMA `backdrop-blur` arkasındaki açık WaveBackground renkleri nav'ı yine de beyazımsı gösteriyor.

**Kural:** Nav ve sidebar için inline style değişkeni yeterli değil. `html[data-dark="true"] nav.sticky { background-color: rgba(10,18,32,0.95) !important; }` gibi direkt override ekle.

---

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
3. İlan başvuru sistemi test edilecek hale gelince test yaz
4. `axe-core` ile Playwright contrast testleri ekle — her sayfa/mod otomatik WCAG kontrolü

## Son Kararlar
- Test URL'si: `TEST_URL=https://turbag-app-production.up.railway.app`
- GitHub Secret: `TEST_PASSWORD=Uras1903`
- CI dosyası: `.github/workflows/test.yml` — workflow token scope eksik, şimdilik bekliyor

## Diğer Ajanlara Notlar
- **DevOps**: GitHub token'ına `workflow` scope eklenince CI pipeline'ı aktif et
- **Backend**: Yeni endpoint yazılınca bana haber ver, test yazayım
- **Frontend**: CSS global değişikliği yapınca MUTLAKA landing page'i hem light hem dark modda test et
- **UX**: Dark mode kontrast değerleri değişince bana danış — WCAG AA (4.5:1) standart metin, 3:1 büyük metin/ikon
