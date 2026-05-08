export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ImpersonateButton } from "@/components/ImpersonateButton";
import { MapPin } from "lucide-react";

export default async function KullanicilarPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const rol = params.rol as "REHBER" | "ACENTE" | undefined;
  const q = params.q?.trim();

  const users = await prisma.user.findMany({
    where: {
      role: rol ? rol : { not: "ADMIN" },
      ...(q ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { rehberProfile: { name: { contains: q, mode: "insensitive" } } },
          { acenteProfile: { companyName: { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      rehberProfile: { select: { name: true, slug: true, photoUrl: true, city: true } },
      acenteProfile:  { select: { companyName: true, slug: true, logoUrl: true, city: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--card-text, #f1f5f9)" }}>Kullanıcılar</h1>
        <p className="text-sm mt-1" style={{ color: "var(--card-text-muted, #94a3b8)" }}>{users.length} kullanıcı</p>
      </div>

      {/* Filtreler */}
      <form className="flex gap-2 flex-wrap">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="İsim veya e-posta ara..."
          className="rounded-xl px-3 py-2 text-sm outline-none flex-1 min-w-40"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--panel-text)" }}
        />
        {(["", "REHBER", "ACENTE"] as const).map(r => (
          <button key={r} type="submit" name="rol" value={r}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={rol === r || (!rol && r === "")
              ? { background: "var(--nav-active-bg)", color: "var(--nav-active-text)" }
              : { background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--panel-text)" }
            }>
            {r || "Tümü"}
          </button>
        ))}
      </form>

      {/* Liste */}
      <div className="backdrop-blur-sm rounded-2xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="divide-y divide-white/5">
          {users.map(user => {
            const name = user.rehberProfile?.name ?? user.acenteProfile?.companyName ?? user.email;
            const city = user.rehberProfile?.city ?? user.acenteProfile?.city;
            const photo = user.rehberProfile?.photoUrl ?? user.acenteProfile?.logoUrl;
            const dashboardHref = user.role === "REHBER" ? "/dashboard/rehber" : "/dashboard/acente";

            return (
              <div key={user.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-sm font-semibold text-white/50"
                  style={{ background: "var(--card-bg)" }}>
                  {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white truncate">{name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      user.role === "REHBER"
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                        : "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                    }`}>{user.role}</span>
                  </div>
                  <div className="text-xs text-white/40 flex items-center gap-2 flex-wrap">
                    <span>{user.email}</span>
                    {city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{city}</span>}
                  </div>
                </div>
                <ImpersonateButton userId={user.id} targetHref={dashboardHref} />
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-white/40">Kullanıcı bulunamadı</div>
          )}
        </div>
      </div>
    </div>
  );
}
