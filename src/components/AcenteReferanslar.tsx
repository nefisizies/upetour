"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, User, MapPin, Building2, ShieldBan, ShieldOff, Trash2, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { Referans, RehberProfile, AcenteRehberBlok } from "@prisma/client";

type ReferansWithRehber = Referans & {
  rehber: Pick<RehberProfile, "name" | "city" | "photoUrl" | "slug">;
};

type BlokWithRehber = AcenteRehberBlok & {
  rehber: Pick<RehberProfile, "name" | "city" | "photoUrl" | "slug">;
};

type BlokSecim = "YOK" | "GECICI_1AY" | "GECICI_3AY" | "GECICI_6AY" | "GECICI_1YIL" | "KALICI";

const BLOK_SECENEKLERI: { value: BlokSecim; label: string }[] = [
  { value: "YOK", label: "Hayır, tekrar başvurabilsin" },
  { value: "GECICI_1AY", label: "1 ay başvuru yollayamasın" },
  { value: "GECICI_3AY", label: "3 ay başvuru yollayamasın" },
  { value: "GECICI_6AY", label: "6 ay başvuru yollayamasın" },
  { value: "GECICI_1YIL", label: "1 yıl başvuru yollayamasın" },
  { value: "KALICI", label: "Bir daha hiç yollayamasın (ben kaldırana kadar)" },
];

