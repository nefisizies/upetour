import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AdminNav } from "@/components/AdminNav";
import { AdminTopBar } from "@/components/AdminTopBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  // Only pure admins (not impersonating) can access admin panel
  if (!session || session.user.role !== "ADMIN" || session.user.adminId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex" data-layout="dashboard" style={{ background: "var(--bg-page)" }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 sticky top-0 h-screen flex flex-col border-r z-20 bg-white/95"
        style={{ backdropFilter: "blur(12px)", borderColor: "var(--panel-border, rgba(0,0,0,0.08))" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--panel-border)" }}>
          <Logo size="sm" href="/dashboard/admin" />
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
            <span className="text-xs truncate" style={{ color: "var(--panel-text-muted)" }}>{session.user.email}</span>
          </div>
        </div>
        <AdminNav />
      </aside>
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <AdminTopBar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
