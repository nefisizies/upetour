# Mimar — Tech Lead & Baş Asistan

> Kullanıcının sağ kolu. Tüm sistemi görür, diğer ajanları koordine eder, teknik kararları verir.
> Son güncelleme: 2026-05-07

## Kimim
Sistemin tamamını bilen tek ajan. Her oturumda tüm ajan dosyalarını okurum, kullanıcıya direktif verdirtir, ekibi yönlendiririm.

## ✅ Son Tamamlanan İşler (2026-05-07)
- **Solid kart sistemi** — tüm dashboard kartları `var(--card-bg)` / `var(--card-border)` CSS değişkenleri ile sıfır şeffaflık. Light: beyaz, dark: #1e293b
- **RehberKarti kontrast fix** — her zaman beyaz kart, inline hex renkler (Tailwind gray override'ından bağımsız)
- **Admin panel yenilendi** — Kullanıcılar, Lisans Onayları, İlanlar, İstatistikler, Tema sayfaları + API route'ları
- **AdminTopBar** — aktif sayfa göstergesi (inverted pill), dark mode toggle, çıkış
- **Admin İstatistikler** — 7 özet kart + haftalık bar chart (son 4 hafta) + lisans/ilan breakdown
- **DashboardNav** — admin'de gizleniyor, sidebar tek navigasyon
- **Aktif nav göstergesi** — `--nav-active-bg`/`--nav-active-text` CSS değişkenleri (light: koyu pill, dark: açık pill)
- **WaveBackground hydration fix** — `ssr: false` client wrapper ile çözüldü

## ✅ Önceki İşler (2026-05-06)
- **Dark premium tema**, **CSS değişkeni sistemi**, **Mesajlaşma sistemi**, **İlanlar sayfası**, **Admin giriş redirect**, **Suspense fix**, **Poyraz merge**, **Logo SVG**

## Mevcut Mimari Kararlar
- **Server/Client ayrımı**: Sayfa bileşenleri server, interaktif olanlar `"use client"`
- **Kart yüzeyleri**: CSS değişkenleri `var(--card-bg)`, `var(--card-border)`, `var(--card-inner-border)` — sıfır şeffaflık
- **Dashboard CSS scope**: `data-layout="dashboard"` attribute ile text-white override'ları hedefleniyor
- **Admin layout**: Kendi sidebar + AdminTopBar'ı var, parent DashboardNav'ı ADMIN için gizleniyor
- **WaveBackground**: `WaveBackgroundClient` wrapper üzerinden `ssr: false` ile yükleniyor (hydration mismatch önlemi)
- **Mesajlaşma**: Conversation partner bazlı gruplama, thread model yok
- **Auth**: `getServerSession` server-side, `useSession` client-side

## 🔴 Kritik Tuzaklar (bir daha yapma)
- **`ssr: false` Server Component'te yasak** — thin `"use client"` wrapper oluştur, oradan dynamic import et
- **`useState` initializer'da `document`** — sunucu `undefined` döndürür, client DOM okur → hydration mismatch
- **React `style` prop'unda `rgba()` spaces** — React `rgba(255, 255, 255, 0.06)` yazar, CSS seçici `rgba(255,255,255,0.06)` bekler → eşleşmez. CSS değişkeni kullan
- **Tailwind gray sınıfları + beyaz kart** — globals.css dark mode `text-gray-400` vb. override eder, beyaz kart üstünde görünmez olur. Beyaz kalıcı kartlarda inline `style={{ color: "#..." }}` kullan

## 🔴 Açık Teknik Borç (öncelik sırası)
1. **İlan başvuru sistemi** — rehber ilana başvurabilmeli (Başvuru modeli yok)
2. **Bildirim sistemi** — mesaj/referans gelince hiçbir bildirim yok
3. **Arama güçlendirme** — kesfet sayfaları daha güçlü filtre alabilir
4. **Mobile responsive** — şu an masaüstü öncelikli
5. **Mesajlaşma polling** — şu an realtime yok, sayfayı yenileme gerekiyor
6. **Hesap silme takibi** — `deletedAt` alanı yok, istatistiklerde kayıp gösterilemez
7. **RehberProfilForm.tsx** — 500+ satır, eski light styling, kart refactor bekliyor

## ⚡ Dikkat Edilecekler
- `@tailwindcss/postcss` `dependencies`'de olmalı — Railway prod build'ı kırar
- `prisma.acenteRehberBlok` lokal'de TS hatası verebilir — Railway'de sorun yok
- `useSearchParams()` kullanan sayfalar `<Suspense>` içinde olmalı
- Her yeni API route'unda `getServerSession` ile auth kontrolü şart
- `DATABASE_URL` Railway env'de — build sırasında DB'ye bağlanma (prisma generate yeterli)

## Diğer Ajanlara Notlar
- **Backend**: Yeni endpoint = auth kontrolü + ownership validation şart
- **Frontend**: Yeni sayfa = dark glass pattern + `var(--primary)` + `force-dynamic`
- **DevOps**: Her push sonrası Railway deploy'u izle, FAILED → log çek, düzelt
- **QA**: Yeni özellik = 4 senaryo test listesi (UX mesajlarını oku)
- **Veri**: İlan başvuru sistemi için şema tasarımı hazır, onay bekliyor
