# Backend Geliştirici Ajanı

> API route'ları, Prisma ORM, veritabanı şeması, auth ve iş mantığı.

## Kimim
Next.js App Router API route'larını yazarım. Prisma şemasını bilirim. Railway PostgreSQL bağlantısını yönetirim. Auth session kontrolünü doğru yaparım.

## Kritik Kurallar
- **Prisma generate**: Lokal'de `prisma.referans` gibi modeller TypeScript hatası verebilir — Railway'de `prisma generate && next build` çalışır. Lokal TS hatalarına takılma.
- **Migration'lar manuel SQL**: `prisma/migrations/` altında `.sql` dosyası yaz, `prisma migrate` çalıştırma (lokal DB yok). Railway'de manuel uygula.
- **Auth server-side**: `getServerSession(authOptions)` route handler'da kullan. Session yoksa 401 dön.
- **Sliding session YASAK**: `expiresAt` token field'ı ile kontrol edilir — session uzatma yapma.

## Mevcut API Endpoint'ler
| Endpoint | Method | Açıklama |
|----------|--------|----------|
| /api/auth/[...nextauth] | - | NextAuth handler |
| /api/takvim | GET | `?yil=&ay=` — o aya ait etkinlikler (GunEtkinlik[] formatında) |
| /api/takvim | POST | Yeni etkinlik ekle |
| /api/takvim/:id | DELETE | Etkinlik sil |
| /api/rehber/profil | GET/PUT | Rehber profil okuma/güncelleme |
| /api/upload | POST | Cloudinary upload URL üretimi |
| /api/referans | GET/POST | Referans sistemi |
| /api/ilan | GET/POST | İlan listesi/ekleme |
| /api/mesaj | GET/POST | Mesajlaşma |

## Veritabanı Modelleri (özet)
```
User: id, email, role (REHBER|ACENTE), passwordHash
RehberProfile: slug, name, city, bio, photoUrl, specialties[], isAvailable
RehberLisans: country, licenseNo, status (PENDING|VERIFIED)
TakvimEtkinlik: rehberId, baslik, baslangic, bitis, notlar, tur (MANUEL|REZERVASYON)
Referans: rehberId, acenteId, durum (BEKLIYOR|ONAYLANDI|REDDEDILDI)
AcenteProfile: slug, companyName, city, logoUrl, website
Ilan: acenteId, baslik, aciklama, tarih, konum, status
Message: senderId, receiverId, icerik, okundu
```

## Açık Görevler
1. **İlan başvuru sistemi**: Rehber → İlana başvur → Acente görür → Onay/red
2. **Bildirim sistemi**: Referans onaylandığında, mesaj geldiğinde, başvuru sonucunda bildirim
3. **Admin panel API**: Lisans VERIFIED yapma endpoint'i
4. **Arama endpoint'i güçlendirme**: Şehir, dil, uzmanlık filtresi

## Son Kararlar
- `GunEtkinlik` tipi: id, baslik, baslangic, bitis, renk, pozisyon (multi-day için)
- Takvim API'si multi-day event'leri tüm günler için ayrı entry döndürür
- Referans sistemi Railway'de çalışıyor, lokal'de Prisma hatası normal

## Bilinen Sorunlar
- `prisma.referans` lokal'de TypeScript hatası — Railway'de sorun yok
- NextAuth CSRF token flow — Node.js'ten doğrudan HTTP ile session almak zor

## Diğer Ajanlara Notlar
- **Frontend**: Multi-day event'ler için `GunEtkinlik[]` dönerken her güne ait `pozisyon` field'ını doğru set et
- **QA**: API testleri için browser oturumu (Playwright) kullanmak gerekiyor — curl ile NextAuth CSRF akışı çalışmıyor
- **DevOps**: `DATABASE_URL` Railway env'de tanımlı, başka env yoksa build fail olur
