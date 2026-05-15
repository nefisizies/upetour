import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md", href = "/", darkBg = false }: { className?: string; size?: "sm" | "md" | "lg"; href?: string; darkBg?: boolean }) {
  const sizes = {
    sm: { icon: 28, text: "text-lg", gap: "gap-1.5" },
    md: { icon: 36, text: "text-2xl", gap: "gap-2" },
    lg: { icon: 52, text: "text-4xl", gap: "gap-3" },
  };
  const s = sizes[size];

  return (
    <Link href={href} className={cn("inline-flex items-center", s.gap, className)}>
      <LogoIcon size={s.icon} />
      <span className={cn("font-bold tracking-tight", darkBg ? "text-white" : "text-gray-900", s.text)}>
        Upe<span style={{ color: "var(--primary)" }}>Tour</span>
      </span>
    </Link>
  );
}

export function LogoIcon({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Arka plan daire */}
      <circle cx="20" cy="20" r="20" style={{ fill: "var(--primary)" }} />

      {/* Konum pin gövdesi */}
      <path
        d="M20 8C15.582 8 12 11.582 12 16C12 22 20 32 20 32C20 32 28 22 28 16C28 11.582 24.418 8 20 8Z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Pin iç daire */}
      <circle cx="20" cy="16" r="4" style={{ fill: "var(--primary)" }} />

      {/* Pin iç nokta */}
      <circle cx="20" cy="16" r="1.5" fill="white" fillOpacity="0.8" />
    </svg>
  );
}
