export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Takvim } from "@/components/Takvim";

export default async function TakvimPage({ searchParams }: { searchParams: { tarih?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Takvimim</h1>
      <Takvim initialTarih={searchParams.tarih ?? null} />
    </div>
  );
}
