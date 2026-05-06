"use client";

import { useState } from "react";
import { CheckCircle, Clock, XCircle, Send } from "lucide-react";

type Durum = "YOK" | "BEKLIYOR" | "ONAYLANDI" | "REDDEDILDI" | "BLOKLU";

interface Props {
  acenteId: string;
  referansId?: string;
  baslangicDurum: Durum;
}

export function ReferansButonu({ acenteId, referansId, baslangicDurum }: Props) {
  const [durum, setDurum] = useState<Durum>(baslangicDurum);
  const [mevcutId, setMevcutId] = useState<string | undefined>(referansId);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [onayPenceresi, setOnayPenceresi] = useState(false);

  async function basvur() {
    setYukleniyor(true);
    const res = await fetch("/api/referans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acenteId }),
    });
    setYukleniyor(false);
    if (res.ok) {
      const data = await res.json();
      setMevcutId(data.id);
      setDurum("BEKLIYOR");
    }
  }

  async function tekrarBasvur() {
    setYukleniyor(true);
    if (mevcutId) {
      await fetch(`/api/referans/${mevcutId}`, { method: "DELETE" });
    }
    const res = await fetch("/api/referans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acenteId }),
    });
    setYukleniyor(false);
    setOnayPenceresi(false);
    if (res.ok) {
      const data = await res.json();
      setMevcutId(data.id);
      setDurum("BEKLIYOR");
    }
  }

  if (durum === "ONAYLANDI") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg font-medium">
        <CheckCircle className="w-3.5 h-3.5" /> Onaylandı
      </span>
    );
  }

  if (durum === "BEKLIYOR") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg font-medium">
        <Clock className="w-3.5 h-3.5" /> Bekliyor
      </span>
    );
  }

  if (durum === "REDDEDILDI") {
    return (
      <>
        <button
          onClick={() => setOnayPenceresi(true)}
          className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" /> Reddedildi — Tekrar Başvur
        </button>

        {onayPenceresi && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Tekrar başvur?</h3>
              <p className="text-sm text-gray-500 mb-5">
                Bu acente daha önce başvurunuzu reddetti. Yine de tekrar başvurmak istiyor musunuz?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setOnayPenceresi(false)}
                  className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={tekrarBasvur}
                  disabled={yukleniyor}
                  className="flex-1 text-sm bg-[#0a7ea4] text-white py-2 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60"
                >
                  {yukleniyor ? "Gönderiliyor..." : "Evet, Başvur"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (durum === "BLOKLU") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
        Başvuru yapılamaz
      </span>
    );
  }

  return (
    <button
      onClick={basvur}
      disabled={yukleniyor}
      className="inline-flex items-center gap-1 text-xs bg-[#0a7ea4] text-white px-3 py-1.5 rounded-lg hover:bg-[#065f7d] transition-colors disabled:opacity-60 font-medium"
    >
      <Send className="w-3.5 h-3.5" />
      {yukleniyor ? "Gönderiliyor..." : "Referans Gönder"}
    </button>
  );
}
