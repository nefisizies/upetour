"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function LisansOnayButonu({ lisansId, mevcutStatus }: { lisansId: string; mevcutStatus: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function guncelle(yeniStatus: string) {
    startTransition(async () => {
      await fetch(`/api/admin/lisans/${lisansId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: yeniStatus }),
      });
      router.refresh();
    });
  }

  if (pending) return <Loader2 className="w-4 h-4 animate-spin text-white/40" />;

  if (mevcutStatus === "PENDING") {
    return (
      <button
        onClick={() => guncelle("VERIFIED")}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-colors shrink-0"
      >
        <CheckCircle className="w-3.5 h-3.5" /> Onayla
      </button>
    );
  }

  return (
    <button
      onClick={() => guncelle("PENDING")}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-white/40 border border-white/10 hover:bg-red-500/15 hover:text-red-400 transition-colors shrink-0"
    >
      <XCircle className="w-3.5 h-3.5" /> Geri Al
    </button>
  );
}
