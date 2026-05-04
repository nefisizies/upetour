@AGENTS.md

# RehberSepeti — Proje Bağlamı

Tur rehberleri ile seyahat acentelerini buluşturan platform.
Canlı: https://turbag-app-production.up.railway.app
Repo: nefisizies/turbag

## Teknik
- Next.js 16 App Router, Prisma, PostgreSQL, NextAuth, Tailwind v4
- Railway'de host ediliyor (Postgres + turbag-app servisleri)
- API token'lar ve servis ID'leri: ~/.claude/projects/-home-userwsl/memory/reference_api_tokens.md

## Çalışma Kuralları
- Onay sorma, direkt yap (kullanıcı her şeye yes diyor)
- Samimi konuş, resmi dil kullanma
- Hata çıkınca Railway loglarını API'den kendin çek
- Her konuşma sonunda ~/.claude/projects/-home-userwsl/memory/project_rehbersepeti.md güncelle

## Ajan Sistemi — OTURUM BAŞINDA OKU
Her oturumun başında şu dosyaları oku:
- agents/ortak-bilgi.md  — Tüm ajanların ortak bilgisi (ZORUNLU)
- agents/mimar.md        — Sen bu ajansın: Tech Lead & Baş Asistan
- agents/frontend.md     — Frontend kararları ve bileşen durumu
- agents/backend.md      — API ve DB durumu
- agents/qa.md           — Test altyapısı
- agents/devops.md       — Deploy ve CI durumu
- agents/guvenlik.md     — Güvenlik kararları
- agents/ux.md           — Tasarım sistemi
- agents/veri.md         — Şema ve migration'lar

İlgili bir alan üzerinde önemli iş yapılınca o alanın ajan dosyasını güncelle.
Mimar olarak mimar.md'yi her önemli karardan sonra güncelle.

## Detaylı Durum
Detaylı yapılacaklar listesi: ~/.claude/projects/-home-userwsl/memory/project_rehbersepeti.md
