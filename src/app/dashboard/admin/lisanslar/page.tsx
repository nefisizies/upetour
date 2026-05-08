export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LisansOnayButonu } from "@/components/LisansOnayButonu";

export default async function LisanslarPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const lisanslar = await prisma.rehberLicense.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      rehber: {
        select: {
          name: true, photoUrl: true, city: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  const bekleyen = lisanslar.filter(l => l.status === "PENDING");
  const onaylanan = lisanslar.filter(l => l.status === "VERIFIED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lisans Onayları</h1>
        <p className="text-sm text-gray-500 mt-1">
          {bekleyen.length} bekleyen · {onaylanan.length} onaylı
        </p>
      </div>

      {bekleyen.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Bekleyen</h2>
          <div className="backdrop-blur-sm rounded-2xl overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="divide-y divide-white/5">
              {bekleyen.map(l => (
                <LisansRow key={l.id} lisans={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {onaylanan.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide">Onaylı</h2>
          <div className="backdrop-blur-sm rounded-2xl overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="divide-y divide-white/5">
              {onaylanan.map(l => (
                <LisansRow key={l.id} lisans={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {lisanslar.length === 0 && (
        <div className="text-center py-20 text-white/40">Henüz lisans başvurusu yok</div>
      )}
    </div>
  );
}

function LisansRow({ lisans }: { lisans: any }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-sm font-semibold text-white/50"
        style={{ background: "var(--card-bg)" }}>
        {lisans.rehber.photoUrl
          ? <img src={lisans.rehber.photoUrl} alt="" className="w-full h-full object-cover" />
          : lisans.rehber.name?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{lisans.rehber.name}</p>
        <p className="text-xs text-white/40">{lisans.rehber.user?.email}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm text-white/80">{lisans.country} — {lisans.licenseType}</p>
        <p className="text-xs text-white/40 font-mono">{lisans.licenseNo}</p>
      </div>
      <LisansOnayButonu lisansId={lisans.id} mevcutStatus={lisans.status} />
    </div>
  );
}
