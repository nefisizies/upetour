export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, MessageCircle, Users, ArrowRight, AlertCircle, Plus, Building2 } from "lucide-react";

export default async function AcenteDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") redirect("/dashboard");

  const profile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
    include: { ilanlar: true },
  });

  const [unreadCount, bekleyenReferansCount] = await Promise.all([
    prisma.message.count({ where: { toUserId: session.user.id, isRead: false } }),
    profile ? prisma.referans.count({ where: { acenteId: profile.id, durum: "BEKLIYOR" } }) : Promise.resolve(0),
  ]);

  const activeIlanCount = profile?.ilanlar.filter((i) => i.isActive).length ?? 0;

  const profileComplete = !!(profile?.description && profile?.city);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Merhaba, {profile?.companyName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Acente panelinize hoş geldiniz</p>
      </div>

      {!profileComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Profil eksik</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Şirket açıklaması ve şehir bilgisini ekleyin.
            </p>
            <Link
              href="/dashboard/acente/profil"
              className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:underline mt-2"
            >
              Profili Tamamla <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Aktif İlan", value: activeIlanCount, icon: FileText, href: "/dashboard/acente/ilanlar", badge: 0 },
          { label: "Okunmamış Mesaj", value: unreadCount, icon: MessageCircle, href: "/dashboard/acente/mesajlar", badge: 0 },
          { label: "Toplam İlan", value: profile?.ilanlar.length ?? 0, icon: Users, href: "/dashboard/acente/ilanlar", badge: 0 },
          { label: "Referans İstekleri", value: bekleyenReferansCount, icon: Building2, href: "/dashboard/acente/referanslar", badge: bekleyenReferansCount },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="relative bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
          >
            {card.badge > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {card.badge}
              </span>
            )}
            <card.icon className="w-5 h-5 text-[#0a7ea4] mb-3" />
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/acente/ilanlar/yeni"
          className="bg-[#0a7ea4] text-white rounded-xl p-6 hover:bg-[#065f7d] transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Yeni İlan Oluştur</p>
              <p className="text-sm text-blue-100">Rehber arayışını paylaş</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          href="/kesfet/rehberler"
          className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0a7ea4]/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#0a7ea4]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Rehber Ara</p>
              <p className="text-sm text-gray-500">Tüm rehberlere göz at</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0a7ea4] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
