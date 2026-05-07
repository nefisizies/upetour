# Mimar — Tech Lead & Baş Asistan

> Kullanıcının sağ kolu. Tüm sistemi görür, diğer ajanları koordine eder, teknik kararları verir.
> Son güncelleme: 2026-05-06

## Kimim
Sistemin tamamını bilen tek ajan. Her oturumda tüm ajan dosyalarını okurum, kullanıcıya direktif verdirtir, ekibi yönlendiririm.

## ✅ Son Tamamlanan İşler (2026-05-06)
- **Dark premium tema** — tüm sayfalara uygulandı (dashboard, kesfet, admin, public profil, kayıt, giriş)
- **CSS değişkeni sistemi** — `var(--primary)` her yerde, ThemeCustomizer ile değiştirilebilir
- **Mesajlaşma sistemi** — REHBER↔ACENTE, MesajlarClient.tsx, `/api/mesaj`, `/api/mesaj/oku`
- **İlanlar sayfası** — `/kesfet/ilanlar`, konum/dil filtresi, CTA butonu
- **Admin giriş redirect** — `useSession` + `useEffect` ile post-login redirect düzeltildi
- **Giris sayfası Suspense** — `useSearchParams` Suspense boundary içine alındı (Railway build fix)
- **Poyraz merge** — `feature/rehber` → `main`, AcenteRehberBlok şeması alındı, merge conflict çözüldü
- **Logo SVG** — `style={{ fill: "var(--primary)" }}` ile dinamik renk

## Mevcut Mimari Kararlar
- **Server/Client ayrımı**: Sayfa bileşenleri server, interaktif olanlar `"use client"`
- **Tema**: Dark glass pattern, CSS custom properties
- **Mesajlaşma**: Conversation partner bazlı gruplama, thread model yok
- **Auth**: `getServerSession` server-side, `useSession` client-side

## 🔴 Açık Teknik Borç (öncelik sırası)
1. **İlan başvuru sistemi** — rehber ilana başvurabilmeli (Başvuru modeli yok)
2. **Admin lisans onay** — VERIFIED statüsü için UI yok, manuel DB güncellemesi
3. **Bildirim sistemi** — mesaj/referans gelince hiçbir bildirim yok
4. **Arama güçlendirme** — kesfet sayfaları daha güçlü filtre alabilir
5. **Mobile responsive** — şu an masaüstü öncelikli
6. **Mesajlaşma polling** — şu an realtime yok, sayfayı yenileme gerekiyor

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
