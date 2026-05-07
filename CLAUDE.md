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
- Her konuşma BAŞINDA ajan dosyalarını oku ve kullanıcıya "okudum, şu an şu durumdasın" diye kısa özet geç
- Her konuşma SONUNDA ~/.claude/projects/-home-userwsl/memory/project_rehbersepeti.md güncelle ve agents/ dosyalarını güncelle

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

## OTURUM BAŞI AKTİF DENETİM — ZORUNLU

Her oturum başladığında kullanıcı bir şey sormadan önce şunları yap:

### 1. Railway Deploy Durumu
Token ve servis ID'leri: `~/.claude/projects/-home-userwsl/memory/reference_api_tokens.md` dosyasından oku.
Railway GraphQL API ile son deploy durumunu çek:
- FAILED/CRASHED → hemen log'u çek, kullanıcıya rapor et
- SUCCESS → devam et

### 2. Canlı Site Erişim Kontrolü
```bash
curl -s -o /dev/null -w "%{http_code}" https://turbag-app-production.up.railway.app
```
- 200 değilse kullanıcıya bildir

### 3. GitHub Actions Son Çalışma
GitHub token: `~/.claude/projects/-home-userwsl/memory/reference_api_tokens.md`
GitHub API ile son Actions çalışmasını sorgula:
- conclusion: failure → hemen rapor et

### 4. Son Push'tan Bu Yana Değişmemiş Açık Sorunlar
agents/qa.md ve agents/ux.md dosyalarındaki "Açık Görevler" listesini oku.
Kritik olanları (kullanıcı deneyimini bozan) kullanıcıya özet geç.

**Denetim sonucu temizse:** "Sistem sağlıklı, deploy başarılı." de ve devam et.
**Sorun varsa:** Önce sorunları rapor et, sonra kullanıcının isteğini al.

## Her Push Sonrası
Her `git push`'tan sonra Railway deploy'u izle (15s aralıkla, maks 6dk).
SUCCESS → bildir. FAILED → log'u çek, hatayı bul, düzelt, tekrar push et.

## Detaylı Durum
Detaylı yapılacaklar listesi: ~/.claude/projects/-home-userwsl/memory/project_rehbersepeti.md
