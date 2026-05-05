"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, X, Eye } from "lucide-react";

export function AdminBanner() {
  const { data: session, update } = useSession();
  const router = useRouter();

  if (!session?.user.adminId) return null;

  async function exitImpersonation() {
    await update({ impersonatingId: null });
    router.push("/dashboard/admin");
    router.refresh();
  }

  return (
    <div className="w-full bg-amber-500 text-white text-sm flex items-center justify-between px-4 py-2 z-50 sticky top-0">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 shrink-0" />
        <span>
          <span className="font-semibold">Admin Modu:</span>{" "}
          <span className="opacity-90">{session.user.email}</span> olarak görüntülüyorsunuz
        </span>
      </div>
      <button
        onClick={exitImpersonation}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1 font-medium text-xs"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Admin Paneline Dön
        <X className="w-3.5 h-3.5 ml-0.5" />
      </button>
    </div>
  );
}
