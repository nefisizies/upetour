export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { MapPin, Globe, Banknote, Building2, Calendar, ArrowLeft, Search } from "lucide-react";
import { Logo } from "@/components/Logo";

export default async function IlanlarPage({
  searchParams,
}: {
  searchParams: Promise<{ konum?: string; dil?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  const ilanlar = await prisma.ilan.findMany({
    where: {
      isActive: true,
      ...(params.konum ? { location: { contains: params.konum, mode: "insensitive" } } : {}),
      ...(params.dil ? { languages: { has: params.dil } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      acente: {
        select: { companyName: true, city: true, logoUrl: true, userId: true },
      },
    },
  });

  // Mevcut konumlar ve diller (filtre için)
  const konumlar = [...new Set(ilanlar.map((i) => i.location).filter(Boolean))] as string[];
  const diller = [...new Set(ilanlar.flatMap((i) => i.languages))];

  const isDashboard = !!session;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>
      <nav className="sticky top-0 z-30 border-b backdrop-blur-md px-4 h-14 flex items-center gap-3"
        style={{ background: "rgba(12,5,0,0.85)", borderColor: "rgba(255,255,255,0.08)" }}>
        <Logo size="sm" darkBg />
        <span className="text-white/20">/</span>
        {isDashboard ? (
          <Link href="/dashboard/rehber" className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        ) : (
          <Link href="/" className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Ana Sayfa
          </Link>
        )}
        <span className="text-white/20">/</span>
        <span className="text-white/60 text-sm">İlanlar</span>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Açık İlanlar</h1>
            <p className="text-sm text-white/40 mt-1">{ilanlar.length} aktif ilan</p>
          </div>

          {/* Filtreler */}
          {(konumlar.length > 0 || diller.length > 0) && (
            <form className="flex gap-2 flex-wrap">
              {konumlar.length > 0 && (
                <select
                  name="konum"
                  defaultValue={params.konum ?? ""}
                  className="rounded-xl px-3 py-2 text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  onChange={(e) => {
                    const url = new URL(window.location.href);
                    e.target.value ? url.searchParams.set("konum", e.target.value) : url.searchParams.delete("konum");
                    window.location.href = url.toString();
                  }}
                >
                  <option value="">Tüm konumlar</option>
                  {konumlar.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              )}
              {diller.length > 0 && (
                <select
                  name="dil"
                  defaultValue={params.dil ?? ""}
                  className="rounded-xl px-3 py-2 text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  onChange={(e) => {
                    const url = new URL(window.location.href);
                    e.target.value ? url.searchParams.set("dil", e.target.value) : url.searchParams.delete("dil");
                    window.location.href = url.toString();
                  }}
                >
                  <option value="">Tüm diller</option>
                  {diller.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </form>
          )}
        </div>

        {ilanlar.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Search className="w-12 h-12 text-white/15" />
            <p className="text-white/40 text-lg">
              {params.konum || params.dil ? "Filtreye uygun ilan bulunamadı" : "Henüz aktif ilan yok"}
            </p>
            {(params.konum || params.dil) && (
              <Link href="/kesfet/ilanlar" className="text-sm hover:underline" style={{ color: "var(--primary)" }}>
                Filtreleri temizle
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ilanlar.map((ilan) => (
              <div key={ilan.id} className="backdrop-blur-sm rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/5 transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>

                {/* Acente */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)" }}>
                    {ilan.acente.logoUrl
                      ? <img src={ilan.acente.logoUrl} alt="" className="w-full h-full object-cover" />
                      : <Building2 className="w-5 h-5 text-white/40" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ilan.acente.companyName}</p>
                    {ilan.acente.city && (
                      <p className="text-xs text-white/40 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {ilan.acente.city}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40 shrink-0">
                    {new Date(ilan.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </span>
                </div>

                {/* İlan başlık + açıklama */}
                <div>
                  <h3 className="font-semibold text-white leading-snug">{ilan.title}</h3>
                  {ilan.description && (
                    <p className="text-sm text-white/50 mt-1.5 line-clamp-2 leading-relaxed">{ilan.description}</p>
                  )}
                </div>

                {/* Detaylar */}
                <div className="flex flex-wrap gap-2">
                  {ilan.location && (
                    <span className="flex items-center gap-1 text-xs text-white/60 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <MapPin className="w-3 h-3" /> {ilan.location}
                    </span>
                  )}
                  {ilan.budget && (
                    <span className="flex items-center gap-1 text-xs text-green-400 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                      <Banknote className="w-3 h-3" /> {ilan.budget}
                    </span>
                  )}
                </div>

                {/* Diller */}
                {ilan.languages.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Globe className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    {ilan.languages.map((dil) => (
                      <span key={dil} className="text-xs text-blue-400 px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
                        {dil}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {session?.user.role === "REHBER" && (
                  <Link
                    href={`/dashboard/rehber/mesajlar?ile=${ilan.acente.userId}`}
                    className="mt-auto w-full text-center py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
                    style={{ background: "var(--primary)" }}
                  >
                    Acenteyle İletişime Geç
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
