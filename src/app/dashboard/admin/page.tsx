export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { AdminSonKayitlar } from "./AdminSonKayitlar";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [rehberCount, acenteCount, pendingLicenseCount, recentUsers] = await Promise.all([
    prisma.user.count({ where: { role: "REHBER" } }),
    prisma.user.count({ where: { role: "ACENTE" } }),
    prisma.rehberLicense.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        rehberProfile: { select: { name: true, photoUrl: true } },
        acenteProfile: { select: { companyName: true, logoUrl: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Tur Rehberi", value: rehberCount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/15", href: "/dashboard/admin/kullanicilar?rol=REHBER" },
    { label: "Seyahat Acentesi", value: acenteCount, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/15", href: "/dashboard/admin/kullanicilar?rol=ACENTE" },
    { label: "Bekleyen Lisans", value: pendingLicenseCount, icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/15", href: "/dashboard/admin/lisanslar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--card-text, #f1f5f9)" }}>Genel Bakış</h1>
        <p className="text-sm mt-1" style={{ color: "var(--card-text-muted, #94a3b8)" }}>Platform durumu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="rounded-2xl p-5 flex items-center gap-3 hover:scale-[1.02] transition-transform"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
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

      <div className="backdrop-blur-sm rounded-2xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--card-inner-border)" }}>
          <h2 className="font-semibold text-white">Son Kayıtlar</h2>
          <Link href="/dashboard/admin/kullanicilar" className="text-xs flex items-center gap-1 hover:underline" style={{ color: "var(--primary)" }}>
            Tümünü gör <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <AdminSonKayitlar
          users={recentUsers.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        />
      </div>
    </div>
  );
}
