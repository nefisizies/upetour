export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RehberProfilSayfasi } from "@/components/RehberProfilSayfasi";

export default async function RehberProfilPage({
  searchParams,
}: {
  searchParams: { yeni?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const profile = await prisma.rehberProfile.findUnique({
    where: { userId: session.user.id },
    include: { tours: true, licenses: true, languages: true },
  });

  const isYeni = searchParams.yeni === "1" || !profile?.bio;

  return (
    <div className="max-w-2xl">
      <RehberProfilSayfasi profile={profile} isYeni={isYeni} />
    </div>
  );
}
