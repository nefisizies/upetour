export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MesajlarClient } from "@/components/MesajlarClient";

export default async function MesajlarPage({
  searchParams,
}: {
  searchParams: Promise<{ ile?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "REHBER") redirect("/dashboard");

  const params = await searchParams;

  // Tüm mesajları çek (sadece acentelerden gelenler)
  const tumMesajlar = await prisma.message.findMany({
    where: {
      OR: [
        { toUserId: session.user.id, from: { role: "ACENTE" } },
        { fromUserId: session.user.id, to: { role: "ACENTE" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      from: {
        select: {
          id: true, role: true,
          acenteProfile: { select: { companyName: true, logoUrl: true } },
        },
      },
      to: {
        select: {
          id: true, role: true,
          acenteProfile: { select: { companyName: true, logoUrl: true } },
        },
      },
    },
  });

  // Konuşmaları karşı taraf bazında grupla
  const konusmaMap = new Map<string, {
    userId: string;
    ad: string;
    foto: string | null;
    rol: string;
    sonMesaj: string;
    sonTarih: Date;
    okunmamis: number;
  }>();

  for (const m of tumMesajlar) {
    const karsi = m.fromUserId === session.user.id ? m.to : m.from;
    const karsiId = karsi.id;

    if (konusmaMap.has(karsiId)) continue; // zaten ilk (en yeni) mesaj eklendi

    const ad = karsi.acenteProfile?.companyName ?? karsi.id;
    const foto = karsi.acenteProfile?.logoUrl ?? null;

    // Bu kişiden okunmamış mesaj sayısı
    const okunmamis = tumMesajlar.filter(
      (x) => x.fromUserId === karsiId && x.toUserId === session.user.id && !x.isRead
    ).length;

    konusmaMap.set(karsiId, {
      userId: karsiId,
      ad,
      foto,
      rol: karsi.role,
      sonMesaj: m.content,
      sonTarih: m.createdAt,
      okunmamis,
    });
  }

  const konusmalar = Array.from(konusmaMap.values());
  const seciliId = params.ile ?? (konusmalar[0]?.userId ?? null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--upe-ink)" }}>Mesajlar</h1>
        <p className="text-sm mt-1" style={{ color: "var(--fg-3)" }}>Acentelerle yazışmalarınız</p>
      </div>
      <MesajlarClient
        benimId={session.user.id}
        konusmalar={konusmalar}
        seciliId={seciliId}
      />
    </div>
  );
}
