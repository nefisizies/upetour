export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AcenteReferanslar } from "@/components/AcenteReferanslar";

export default async function AcenteReferanslarPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") redirect("/dashboard");

  const profile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      referanslar: {
        include: {
          rehber: { select: { name: true, city: true, photoUrl: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      bloklar: {
        include: {
          rehber: { select: { name: true, city: true, photoUrl: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) redirect("/dashboard");

  return (
    <div className="max-w-2xl">
      <AcenteReferanslar referanslar={profile.referanslar} bloklar={profile.bloklar} />
    </div>
  );
}
