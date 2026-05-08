export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RehberAra } from "@/components/RehberAra";

export default async function RehberBulPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") redirect("/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rehber Bul</h1>
      <RehberAra />
    </div>
  );
}
