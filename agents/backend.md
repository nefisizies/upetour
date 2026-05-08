# Backend Geliştirici Ajanı

> API route'ları, Prisma ORM, veritabanı şeması, auth ve iş mantığı.
> Son güncelleme: 2026-05-06

## Kimim
Next.js App Router API route'larını yazarım. Prisma şemasını bilirim. Railway PostgreSQL bağlantısını yönetirim.

## Kritik Kurallar
- **Prisma generate**: Lokal'de bazı modeller TypeScript hatası verebilir — Railway'de sorun olmaz.
- **Migration'lar manuel SQL**: `prisma/migrations/` altında `.sql` dosyası yaz. `prisma migrate` çalıştırma.
- **Auth server-side**: `getServerSession(authOptions)` ile kontrol. Session yoksa 401.
- **Ownership validation**: Her okuma/yazma işleminde `session.user.id` kontrolü yap (IDOR önleme).

## ✅ Mevcut API Endpoint'ler
| Endpoint | Method | Açıklama |
|----------|--------|----------|
| /api/auth/[...nextauth] | - | NextAuth handler |
| /api/takvim | GET | `?yil=&ay=` — o aya ait etkinlikler |
| /api/takvim | POST | Yeni etkinlik ekle |
| /api/takvim/:id | DELETE | Etkinlik sil |
| /api/rehber/profil | GET/PUT | Rehber profil okuma/güncelleme |
| /api/upload | POST | Cloudinary upload URL üretimi |
| /api/referans | GET/POST | Referans sistemi |
| /api/referans/:id | PUT/DELETE | Referans onay/red/silme |
| /api/ilan | GET/POST | İlan listesi/ekleme |
| /api/ilan/:id | PUT/DELETE | İlan güncelleme/silme |
| /api/mesaj | GET | `?ile=userId` — konuşma geçmişi (fromUserId + toUserId çift filtre) |
| /api/mesaj | POST | Mesaj gönder `{ toUserId, content }` — REHBER→REHBER bloklu |
| /api/mesaj/oku | POST | `{ fromUserId }` — o kişiden gelen mesajları okundu işaretle |

## Mesajlaşma İş Mantığı
```ts
// POST /api/mesaj — iş kuralı
if (gondericRol === "REHBER" && aliciRol === "REHBER") {
  return 403; // Rehberler arası mesajlaşma yasak
}
```

GET `/api/mesaj?ile=X` sorgusu:
```ts
where: {
  OR: [
    { fromUserId: session.user.id, toUserId: ile },
    { fromUserId: ile, toUserId: session.user.id },
  ],
}
```
Dönen response `mesajlar` içinde `from` objesi var (rehberProfile + acenteProfile select).

## Veritabanı Modelleri (güncel)
```
User: id, email, role (REHBER|ACENTE|ADMIN), passwordHash
RehberProfile: slug, name, city, bio, photoUrl, specialties[], isAvailable, ...
RehberDil: id, rehberId, dil, seviye, sertifika
RehberLisans: id, rehberId, country, licenseNo, status (PENDING|VERIFIED)
TakvimEtkinlik: id, rehberId, baslik, baslangic, bitis, notlar, tur (MANUEL|REZERVASYON)
Referans: id, rehberId, acenteId, durum (BEKLIYOR|ONAYLANDI|REDDEDILDI)
AcenteProfile: slug, companyName, city, logoUrl, website
AcenteRehberBlok: id, acenteId, rehberId  ← Poyraz ekledi
Ilan: id, acenteId, title, description, location, languages[], budget, isActive
Message: id, fromUserId, toUserId, content, isRead, createdAt
Review: id, reviewerId, revieweeId, puan, yorum
```

## 🔴 Açık Görevler
1. **İlan başvuru sistemi**: `IlanBasvuru` modeli yok — Veri ajanıyla koordine et
2. **Admin lisans API**: `/api/admin/lisans/:id` — status VERIFIED yapma endpoint'i yok
3. **Bildirim endpoint'i**: mesaj/referans/başvuru olaylarında in-app bildirim
4. **Mesajlaşma polling**: şu an realtime yok, client reload gerekiyor

## ⚡ Sık Yapılan Hatalar
- `prisma.message` modeli lokal'de `Message` olarak import edilebilir ama generate olmadan hata verebilir
- `/api/mesaj` GET dönen mesajlarda `createdAt` string olarak gelir (JSON serialization), client'ta `new Date(m.createdAt)` ile parse et
- Acente tarafında mesajlar: `/dashboard/acente/mesajlar` henüz yok — ileride eklenecek

## Diğer Ajanlara Notlar
- **Frontend**: `/api/mesaj` GET dönen response'ta `from.rehberProfile` ve `from.acenteProfile` her ikisi de nullable — null check yap
- **Güvenlik**: Her yeni route'ta `session.user.id === resource.ownerId` kontrolü şart
- **Veri**: `IlanBasvuru` tablosu öncelikli — şema tasarımını Veri ajanıyla konuş
