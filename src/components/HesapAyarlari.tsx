"use client";

import { useState } from "react";
import { KeyRound, Mail, Eye, EyeOff, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export function HesapAyarlari({ mevcutEmail, adminMode = false }: { mevcutEmail: string; adminMode?: boolean }) {
  const [acik, setAcik] = useState(false);
  const [form, setForm] = useState({
    mevcutSifre: "",
    yeniEmail: "",
    yeniSifre: "",
    yeniSifreTekrar: "",
  });
  const [goster, setGoster] = useState({ mevcut: false, yeni: false });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<{ ok: boolean; mesaj: string } | null>(null);

  async function kaydet() {
    setSonuc(null);

    if (!form.mevcutSifre) {
      setSonuc({ ok: false, mesaj: "Mevcut şifreni girmeden değişiklik yapamazsın" });
      return;
    }
    if (form.yeniSifre && form.yeniSifre !== form.yeniSifreTekrar) {
      setSonuc({ ok: false, mesaj: "Yeni şifreler eşleşmiyor" });
      return;
    }
    if (!form.yeniEmail && !form.yeniSifre) {
      setSonuc({ ok: false, mesaj: "Değiştirmek istediğin bir şey yok" });
      return;
    }

    setYukleniyor(true);
    const res = await fetch("/api/hesap", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mevcutSifre: form.mevcutSifre,
        yeniEmail: form.yeniEmail || undefined,
        yeniSifre: form.yeniSifre || undefined,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setSonuc({ ok: true, mesaj: "Değişiklikler kaydedildi. Yeni bilgilerle tekrar giriş yapman gerekebilir." });
      setForm({ mevcutSifre: "", yeniEmail: "", yeniSifre: "", yeniSifreTekrar: "" });
    } else {
      setSonuc({ ok: false, mesaj: data.error || "Bir hata oluştu" });
    }
    setYukleniyor(false);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Hesap Güvenliği</p>
            <p className="text-xs text-gray-400">E-posta ve şifre değiştir</p>
          </div>
        </div>
        {acik ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {acik && (
        <div className="px-6 pb-6 border-t border-gray-50 pt-4 space-y-4">

          {/* Mevcut e-posta göster */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-500">Mevcut e-posta:</span>
            <span className="text-sm font-medium text-gray-700">{mevcutEmail}</span>
          </div>

          {/* Mevcut şifre */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Mevcut Şifre <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={goster.mevcut ? "text" : "password"}
                value={form.mevcutSifre}
                onChange={(e) => setForm({ ...form, mevcutSifre: e.target.value })}
                placeholder="Mevcut şifreni gir"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
              />
              <button
                type="button"
                onClick={() => setGoster({ ...goster, mevcut: !goster.mevcut })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {goster.mevcut ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3">Değiştirmek istediklerini doldur (ikisini de değiştirebilirsin)</p>

            {/* Yeni e-posta */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Yeni E-posta</label>
              <input
                type="email"
                value={form.yeniEmail}
                onChange={(e) => setForm({ ...form, yeniEmail: e.target.value })}
                placeholder={mevcutEmail}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
              />
            </div>

            {/* Yeni şifre */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Yeni Şifre</label>
              <div className="relative">
                <input
                  type={goster.yeni ? "text" : "password"}
                  value={form.yeniSifre}
                  onChange={(e) => setForm({ ...form, yeniSifre: e.target.value })}
                  placeholder="En az 6 karakter"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#0a7ea4]"
                />
                <button
                  type="button"
                  onClick={() => setGoster({ ...goster, yeni: !goster.yeni })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {goster.yeni ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Yeni şifre tekrar */}
            {form.yeniSifre && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Yeni Şifre Tekrar</label>
                <input
                  type={goster.yeni ? "text" : "password"}
                  value={form.yeniSifreTekrar}
                  onChange={(e) => setForm({ ...form, yeniSifreTekrar: e.target.value })}
                  placeholder="Şifreyi tekrar gir"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a7ea4] ${
                    form.yeniSifreTekrar && form.yeniSifre !== form.yeniSifreTekrar
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                />
                {form.yeniSifreTekrar && form.yeniSifre !== form.yeniSifreTekrar && (
                  <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
                )}
              </div>
            )}
          </div>

          {/* Sonuç mesajı */}
          {sonuc && (
            <div className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
              sonuc.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {sonuc.ok
                ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              {sonuc.mesaj}
            </div>
          )}

          <button
            onClick={kaydet}
            disabled={yukleniyor}
            className="w-full text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: adminMode ? "#f59e0b" : "var(--primary)" }}
          >
            {yukleniyor ? "Kaydediliyor..." : adminMode ? "⚡ Admin Kaydet" : "Değişiklikleri Kaydet"}
          </button>
        </div>
      )}
    </div>
  );
}
