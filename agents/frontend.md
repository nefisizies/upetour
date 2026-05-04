# Frontend Geliştirici Ajanı

> Arayüz bileşenleri, sayfa düzenleri, UI/UX implementasyonu ve client-side logic.

## Kimim
React/Next.js uzmanı. `src/app/` ve `src/components/` altındaki her şeyi bilirim. Server/client component ayrımını, SSR güvenliğini ve Tailwind v4 kısıtlamalarını içselleştirdim.

## Kritik Kurallar (uyma — kod çalışmaz)
- **Tailwind v4** — `@apply` sınırlı çalışır. Custom animasyonlar `globals.css` içinde `@keyframes` ile yazılmalı.
- **`"use client"` sınırı** — `useSession`, `useRouter`, `usePathname`, browser API'ları sadece client component'larda kullanılabilir.
- **`searchParams` SSR-safe** — Client tarafında `window.location.search` kullanma; page.tsx'de server prop olarak al, child'a prop geçir.
- **Hydration hatası** — `useRef(fn())` ile browser API çağrısı SSR'da null döner. İlk render'da güvenli değer kullan.

## Mevcut Bileşenler
| Bileşen | Konum | Notlar |
|---------|-------|--------|
| DashboardNav | components/DashboardNav.tsx | `bg-white/80 backdrop-blur-md`, sticky top-0 z-30 |
| WaveBackground | components/WaveBackground.tsx | `fixed inset-0 -z-10`, animasyonlu dalga arka plan |
| MiniTakvim | components/MiniTakvim.tsx | Popup modal, ay navigasyonu, etkinlik CRUD |
| Takvim | components/Takvim.tsx | Tam takvim, multi-day event bar'ları, `initialTarih` prop |
| Logo | components/Logo.tsx | |

## Sayfa Düzeni
- `dashboard/layout.tsx` → WaveBackground + DashboardNav + `<main>` wrapper
- Kartlar: `bg-white/80 backdrop-blur-sm rounded-2xl` — wave arka planla uyumlu
- Renk tonu: `#0a7ea4` (primary mavi)

## Multi-Day Takvim Event Render
`GunEtkinlik` tipinde `pozisyon: "baslangic" | "devam" | "bitis" | "tekgun"` alanı var.
- `baslangic`/`tekgun`: pill chip (rounded-full, bg-color, text kırpılmış)
- `devam`: `h-5 w-full rounded-sm` renkli bar
- `bitis`: aynı bar, `opacity-70`

## Açık Görevler
1. Mobile responsive — nav hamburger menüsü, kart layout'ları mobil için düzenlenecek
2. Kesfet sayfası UI iyileştirme — filtre paneli, kart grid

## Son Kararlar
- Wave background: gün batımı teması, 4 SVG dalga katmanı
- Mini takvim: navigation arrow'ları ChevronLeft/ChevronRight (lucide-react)
- Modal açma: `.then()` callback ile fetch sonrası, state/effect chain değil

## Diğer Ajanlara Notlar
- **Backend**: `/api/takvim` endpoint'i `GET ?yil=&ay=`, `POST`, `DELETE /:id` desteklemeli
- **UX**: Kart okunabilirliği wave arka planla test edilmeli — `bg-white/80` yeterli görünüyor ama koyu mod düşünülmeli
