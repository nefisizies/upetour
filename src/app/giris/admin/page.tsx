"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const ADMINS = [
  { id: "uras", label: "uras", email: "uras@turbag.app", color: "#e07b39" },
  { id: "pogo", label: "pogo", email: "pogo@turbag.app", color: "#7c3aed" },
];

export default function AdminGirisPage() {
  const router = useRouter();
  const { status } = useSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const selectedAdmin = ADMINS.find((a) => a.id === selected);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAdmin) return;
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: selectedAdmin.email,
      password,
      rememberMe: "true",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Şifre hatalı.");
    }
    // session effect redirect handled on dashboard/page.tsx
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)" }}>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="md" darkBg className="justify-center mb-6" />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "rgba(124,58,237,0.15)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.3)" }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            Sistem Yöneticisi
          </div>
          <h1 className="text-xl font-bold text-white">Admin Girişi</h1>
        </div>

        {/* Admin seçimi */}
        {!selected ? (
          <div className="space-y-3">
            <p className="text-xs text-center text-white/30 mb-4 uppercase tracking-wider">Hesap seç</p>
            {ADMINS.map((admin) => (
              <button
                key={admin.id}
                onClick={() => setSelected(admin.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 text-left"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shrink-0"
                  style={{ background: `color-mix(in srgb, ${admin.color} 25%, transparent)`, border: `1px solid color-mix(in srgb, ${admin.color} 40%, transparent)` }}>
                  {admin.label[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{admin.label}</p>
                  <p className="text-xs text-white/40">{admin.email}</p>
                </div>
                <ShieldCheck className="w-4 h-4 ml-auto opacity-30" style={{ color: admin.color }} />
              </button>
            ))}

            <div className="mt-6 text-center">
              <Link href="/giris" className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Normal giriş
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Seçili admin */}
            <div className="flex items-center gap-3 p-4 rounded-2xl mb-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                style={{ background: `color-mix(in srgb, ${selectedAdmin!.color} 25%, transparent)` }}>
                {selectedAdmin!.label[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{selectedAdmin!.label}</p>
                <p className="text-xs text-white/40">{selectedAdmin!.email}</p>
              </div>
              <button onClick={() => { setSelected(null); setPassword(""); setError(""); }}
                className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Değiştir
              </button>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 mb-4 text-sm"
                style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  placeholder="Şifre"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 hover:brightness-110"
                style={{ background: selectedAdmin!.color }}
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/giris" className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Normal giriş
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
