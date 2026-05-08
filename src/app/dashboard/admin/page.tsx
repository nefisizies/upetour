export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Building2, ShieldCheck, FileText, ArrowRight } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [rehberCount, acenteCount, pendingLicenseCount, activeilanCount, recentUsers] = await Promise.all([
    prisma.user.count({ where: { role: "REHBER" } }),
    prisma.user.count({ where: { role: "ACENTE" } }),
    prisma.rehberLicense.count({ where: { status: "PENDING" } }),
    prisma.ilan.count({ where: { isActive: true } }),
    prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        rehberProfile: { select: { name: true, photoUrl: true } },
        acenteProfile:  { select: { companyName: true, logoUrl: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Tur Rehberi", value: rehberCount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/15", href: "/dashboard/admin/kullanicilar?rol=REHBER" },
    { label: "Seyahat Acentesi", value: acenteCount, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/15", href: "/dashboard/admin/kullanicilar?rol=ACENTE" },
    { label: "Bekleyen Lisans", value: pendingLicenseCount, icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/15", href: "/dashboard/admin/lisanslar" },
    { label: "Aktif İlan", value: activeilanCount, icon: FileText, color: "text-green-400", bg: "bg-green-500/15", href: "/dashboard/admin/ilanlar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-sm text-gray-500 mt-1">Platform durumu</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="backdrop-blur-sm rounded-2xl p-5 flex items-center gap-3 hover:scale-[1.02] transition-transform"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-white/50">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Son kayıtlar */}
      <div className="backdrop-blur-sm rounded-2xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--card-inner-border)" }}>
          <h2 className="font-semibold text-white">Son Kayıtlar</h2>
          <Link href="/dashboard/admin/kullanicilar" className="text-xs flex items-center gap-1 hover:underline" style={{ color: "var(--primary)" }}>
            Tümünü gör <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentUsers.map(user => {
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
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === "REHBER"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                    : "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                }`}>{user.role}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
