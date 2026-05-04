import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { WaveBackground } from "@/components/WaveBackground";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/giris");

  return (
    <div className="min-h-screen">
      <WaveBackground />
      <DashboardNav role={session.user.role} email={session.user.email} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
