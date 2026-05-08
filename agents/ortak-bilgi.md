# Ortak Ekip Bilgisi — RehberSepeti

> Tüm ajanlar bu dosyayı okur. Proje genelindeki kararlar ve mevcut durum burada tutulur.
> Son güncelleme: 2026-05-06

## Proje Özeti
Tur rehberleri (REHBER) ile seyahat acentelerini (ACENTE) buluşturan web platformu.
- Canlı URL: https://turbag-app-production.up.railway.app
- Repo: https://github.com/nefisizies/turbag
- Branch: `main` → Railway otomatik deploy
- Takım: Uras (frontend/genel) + Poyraz (acente özellikleri)

## Teknik Stack
- **Framework**: Next.js 16 App Router (`force-dynamic` dinamik sayfalarda)
- **ORM**: Prisma 5 + PostgreSQL (Railway Postgres servisi)
- **Auth**: NextAuth v4, JWT strategy, credentials provider
- **Stil**: Tailwind CSS v4 (`@tailwindcss/postcss` — `dependencies`'de olmalı, devDependencies'de değil)
- **Upload**: Cloudinary unsigned preset (`rehbersepeti` preset, cloud: `dkcrf1xw7`)
- **Deploy**: Railway, Nixpacks, `prisma generate && next build`

## Tasarım Sistemi — Dark Premium Theme
**Tüm sayfalar karanlık premium temaya geçirildi.** Eski light frosted-glass kullanılmıyor.

### CSS Değişkeni Sistemi
```css
:root { --primary: #0a7ea4; }  /* ThemeCustomizer ile değiştirilebilir */
```
- Hardcoded `#0a7ea4` **kullanılmaz** — her yerde `var(--primary)` kullanılır
- Opaklı varyantlar: `color-mix(in srgb, var(--primary) 20%, transparent)`

### Kart Deseni (dark glass)
```tsx
style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
className="backdrop-blur-sm rounded-2xl"
```

### Renk Sistemi
- Arka plan: `linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)` (sayfa düzeyinde)
- Başlıklar: `text-white`
- İkincil metin: `text-white/60` veya `text-white/40`
- Muted: `text-white/30`
- Yeşil badge: `text-green-400` + `rgba(34,197,94,0.1)` bg
- Mavi badge: `text-blue-400` + `rgba(96,165,250,0.1)` bg
- Amber uyarı: `text-amber-300` + `bg-amber-500/10 border border-amber-500/30`

## Klasör Yapısı (önemli)
```
src/
  app/
    api/
      mesaj/         — GET/POST mesaj, POST /oku
      ilan/          — GET/POST ilan
      referans/      — referans sistemi
      takvim/        — takvim CRUD
    dashboard/
      rehber/        — Rehber dashboard + mesajlar sayfası
      acente/        — Acente dashboard
      admin/         — Admin panel
    giris/           — Login (admin + normal)
    kayit/           — Kayıt (2-adım)
    kesfet/
      rehberler/     — Public rehber listesi
      ilanlar/       — Public ilan listesi (rehberler başvurabilir)
    rehber/[slug]/   — Public rehber profili
  components/
    MesajlarClient.tsx — Chat UI (client component)
    Logo.tsx           — var(--primary) kullanıyor
    RehberKarti.tsx    — Dark glass kart
    ThemeCustomizer.tsx — CSS değişkeni theme değiştirici
agents/              — Bu klasör
tests/e2e/           — Playwright testleri
prisma/
  schema.prisma
  migrations/
```

## Veritabanı Temel Modeller
- `User` (email, role: REHBER|ACENTE|ADMIN)
- `RehberProfile` (slug, name, city, bio, photoUrl, specialties[], operatingCountries[], experienceYears, isAvailable)
- `RehberDil` (dil, seviye, sertifika)
- `RehberLisans` (country, licenseNo, status: PENDING|VERIFIED)
- `TakvimEtkinlik` (rehberId, baslik, baslangic, bitis, notlar, tur: MANUEL|REZERVASYON)
- `Referans` (rehberId, acenteId, durum: BEKLIYOR|ONAYLANDI|REDDEDILDI)
- `AcenteProfile` (slug, companyName, city, logoUrl, website)
- `AcenteRehberBlok` (acenteId, rehberId) — Poyraz tarafından eklendi, acente rehberi bloklayabilir
- `Message` (fromUserId, toUserId, content, isRead, createdAt)
- `Review` (reviewerId, revieweeId, puan, yorum)
- `Ilan` (acenteId, title, description, location, languages[], budget, isActive)

## Kritik Kararlar (değiştirilmez)
1. Tailwind v4 kullanıyoruz — v3 syntax'ı çalışmaz
2. Migration'lar manuel SQL — lokal DB yok, Railway'de uygulanır
3. Prisma client Railway'de `prisma generate` ile üretilir — lokal TS hataları beklenen
4. `next-auth` sliding session YASAK
5. Fotoğraf upload: Cloudinary unsigned, backend'e dosya gitmez
6. Rehberler arası mesajlaşma YASAK — API seviyesinde bloklu
7. Hardcoded renk kodu YASAK — her yerde `var(--primary)` kullan

## Takım Koordinasyonu (Poyraz)
Poyraz `feature/acente` branch'inde çalışıyor, zaman zaman main'e push yapıyor.
Merge conflict beklenen dosyalar: `prisma/schema.prisma`, acente API route'ları, `AcenteReferanslar.tsx`
Conflict çözümü: `--theirs` ile Poyraz'ın değişikliklerini al (şema için)

## Bilinen Açık Sorunlar
- Playwright WSL2'de çalışmıyor (libnspr4 eksik — kullanıcı `sudo apt-get install` yapmalı)
- Admin lisans doğrulama akışı — UI yok, manuel DB güncellemesi gerekiyor
- İlan başvuru sistemi — rehber ilana başvurabilmeli (Başvuru modeli henüz yok)
- Bildirim sistemi — mesaj/referans gelince in-app bildirim yok

## Ajan Sistemi
Her ajan `agents/<rol>.md` dosyasını tutar.
Format: Kimim → Uzmanlık → Güncel Durum ✅ → Açık Görevler 🔴 → Hatırlatmalar ⚡
Her önemli işlemden sonra kendi dosyasını güncelle.
