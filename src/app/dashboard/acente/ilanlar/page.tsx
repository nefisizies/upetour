export const dynamic = "force-dynamic";

import type { CSSProperties } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, MapPin, Globe, Wallet, Users, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
import { IlanToggleButonu } from "@/components/IlanToggleButonu";

export default async function AcenteIlanlarPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ACENTE") redirect("/dashboard");

  const profile = await prisma.acenteProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      ilanlar: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { basvurular: true } } },
      },
    },
  });

  const ilanlar = profile?.ilanlar ?? [];
  const aktif = ilanlar.filter((i) => i.isActive).length;

  return (
    <div className="space-y-6" data-layout="dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary, #f1f5f9)" }}>İlanlarım</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted, #94a3b8)" }}>
            {aktif} aktif · {ilanlar.length} toplam
          </p>
        </div>
        <Link
          href="/dashboard/acente/ilanlar/yeni"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          <Plus className="w-4 h-4" /> Yeni İlan
        </Link>
      </div>

      {ilanlar.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-primary, #f1f5f9)" }}>Henüz ilan yok</p>
          <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-muted, #94a3b8)" }}>İlk ilanınızı oluşturun, rehberler başvursun.</p>
          <Link
            href="/dashboard/acente/ilanlar/yeni"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <Plus className="w-4 h-4" /> İlan Oluştur
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {ilanlar.map((ilan) => (
            <div
              key={ilan.id}
              className="rounded-2xl p-5"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate" style={{ color: "var(--text-primary, #f1f5f9)" }}>{ilan.title}</h3>
                    <span
                      className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={ilan.isActive
                        ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                        : { background: "rgba(148,163,184,0.15)", color: "#94a3b8" }}
                    >
                      {ilan.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  {ilan.description && (
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--text-muted, #94a3b8)" }}>{ilan.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>
                    {ilan.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ilan.location}</span>
                    )}
                    {ilan.budget && (
                      <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />{ilan.budget}</span>
                    )}
                    {ilan.languages.length > 0 && (
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{ilan.languages.join(", ")}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <Link href="/dashboard/acente/basvurular" className="hover:underline" style={{ color: "var(--primary)" }}>
                        {ilan._count.basvurular} başvuru
                      </Link>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/acente/ilanlar/${ilan.id}/duzenle`}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    title="Düzenle"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <IlanToggleButonu ilanId={ilan.id} isActive={ilan.isActive} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileText({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
