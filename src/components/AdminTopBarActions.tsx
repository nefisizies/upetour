"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminTopBarActions() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1 text-xs transition-colors"
      style={{ color: "var(--panel-text-muted)" }}
      onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--panel-text-muted)")}
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden sm:block">Çıkış</span>
    </button>
  );
}
