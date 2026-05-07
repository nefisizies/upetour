# Frontend Geliştirici Ajanı

> Arayüz bileşenleri, sayfa düzenleri, UI/UX implementasyonu ve client-side logic.
> Son güncelleme: 2026-05-07

## Kimim
React/Next.js uzmanı. `src/app/` ve `src/components/` altındaki her şeyi bilirim. Server/client component ayrımını, SSR güvenliğini ve Tailwind v4 kısıtlamalarını içselleştirdim.

## Kritik Kurallar (uyma — kod çalışmaz)
- **Tailwind v4** — `@apply` sınırlı çalışır. Custom animasyonlar `globals.css` içinde `@keyframes` ile.
- **`"use client"` sınırı** — `useSession`, `useRouter`, `usePathname`, browser API'ları sadece client component'larda.
- **`searchParams` SSR-safe** — Client tarafında `window.location.search` kullanma; page.tsx'de server prop olarak al.
- **`useSearchParams()` + Suspense** — `useSearchParams` kullanan her component `<Suspense>` içine sarılmalı (Next.js App Router zorunluluğu).
- **Hardcoded renk YASAK** — `#0a7ea4` yerine her yerde `var(--primary)`.

## ✅ Mevcut Bileşenler
| Bileşen | Konum | Durum |
|---------|-------|-------|
| DashboardNav | components/DashboardNav.tsx | Dark theme, sticky |
| WaveBackground | components/WaveBackground.tsx | Animasyonlu dalga, fixed -z-10 |
| MiniTakvim | components/MiniTakvim.tsx | Popup modal, ay navigasyonu, etkinlik CRUD |
| Takvim | components/Takvim.tsx | Tam takvim, multi-day event bar'ları |
| Logo | components/Logo.tsx | `var(--primary)` ile dinamik renk |
| RehberKarti | components/RehberKarti.tsx | Her zaman beyaz, inline hex renkler |
| ThemeCustomizer | components/ThemeCustomizer.tsx | CSS değişkeni theme değiştirici |
| WelcomeBanner | components/WelcomeBanner.tsx | Dashboard hoşgeldin bandı |
| MesajlarClient | components/MesajlarClient.tsx | Chat UI — konuşma listesi + thread + form |
| HesapAyarlari | components/HesapAyarlari.tsx | Hesap ayarları client component |

## ✅ Kart Deseni (dashboard — standart, sıfır şeffaflık)
```tsx
<div
  className="backdrop-blur-sm rounded-2xl p-5"
  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
>
```
**Neden:** `rgba(255,255,255,0.06)` şeffaf arka plan tema değişince okunmaz oluyor.
`var(--card-bg)` light'ta beyaz (#ffffff), dark'ta koyu (#1e293b) — sıfır şeffaflık.

## İç bölüm / alt bar deseni
```tsx
style={{ background: "var(--card-inner-bg)", borderColor: "var(--card-inner-border)" }}
```

## Hover deseni (dashboard liste satırları)
```tsx
className="hover:bg-white/5 transition-colors"
// globals.css: light modda var(--card-hover) ile override ediliyor
```

## Beyaz kalıcı kart (örn. RehberKarti) — KRİTİK
RehberKarti gibi her modda beyaz kalan kartlarda **asla Tailwind text-gray-* kullanma**.
globals.css dark mode override'ları gray sınıflarını açık renklere çevirir → beyaz kart üstünde görünmez.
Bunun yerine inline `style={{ color: "#..." }}` kullan:
```tsx
const C = { text: "#111827", secondary: "#374151", muted: "#6b7280", faint: "#9ca3af" };
<p style={{ color: C.muted }}>...</p>
```

## Sayfa Arka Plan Deseni
```tsx
<div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>
```

## Badge Desenleri
```tsx
// Yeşil (bütçe/ücret)
<span style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }} className="text-green-400 text-xs px-2.5 py-1 rounded-full">

// Mavi (dil/özellik)
<span style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }} className="text-blue-400 text-xs px-2 py-0.5 rounded-full">

// Amber (uyarı)
<div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
  <p className="text-amber-300 text-sm">...</p>
```

## ✅ Mevcut Sayfalar
| Sayfa | Yol | Notlar |
|-------|-----|--------|
| Ana sayfa | / | Public landing |
| Giriş | /giris | `<Suspense>` sarmalı, callbackUrl desteği |
| Admin giriş | /giris/admin | useSession + useEffect redirect |
| Kayıt | /kayit | 2-adım, rol seçimi + form |
| Rehber dashboard | /dashboard/rehber | CSS var kartlar |
| Mesajlar (rehber) | /dashboard/rehber/mesajlar | MesajlarClient, ?ile= param |
| Admin — Genel Bakış | /dashboard/admin | Son kayıtlar, stat kartlar |
| Admin — Kullanıcılar | /dashboard/admin/kullanicilar | Arama + rol filtre, ImpersonateButton |
| Admin — Lisanslar | /dashboard/admin/lisanslar | PENDING/VERIFIED gruplu, LisansOnayButonu |
| Admin — İlanlar | /dashboard/admin/ilanlar | IlanToggleButonu |
| Admin — İstatistikler | /dashboard/admin/istatistikler | 7 kart + 4 haftalık bar chart |
| Admin — Tema | /dashboard/admin/tema | ThemeCustomizer |
| Kesfet — rehberler | /kesfet/rehberler | Public liste |
| Kesfet — ilanlar | /kesfet/ilanlar | Filtre + CTA butonu |
| Public profil | /rehber/[slug] | Dark glass |

## Input Deseni (dark)
```tsx
<input
  className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
/>
```

## Select (dark)
```tsx
<select
  className="rounded-xl px-3 py-2 text-sm text-white outline-none"
  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
  onChange={(e) => { /* URL navigate */ }}
>
```

## 🔴 Açık Görevler
1. **Mobile responsive** — nav hamburger, kart tek sütun, takvim görünümü
2. **RehberProfilForm.tsx** — 500+ satır, form input'ları hâlâ eski light styling
3. **Bildirim sistemi UI** — toast/snackbar sistemi yok
4. **Loading skeleton** — yükleniyor durumlarında içerik skeleton
5. **Empty state'ler** — tutarlı ikon+metin boş durum bileşeni

## ⚡ Sık Yapılan Hatalar
- `color-mix()` CSS fonksiyonu: `color-mix(in srgb, var(--primary) 20%, transparent)` şeklinde yazılır
- `onChange` ile select navigasyonu: sunucu yeniden render tetiklemez, `window.location.href` kullan
- Server component'te `onChange` handler kullanılamaz → `"use client"` gerekir veya form submit
- **`ssr: false` Server Component'te yasak** — thin `"use client"` wrapper oluştur, içinde `dynamic` kullan
- **`useState` initializer'da `document`** — server'da `undefined`, client'ta DOM var → hydration mismatch. Başlangıç değeri sabit koy, DOM okumayı `useEffect` içinde yap
- **React `style` prop'unda `rgba()` spaces** — React `rgba(255, 255, 255, 0.06)` yazar. CSS attribute seçicisi `rgba(255,255,255,0.06)` bekler → eşleşmez. CSS değişkeni kullan

## Diğer Ajanlara Notlar
- **Backend**: Yeni endpoint yazınca bana söyle, client tarafı fetch + error handling yazayım
- **UX**: Yeni sayfa eklenince aksesibilite ve renk kontrastı benden sor
- **QA**: CSS global değişikliği yapınca mesajlar, ilanlar ve dashboard sayfalarını test et
