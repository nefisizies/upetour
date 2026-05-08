"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

const DILLER = ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Rusça", "Arapça", "İspanyolca", "Çince", "Japonca", "İtalyanca"];

export default function YeniIlanPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", location: "", budget: "" });
  const [diller, setDiller] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleDil(dil: string) {
    setDiller(prev => prev.includes(dil) ? prev.filter(d => d !== dil) : [...prev, dil]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Başlık zorunlu"); return; }
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/ilan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, languages: diller }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      router.push("/dashboard/acente/ilanlar");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6" data-layout="dashboard">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/acente/ilanlar" className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>Yeni İlan</h1>
      </div>

      <form onSubmit={submit} className="rounded-2xl p-6 space-y-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--text-muted, #94a3b8)" }}>Başlık *</label>
          <input
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary, #f1f5f9)" }}
            placeholder="örn. İstanbul Avrupa yakası için İngilizce rehber"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--text-muted, #94a3b8)" }}>Açıklama</label>
          <textarea
            rows={4}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary, #f1f5f9)" }}
            placeholder="İhtiyaçlarınızı, çalışma koşullarını, beklentilerinizi yazın..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-muted, #94a3b8)" }}>Konum</label>
            <input
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary, #f1f5f9)" }}
              placeholder="İstanbul, Kapadokya..."
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-muted, #94a3b8)" }}>Bütçe / Ücret</label>
            <input
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary, #f1f5f9)" }}
              placeholder="500-800 $/gün"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "var(--text-muted, #94a3b8)" }}>Dil Gereksinimleri</label>
          <div className="flex flex-wrap gap-2">
            {DILLER.map(dil => (
              <button
                key={dil}
                type="button"
                onClick={() => toggleDil(dil)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={diller.includes(dil)
                  ? { background: "var(--primary)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--text-muted, #94a3b8)" }}
              >
                {dil}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          {loading ? "Oluşturuluyor..." : "İlanı Yayınla"}
        </button>
      </form>
    </div>
  );
}
