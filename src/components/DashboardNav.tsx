"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Compass, Building2, LayoutDashboard, User, MessageCircle, FileText, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const rehberLinks = [
  { href: "/dashboard/rehber", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/rehber/profil", label: "Profilim", icon: User },
  { href: "/dashboard/rehber/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/kesfet/ilanlar", label: "İlanlar", icon: Search },
];

const acenteLinks = [
  { href: "/dashboard/acente", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/acente/profil", label: "Profilim", icon: User },
  { href: "/dashboard/acente/ilanlar", label: "İlanlarım", icon: FileText },
  { href: "/dashboard/acente/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/kesfet/rehberler", label: "Rehber Bul", icon: Search },
];

export function DashboardNav({ role, email }: { role: string; email: string }) {
  const pathname = usePathname();
  const links = role === "REHBER" ? rehberLinks : acenteLinks;
  const Icon = role === "REHBER" ? Compass : Building2;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[#0a7ea4] font-bold text-lg">
            <Icon className="w-5 h-5" />
            TurBağ
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: NavIcon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors",
                  pathname === href
                    ? "bg-[#0a7ea4]/10 text-[#0a7ea4] font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <NavIcon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Çıkış</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
