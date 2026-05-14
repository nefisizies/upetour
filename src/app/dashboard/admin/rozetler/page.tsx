export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RozetOnayClient } from "./RozetOnayClient";

export default async function AdminRozetlerPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [bekleyenler, onaylananlar, toplamCheckin] = await Promise.all([
    prisma.rehberRozet.findMany({
      where: { onaylandi: false },
      include: {
        rehber: { select: { name: true, slug: true, photoUrl: true, unvan: true, checkInSayisi: true } },
        rozet: true,
      },
      orderBy: { kazanildiAt: "desc" },
    }),
    prisma.rehberRozet.count({ where: { onaylandi: true } }),
    prisma.checkIn.count(),
  ]);

  return (
    <RozetOnayClient
      bekleyenler={bekleyenler.map((r) => ({
        ...r,
        kazanildiAt: r.kazanildiAt.toISOString(),
      }))}
      toplamOnaylanan={onaylananlar}
      toplamCheckin={toplamCheckin}
    />
  );
}