export function AcenteReferanslar({
  referanslar: initial,
  bloklar: initialBloklar,
}: {
  referanslar: ReferansWithRehber[];
  bloklar: BlokWithRehber[];
}) {
  const [referanslar, setReferanslar] = useState(initial);
  const [bloklar, setBloklar] = useState(initialBloklar);
  const [islemYapiliyor, setIslemYapiliyor] = useState<string | null>(null);
  const [cikarOnay, setCikarOnay] = useState<{ id: string; rehberAdi: string } | null>(null);

  // Red modal state
  const [redModal, setRedModal] = useState<{ id: string; rehberAdi: string } | null>(null);
  const [blokSecim, setBlokSecim] = useState<BlokSecim>("YOK");

  async function onayla(id: string) {
    setIslemYapiliyor(id);
    const res = await fetch(`/api/referans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum: "ONAYLANDI" }),
    });
    setIslemYapiliyor(null);
    if (!res.ok) return;
    setReferanslar((prev) => prev.map((r) => r.id === id ? { ...r, durum: "ONAYLANDI" } : r));
  }

  async function reddetOnayla() {
    if (!redModal) return;
    setIslemYapiliyor(redModal.id);
    const res = await fetch(`/api/referans/${redModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum: "REDDEDILDI", blok: blokSecim }),
    });
    setIslemYapiliyor(null);
    if (!res.ok) { setRedModal(null); return; }
    setReferanslar((prev) => prev.map((r) => r.id === redModal.id ? { ...r, durum: "REDDEDILDI" } : r));

    // Blok eklendiyse listeyi güncelle
    if (blokSecim !== "YOK") {
      const blokRes = await fetch("/api/referans/blok");
      if (blokRes.ok) setBloklar(await blokRes.json());
    }
    setRedModal(null);
    setBlokSecim("YOK");
  }

  async function referansCikar(id: string) {
    setIslemYapiliyor(id);
    const res = await fetch(`/api/referans/${id}`, { method: "DELETE" });
    setIslemYapiliyor(null);
    setCikarOnay(null);
    if (!res.ok) return;
    setReferanslar((prev) => prev.map((r) => r.id === id ? { ...r, durum: "KALDIRILDI" } : r));
  }

  async function geriEkle(id: string) {
    setIslemYapiliyor(id);
    const res = await fetch(`/api/referans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum: "ONAYLANDI" }),
    });
    setIslemYapiliyor(null);
    if (!res.ok) return;
    setReferanslar((prev) => prev.map((r) => r.id === id ? { ...r, durum: "ONAYLANDI" } : r));
  }

  async function blokKaldir(blokId: string) {
    const res = await fetch("/api/referans/blok", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blokId }),
    });
    if (!res.ok) return;
    setBloklar((prev) => prev.filter((b) => b.id !== blokId));
  }

  const bekleyenler = referanslar.filter((r) => r.durum === "BEKLIYOR");
  const gecmisler = referanslar.filter((r) => r.durum === "ONAYLANDI" || r.durum === "REDDEDILDI");
  const kaldirildi = referanslar.filter((r) => r.durum === "KALDIRILDI");

  return (
    <>
      {/* Çıkar Onay Modal */}
      {cikarOnay && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Onayı geri çek?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-medium">{cikarOnay.rehberAdi}</span> ile olan onaylı referans silinecek. Rehber tekrar başvurabilir.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCikarOnay(null)}
                className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={() => referansCikar(cikarOnay.id)}
                disabled={islemYapiliyor === cikarOnay.id}
                className="flex-1 text-sm bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {islemYapiliyor === cikarOnay.id ? "Siliniyor..." : "Evet, Çıkar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Red Modal */}
      {redModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-1">Başvuruyu Reddet</h3>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium">{redModal.rehberAdi}</span> için kısıtlama seçin:
            </p>
            <div className="space-y-2 mb-5">
              {BLOK_SECENEKLERI.map((s) => (
                <label key={s.value} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="blok"
                    value={s.value}
                    checked={blokSecim === s.value}
                    onChange={() => setBlokSecim(s.value)}
                    className="accent-[#0a7ea4]"
                  />
                  <span className="text-sm text-gray-700">{s.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRedModal(null); setBlokSecim("YOK"); }}
                className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={reddetOnayla}
                disabled={islemYapiliyor === redModal.id}
                className="flex-1 text-sm bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {islemYapiliyor === redModal.id ? "İşleniyor..." : "Reddet"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Referans İstekleri */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0a7ea4]" />
            <h1 className="font-semibold text-gray-900 text-lg">Referans İstekleri</h1>
            {bekleyenler.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {bekleyenler.length}
              </span>
            )}
          </div>

          {referanslar.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Henüz referans isteği yok.</p>
          ) : (
            <div className="space-y-3">
              {bekleyenler.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0a7ea4]/10 flex items-center justify-center shrink-0">
                      {r.rehber.photoUrl
                        ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <User className="w-4 h-4 text-[#0a7ea4]" />}
                    </div>
                    <div>
                      <Link href={`/rehber/${r.rehber.slug}`} target="_blank"
                        className="text-sm font-medium text-gray-900 hover:underline">
                        {r.rehber.name}
                      </Link>
                      {r.rehber.city && (
                        <p className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {r.rehber.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-600 flex items-center gap-1 mr-1">
                      <Clock className="w-3 h-3" /> Bekliyor
                    </span>
                    <button
                      onClick={() => onayla(r.id)}
                      disabled={islemYapiliyor === r.id}
                      className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      <CheckCircle className="w-3.5 h-3.5" /> Onayla
                    </button>
                    <button
                      onClick={() => setRedModal({ id: r.id, rehberAdi: r.rehber.name })}
                      disabled={islemYapiliyor === r.id}
                      className="flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      <XCircle className="w-3.5 h-3.5" /> Reddet
                    </button>
                  </div>
                </div>
              ))}

              {gecmisler.length > 0 && (
                <>
                  {bekleyenler.length > 0 && <div className="border-t border-gray-100 pt-2" />}
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Geçmiş</p>
                  {gecmisler.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          {r.rehber.photoUrl
                            ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                            : <User className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div>
                          <Link href={`/rehber/${r.rehber.slug}`} target="_blank"
                            className="text-sm font-medium text-gray-900 hover:underline">
                            {r.rehber.name}
                          </Link>
                          {r.rehber.city && (
                            <p className="text-xs text-gray-400 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {r.rehber.city}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                      {r.durum === "ONAYLANDI" ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Onaylandı
                          </span>
                          <button
                            onClick={() => setCikarOnay({ id: r.id, rehberAdi: r.rehber.name })}
                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-2 py-0.5 rounded-full transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Çıkar
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Reddedildi
                        </span>
                      )}
                    </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Kaldırılanlar */}
        {kaldirildi.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Kaldırılan Onaylar</h2>
              <span className="text-xs text-gray-400">({kaldirildi.length})</span>
            </div>
            <div className="space-y-3">
              {kaldirildi.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      {r.rehber.photoUrl
                        ? <img src={r.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <User className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div>
                      <Link href={`/rehber/${r.rehber.slug}`} target="_blank"
                        className="text-sm font-medium text-gray-900 hover:underline">
                        {r.rehber.name}
                      </Link>
                      {r.rehber.city && (
                        <p className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {r.rehber.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => geriEkle(r.id)}
                    disabled={islemYapiliyor === r.id}
                    className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {islemYapiliyor === r.id ? "Ekleniyor..." : "Geri Ekle"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engellenenler */}
        {bloklar.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldBan className="w-4 h-4 text-red-400" />
              <h2 className="font-semibold text-gray-900">Engellenenler</h2>
              <span className="text-xs text-gray-400">({bloklar.length})</span>
            </div>
            <div className="space-y-3">
              {bloklar.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      {b.rehber.photoUrl
                        ? <img src={b.rehber.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <User className="w-4 h-4 text-red-400" />}
                    </div>
                    <div>
                      <Link href={`/rehber/${b.rehber.slug}`} target="_blank"
                        className="text-sm font-medium text-gray-900 hover:underline">
                        {b.rehber.name}
                      </Link>
                      <p className="text-xs text-red-400">
                        {b.tur === "KALICI"
                          ? "Kalıcı engel"
                          : `${new Date(b.banBitis!).toLocaleDateString("tr-TR")} tarihine kadar`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => blokKaldir(b.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ShieldOff className="w-3.5 h-3.5" /> Engeli Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
