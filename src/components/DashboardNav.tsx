"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, User, MessageCircle, FileText, Search, LogOut, CalendarDays, Building2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const rehberLinks = [
  { href: "/dashboard/rehber", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/rehber/profil", label: "Profilim", icon: User },
  { href: "/dashboard/rehber/takvim", label: "Takvim", icon: CalendarDays },
  { href: "/dashboard/rehber/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/kesfet/ilanlar", label: "İlanlar", icon: Search },
  { href: "/kesfet/acenteler", label: "Acenteler", icon: Building2 },
];

const acenteLinks = [
  { href: "/dashboard/acente", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/acente/profil", label: "Profilim", icon: User },
  { href: "/dashboard/acente/ilanlar", label: "İlanlarım", icon: FileText },
  { href: "/dashboard/acente/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/kesfet/rehberler", label: "Rehber Bul", icon: Search },
  { href: "/dashboard/acente/referanslar", label: "Referanslar", icon: Building2 },
];

export function DashboardNav({ role, email }: { role: string; email: string }) {
  const pathname = usePathname();
  const links = role === "REHBER" ? rehberLinks : acenteLinks;

  return (
    <nav className="sticky top-0 z-30 border-b"
      style={{
        backgroundColor: "color-mix(in srgb, var(--sidebar-bg) 92%, transparent)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(0,0,0,0.06)",
      }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo size="sm" href={role === "REHBER" ? "/dashboard/rehber" : "/dashboard/acente"} />
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label, icon: NavIcon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all"
                  style={isActive ? {
                    backgroundColor: "var(--nav-active-bg)",
                    color: "var(--nav-active-text)",
                    fontWeight: 600,
                  } : {
                    color: "var(--nav-text, #4b5563)",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.05)";
                      (e.currentTarget as HTMLElement).style.color = "var(--nav-text-hover, #111827)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "";
                      (e.currentTarget as HTMLElement).style.color = "var(--nav-text, #4b5563)";
                    }
                  }}
                >
                  <NavIcon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{email}</span>
          <DarkModeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Çıkış</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
