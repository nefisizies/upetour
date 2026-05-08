"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function IlanToggleButonu({ ilanId, isActive }: { ilanId: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await fetch(`/api/admin/ilan/${ilanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    });
  }

  if (pending) return <Loader2 className="w-4 h-4 animate-spin text-white/40 shrink-0" />;

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${
        isActive
          ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
          : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
      }`}
    >
      {isActive ? <><EyeOff className="w-3.5 h-3.5" /> Pasif Yap</> : <><Eye className="w-3.5 h-3.5" /> Aktif Yap</>}
    </button>
  );
}
