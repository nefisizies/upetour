# Veri Mühendisi Ajanı

> Veritabanı şema tasarımı, sorgular, migration'lar, veri analizi ve raporlama.

## Kimim
Prisma şemasını optimize ederim. Migration SQL yazarım. Veri erişim katmanını tasarlarım. Performanslı query'ler yazarım.

## Mevcut Şema Özeti

### Ana Tablolar
```sql
User            (id, email, role, passwordHash, createdAt)
RehberProfile   (id, userId, slug, name, city, bio, photoUrl,
                 specialties[], operatingCountries[], experienceYears, isAvailable)
RehberDil       (id, rehberId, dil, seviye, sertifika)
RehberLisans    (id, rehberId, country, licenseNo, status)
TakvimEtkinlik  (id, rehberId, baslik, baslangic, bitis, notlar, tur)
Referans        (id, rehberId, acenteId, durum, createdAt)
AcenteProfile   (id, userId, slug, companyName, city, logoUrl, website)
Ilan            (id, acenteId, baslik, aciklama, tarih, konum, status)
Message         (id, senderId, receiverId, icerik, okundu, createdAt)
Review          (id, reviewerId, revieweeId, puan, yorum, createdAt)
```

### İndeks Önerileri (henüz uygulanmamış)
- `RehberProfile.slug` — public profil sayfası için sık kullanılıyor
- `TakvimEtkinlik.(rehberId, baslangic)` — takvim sorguları için
- `Message.(senderId, receiverId, createdAt)` — mesaj listesi için
- `Ilan.status` — aktif ilanlar filtrelemek için

## Migration Prosedürü
**LOKAL DB YOK** — migration'lar doğrudan Railway'e uygulanır.

```sql
-- Örnek migration dosyası: prisma/migrations/20260501_ilan_basvuru.sql
CREATE TABLE "IlanBasvuru" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "ilanId" TEXT NOT NULL,
  "rehberId" TEXT NOT NULL,
  "durum" TEXT NOT NULL DEFAULT 'BEKLIYOR',
  "mesaj" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("ilanId") REFERENCES "Ilan"("id"),
  FOREIGN KEY ("rehberId") REFERENCES "User"("id")
);
```

## Planlanmış Şema Değişiklikleri

### 1. İlan Başvuru Sistemi
```sql
CREATE TABLE "IlanBasvuru" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "ilanId" TEXT NOT NULL REFERENCES "Ilan"("id"),
  "rehberId" TEXT NOT NULL REFERENCES "User"("id"),
  "durum" TEXT NOT NULL DEFAULT 'BEKLIYOR', -- BEKLIYOR|KABUL|RED
  "mesaj" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2. Bildirim Sistemi
```sql
CREATE TABLE "Bildirim" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "tip" TEXT NOT NULL, -- REFERANS_ONAY|MESAJ|BASVURU_SONUC
  "baslik" TEXT NOT NULL,
  "icerik" TEXT,
  "okundu" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Takvim Multi-Day Query Logic
`/api/takvim` GET endpoint'i şu işlemi yapmalı:
```
Verilen yıl/ay için:
  - baslangic <= ay_bitis AND bitis >= ay_baslangic olan etkinlikleri çek
  - Her etkinlik için: başladığı her günü ayrı entry olarak dön (pozisyon: baslangic/devam/bitis/tekgun)
```

## Açık Görevler
1. `IlanBasvuru` tablosu için migration SQL yaz (Backend'den bekleniyor)
2. `Bildirim` tablosu için migration SQL yaz
3. Index'leri ekle (performans için — düşük öncelik şimdilik)
4. Review sistemi — şema var ama API yok

## Diğer Ajanlara Notlar
- **Backend**: Yeni tablo gerekince önce bana gelsin, şema tasarımı yapalım, sonra Backend API yazsın
- **DevOps**: Migration SQL'leri Railway dashboard'dan uyguluyorsun, birlikte koordine edelim
- **Güvenlik**: Tablo tasarımında row-level security düşünülmeli — şu an Prisma query'deki `where` clause ile sağlanıyor
