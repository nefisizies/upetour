"use client";

export function Iskelet({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: "rgba(255,255,255,0.06)" }}
    />
  );
}

export function KartIskeleti() {
  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
      <Iskelet className="h-4 w-2/3" />
      <Iskelet className="h-3 w-full" />
      <Iskelet className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Iskelet className="h-5 w-16" />
        <Iskelet className="h-5 w-20" />
      </div>
    </div>
  );
}

export function ListeIskeleti({ adet = 3 }: { adet?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: adet }).map((_, i) => <KartIskeleti key={i} />)}
    </div>
  );
}
