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
      className="flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
      style={{ color: "var(--card-text-muted, #94a3b8)", border: "1px solid var(--card-border, rgba(255,255,255,0.1))" }}
      onMouseEnter={e => { e.currentTarget.style.color = "#0a7ea4"; e.currentTarget.style.borderColor = "#0a7ea4"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "var(--card-text-muted, #94a3b8)"; e.currentTarget.style.borderColor = "var(--card-border, rgba(255,255,255,0.1))"; }}
    >
      <Eye className="w-3.5 h-3.5" />
      {loading ? "Geçiyor..." : "Görüntüle"}
    </button>
  );
}
