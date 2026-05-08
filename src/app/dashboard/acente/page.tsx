export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Users, ArrowRight, AlertCircle, Building2, Search } from "lucide-react";

export default async function AcenteDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") redirect("/dashboard");

  const profile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
  });

  const [unreadCount, bekleyenReferansCount] = await Promise.all([
    prisma.message.count({ where: { toUserId: session.user.id, isRead: false } }),
    profile ? prisma.referans.count({ where: { acenteId: profile.id, durum: "BEKLIYOR" } }) : Promise.resolve(0),
  ]);

  const profileComplete = !!(profile?.description && profile?.city);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>
          Merhaba, {profile?.companyName} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Acente panelinize hoş geldiniz</p>
      </div>

      {!profileComplete && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Profil eksik</p>
            <p className="text-sm text-yellow-400/70 mt-0.5">Şirket açıklaması ve şehir bilgisini ekleyin.</p>
            <Link href="/dashboard/acente/profil" className="inline-flex items-center gap-1 text-sm font-medium text-yellow-300 hover:underline mt-2">
              Profili Tamamla <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Okunmamış Mesaj", value: unreadCount, icon: MessageCircle, href: "/dashboard/acente/mesajlar", badge: 0 },
          { label: "Referans İstekleri", value: bekleyenReferansCount, icon: Building2, href: "/dashboard/acente/referanslar", badge: bekleyenReferansCount },
          { label: "Rehber Bul", value: "→", icon: Search, href: "/dashboard/acente/rehber-bul", badge: 0 },
        ].map((card) => (
          <Link key={card.label} href={card.href}
            className="relative rounded-xl p-5 transition-all hover:brightness-110"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            {card.badge > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {card.badge}
              </span>
            )}
            <card.icon className="w-5 h-5 text-[#0a7ea4] mb-3" />
            <div className="text-2xl font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>{card.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/acente/rehber-bul"
          className="bg-[#0a7ea4] text-white rounded-xl p-6 hover:bg-[#065f7d] transition-colors flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Rehber Ara</p>
              <p className="text-sm text-blue-100">Tarih, şehir ve uzmanlığa göre filtrele</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link href="/kesfet/rehberler"
          className="rounded-xl p-6 transition-all hover:brightness-110 flex items-center justify-between group"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(10,126,164,0.15)" }}>
              <Users className="w-5 h-5 text-[#0a7ea4]" />
            </div>
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>Rehber Ara</p>
              <p className="text-sm" style={{ color: "var(--text-muted, #94a3b8)" }}>Tüm rehberlere göz at</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 transition-colors" style={{ color: "var(--text-muted, #94a3b8)" }} />
        </Link>
      </div>
    </div>
  );
}
