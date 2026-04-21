export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RehberProfilForm } from "@/components/RehberProfilForm";

export default async function RehberProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const profile = await prisma.rehberProfile.findUnique({
    where: { userId: session.user.id },
    include: { tours: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profilimi Düzenle</h1>
      <RehberProfilForm profile={profile} />
    </div>
  );
}
