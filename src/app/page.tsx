import Link from "next/link";
import { Compass, Building2, Star, MessageCircle, Shield, Zap, MapPin, Users, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeroSlider } from "@/components/HeroSlider";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [rehberCount, acenteCount] = await Promise.all([
    prisma.rehberProfile.count(),
    prisma.acenteProfile.count(),
  ]);

  return (
    <div className="min-h-screen bg-stone-950 text-white">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)" }}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Logo size="md" darkBg />

          <div className="flex items-center gap-2">
            <Link href="/giris?rol=rehber"
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
              <Compass className="w-4 h-4" />
              <span className="hidden sm:block">Rehber Girişi</span>
            </Link>
            <Link href="/giris?rol=acente"
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:block">Acente Girişi</span>
            </Link>
            <Link href="/giris/admin"
              className="text-xs text-white/30 hover:text-white/60 px-3 py-2 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <HeroSlider />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20"
            style={{ background: "rgba(224,123,57,0.25)", backdropFilter: "blur(8px)" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Türkiye&apos;nin Tur Profesyonelleri Burada
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Rehberler ve Acenteler
            <br />
            <span style={{ color: "var(--primary)" }}>Tek Platformda</span> Buluşuyor
          </h1>

          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tur rehberlerini keşfet, doğrudan iletişim kur.
            Seyahat sektörünün freelancer platformu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kayit?rol=REHBER"
              className="group flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl transition-all text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "var(--primary)" }}>
              <Compass className="w-5 h-5" />
              Rehber Olarak Katıl
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/kayit?rol=ACENTE"
              className="group flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl transition-all border border-white/30 hover:bg-white/10 hover:-translate-y-0.5">
              <Building2 className="w-5 h-5" />
              Acente Olarak Katıl
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 -mt-1" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-2 divide-x divide-white/10">
          {[
            { value: rehberCount > 10 ? `${rehberCount}+` : rehberCount, label: "Kayıtlı Rehber", icon: Compass },
            { value: acenteCount > 10 ? `${acenteCount}+` : acenteCount, label: "Seyahat Acentesi", icon: Building2 },
          ].map((s) => (
            <div key={s.label} className="text-center px-4 py-2">
              <s.icon className="w-5 h-5 mx-auto mb-2 opacity-60" style={{ color: "var(--primary)" }} />
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4" style={{ background: "linear-gradient(to bottom, #0c0500, #1a0900)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Neden RehberSepeti?</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Hem rehberler hem acenteler için özel olarak tasarlanmış araçlar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Rol Bazlı Profiller", desc: "Rehber ve acente profili tamamen farklı. Her rol için özel dashboard ve araçlar." },
              { icon: MapPin, title: "Konum & Uzmanlık", desc: "Şehir, dil, uzmanlık ve müsaitliğe göre rehber ara. Dakikalar içinde bul." },
              { icon: MessageCircle, title: "Doğrudan Mesajlaşma", desc: "Aracısız iletişim. Rehberle veya acente ile direkt görüş." },
              { icon: Star, title: "Değerlendirme Sistemi", desc: "Her tur sonrası yorum ve puan. Güven inşa et, referans kazan." },
              { icon: Shield, title: "Doğrulanmış Profiller", desc: "Lisans ve belge doğrulama ile sahte hesapları önle." },
              { icon: Zap, title: "Doğrudan İletişim", desc: "İlan açmadan direkt rehbere mesaj at. Hızlı ve kolay." },
            ].map((f) => (
              <div key={f.title}
                className="group p-6 rounded-2xl border border-white/8 hover:border-white/20 transition-all hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
                  <f.icon className="w-6 h-6" style={{ color: "var(--primary)" }} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Cards ── */}
      <section className="py-24 px-4" style={{ background: "#0c0500" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Hemen Başla</h2>
            <p className="text-white/50">Ücretsiz üye ol, profilini oluştur, işleri büyüt.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Rehber Kartı */}
            <Link href="/kayit?rol=REHBER"
              className="group relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between min-h-72 transition-transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url(https://images.unsplash.com/photo-1569958132716-89b39cf2c4f1?w=800&q=80)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 40%, transparent), transparent)" }} />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "color-mix(in srgb, var(--primary) 30%, transparent)", backdropFilter: "blur(8px)", border: "1px solid color-mix(in srgb, var(--primary) 50%, transparent)" }}>
                  <Compass className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Tur Rehberi</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Profilini oluştur, uzmanlıklarını listele, acentelerden teklifler al.
                  Kendi takvimini yönet, müşterilerle doğrudan iletişim kur.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-2 font-semibold text-white mt-6">
                Rehber Olarak Katıl
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" style={{ color: "var(--primary)" }} />
              </div>
            </Link>

            {/* Acente Kartı */}
            <Link href="/kayit?rol=ACENTE"
              className="group relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between min-h-72 transition-transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url(https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.3), transparent)" }} />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Seyahat Acentesi</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  İlan ver, binlerce rehber arasından seç. Seyahat operasyonlarını
                  tek platformdan yönet, güvenilir rehberlerle çalış.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-2 font-semibold text-white mt-6">
                Acente Olarak Katıl
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform text-white/70" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-8 px-4" style={{ background: "#080300" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" darkBg />
          <p className="text-sm text-white/30">© 2025 RehberSepeti. Tüm hakları saklıdır.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/giris?rol=rehber" className="hover:text-white/70 transition-colors">Rehber Girişi</Link>
            <Link href="/giris?rol=acente" className="hover:text-white/70 transition-colors">Acente Girişi</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
