export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Building2, ShieldCheck, FileText, MessageCircle, Star, TrendingUp } from "lucide-react";

function week(weeksAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - weeksAgo * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function IstatistiklerPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const now = new Date();
  const w1 = week(1);
  const w4 = week(4);

  const [
    rehberTotal, acenteTotal,
    rehberW1, acenteW1,
    rehberW4, acenteW4,
    pendingLicenses, verifiedLicenses,
    activeIlanlar, totalIlanlar,
    totalMessages, messagesW1,
    totalReviews,
    // son 4 hafta breakdown
    w0rehber, w0acente,
    w1rehber, w1acente,
    w2rehber, w2acente,
    w3rehber, w3acente,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "REHBER" } }),
    prisma.user.count({ where: { role: "ACENTE" } }),
    prisma.user.count({ where: { role: "REHBER", createdAt: { gte: w1 } } }),
    prisma.user.count({ where: { role: "ACENTE", createdAt: { gte: w1 } } }),
    prisma.user.count({ where: { role: "REHBER", createdAt: { gte: w4 } } }),
    prisma.user.count({ where: { role: "ACENTE", createdAt: { gte: w4 } } }),
    prisma.rehberLicense.count({ where: { status: "PENDING" } }),
    prisma.rehberLicense.count({ where: { status: "VERIFIED" } }),
    prisma.ilan.count({ where: { isActive: true } }),
    prisma.ilan.count(),
    prisma.message.count(),
    prisma.message.count({ where: { createdAt: { gte: w1 } } }),
    prisma.review.count(),
    // haftalar: [bu hafta, 1 hafta önce, 2 hafta önce, 3 hafta önce]
    prisma.user.count({ where: { role: "REHBER", createdAt: { gte: week(1), lt: now } } }),
    prisma.user.count({ where: { role: "ACENTE", createdAt: { gte: week(1), lt: now } } }),
    prisma.user.count({ where: { role: "REHBER", createdAt: { gte: week(2), lt: week(1) } } }),
    prisma.user.count({ where: { role: "ACENTE", createdAt: { gte: week(2), lt: week(1) } } }),
    prisma.user.count({ where: { role: "REHBER", createdAt: { gte: week(3), lt: week(2) } } }),
    prisma.user.count({ where: { role: "ACENTE", createdAt: { gte: week(3), lt: week(2) } } }),
    prisma.user.count({ where: { role: "REHBER", createdAt: { gte: week(4), lt: week(3) } } }),
    prisma.user.count({ where: { role: "ACENTE", createdAt: { gte: week(4), lt: week(3) } } }),
  ]);

  const weeklyData = [
    { label: "3 hafta önce", rehber: w3rehber, acente: w3acente },
    { label: "2 hafta önce", rehber: w2rehber, acente: w2acente },
    { label: "Geçen hafta",  rehber: w1rehber, acente: w1acente },
    { label: "Bu hafta",     rehber: w0rehber, acente: w0acente },
  ];

  const maxWeekly = Math.max(...weeklyData.map(w => w.rehber + w.acente), 1);

  const summaryCards = [
    { label: "Toplam Rehber",   value: rehberTotal,     sub: `+${rehberW1} bu hafta`,  icon: Users,          color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "Toplam Acente",   value: acenteTotal,     sub: `+${acenteW1} bu hafta`,  icon: Building2,      color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
    { label: "Son 4 Hf. Yeni",  value: rehberW4 + acenteW4, sub: `${rehberW4}R + ${acenteW4}A`, icon: TrendingUp, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "Bekleyen Lisans", value: pendingLicenses, sub: `${verifiedLicenses} onaylı`,      icon: ShieldCheck,    color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Aktif İlan",      value: activeIlanlar,   sub: `${totalIlanlar} toplam`,           icon: FileText,       color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Toplam Mesaj",    value: totalMessages,   sub: `+${messagesW1} bu hafta`,          icon: MessageCircle,  color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    { label: "Değerlendirme",   value: totalReviews,    sub: "toplam yorum",                     icon: Star,           color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--card-text, #f1f5f9)" }}>İstatistikler</h1>
        <p className="text-sm mt-1" style={{ color: "var(--card-text-muted, #94a3b8)" }}>Platform geneli veriler</p>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <span className="text-2xl font-bold text-white">{value}</span>
            </div>
            <p className="text-xs font-medium text-white">{label}</p>
            <p className="text-xs text-white/40 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Haftalık kayıt tablosu */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--card-inner-border)" }}>
          <h2 className="font-semibold text-white">Haftalık Yeni Kayıtlar</h2>
          <p className="text-xs text-white/40 mt-0.5">Son 4 hafta</p>
        </div>
        <div className="p-5 space-y-3">
          {weeklyData.map(({ label, rehber, acente }) => {
            const total = rehber + acente;
            const rehberPct = total > 0 ? (rehber / maxWeekly) * 100 : 0;
            const acentePct = total > 0 ? (acente / maxWeekly) * 100 : 0;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/60">{label}</span>
                  <span className="text-xs font-medium text-white">{total} kayıt</span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--card-inner-bg)" }}>
                  {rehber > 0 && (
                    <div className="h-full rounded-full transition-all" style={{ width: `${rehberPct}%`, background: "#3b82f6" }} />
                  )}
                  {acente > 0 && (
                    <div className="h-full rounded-full transition-all" style={{ width: `${acentePct}%`, background: "#a855f7" }} />
                  )}
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs" style={{ color: "#3b82f6" }}>{rehber} rehber</span>
                  <span className="text-xs" style={{ color: "#a855f7" }}>{acente} acente</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="px-5 pb-4 flex gap-4">
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#3b82f6" }} /> Rehber
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#a855f7" }} /> Acente
          </span>
        </div>
      </div>

      {/* Lisans + İlan özet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <h2 className="font-semibold text-white mb-4">Lisans Durumu</h2>
          <div className="space-y-3">
            {[
              { label: "Bekleyen",  value: pendingLicenses,  color: "#f59e0b" },
              { label: "Onaylanan", value: verifiedLicenses, color: "#22c55e" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm text-white/70">{label}</span>
                </div>
                <span className="text-sm font-bold text-white">{value}</span>
              </div>
            ))}
            <div className="pt-2 border-t" style={{ borderColor: "var(--card-inner-border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Toplam</span>
                <span className="text-sm font-bold text-white">{pendingLicenses + verifiedLicenses}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <h2 className="font-semibold text-white mb-4">İlan Durumu</h2>
          <div className="space-y-3">
            {[
              { label: "Aktif",  value: activeIlanlar,              color: "#22c55e" },
              { label: "Pasif",  value: totalIlanlar - activeIlanlar, color: "#64748b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm text-white/70">{label}</span>
                </div>
                <span className="text-sm font-bold text-white">{value}</span>
              </div>
            ))}
            <div className="pt-2 border-t" style={{ borderColor: "var(--card-inner-border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Toplam</span>
                <span className="text-sm font-bold text-white">{totalIlanlar}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
