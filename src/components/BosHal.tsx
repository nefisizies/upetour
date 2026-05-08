import { LucideIcon } from "lucide-react";
import Link from "next/link";

export function BosHal({
  ikon: Ikon,
  baslik,
  aciklama,
  butonLabel,
  butonHref,
}: {
  ikon?: LucideIcon;
  baslik: string;
  aciklama?: string;
  butonLabel?: string;
  butonHref?: string;
}) {
  return (
    <div
      className="text-center py-16 px-6 rounded-2xl"
      style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
    >
      {Ikon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <Ikon className="w-7 h-7 opacity-40" style={{ color: "var(--text-muted)" }} />
        </div>
      )}
      <p className="font-semibold text-base" style={{ color: "var(--text-primary, #f1f5f9)" }}>{baslik}</p>
      {aciklama && (
        <p className="text-sm mt-1.5 max-w-xs mx-auto" style={{ color: "var(--text-muted, #94a3b8)" }}>{aciklama}</p>
      )}
      {butonLabel && butonHref && (
        <Link
          href={butonHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium mt-5 transition-opacity hover:opacity-90"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          {butonLabel}
        </Link>
      )}
    </div>
  );
}
