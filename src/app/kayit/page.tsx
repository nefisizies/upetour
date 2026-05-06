"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Compass, Building2, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";

function KayitForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rolParam = params.get("rol") === "ACENTE" ? "ACENTE" : params.get("rol") === "REHBER" ? "REHBER" : null;

  const [seciliRol, setSeciliRol] = useState<"REHBER" | "ACENTE" | null>(rolParam);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!seciliRol) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: seciliRol }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Bir hata oluştu.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push(seciliRol === "REHBER" ? "/dashboard/rehber/profil?yeni=1" : "/dashboard/acente/profil?yeni=1");
    router.refresh();
  }

  if (!seciliRol) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>
        <Logo size="md" darkBg className="mb-10" />
        <p className="text-sm text-white/40 mb-8 uppercase tracking-wider">Nasıl katılmak istiyorsunuz?</p>
        <div className="grid sm:grid-cols-2 gap-4 w-full max-w-md">
          <button
            onClick={() => setSeciliRol("REHBER")}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border transition-all hover:-translate-y-1 group"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors"
              style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
              <Compass className="w-7 h-7" style={{ color: "var(--primary)" }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">Tur Rehberi</p>
              <p className="text-xs text-white/40 mt-1">Profilini oluştur, acentelerden teklif al</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
          </button>

          <button
            onClick={() => setSeciliRol("ACENTE")}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border transition-all hover:-translate-y-1 group"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <Building2 className="w-7 h-7 text-white/70" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">Seyahat Acentesi</p>
              <p className="text-xs text-white/40 mt-1">İlan aç, rehberlerden başvuru al</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
          </button>
        </div>

        <p className="text-sm text-white/30 mt-8">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>Giriş Yap</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>
      <Logo size="md" darkBg className="mb-8" />
      <div className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl"
          style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
            {seciliRol === "REHBER"
              ? <Compass className="w-4 h-4" style={{ color: "var(--primary)" }} />
              : <Building2 className="w-4 h-4" style={{ color: "var(--primary)" }} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>
              {seciliRol === "REHBER" ? "Tur Rehberi" : "Seyahat Acentesi"}
            </p>
            <p className="text-xs text-white/40">olarak kaydoluyorsunuz</p>
          </div>
          <button onClick={() => setSeciliRol(null)}
            className="text-xs text-white/30 hover:text-white/60 flex items-center gap-0.5 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Değiştir
          </button>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              {seciliRol === "REHBER" ? "Adınız Soyadınız" : "Şirket Adı"}
            </label>
            <input type="text" name="name" autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              placeholder={seciliRol === "REHBER" ? "Ali Yılmaz" : "ABC Turizm Ltd."}
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
            <input type="email" name="email" autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              placeholder="ornek@email.com"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Şifre</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} name="password" autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                placeholder="Min. 8 karakter"
                minLength={8}
                required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full font-semibold py-3 rounded-xl transition-all disabled:opacity-50 hover:brightness-110 text-white"
            style={{ background: "var(--primary)" }}>
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-sm text-center text-white/30 mt-6">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}

export default function KayitPage() {
  return (
    <Suspense>
      <KayitForm />
    </Suspense>
  );
}
