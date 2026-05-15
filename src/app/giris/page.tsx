"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, Building2, Shield, Eye, EyeOff, ArrowLeft, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/Logo";

// localStorage key'i rol bazlı — her rol bağımsız
function rolKey(rol: string | null) {
  return `remember_email_${rol ?? "genel"}`;
}

function GirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const rol = searchParams.get("rol"); // "rehber" | "acente" | null

  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sayfa yüklenince bu rol için kaydedilmiş email'i yükle
  useEffect(() => {
    const savedEmail = localStorage.getItem(rolKey(rol));
    if (savedEmail) {
      setForm((f) => ({ ...f, email: savedEmail }));
      setRememberMe(true);
    }
  }, [rol]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#051214" }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // Zaten giriş yapılmışsa → sadece aynı rol istiyorsa "zaten giriş yapıldı" ekranı göster
  // Farklı rol istiyorsa (örn. rehber girişli iken admin sayfasına gidince) login formu göster
  const sessionRolMatch = status === "authenticated" && session && (
    (rol === "rehber" && session.user.role === "REHBER") ||
    (rol === "acente" && session.user.role === "ACENTE") ||
    (rol === "admin" && session.user.role === "ADMIN") ||
    (!rol)
  );

  if (sessionRolMatch && session) {
    const roleLabel = session.user.role === "REHBER" ? "Rehber" : session.user.role === "ACENTE" ? "Acente" : "Admin";
    const dashHref = session.user.role === "REHBER" ? "/dashboard/rehber" : session.user.role === "ACENTE" ? "/dashboard/acente" : "/dashboard/admin";
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #051214 0%, #0A1628 50%, #051214 100%)" }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <Logo size="md" darkBg href="/" className="justify-center" />
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-lg font-bold"
              style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}>
              {session.user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">{roleLabel} olarak giriş yapılmış</p>
              <p className="font-semibold text-white">{session.user.email}</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link href={dashHref}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: "var(--primary)", color: "white" }}>
                <LayoutDashboard className="w-4 h-4" /> Panele Devam Et
              </Link>
              <button
                onClick={() => signOut({ redirect: false }).then(() => router.refresh())}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>
                <LogOut className="w-4 h-4" /> Farklı Hesapla Giriş Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      rememberMe: String(rememberMe),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Email veya şifre hatalı.");
      return;
    }
    if (rememberMe) {
      localStorage.setItem(rolKey(rol), form.email);
    } else {
      localStorage.removeItem(rolKey(rol));
    }
    // Giriş başarılı — rol'e göre panele yönlendir
    if (isAdmin) router.push("/dashboard/admin");
    else if (isAcente) router.push("/dashboard/acente");
    else if (isRehber) router.push("/dashboard/rehber");
    else router.push("/dashboard");
  }

  const isRehber = rol === "rehber";
  const isAcente = rol === "acente";
  const isAdmin = rol === "admin";

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #051214 0%, #0A1628 50%, #051214 100%)" }}>

      {/* Sol — görsel panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: isAcente
              ? "url(https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80)"
              : isAdmin
              ? "url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80)"
              : "url(https://images.unsplash.com/photo-1569958132716-89b39cf2c4f1?w=1200&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, transparent), transparent 60%)" }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="md" darkBg href="/" />
          <div>
            <div className="flex items-center gap-3 mb-4">
              {isAcente ? <Building2 className="w-8 h-8" style={{ color: "var(--primary)" }} /> : isAdmin ? <Shield className="w-8 h-8" style={{ color: "var(--primary)" }} /> : <Compass className="w-8 h-8" style={{ color: "var(--primary)" }} />}
              <span className="text-sm font-medium text-white/60 uppercase tracking-widest">
                {isAcente ? "Acente Girişi" : isAdmin ? "Admin Girişi" : isRehber ? "Rehber Girişi" : "Giriş"}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3">
              {isAcente ? "Acentenizi Yönetin" : isAdmin ? "Yönetim Paneli" : isRehber ? "Kariyerinizi Yönetin" : "Hoş Geldiniz"}
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-sm">
              {isAcente
                ? "İlan verin, rehber bulun, operasyonlarınızı tek platformdan yönetin."
                : isAdmin
                ? "Platform yönetimi, kullanıcı denetimi ve içerik moderasyonu."
                : isRehber
                ? "Profilinizi güncelleyin, takvimınızı yönetin, acentelerle iletişim kurun."
                : "Türkiye'nin tur profesyonelleri platformuna hoş geldiniz."}
            </p>
          </div>
        </div>
      </div>

      {/* Sağ — form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Logo size="md" darkBg href="/" className="justify-center" />
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ana sayfa
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1">Giriş Yap</h1>
          <p className="text-sm text-white/40 mb-8">
            {isAcente ? "Acente hesabınıza giriş yapın" : isAdmin ? "Admin hesabınıza giriş yapın" : isRehber ? "Rehber hesabınıza giriş yapın" : "Hesabınıza erişin"}
          </p>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-6 text-sm border"
              style={{ background: "rgba(220,38,38,0.1)", borderColor: "rgba(220,38,38,0.3)", color: "#fca5a5" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-white/60">Şifre</label>
                <Link href="/sifremi-unuttum" className="text-xs hover:underline" style={{ color: "var(--primary)" }}>
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: "var(--primary)" }}
              />
              <label htmlFor="rememberMe" className="text-sm text-white/50 cursor-pointer select-none">
                Beni hatırla <span className="text-white/25">({rememberMe ? "30 gün" : "1 gün"})</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl transition-all disabled:opacity-50 hover:brightness-110 text-white mt-2"
              style={{ background: "var(--primary)" }}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          {/* Kayıt linkleri */}
          <div className="mt-8 pt-6 border-t border-white/8">
            <p className="text-xs text-center text-white/30 mb-4">Hesabın yok mu?</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/kayit?rol=REHBER"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all group">
                <Compass className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" style={{ color: "color-mix(in srgb, var(--primary) 60%, transparent)" }} />
                <span className="text-xs font-medium text-white/40 group-hover:text-white/70 transition-colors">Rehber Kaydı</span>
              </Link>
              <Link href="/kayit?rol=ACENTE"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all group">
                <Building2 className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
                <span className="text-xs font-medium text-white/40 group-hover:text-white/70 transition-colors">Acente Kaydı</span>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <Link href="/dashboard/admin" className="text-xs text-white/20 hover:text-white/50 transition-colors">
                Admin Girişi
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense>
      <GirisForm />
    </Suspense>
  );
}
