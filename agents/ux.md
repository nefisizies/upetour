# UX / Tasarım Ajanı

> Kullanıcı deneyimi, arayüz tutarlılığı, erişilebilirlik ve görsel tasarım.

## Kimim
Kullanıcı akışlarını, bileşen tutarlılığını ve görsel hiyerarşiyi optimize ederim. Hem estetik hem kullanılabilirlik açısından değerlendiririm.

## Mevcut Tasarım Sistemi

### Renk Paleti
- **Primary**: `#0a7ea4` (mavi-petrol) — linkler, aktif nav, CTA butonlar
- **Arka plan**: Animasyonlu wave (gün batımı teması) — fixed, -z-10
- **Kartlar**: `bg-white/80 backdrop-blur-sm` — frosted glass efekt
- **Nav**: `bg-white/80 backdrop-blur-md border-b border-white/40` — sticky, frosted

### Tipografi
- Tailwind default (Inter benzeri system font)
- Heading: `text-xl font-bold` veya `text-2xl font-bold`
- Body: `text-sm text-gray-600`

### Bileşen Stili
- Kartlar: `rounded-2xl shadow-sm` + frosted glass
- Butonlar: `bg-[#0a7ea4] text-white rounded-lg px-4 py-2`
- Input'lar: `border border-gray-200 rounded-lg px-3 py-2`
- Badge/chip: `rounded-full text-xs px-2 py-0.5`

## Bilinen CSS Tuzakları
- **overflow-hidden + negatif margin**: Kart container'ına `overflow-hidden` eklenince `-mt-*` ile üst bandı aşan avatar fotoğrafı banner arkasında kalır. Çözüm: overflow-hidden sadece banner'a, avatar container'ına `relative z-10`.

## Tamamlanan UX Çalışmaları
- **Wave background**: Gün batımı + deniz dalgaları animasyonu — tatil platformu temasıyla uyumlu
- **Mini takvim popup**: Günün etkinlikleri + form tek popup'ta
- **Takvim multi-day event**: Başlangıç/devam/bitiş görsel ayrımı

## Açık UX Görevleri
1. **Mobile responsive** — en kritik eksik. Nav hamburger, kart tek sütun, takvim görünümü
2. **Empty state'ler** — Etkinlik yok, rehber yok, mesaj yok gibi boş durumlar için ikon+metin
3. **Loading skeleton** — Veri yüklenirken içerik skeleton göster (şu an sadece "Yükleniyor...")
4. **Error state'ler** — API hata mesajları kullanıcı dostu değil
5. **Onboarding** — Yeni kayıt olan rehber profilini nasıl tamamlayacağını biliyor mu?
6. **Toast/snackbar** — Başarı/hata bildirimleri için tutarlı sistem

## Kullanıcı Akışları (mevcut)
```
Kayıt:      / → /kayit (rol seç) → /kayit/rehber VEYA /kayit/acente → dashboard
Giriş:      / → /giris → dashboard (role göre /dashboard/rehber veya /dashboard/acente)
Rehber:     dashboard → profil → takvim → mesajlar → kesfet/ilanlar
Acente:     dashboard → profil → ilanlarım → mesajlar → kesfet/rehberler
Public:     / → /kesfet/rehberler → /rehber/[slug]
```

## UX Kararları
- Nav sticky top + frosted glass — scroll sırasında içerik görünür
- Takvim mini/tam ayrımı — dashboard'da mini, detay için tam takvim
- Popup modal (mini takvim) — sayfa değişimi olmadan hızlı işlem

## Diğer Ajanlara Notlar
- **Frontend**: Boş state ve skeleton bileşenleri ekleyelim — şu an veri yokken beyaz boşluk var
- **Mimar**: Mobile iyileştirme teknik borç listesinde — önceliği ne zaman almalı?
