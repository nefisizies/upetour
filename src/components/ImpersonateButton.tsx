"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye } from "lucide-react";

export function ImpersonateButton({ userId, targetHref }: { userId: string; targetHref: string }) {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function impersonate() {
    setLoading(true);
    try {
      await update({ impersonatingId: userId });
      router.push(targetHref);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={impersonate}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0a7ea4] border border-gray-200 hover:border-[#0a7ea4] rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
    >
      <Eye className="w-3.5 h-3.5" />
      {loading ? "Geçiyor..." : "Görüntüle"}
    </button>
  );
}
