import Link from "next/link";
import { MapPin, Users, Star, MessageCircle, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#0a7ea4]">
            TurBağ
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/giris"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
            >
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="text-sm bg-[#0a7ea4] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#065f7d] transition-colors"
            >
              Üye Ol
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a7ea4] via-[#0d8fb8] to-[#1a6b8a] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            Türkiye&apos;nin Tur Profesyonelleri Burada
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Rehberler ve Acenteler
            <br />
            <span className="text-yellow-300">Tek Platformda</span> Buluşuyor
          </h1>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Tur rehberlerini keşfet, projeler için ilan ver, doğrudan iletişim kur.
            Seyahat sektörünün freelancer platformu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kayit?rol=REHBER"
              className="bg-white text-[#0a7ea4] font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
            >
              Rehber Olarak Katıl
            </Link>
            <Link
              href="/kayit?rol=ACENTE"
              className="bg-yellow-400 text-gray-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Acente Olarak Katıl
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "500+", label: "Kayıtlı Rehber" },
            { value: "120+", label: "Seyahat Acentesi" },
            { value: "2.400+", label: "Tamamlanan Tur" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-[#0a7ea4]">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Neden TurBağ?
        </h2>
        <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
          Hem rehberler hem acenteler için özel olarak tasarlanmış araçlar
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Users className="w-6 h-6" />,
              title: "Rol Bazlı Profiller",
              desc: "Rehber profili ve acente profili tamamen farklı. Her rol için özel dashboard ve araçlar.",
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              title: "Konum & Uzmanlık Filtresi",
              desc: "Şehir, dil, uzmanlık alanı ve müsaitlik durumuna göre rehber ara.",
            },
            {
              icon: <MessageCircle className="w-6 h-6" />,
              title: "Doğrudan Mesajlaşma",
              desc: "Aracısız iletişim. Rehberle veya acente ile direkt görüş.",
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: "Değerlendirme Sistemi",
              desc: "Her tur sonrası yorum ve puan bırak. Güven inşa et.",
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Doğrulanmış Profiller",
              desc: "Lisans ve belge doğrulama ile sahte hesapları önle.",
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: "İlan & Başvuru",
              desc: "Acenteler ilan açar, rehberler başvurur. Hızlı ve kolay.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-[#0a7ea4]/10 text-[#0a7ea4] rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a7ea4] text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Hemen Başla</h2>
        <p className="text-blue-100 mb-8 max-w-md mx-auto">
          Ücretsiz üye ol, profilini oluştur, işleri büyüt.
        </p>
        <Link
          href="/kayit"
          className="inline-block bg-white text-[#0a7ea4] font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Ücretsiz Kayıt Ol
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2025 TurBağ. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
