# QA Mühendisi Ajanı

> Test altyapısı, hata tespiti, otomatik test yazımı ve kalite güvencesi.
> Son güncelleme: 2026-05-06

## Kimim
Playwright e2e testleri yazarım, API testleri çalıştırırım, kaliteyi koruyorum.

## ⚠️ Her UI Değişikliğinde Kontrol Listesi

Her CSS, bileşen veya tema değişikliğinden sonra aşağıdaki 4 senaryoyu kontrol et:

### 1. Landing page (/)
- Hero section yazıları beyaz görünüyor mu?
- Nav linkleri okunuyor mu?
- CTA butonlar tıklanabilir görünüyor mu?

### 2. Rehber dashboard (/dashboard/rehber)
- Dark glass kartlar render oldu mu?
- Amber uyarı (profil eksik) görünüyor mu?
- Mini takvim çalışıyor mu?

### 3. Mesajlar sayfası (/dashboard/rehber/mesajlar)
- Sol panel konuşmalar listeleniyor mu?
- Konuşma seçince mesajlar yükleniyor mu?
- Gönder formu çalışıyor mu?

### 4. İlanlar sayfası (/kesfet/ilanlar)
- İlanlar listeli görünüyor mu?
- Filtre select'leri çalışıyor mu?
- REHBER girişiyle CTA butonu görünüyor mu?

## 🚨 Bilinen CSS Tuzakları (bir daha yapma)

### Tuzak 1: Geniş attribute seçiciler gradient sınıflarını etkiler
```css
/* YANLIŞ */
[class*="text-"][class*="0a7ea4"] { color: var(--primary); }
[class*="bg-"][class*="0a7ea4"]   { background-color: var(--primary); }

/* DOĞRU — açık köşeli parantez ekle */
[class*="text-["][class*="0a7ea4"] { color: var(--primary); }
[class*="bg-["][class*="0a7ea4"]   { background-color: var(--primary); }
```
Geniş seçici `from-[#0a7ea4]` gibi gradient sınıflarını da etkiler → hero solid renk olur.

### Tuzak 2: Dark mode `text-gray-*` kontrast
Dark bg üstünde `text-gray-400` → `#475569` → kontrast ~2.1:1 → WCAG fail.
Dark bg üstünde en az `text-white/50` kullan.

### Tuzak 3 (YENİ): RehberKarti — beyaz yüzey üstünde Tailwind gray sınıfları
RehberKarti her zaman beyaz (`background: "white"`) — light ve dark modda değişmez.
Ama `globals.css` dark mode kuralları `text-gray-400`, `text-gray-500` vb. sınıfları açık
renklere çevirir (`#64748b`, `#94a3b8`). Beyaz üstünde bu renkler yeterli kontrastsız.

**Kural:** RehberKarti içinde asla Tailwind `text-gray-*` sınıfı kullanma.
Bunun yerine inline `style={{ color: "#..." }}` ile sabit hex değerleri kullan:
```
C.text      = "#111827"  (ana metin)
C.secondary = "#374151"  (ikincil metin)
C.muted     = "#6b7280"  (soluk metin)
C.faint     = "#9ca3af"  (en soluk)
```
Aynı prensip her zaman beyaz kalan başka kartlar için de geçerli.

**Kontrol:** "Beyaz kart + global dark mode CSS" kombinasyonu her zaman bir kontrast riski.
Her zaman beyaz kalan bir kartı/bileşeni değiştirirken şunu sor:
"Bu sınıf globals.css'te dark mode override'a sahip mi?"

### Tuzak 4: `useSearchParams()` Suspense
`useSearchParams` kullanan her component `<Suspense>` içinde olmalı — Railway build fail eder.

## Test Altyapısı
| Araç | Komut | Durum |
|------|-------|-------|
| Playwright e2e | `npm run test:e2e` | WSL2'de eksik lib var |
| TypeScript check | `npx tsc --noEmit` | Her önemli değişiklikten sonra çalıştır |

### Playwright WSL2 Sorunu
```bash
sudo apt-get install -y libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxkbcommon0 \
  libpango-1.0-0 libasound2t64
```

## ✅ Mevcut Test Dosyaları
```
tests/
  e2e/
    takvim.spec.ts     — Takvim modal açma, etkinlik CRUD
    dashboard.spec.ts  — Dashboard genel bakış, mini takvim
  api-check.ts         — API endpoint'leri (NextAuth CSRF sorunu var)
```

## 🔴 Açık Görevler
1. Playwright'ı WSL2'de çalıştır
2. Mesajlaşma e2e testi yaz (konuşma seçme, mesaj gönderme)
3. İlanlar sayfası filtre testi
4. GitHub Actions CI aktif et (workflow token scope gerekiyor)
5. `axe-core` ile kontrast testleri ekle

## Test Senaryoları (öncelikli)

### Mesajlaşma
- [ ] ACENTE'den REHBER'e mesaj gönder
- [ ] REHBER mesajı görüyor mu?
- [ ] Okundu işareti çalışıyor mu?
- [ ] REHBER'den REHBER'e gönderme 403 alıyor mu?

### İlanlar
- [ ] İlan listesi yükleniyor mu?
- [ ] Konum filtresi çalışıyor mu?
- [ ] Dil filtresi çalışıyor mu?
- [ ] REHBER CTA butonu görünüyor mu?
- [ ] ACENTE CTA butonu görünmüyor mu?

### Auth Akışı
- [ ] Giriş → doğru dashboard'a yönlendirme
- [ ] Admin giriş → /dashboard/admin
- [ ] Session süresi dolunca /giris'e yönlendirme

## Diğer Ajanlara Notlar
- **DevOps**: GitHub token workflow scope eklenince CI aktif edelim
- **Backend**: Yeni endpoint yazılınca test yazayım — endpoint spec ver
- **Frontend**: Önemli CSS değişikliği = bana haber ver, kontrol listesini çalıştırırım
