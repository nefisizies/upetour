"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Compass, Building2 } from "lucide-react";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";

function KayitForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("rol") === "ACENTE" ? "ACENTE" : "REHBER";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole as "REHBER" | "ACENTE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Logo className="mb-8" size="md" />
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Hesap Oluştur</h1>
        <p className="text-sm text-gray-500 mb-6">Rol seç ve üye ol</p>

        {/* Rol Seçimi */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["REHBER", "ACENTE"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({ ...form, role: r })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.role === r
                  ? "border-[#0a7ea4] bg-[#0a7ea4]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {r === "REHBER" ? (
                <Compass className={`w-6 h-6 ${form.role === r ? "text-[#0a7ea4]" : "text-gray-400"}`} />
              ) : (
                <Building2 className={`w-6 h-6 ${form.role === r ? "text-[#0a7ea4]" : "text-gray-400"}`} />
              )}
              <span className={`text-sm font-medium ${form.role === r ? "text-[#0a7ea4]" : "text-gray-500"}`}>
                {r === "REHBER" ? "Tur Rehberi" : "Seyahat Acentesi"}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.role === "REHBER" ? "Adınız Soyadınız" : "Şirket Adı"}
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
              placeholder={form.role === "REHBER" ? "Ali Yılmaz" : "ABC Turizm Ltd."}
              required
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
              placeholder="Min. 8 karakter"
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a7ea4] text-white font-medium py-2.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="text-[#0a7ea4] font-medium hover:underline">
            Giriş Yap
          </Link>
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
