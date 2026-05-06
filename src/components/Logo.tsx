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
        Rehber<span style={{ color: "var(--primary)" }}>Sepeti</span>
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
      <circle cx="20" cy="20" r="20" fill="#0a7ea4" />

      {/* Sepet gövdesi */}
      <path
        d="M10 22h20l-2 8H12l-2-8z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Sepet ızgara çizgileri */}
      <line x1="16" y1="22" x2="15" y2="30" stroke="#0a7ea4" strokeWidth="1.2" />
      <line x1="20" y1="22" x2="20" y2="30" stroke="#0a7ea4" strokeWidth="1.2" />
      <line x1="24" y1="22" x2="25" y2="30" stroke="#0a7ea4" strokeWidth="1.2" />
      <line x1="10" y1="25.5" x2="30" y2="25.5" stroke="#0a7ea4" strokeWidth="1.2" />

      {/* Sepet sapı */}
      <path
        d="M14 22 C14 16 18 13 20 13 C22 13 26 16 26 22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pusula iğnesi / konum pin */}
      <circle cx="20" cy="13" r="3.5" fill="#FFD93D" />
      <circle cx="20" cy="13" r="1.5" fill="#0a7ea4" />
    </svg>
  );
}
