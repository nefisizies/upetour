import { prisma } from "@/lib/prisma";
import { AdminPageTitle } from "./AdminPageTitle";
import { DarkModeToggle } from "./DarkModeToggle";
import { AdminTopBarActions } from "./AdminTopBarActions";

export async function AdminTopBar() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    rehberCount, acenteCount,
    newRehberWeek, newAcenteWeek,
    pendingLicenses, activeIlanlar,
    newMessagesWeek,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "REHBER" } }),
    prisma.user.count({ where: { role: "ACENTE" } }),
    prisma.user.count({ where: { role: "REHBER", createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { role: "ACENTE", createdAt: { gte: sevenDaysAgo } } }),
    prisma.rehberLicense.count({ where: { status: "PENDING" } }),
    prisma.ilan.count({ where: { isActive: true } }),
    prisma.message.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const newThisWeek = newRehberWeek + newAcenteWeek;

  const stats: { label: string; value: string; accent?: string }[] = [
    { label: "Rehber", value: String(rehberCount), accent: "#3b82f6" },
    { label: "Acente", value: String(acenteCount), accent: "#a855f7" },
    {
      label: "Bu hafta",
      value: newThisWeek > 0 ? `+${newThisWeek}` : "0",
      accent: newThisWeek > 0 ? "#22c55e" : undefined,
    },
    ...(pendingLicenses > 0 ? [{ label: "Bekleyen lisans", value: String(pendingLicenses), accent: "#f59e0b" }] : []),
    { label: "Aktif ilan", value: String(activeIlanlar) },
    ...(newMessagesWeek > 0 ? [{ label: "Haftalık mesaj", value: String(newMessagesWeek) }] : []),
  ];

  return (
    <div className="sticky top-0 z-10 border-b px-6 h-12 flex items-center justify-between shrink-0"
      style={{
        background: "color-mix(in srgb, var(--sidebar-bg) 95%, transparent)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--panel-border)",
      }}>

      {/* Sol: hangi sayfa */}
      <AdminPageTitle />

      {/* Sağ: istatistikler + araçlar */}
      <div className="flex items-center gap-3">
        {/* Stat chips */}
        <div className="hidden lg:flex items-center gap-2">
          {stats.map(s => (
            <span key={s.label}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--card-inner-bg)",
                border: "1px solid var(--card-inner-border)",
                color: "var(--panel-text)",
              }}>
              <span className="font-bold" style={{ color: s.accent ?? "var(--primary)" }}>{s.value}</span>
              <span style={{ color: "var(--panel-text-muted)" }}>{s.label}</span>
            </span>
          ))}
        </div>

        {/* Tablet: sadece sayılar, etiket yok */}
        <div className="hidden sm:flex lg:hidden items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: "#3b82f6" }}>{rehberCount}R</span>
          <span style={{ color: "var(--panel-text-muted)" }}>·</span>
          <span className="text-xs font-medium" style={{ color: "#a855f7" }}>{acenteCount}A</span>
          {newThisWeek > 0 && <>
            <span style={{ color: "var(--panel-text-muted)" }}>·</span>
            <span className="text-xs font-medium" style={{ color: "#22c55e" }}>+{newThisWeek}</span>
          </>}
        </div>

        <DarkModeToggle />
        <AdminTopBarActions />
      </div>
    </div>
  );
}
