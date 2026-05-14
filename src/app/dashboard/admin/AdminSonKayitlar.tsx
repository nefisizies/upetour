"use client";

import { useState } from "react";
import { Eye, X, Copy, Check } from "lucide-react";

type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  rehberProfile: { name: string; photoUrl: string | null } | null;
  acenteProfile: { companyName: string; logoUrl: string | null } | null;
};

type Detay = {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  rehberProfile: { name: string } | null;
  acenteProfile: { companyName: string } | null;
};

function KopyaButonu({ metin }: { metin: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  function kopyala() {
    navigator.clipboard.writeText(metin);
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 1500);
  }
  return (
    <button onClick={kopyala} className="p-1 rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
      {kopyalandi ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function AdminSonKayitlar({ users }: { users: User[] }) {
  const [detay, setDetay] = useState<Detay | null>(null);
  const [yukleniyor, setYukleniyor] = useState<string | null>(null);

  async function detayGor(userId: string) {
    setYukleniyor(userId);
    try {
      const res = await fetch(`/api/admin/kullanici-detay?id=${userId}`);
      const data = await res.json();
      setDetay({ ...data, createdAt: new Date(data.createdAt).toISOString() });
    } finally {
      setYukleniyor(null);
    }
  }

  return (
    <>
      <div className="divide-y divide-white/5">
        {users.map((user) => {
          const name = user.rehberProfile?.name ?? user.acenteProfile?.companyName ?? user.email;
          const photo = user.rehberProfile?.photoUrl ?? user.acenteProfile?.logoUrl;
          return (
            <div key={user.id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-xs font-semibold text-white/50"
                style={{ background: "var(--card-bg)" }}>
                {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                user.role === "REHBER"
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                  : "bg-purple-500/15 text-purple-400 border border-purple-500/25"
              }`}>{user.role}</span>
              <button
                onClick={() => detayGor(user.id)}
                disabled={yukleniyor === user.id}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-40"
                style={{ color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)" }}
              >
                <Eye className="w-3 h-3" />
                {yukleniyor === user.id ? "..." : "Detay"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {detay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setDetay(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: "#130800", border: "1px solid rgba(255,255,255,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Hesap Detayları</h3>
              <button onClick={() => setDetay(null)} className="text-white/40 hover:text-white/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* İsim */}
              <div>
                <p className="text-xs text-white/40 mb-1">Ad / Şirket</p>
                <p className="text-sm text-white font-medium">
                  {detay.rehberProfile?.name ?? detay.acenteProfile?.companyName ?? "—"}
                </p>
              </div>

              {/* Email */}
              <div>
                <p className="text-xs text-white/40 mb-1">Email</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-sm text-white flex-1 select-all">{detay.email}</p>
                  <KopyaButonu metin={detay.email} />
                </div>
              </div>

              {/* Şifre hash */}
              <div>
                <p className="text-xs text-white/40 mb-1">
                  Şifre <span className="text-white/25">(bcrypt hash — düz metin görüntülenemez)</span>
                </p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xs text-white/50 flex-1 font-mono break-all select-all">{detay.password}</p>
                  <KopyaButonu metin={detay.password} />
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-xs text-white/40 mb-1">Rol</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    detay.role === "REHBER" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"
                  }`}>{detay.role}</span>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Kayıt Tarihi</p>
                  <p className="text-xs text-white/60">
                    {new Date(detay.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
