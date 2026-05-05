export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, UserCheck, Building2 } from "lucide-react";
import { ImpersonateButton } from "@/components/ImpersonateButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    orderBy: { createdAt: "desc" },
    include: {
      rehberProfile: { select: { name: true, slug: true, photoUrl: true, city: true } },
      acenteProfile:  { select: { companyName: true, slug: true, logoUrl: true, city: true } },
    },
  });

  const rehberCount = users.filter(u => u.role === "REHBER").length;
  const acenteCount = users.filter(u => u.role === "ACENTE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-sm text-gray-500 mt-1">Platform hesaplarını yönet, kullanıcı görünümüne geç</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{rehberCount}</div>
              <div className="text-xs text-gray-500">Tur Rehberi</div>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{acenteCount}</div>
              <div className="text-xs text-gray-500">Seyahat Acentesi</div>
            </div>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Kayıtlı Hesaplar</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {users.map(user => {
            const name = user.rehberProfile?.name ?? user.acenteProfile?.companyName ?? user.email;
            const city = user.rehberProfile?.city ?? user.acenteProfile?.city;
            const photo = user.rehberProfile?.photoUrl ?? user.acenteProfile?.logoUrl;
            const dashboardHref = user.role === "REHBER" ? "/dashboard/rehber" : "/dashboard/acente";

            return (
              <div key={user.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {photo
                    ? <img src={photo} alt={name} className="w-full h-full object-cover" />
                    : <span className="text-sm font-semibold text-gray-400">{name[0]?.toUpperCase()}</span>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">{name}</span>
                    <span className={`inline-flex text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      user.role === "REHBER" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}>{user.role}</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate">{user.email}{city ? ` · ${city}` : ""}</div>
                </div>
                {/* Impersonate button */}
                <ImpersonateButton userId={user.id} targetHref={dashboardHref} />
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Henüz kayıtlı kullanıcı yok</div>
          )}
        </div>
      </div>
    </div>
  );
}
