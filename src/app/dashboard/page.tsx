import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/giris");

  if (session.user.role === "REHBER") redirect("/dashboard/rehber");
  if (session.user.role === "ACENTE") redirect("/dashboard/acente");

  redirect("/giris");
}
