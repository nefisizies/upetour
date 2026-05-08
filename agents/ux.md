# UX / Tasarım Ajanı

> Kullanıcı deneyimi, arayüz tutarlılığı, erişilebilirlik ve görsel tasarım.
> Son güncelleme: 2026-05-06

## Kimim
Kullanıcı akışlarını, bileşen tutarlılığını ve görsel hiyerarşiyi optimize ederim.

## ✅ Mevcut Tasarım Sistemi — Dark Premium Theme

### Temel Kararlar
- **Tema**: Karanlık premium. Tüm sayfalar `#0c0500 → #1a0900` gradient arka plan.
- **Renk sistemi**: `var(--primary)` CSS değişkeni, ThemeCustomizer ile değiştirilebilir
- **Kart**: Dark glass — `rgba(255,255,255,0.06)` bg + `rgba(255,255,255,0.1)` border + `backdrop-blur-sm`
- **Metin**: `text-white` başlıklar, `text-white/60` ikincil, `text-white/40` muted

### Kullanıcı Akışları (mevcut)
```
Kayıt:   / → /kayit (rol seç → form) → dashboard
Giriş:   / → /giris → /dashboard/rehber VEYA /dashboard/acente
Rehber:  dashboard → profil → takvim → mesajlar → /kesfet/ilanlar
Acente:  dashboard → profil → ilanlarım → mesajlar → /kesfet/rehberler
Public:  / → /kesfet/rehberler → /rehber/[slug]
```

### Badge Hiyerarşisi
- Yeşil (ücret/pozitif): `text-green-400` + `rgba(34,197,94,0.1)` bg
- Mavi (dil/bilgi): `text-blue-400` + `rgba(96,165,250,0.1)` bg
- Amber (uyarı/eksik): `text-amber-300` + `bg-amber-500/10 border-amber-500/30`
- Primary (CTA): `var(--primary)` bg + `text-white`

### Bileşen Stili
- Butonlar: `var(--primary)` bg, `hover:brightness-110`, `rounded-xl`
- Input'lar: `rgba(255,255,255,0.06)` bg, `rgba(255,255,255,0.1)` border, `rounded-xl`
- Nav: `rgba(12,5,0,0.85)` bg + `backdrop-blur-md`, sticky
- Mesaj balonu (gönderen): `var(--primary)` bg, `rounded-2xl`
- Mesaj balonu (alınan): `rgba(255,255,255,0.08)` bg, `text-white/85`

## ✅ Tamamlanan UX Çalışmaları
- Wave background (eski light tema) → dark premium gradient
- Tüm kartlar frosted glass'tan dark glass'a geçirildi
- Mesajlaşma arayüzü: konuşma listesi (sol panel) + thread (sağ panel) + form
- İlanlar sayfası: filtre dropdown'ları + badge grid + CTA butonu
- Kayıt sayfası: 2-adım rol seçimi + dark glass form
- Admin sidebar: dark, amber ADMIN badge

## 🔴 Açık UX Görevleri
1. **Mobile responsive** — nav hamburger, kart tek sütun, takvim görünümü (EN KRİTİK)
2. **RehberProfilForm.tsx** — 500+ satır form, eski light styling kaldı
3. **Empty state'ler** — mesaj yok, ilan yok, referans yok için tutarlı ikon+metin
4. **Loading skeleton** — veri yüklenirken skeleton göster (şu an sadece spinner)
5. **Toast/snackbar** — başarı/hata bildirimleri için tutarlı sistem
6. **Onboarding** — yeni rehber profili nasıl tamamlayacağını biliyor mu?

## Bilinen CSS Tuzakları
- `overflow-hidden + negatif margin`: kart container'ına `overflow-hidden` eklenince avatar aşıyor. Çözüm: overflow-hidden sadece banner'a.
- `onChange` server component'te kullanılamaz — filtre select'leri için `window.location.href` ile navigate et.
- `color-mix(in srgb, var(--primary) 20%, transparent)` — opak `var(--primary)` varyantı için standart yol.

## Erişilebilirlik Notları
- Kontrast: dark glass üstünde `text-white/60` minimum — `text-white/40` sadece dekoratif ikon için
- Badge metinleri (`text-xs`) için `text-white/50` veya üstü kullan
- CTA butonları: `var(--primary)` bg üstünde beyaz metin — ThemeCustomizer çok açık renk seçerse kontrast bozulabilir

## Diğer Ajanlara Notlar
- **Frontend**: Yeni bileşen eklerken dark glass desene uymayan kısımlar bana sor
- **QA**: Kontrast oranlarını `axe-core` ile test et — WCAG AA (4.5:1) standart metin
- **Mimar**: Mobile iyileştirme teknik borç listesinde 1 numara — ne zaman başlayalım?
