export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RehberProfilForm } from "@/components/RehberProfilForm";
import { WelcomeBanner } from "@/components/WelcomeBanner";

export default async function RehberProfilPage({
  searchParams,
}: {
  searchParams: { yeni?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const profile = await prisma.rehberProfile.findUnique({
    where: { userId: session.user.id },
    include: { tours: true, licenses: true },
  });

  const isYeni = searchParams.yeni === "1" || !profile?.bio;

  return (
    <div className="max-w-2xl">
      {isYeni && (
        <WelcomeBanner
          name={profile?.name ?? ""}
          dashboardHref="/dashboard/rehber"
        />
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isYeni ? "Profilini Tamamla" : "Profilimi Düzenle"}
      </h1>
      <RehberProfilForm profile={profile} />
    </div>
  );
}
