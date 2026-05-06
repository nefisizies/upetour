"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function GirisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const rol = searchParams.get("rol"); // "rehber" | "acente" | null

  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c0500" }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
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
    if (result?.error) setError("Email veya şifre hatalı.");
  }

  const isRehber = rol === "rehber";
  const isAcente = rol === "acente";

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>

      {/* Sol — görsel panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: isAcente
              ? "url(https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80)"
              : "url(https://images.unsplash.com/photo-1569958132716-89b39cf2c4f1?w=1200&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, transparent), transparent 60%)" }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="md" darkBg href="/" />
          <div>
            <div className="flex items-center gap-3 mb-4">
              {isAcente ? <Building2 className="w-8 h-8" style={{ color: "var(--primary)" }} /> : <Compass className="w-8 h-8" style={{ color: "var(--primary)" }} />}
              <span className="text-sm font-medium text-white/60 uppercase tracking-widest">
                {isAcente ? "Acente Girişi" : isRehber ? "Rehber Girişi" : "Giriş"}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3">
              {isAcente ? "Acentenizi Yönetin" : isRehber ? "Kariyerinizi Yönetin" : "Hoş Geldiniz"}
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-sm">
              {isAcente
                ? "İlan verin, rehber bulun, operasyonlarınızı tek platformdan yönetin."
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
            {isAcente ? "Acente hesabınıza giriş yapın" : isRehber ? "Rehber hesabınıza giriş yapın" : "Hesabınıza erişin"}
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
          </div>

        </div>
      </div>

    </div>
  );
}
