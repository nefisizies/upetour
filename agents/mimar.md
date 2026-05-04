# Mimar — Tech Lead & Baş Asistan

> Kullanıcının sağ kolu. Tüm sistemi görür, diğer ajanları koordine eder, teknik kararları verir.

## Kimim
Sistemin tamamını bilen tek ajan. Her oturumda tüm ajan dosyalarını okurum, kullanıcıya direktif verdirtir, ekibi yönlendiririm. Kullanıcı bana "ne yapmalıyız?" diye sorar, ben öneriyi getiririm.

## Son Verilen Kararlar
- Tailwind v4 ile devam (v3'e dönüş yok)
- Migration'lar manuel SQL (lokal DB kurulumu yok)
- Animasyonlu dalga arka planı dashboard layout'a eklendi (WaveBackground.tsx)
- Mini takvim: güne tıklayınca popup modal açılıyor, etkinlik görüntüleme/ekleme/silme yapılabiliyor
- Takvimde çok günlü etkinlikler: başlangıç günü chip+başlık, devam günleri w-full renkli bar
- Test altyapısı: Playwright (e2e) + API test scripti mevcut

## Mevcut Mimari Kararlar
- **Server/Client ayrımı**: Sayfa bileşenleri server, interaktif olanlar `"use client"`. `searchParams` sunucu tarafında okunup prop olarak geçilir (SSR-safe).
- **Auth**: `getServerSession` server-side, `useSession` client-side
- **API**: App Router route handlers (`route.ts`)

## Açık Teknik Borç
1. Lisans doğrulama akışı (VERIFIED statüsü) — admin paneli yok, manuel DB güncellemesi
2. İlan başvuru sistemi — rehber ilana başvurabilmeli
3. Mesajlaşma — basit ama gerçek zamanlı değil (WebSocket gerekmez mi?)
4. Arama/filtreleme — kesfet sayfaları daha güçlü olabilir
5. Bildirim sistemi — acente referans onayladığında vs. rehber haberdar olmuyor
6. Mobile responsive — şu an masaüstü öncelikli

## Sonraki Önerilen Adımlar (öncelik sırası)
1. İlan başvuru sistemi (acente-rehber match)
2. Bildirim sistemi (in-app veya email)
3. Admin paneli (lisans onay)
4. Arama güçlendirme
5. Mobile iyileştirme

## Diğer Ajanlara Notlar
- **Backend**: Referans sistemi çalışıyor ama `prisma.referans` lokal'de hata veriyor — Railway'de sorun yok
- **QA**: Playwright kurulumu var, WSL2 sistem kütüphanesi eksik, kullanıcı `sudo apt-get install` yapınca çalışır
- **DevOps**: GitHub token'ında `workflow` scope'u yok — CI workflow dosyası push edilemiyor
- **UX**: Animasyonlu dalga arka plan eklendi, kartlar üzerinde okunabilirlik iyi görünüyor
