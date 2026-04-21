export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Star, MessageCircle, Eye, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default async function RehberDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const profile = await prisma.rehberProfile.findUnique({
    where: { userId: session.user.id },
    include: { tours: true },
  });

  const unreadCount = await prisma.message.count({
    where: { toUserId: session.user.id, isRead: false },
  });

  const reviewCount = await prisma.review.count({
    where: { revieweeId: session.user.id },
  });

  const profileComplete = !!(
    profile?.bio &&
    profile?.city &&
    profile?.languages?.length &&
    profile?.specialties?.length
  );

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Merhaba, {profile?.name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Rehber panelinize hoş geldiniz</p>
      </div>

      {/* Profil tamamlama uyarısı */}
      {!profileComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Profiliniz eksik</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Biyografi, şehir, dil ve uzmanlık ekleyin — acenteler sizi daha kolay bulsun.
            </p>
            <Link
              href="/dashboard/rehber/profil"
              className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:underline mt-2"
            >
              Profili Düzenle <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tur Hizmetim", value: profile?.tours?.length ?? 0, icon: Eye, href: "/dashboard/rehber/profil" },
          { label: "Okunmamış Mesaj", value: unreadCount, icon: MessageCircle, href: "/dashboard/rehber/mesajlar" },
          { label: "Değerlendirme", value: reviewCount, icon: Star, href: "#" },
          { label: "Profil Durumu", value: profileComplete ? "Tam" : "Eksik", icon: profileComplete ? CheckCircle : AlertCircle, href: "/dashboard/rehber/profil" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
          >
            <card.icon className="w-5 h-5 text-[#0a7ea4] mb-3" />
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Hızlı işlemler */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/rehber/profil"
          className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0a7ea4]/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[#0a7ea4]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Profilimi Düzenle</p>
              <p className="text-sm text-gray-500">Bilgilerini güncelle, tur ekle</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0a7ea4] transition-colors" />
        </Link>

        <Link
          href="/kesfet/ilanlar"
          className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Acente İlanlarını Gör</p>
              <p className="text-sm text-gray-500">Yeni fırsatları keşfet</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0a7ea4] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
