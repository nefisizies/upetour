"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShieldCheck, Palette, BarChart2 } from "lucide-react";

const pages = [
  { href: "/dashboard/admin",                label: "Genel Bakış",     icon: LayoutDashboard },
  { href: "/dashboard/admin/kullanicilar",   label: "Kullanıcılar",    icon: Users },
  { href: "/dashboard/admin/lisanslar",      label: "Lisans Onayları", icon: ShieldCheck },
  { href: "/dashboard/admin/istatistikler",  label: "İstatistikler",   icon: BarChart2 },
  { href: "/dashboard/admin/tema",           label: "Tema & Görünüm",  icon: Palette },
];

export function AdminPageTitle() {
  const pathname = usePathname();
  const current = pages.find(p => p.href === pathname) ?? pages[0];
  const Icon = current.icon;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color: "var(--panel-text-muted)" }}>Admin</span>
      <span style={{ color: "var(--panel-text-muted)" }}>›</span>
      <span className="flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-lg"
        style={{ background: "var(--nav-active-bg)", color: "var(--nav-active-text)" }}>
        <Icon className="w-3.5 h-3.5" />
        {current.label}
      </span>
    </div>
  );
}
