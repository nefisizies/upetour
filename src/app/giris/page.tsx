"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Building2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function GirisPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard"); // /dashboard server-side redirect handles role (ADMIN → /dashboard/admin)
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#0a7ea4] border-t-transparent rounded-full animate-spin" /></div>;
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
    }
    // Navigation is handled by the useEffect above when status → "authenticated"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Logo className="mb-8" size="md" />
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Giriş Yap</h1>
        <p className="text-sm text-gray-500 mb-6">Hesabına erişmek için giriş yap</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
              placeholder="ornek@email.com"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Şifre</label>
              <Link href="/sifremi-unuttum" className="text-xs text-[#0a7ea4] hover:underline">
                Şifremi unuttum
              </Link>
            </div>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#0a7ea4] accent-[#0a7ea4] cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
              Beni hatırla <span className="text-gray-400 text-xs">({rememberMe ? "30 gün" : "1 gün"})</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a7ea4] text-white font-medium py-2.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400 mb-3">Hesabın yok mu? Rolünü seç:</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Link href="/kayit?rol=REHBER"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-gray-200 hover:border-[#0a7ea4] hover:bg-[#0a7ea4]/5 transition-all group">
              <Compass className="w-5 h-5 text-gray-400 group-hover:text-[#0a7ea4]" />
              <span className="text-xs font-medium text-gray-500 group-hover:text-[#0a7ea4]">Tur Rehberi</span>
            </Link>
            <Link href="/kayit?rol=ACENTE"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-gray-200 hover:border-[#0a7ea4] hover:bg-[#0a7ea4]/5 transition-all group">
              <Building2 className="w-5 h-5 text-gray-400 group-hover:text-[#0a7ea4]" />
              <span className="text-xs font-medium text-gray-500 group-hover:text-[#0a7ea4]">Seyahat Acentesi</span>
            </Link>
          </div>
          {/* Admin hint — subtle, not prominent */}
          <button
            type="button"
            onClick={() => setForm({ email: "uras@turbag.app", password: "" })}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-300 hover:text-gray-500 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Sistem Yöneticisi
          </button>
        </div>
      </div>
    </div>
  );
}
