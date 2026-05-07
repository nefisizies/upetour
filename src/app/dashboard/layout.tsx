import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { WaveBackground } from "@/components/WaveBackground";
import { AdminBanner } from "@/components/AdminBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/giris");

  // ADMIN panel has its own layout with sidebar + top bar — skip the standard nav
  const isAdmin = session.user.role === "ADMIN" && !session.user.adminId;

  return (
    <div className="min-h-screen" data-layout="dashboard">
      <WaveBackground />
      <AdminBanner />
      {!isAdmin && <DashboardNav role={session.user.role} email={session.user.email} />}
      {isAdmin ? children : <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>}
    </div>
  );
}
