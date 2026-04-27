@AGENTS.md

# RehberSepeti — Proje Bağlamı

Tur rehberleri ile seyahat acentelerini buluşturan platform.
Canlı: https://turbag-app-production.up.railway.app
Repo: nefisizies/turbag

## Teknik
- Next.js 16 App Router, Prisma, PostgreSQL, NextAuth, Tailwind
- Railway'de host ediliyor (Postgres + turbag-app servisleri)
- API token'lar ve servis ID'leri: ~/.claude/projects/-home-userwsl/memory/reference_api_tokens.md

## Çalışma Kuralları
- Onay sorma, direkt yap (kullanıcı her şeye yes diyor)
- Samimi konuş, resmi dil kullanma
- Hata çıkınca Railway loglarını API'den kendin çek
- Her konuşma sonunda ~/.claude/projects/-home-userwsl/memory/project_rehbersepeti.md güncelle

## Mevcut Durum
Kayıt sistemi çalışıyor. Sıradaki: kayıt sonrası rehber profil tamamlama sayfası.
Detaylı yapılacaklar listesi: ~/.claude/projects/-home-userwsl/memory/project_rehbersepeti.md
