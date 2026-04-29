"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Compass, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

function KayitForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rolParam = params.get("rol") === "ACENTE" ? "ACENTE" : params.get("rol") === "REHBER" ? "REHBER" : null;

  const [seciliRol, setSeciliRol] = useState<"REHBER" | "ACENTE" | null>(rolParam);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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

  // Adım 1 — Rol seçimi
  if (!seciliRol) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <Logo className="mb-10" size="md" />
        <p className="text-gray-500 text-sm mb-8">Nasıl katılmak istiyorsunuz?</p>
        <div className="grid sm:grid-cols-2 gap-4 w-full max-w-md">
          <button
            onClick={() => setSeciliRol("REHBER")}
            className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#0a7ea4] hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 bg-[#0a7ea4]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0a7ea4]/20 transition-colors">
              <Compass className="w-7 h-7 text-[#0a7ea4]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Tur Rehberi</p>
              <p className="text-xs text-gray-400 mt-1">Profilini oluştur, acentelerden teklif al</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0a7ea4] transition-colors" />
          </button>

          <button
            onClick={() => setSeciliRol("ACENTE")}
            className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#0a7ea4] hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 bg-[#0a7ea4]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0a7ea4]/20 transition-colors">
              <Building2 className="w-7 h-7 text-[#0a7ea4]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Seyahat Acentesi</p>
              <p className="text-xs text-gray-400 mt-1">İlan aç, rehberlerden başvuru al</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0a7ea4] transition-colors" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="text-[#0a7ea4] font-medium hover:underline">Giriş Yap</Link>
        </p>
      </div>
    );
  }

  // Adım 2 — Form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Logo className="mb-8" size="md" />
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Seçili rol göstergesi */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-[#0a7ea4]/5 rounded-xl">
          <div className="w-8 h-8 bg-[#0a7ea4]/10 rounded-lg flex items-center justify-center shrink-0">
            {seciliRol === "REHBER"
              ? <Compass className="w-4 h-4 text-[#0a7ea4]" />
              : <Building2 className="w-4 h-4 text-[#0a7ea4]" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#0a7ea4]">
              {seciliRol === "REHBER" ? "Tur Rehberi" : "Seyahat Acentesi"}
            </p>
            <p className="text-xs text-gray-400">olarak kaydoluyorsunuz</p>
          </div>
          <button onClick={() => setSeciliRol(null)}
            className="text-xs text-gray-400 hover:text-[#0a7ea4] flex items-center gap-0.5 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Değiştir
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {seciliRol === "REHBER" ? "Adınız Soyadınız" : "Şirket Adı"}
            </label>
            <input type="text" name="name" autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
              placeholder={seciliRol === "REHBER" ? "Ali Yılmaz" : "ABC Turizm Ltd."}
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
              placeholder="ornek@email.com"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input type="password" name="password" autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] focus:border-transparent"
              placeholder="Min. 8 karakter"
              minLength={8}
              required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#0a7ea4] text-white font-medium py-2.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60">
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="text-[#0a7ea4] font-medium hover:underline">Giriş Yap</Link>
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
