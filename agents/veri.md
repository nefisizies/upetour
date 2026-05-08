# Veri Mühendisi Ajanı

> Veritabanı şema tasarımı, sorgular, migration'lar, veri analizi.
> Son güncelleme: 2026-05-06

## Kimim
Prisma şemasını optimize ederim. Migration SQL yazarım. Veri erişim katmanını tasarlarım.

## ✅ Mevcut Şema (güncel)

### Ana Tablolar
```sql
User            (id, email, role, passwordHash, createdAt)
RehberProfile   (id, userId, slug, name, city, bio, photoUrl,
                 specialties[], operatingCountries[], experienceYears, isAvailable)
RehberDil       (id, rehberId, dil, seviye, sertifika)
RehberLisans    (id, rehberId, country, licenseNo, status: PENDING|VERIFIED)
TakvimEtkinlik  (id, rehberId, baslik, baslangic, bitis, notlar, tur)
Referans        (id, rehberId, acenteId, durum: BEKLIYOR|ONAYLANDI|REDDEDILDI)
AcenteProfile   (id, userId, slug, companyName, city, logoUrl, website)
AcenteRehberBlok (id, acenteId, rehberId, createdAt)  ← Poyraz ekledi
Ilan            (id, acenteId, title, description, location, languages[], budget, isActive)
Message         (id, fromUserId, toUserId, content, isRead, createdAt)
Review          (id, reviewerId, revieweeId, puan, yorum, createdAt)
```

**Önemli**: `Message` modeli `fromUserId`/`toUserId` kullanıyor (eski schema'da `senderId`/`receiverId` vardı — güncel değil).

## Migration Prosedürü
**LOKAL DB YOK** — migration'lar doğrudan Railway'e uygulanır.
1. `prisma/migrations/YYYYMMDD_aciklama.sql` oluştur
2. `prisma/schema.prisma`'ya model ekle
3. Railway'e push et — `prisma generate` otomatik çalışır
4. SQL migration'ı Railway dashboard → Postgres → Query Editor'dan uygula

## 🔴 Planlanmış Şema Değişiklikleri

### 1. İlan Başvuru Sistemi (öncelikli)
```sql
CREATE TABLE "IlanBasvuru" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "ilanId" TEXT NOT NULL REFERENCES "Ilan"("id"),
  "rehberId" TEXT NOT NULL REFERENCES "User"("id"),
  "durum" TEXT NOT NULL DEFAULT 'BEKLIYOR', -- BEKLIYOR|KABUL|RED
  "mesaj" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("id"),
  UNIQUE ("ilanId", "rehberId")  -- aynı rehber aynı ilana 2 kez başvuramasın
);
```

Prisma model:
```prisma
model IlanBasvuru {
  id        String   @id @default(cuid())
  ilanId    String
  rehberId  String
  durum     String   @default("BEKLIYOR")
  mesaj     String?
  createdAt DateTime @default(now())
  ilan      Ilan     @relation(fields: [ilanId], references: [id])
  rehber    User     @relation(fields: [rehberId], references: [id])
  @@unique([ilanId, rehberId])
}
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

## İndeks Önerileri (henüz uygulanmamış)
```sql
CREATE INDEX idx_rehber_profile_slug ON "RehberProfile"(slug);
CREATE INDEX idx_takvim_rehber_dates ON "TakvimEtkinlik"("rehberId", "baslangic");
CREATE INDEX idx_message_conversation ON "Message"("fromUserId", "toUserId", "createdAt");
CREATE INDEX idx_ilan_active ON "Ilan"("isActive");
```

## Takvim Multi-Day Query Logic
`/api/takvim` GET endpoint'i için:
- `baslangic <= ay_bitis AND bitis >= ay_baslangic` filtresi
- Her event için tüm günleri ayrı entry döner (pozisyon: baslangic/devam/bitis/tekgun)

## ⚡ Dikkat: Şema Senkronizasyonu
Poyraz `feature/acente` branch'inde şemaya model ekleyebilir.
Main'e merge ederken `prisma/schema.prisma` çakışma riski var.
Conflict → `git checkout --theirs prisma/schema.prisma` ile Poyraz'ın versiyonunu al,
sonra eklenmeyen kendi modellerini manuel geri ekle.

## Diğer Ajanlara Notlar
- **Backend**: Yeni tablo gerekince önce bana gelsin, şema + migration birlikte tasarlayalım
- **DevOps**: Migration SQL'leri Railway'de manuel uygula, sonra push et
- **Güvenlik**: `IlanBasvuru` için row-level check — rehber sadece kendi başvurularını görmeli
