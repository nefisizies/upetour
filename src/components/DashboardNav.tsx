"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, User, MessageCircle, Search, LogOut, CalendarDays, Building2, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { BildirimDropdown } from "@/components/BildirimDropdown";

const rehberLinks = [
  { href: "/dashboard/rehber", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/rehber/profil", label: "Profilim", icon: User },
  { href: "/dashboard/rehber/takvim", label: "Takvim", icon: CalendarDays },
  { href: "/dashboard/rehber/mesajlar", label: "Mesajlar", icon: MessageCircle },
];

const acenteLinks = [
  { href: "/dashboard/acente", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/acente/profil", label: "Profilim", icon: User },
  { href: "/dashboard/acente/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/dashboard/acente/rehber-bul", label: "Rehber Bul", icon: Search },
];

export function DashboardNav({ role, email }: { role: string; email: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = role === "REHBER" ? rehberLinks : acenteLinks;
  const homeHref = role === "REHBER" ? "/dashboard/rehber" : "/dashboard/acente";

  function NavLink({ href, label, icon: NavIcon }: { href: string; label: string; icon: React.ElementType }) {
    const isActive = pathname === href || (href !== homeHref && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all"
        style={isActive ? {
          backgroundColor: "var(--nav-active-bg)",
          color: "var(--nav-active-text)",
          fontWeight: 600,
        } : { color: "var(--nav-text, #4b5563)" }}
        onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.05)"; (e.currentTarget as HTMLElement).style.color = "var(--nav-text-hover, #111827)"; } }}
        onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.color = "var(--nav-text, #4b5563)"; } }}
      >
        <NavIcon className="w-4 h-4" />
        {label}
      </Link>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: "color-mix(in srgb, var(--sidebar-bg) 92%, transparent)", backdropFilter: "blur(12px)", borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "var(--nav-text, #4b5563)" }}
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Logo size="sm" href={homeHref} />
            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-0.5">
              {links.map(l => <NavLink key={l.href} {...l} />)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BildirimDropdown />
            <DarkModeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-sm transition-colors p-2 rounded-lg"
              style={{ color: "var(--nav-text, #4b5563)" }}
              title="Çıkış"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block text-sm">Çıkış</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 pt-14"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="dash-card mx-4 mt-2 rounded-2xl shadow-xl p-3 space-y-0.5"
            onClick={e => e.stopPropagation()}
          >
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm"
                style={pathname === l.href
                  ? { backgroundColor: "var(--nav-active-bg)", color: "var(--nav-active-text)", fontWeight: 600 }
                  : { color: "var(--nav-text, #4b5563)" }}
              >
                <l.icon className="w-4 h-4" />
                {l.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t" style={{ borderColor: "var(--card-inner-border)" }}>
              <p className="px-4 py-1 text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{email}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors text-red-500"
              >
                <LogOut className="w-4 h-4" /> Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
