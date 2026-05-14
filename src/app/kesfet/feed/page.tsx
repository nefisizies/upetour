export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, Trophy, Camera, Clock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const UNVAN_LABEL: Record<string, string> = {
  AKTIF_REHBER: "Aktif Rehber",
  DENEYIMLI_REHBER: "Deneyimli Rehber",
  UZMAN_REHBER: "Uzman Rehber",
  SUPER_REHBER: "Süper Rehber",
  ELIT_REHBER: "Elit Rehber",
};

function zamanFarki(dateStr: Date) {
  const fark = Date.now() - new Date(dateStr).getTime();
  const dakika = Math.floor(fark / 60000);
  if (dakika < 60) return `${dakika}dk önce`;
  const saat = Math.floor(dakika / 60);
  if (saat < 24) return `${saat} saat önce`;
  const gun = Math.floor(saat / 24);
  if (gun < 7) return `${gun} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  const checkInler = await prisma.checkIn.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      rehber: {
        select: {
          id: true,
          name: true,
          slug: true,
          photoUrl: true,
          city: true,
          unvan: true,
          checkInSayisi: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0c0500 0%, #1a0900 50%, #0c0500 100%)" }}>
      <nav className="sticky top-0 z-30 border-b backdrop-blur-md px-4 h-14 flex items-center justify-between"
        style={{ background: "rgba(12,5,0,0.85)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-4">
          <Logo size="sm" darkBg />
          <span className="text-white/40 text-sm hidden sm:block">Rehber Feed</span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href={`/dashboard/${session.user.role === "REHBER" ? "rehber" : session.user.role === "ACENTE" ? "acente" : "admin"}`}
              className="text-sm font-medium px-4 py-1.5 rounded-lg"
              style={{ background: "var(--primary)", color: "white" }}>
              Dashboard
            </Link>
          ) : (
            <Link href="/giris" className="text-sm text-white/60 hover:text-white transition-colors">
              Giriş Yap
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Rehber Feed</h1>
          <p className="text-white/40 text-sm mt-1">Rehberlerin tur anlarından canlı paylaşımlar</p>
        </div>

        {checkInler.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-white/15 mx-auto mb-3" />
            <p className="text-white/40">Henüz paylaşım yok</p>
            <p className="text-white/25 text-sm mt-1">Rehberler check-in yaptıkça burada görünür</p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkInler.map((ci) => (
              <article
                key={ci.id}
                className="rounded-2xl overflow-hidden transition-all hover:brightness-110"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                {/* Fotoğraf */}
                {ci.fotografUrl && (
                  <div className="relative">
                    <img src={ci.fotografUrl} alt={ci.baslik} className="w-full max-h-72 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                <div className="p-5">
                  {/* Rehber başlık */}
                  <Link href={`/rehber/${ci.rehber.slug}`} className="flex items-center gap-3 mb-3 group">
                    <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold"
                      style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}>
                      {ci.rehber.photoUrl
                        ? <img src={ci.rehber.photoUrl} alt="" className="w-full h-full object-cover" />
                        : ci.rehber.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white group-hover:underline">{ci.rehber.name}</span>
                        {ci.rehber.unvan !== "YENI_REHBER" && UNVAN_LABEL[ci.rehber.unvan] && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5"
                            style={{ background: "rgba(234,179,8,0.12)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.2)" }}>
                            <Trophy className="w-2.5 h-2.5" /> {UNVAN_LABEL[ci.rehber.unvan]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/35 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {zamanFarki(ci.createdAt)}
                        </span>
                        {ci.rehber.checkInSayisi > 1 && (
                          <span>{ci.rehber.checkInSayisi} check-in</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* İçerik */}
                  <p className="font-semibold text-white text-sm leading-snug">{ci.baslik}</p>
                  {ci.sehir && (
                    <p className="text-xs text-white/45 flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 shrink-0" style={{ color: "var(--primary)" }} />
                      {ci.ulke ? `${ci.sehir}, ${ci.ulke}` : ci.sehir}
                    </p>
                  )}
                  {ci.aciklama && (
                    <p className="text-sm text-white/50 mt-2 leading-relaxed">{ci.aciklama}</p>
                  )}

                  {/* Alt meta */}
                  <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    {ci.fotografUrl && (
                      <span className="text-[11px] text-white/30 flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Fotoğraflı
                      </span>
                    )}
                    {ci.dogrulandi && (
                      <span className="text-[11px] text-green-400 flex items-center gap-1">✅ Doğrulandı</span>
                    )}
                    <Link href={`/rehber/${ci.rehber.slug}`}
                      className="ml-auto text-[11px] hover:underline"
                      style={{ color: "var(--primary)" }}>
                      Profile git →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
