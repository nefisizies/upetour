export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User, Star, MessageCircle, ArrowRight, AlertCircle,
  MapPin, Globe, Briefcase, CheckCircle, Clock, TrendingUp,
  ChevronRight, CalendarDays,
} from "lucide-react";
import { MiniTakvim } from "@/components/MiniTakvim";
import { HizliEtkinlikEkle } from "@/components/HizliEtkinlikEkle";

function TamamlanmaBar({ yuzde }: { yuzde: number }) {
  const renk = yuzde < 40 ? "bg-red-400" : yuzde < 80 ? "bg-yellow-400" : "bg-green-400";
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/50">Profil tamamlanma</span>
        <span className="text-xs font-semibold text-white/70">%{yuzde}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${renk}`} style={{ width: `${yuzde}%` }} />
      </div>
    </div>
  );
}

export default async function RehberDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const profile = await prisma.rehberProfile.findUnique({
    where: { userId: session.user.id },
    include: { tours: true, licenses: true, languages: true },
  });

  const simdi = new Date();
  const buAyBaslangic = new Date(simdi.getFullYear(), simdi.getMonth(), 1);
  const buAyBitis = new Date(simdi.getFullYear(), simdi.getMonth() + 1, 1);

  const [unreadCount, totalMessages, reviewData, sonMesajlar, yaklasanEtkinlikler, buAyEtkinlikler] = await Promise.all([
    prisma.message.count({ where: { toUserId: session.user.id, isRead: false } }),
    prisma.message.count({ where: { toUserId: session.user.id } }),
    prisma.review.aggregate({
      where: { revieweeId: session.user.id },
      _count: true,
      _avg: { rating: true },
    }),
    prisma.message.findMany({
      where: { toUserId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { from: { include: { acenteProfile: true } } },
    }),
    profile ? prisma.takvimEtkinlik.findMany({
      where: {
        rehberId: profile.id,
        OR: [
          { bitis: { gte: simdi } },
          { baslangic: { gte: simdi }, bitis: null },
        ],
      },
      orderBy: { baslangic: "asc" },
      take: 4,
    }) : Promise.resolve([]),
    profile ? prisma.takvimEtkinlik.findMany({
      where: {
        rehberId: profile.id,
        baslangic: { lt: buAyBitis },
        OR: [
          { bitis: null },
          { bitis: { gte: buAyBaslangic } },
          { baslangic: { gte: buAyBaslangic } },
        ],
      },
    }) : Promise.resolve([]),
  ]);

  // Profil tamamlanma yüzdesi
  const alanlar = [
    !!profile?.name,
    !!profile?.bio,
    !!profile?.city,
    (profile?.languages?.length ?? 0) > 0,
    (profile?.specialties?.length ?? 0) > 0,
    (profile?.experienceYears ?? 0) > 0,
    (profile?.operatingCountries?.length ?? 0) > 0,
  ];
  const tamamlanma = Math.round((alanlar.filter(Boolean).length / alanlar.length) * 100);
  const profilTam = tamamlanma === 100;

  const verifiedLicenses = profile?.licenses.filter((l) => l.status === "VERIFIED").length ?? 0;
  const pendingLicenses = profile?.licenses.filter((l) => l.status === "PENDING").length ?? 0;
  const avgRating = reviewData._avg.rating ? reviewData._avg.rating.toFixed(1) : "—";

  return (
    <div className="space-y-6">

      {/* Profil Özet Kartı */}
      <div className="backdrop-blur-sm rounded-2xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <User className="w-8 h-8" style={{ color: "var(--primary)" }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">
                {profile?.name ?? session.user.email}
              </h1>
              {profile?.isAvailable ? (
                <span className="inline-flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Müsait
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--card-bg)", color: "rgba(255,255,255,0.5)", border: "1px solid var(--card-border)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
                  Müsait Değil
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-white/50 flex-wrap">
              {profile?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {profile.city}
                </span>
              )}
              {(profile?.experienceYears ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> {profile?.experienceYears} yıl deneyim
                </span>
              )}
              {(profile?.languages?.length ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> {profile?.languages.slice(0, 3).map((l) => l.dil).join(", ")}
                  {(profile?.languages.length ?? 0) > 3 && ` +${(profile?.languages.length ?? 0) - 3}`}
                </span>
              )}
            </div>
            <TamamlanmaBar yuzde={tamamlanma} />
          </div>
          <Link
            href="/dashboard/rehber/profil"
            className="shrink-0 text-sm font-medium hidden sm:block hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Düzenle
          </Link>
        </div>
      </div>

      {/* Profil eksik uyarısı */}
      {!profilTam && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">Profilin %{100 - tamamlanma} eksik</p>
            <p className="text-sm text-amber-400 mt-0.5">
              Eksik bilgileri tamamla, acentelerin seni daha kolay bulsun.
            </p>
          </div>
          <Link href="/dashboard/rehber/profil" className="shrink-0 text-sm font-medium text-amber-300 hover:underline flex items-center gap-1">
            Tamamla <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/rehber/mesajlar" className="backdrop-blur-sm rounded-xl p-5 transition-shadow group" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <MessageCircle className="w-5 h-5" style={{ color: "var(--primary)" }} />
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-white">{totalMessages}</div>
          <div className="text-xs text-white/50 mt-1">Mesaj</div>
          {unreadCount > 0 && <div className="text-xs text-red-400 mt-0.5">{unreadCount} okunmamış</div>}
        </Link>

        <div className="backdrop-blur-sm rounded-xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <Star className="w-5 h-5 text-yellow-400 mb-3" />
          <div className="text-2xl font-bold text-white">{avgRating}</div>
          <div className="text-xs text-white/50 mt-1">Ortalama Puan</div>
          <div className="text-xs text-white/40 mt-0.5">{reviewData._count} değerlendirme</div>
        </div>

        <div className="backdrop-blur-sm rounded-xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <CheckCircle className="w-5 h-5 text-green-500 mb-3" />
          <div className="text-2xl font-bold text-white">{verifiedLicenses}</div>
          <div className="text-xs text-white/50 mt-1">Onaylı Lisans</div>
          {pendingLicenses > 0 && (
            <div className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {pendingLicenses} bekliyor
            </div>
          )}
        </div>

        <div className="backdrop-blur-sm rounded-xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <TrendingUp className="w-5 h-5 text-purple-400 mb-3" />
          <div className="text-2xl font-bold text-white">{tamamlanma}%</div>
          <div className="text-xs text-white/50 mt-1">Profil Gücü</div>
          <div className="text-xs text-white/40 mt-0.5">{profilTam ? "Tamamlandı" : "Geliştir"}</div>
        </div>
      </div>

      {/* Yaklaşan Etkinlikler + Mini Takvim */}
      <div className="backdrop-blur-sm rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="grid grid-cols-3 items-center px-6 py-4 border-b" style={{ borderColor: "var(--card-inner-border)" }}>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4" style={{ color: "var(--primary)" }} /> Yaklaşan Etkinlikler
          </h2>
          <div className="flex justify-center">
            <HizliEtkinlikEkle />
          </div>
          <div className="flex justify-end">
            <Link
              href="/dashboard/rehber/takvim"
              className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
              style={{ color: "var(--primary)", borderColor: "var(--primary)" }}
            >
              Takvime git
            </Link>
          </div>
        </div>
        <div className="flex divide-x divide-white/8">
          {/* Sol: Yaklaşan liste */}
          <div className="flex-1 min-w-0">
            {yaklasanEtkinlikler.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <CalendarDays className="w-7 h-7 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/40">Yaklaşan etkinlik yok</p>
              </div>
            ) : (
              <div className="divide-y divide-white/8">
                {yaklasanEtkinlikler.map((e) => {
                  const bas = new Date(e.baslangic);
                  const bit = e.bitis ? new Date(e.bitis) : null;
                  const bugunD = new Date(); bugunD.setHours(0, 0, 0, 0);
                  const basGun = new Date(bas); basGun.setHours(0, 0, 0, 0);
                  const fark = Math.ceil((basGun.getTime() - bugunD.getTime()) / 86400000);
                  const etiket = fark === 0 ? "Bugün" : fark === 1 ? "Yarın" : `${fark}g`;
                  const acil = fark <= 1;
                  return (
                    <Link key={e.id} href="/dashboard/rehber/takvim"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 ${e.tur === "REZERVASYON" ? "bg-purple-500/15" : ""}`}
                        style={e.tur !== "REZERVASYON" ? { background: "color-mix(in srgb, var(--primary) 10%, transparent)" } : undefined}>
                        <span className={`text-xs font-bold leading-none ${e.tur === "REZERVASYON" ? "text-purple-400" : ""}`}
                          style={e.tur !== "REZERVASYON" ? { color: "var(--primary)" } : undefined}>
                          {String(bas.getDate()).padStart(2, "0")}
                        </span>
                        <span className={`text-[9px] leading-none mt-0.5 ${e.tur === "REZERVASYON" ? "text-purple-400/70" : "text-white/40"}`}>
                          {["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"][bas.getMonth()]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{e.baslik}</p>
                        {bit ? (
                          <p className="text-[10px] text-white/40 mt-0.5">
                            {bas.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} – {bit.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                          </p>
                        ) : e.notlar ? (
                          <p className="text-[10px] text-white/40 truncate">{e.notlar}</p>
                        ) : null}
                      </div>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${acil ? "bg-red-500/15 text-red-400" : "text-white/40"}`}
                        style={!acil ? { background: "var(--card-bg)" } : undefined}>
                        {etiket}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          {/* Sağ: Mini takvim */}
          <div className="p-4 w-52 shrink-0">
            <MiniTakvim
              etkinlikler={buAyEtkinlikler}
              yil={simdi.getFullYear()}
              ay={simdi.getMonth() + 1}
            />
          </div>
        </div>
      </div>

      {/* Alt İki Kolon */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Son Mesajlar */}
        <div className="backdrop-blur-sm rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--card-inner-border)" }}>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4" style={{ color: "var(--primary)" }} /> Mesajlar
            </h2>
            <Link href="/dashboard/rehber/mesajlar" className="text-xs hover:underline" style={{ color: "var(--primary)" }}>
              Tümünü gör
            </Link>
          </div>
          {sonMesajlar.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <MessageCircle className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">Henüz mesajın yok</p>
              <p className="text-xs text-white/30 mt-1">Acenteler seninle iletişime geçtiğinde burada görünür</p>
            </div>
          ) : (
            <div className="divide-y divide-white/8">
              {sonMesajlar.map((msg) => (
                <Link key={msg.id} href="/dashboard/rehber/mesajlar" className="flex items-start gap-3 px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
                    <User className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {msg.from.acenteProfile?.companyName ?? msg.from.email}
                      </p>
                      {!msg.isRead && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "var(--primary)" }} />}
                    </div>
                    <p className="text-xs text-white/50 truncate mt-0.5">{msg.content}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Hızlı Aksiyonlar */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/rehber/profil", icon: User, bgStyle: { background: "color-mix(in srgb, var(--primary) 10%, transparent)" }, iconStyle: { color: "var(--primary)" }, title: "Profil Düzenle", desc: "Bilgilerini güncelle" },
          { href: "/dashboard/rehber/mesajlar", icon: MessageCircle, bgStyle: { background: "rgba(168,85,247,0.15)" }, iconStyle: { color: "rgb(192,132,252)" }, title: "Mesajlar", desc: "Acentelerle iletişim" },
          { href: "/kesfet/rehberler", icon: Globe, bgStyle: { background: "rgba(34,197,94,0.15)" }, iconStyle: { color: "rgb(74,222,128)" }, title: "Rehberleri Gör", desc: "Diğer rehberler" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="backdrop-blur-sm rounded-xl p-5 transition-shadow flex items-center gap-4 group hover:bg-white/5"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={item.bgStyle}>
              <item.icon className="w-5 h-5" style={item.iconStyle} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm">{item.title}</p>
              <p className="text-xs text-white/50">{item.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

    </div>
  );
}
