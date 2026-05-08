"use client";

import dynamic from "next/dynamic";

// ssr: false only allowed in client components — this wrapper lets server layouts use it
const WaveBackgroundInner = dynamic(
  () => import("./WaveBackground").then(m => ({ default: m.WaveBackground })),
  { ssr: false }
);

export function WaveBackgroundClient() {
  return <WaveBackgroundInner />;
}
