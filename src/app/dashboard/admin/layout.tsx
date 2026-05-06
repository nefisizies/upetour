import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Palette, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { WaveBackground } from "@/components/WaveBackground";

const adminLinks = [
  { href: "/dashboard/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/admin/tema", label: "Tema & Görünüm", icon: Palette, exact: false },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  // Only pure admins (not impersonating) can access admin panel
  if (!session || session.user.role !== "ADMIN" || session.user.adminId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <WaveBackground />
      {/* Sidebar */}
      <aside className="w-56 shrink-0 sticky top-0 h-screen flex flex-col backdrop-blur-md border-r z-20" style={{ background: "rgba(0,0,0,0.7)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Logo size="sm" href="/dashboard/admin" darkBg />
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
            <span className="text-xs text-white/40 truncate">{session.user.email}</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 text-sm text-white/50 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
