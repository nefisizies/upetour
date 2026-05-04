"use client";

import { useState, useEffect, useRef } from "react";

const THEMES = ["ocean", "desert", "rainforest", "mountain", "aurora", "spring"] as const;
type Theme = (typeof THEMES)[number];

const CYCLE_MS = 60_000;
const FADE_MS = 2_500;

// Deterministic LCG PRNG — identical output on server and client (SSR-safe)
function rng(seed: number) {
  let s = seed | 0;
  return (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

const RAIN = Array.from({ length: 25 }, (_, i) => {
  const r = rng(i * 13 + 7);
  return { left: r() * 100, delay: r() * 5, dur: 0.3 + r() * 0.5 };
});

const SNOW = Array.from({ length: 18 }, (_, i) => {
  const r = rng(i * 17 + 3);
  return { left: r() * 100, delay: r() * 8, dur: 5 + r() * 7, size: 3 + Math.round(r() * 5) };
});

const PETALS = Array.from({ length: 14 }, (_, i) => {
  const r = rng(i * 11 + 5);
  return { left: r() * 100, delay: r() * 10, dur: 6 + r() * 8, w: 8 + Math.round(r() * 10), h: 5 + Math.round(r() * 6), hue: 310 + Math.round(r() * 50) };
});

const SAND = Array.from({ length: 20 }, (_, i) => {
  const r = rng(i * 19 + 11);
  return { left: r() * 100, top: 25 + r() * 60, delay: r() * 6, dur: 3 + r() * 5, size: 2 + Math.round(r() * 3) };
});

const STARS = Array.from({ length: 50 }, (_, i) => {
  const r = rng(i * 23 + 2);
  return { left: r() * 100, top: r() * 75, delay: r() * 5, dur: 2 + r() * 4, size: 1 + Math.round(r() * 2) };
});

function OceanTheme() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #fde68a 0%, #fb923c 18%, #f472b6 36%, #818cf8 54%, #38bdf8 70%, #0ea5e9 82%, #0369a1 100%)",
      }} />
      <div className="absolute rounded-full" style={{
        width: 120, height: 120, top: "6%", left: "50%",
        transform: "translateX(-50%)",
        background: "radial-gradient(circle, #fef9c3 0%, #fde047 40%, #fb923c 80%, transparent 100%)",
        filter: "blur(4px)",
        animation: "sun-pulse 4s ease-in-out infinite",
        opacity: 0.9,
      }} />
      <div className="absolute" style={{
        width: "30%", height: "25%", top: "52%", left: "35%",
        background: "radial-gradient(ellipse, rgba(254,249,195,0.35) 0%, transparent 70%)",
        animation: "shimmer 3s ease-in-out infinite",
        filter: "blur(8px)",
      }} />
      <div className="absolute bottom-0 left-0" style={{ width: "200%", animation: "wave-slow 14s linear infinite" }}>
        <svg viewBox="0 0 1440 220" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,80 C180,140 360,20 540,80 C720,140 900,20 1080,80 C1260,140 1440,20 1440,80 L1440,220 L0,220 Z" fill="rgba(2,132,199,0.45)" />
          <path d="M1440,80 C1620,140 1800,20 1980,80 C2160,140 2340,20 2520,80 C2700,140 2880,20 2880,80 L2880,220 L1440,220 Z" fill="rgba(2,132,199,0.45)" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0" style={{ width: "200%", animation: "wave-mid 9s linear infinite" }}>
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,60 C200,110 400,10 600,60 C800,110 1000,10 1200,60 C1400,110 1440,30 1440,60 L1440,200 L0,200 Z" fill="rgba(14,165,233,0.5)" />
          <path d="M1440,60 C1640,110 1840,10 2040,60 C2240,110 2440,10 2640,60 C2840,110 2880,30 2880,60 L2880,200 L1440,200 Z" fill="rgba(14,165,233,0.5)" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0" style={{ width: "200%", animation: "wave-fast 6s linear infinite" }}>
        <svg viewBox="0 0 1440 170" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,50 C120,90 280,10 440,50 C600,90 760,10 920,50 C1080,90 1240,10 1440,50 L1440,170 L0,170 Z" fill="rgba(56,189,248,0.55)" />
          <path d="M1440,50 C1560,90 1720,10 1880,50 C2040,90 2200,10 2360,50 C2520,90 2680,10 2880,50 L2880,170 L1440,170 Z" fill="rgba(56,189,248,0.55)" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0" style={{ width: "200%", animation: "wave-fast 4.5s linear infinite reverse" }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,30 C80,50 160,10 240,30 C320,50 400,10 480,30 C560,50 640,10 720,30 C800,50 880,10 960,30 C1040,50 1120,10 1200,30 C1280,50 1360,10 1440,30 L1440,80 L0,80 Z" fill="rgba(186,230,253,0.6)" />
          <path d="M1440,30 C1520,50 1600,10 1680,30 C1760,50 1840,10 1920,30 C2000,50 2080,10 2160,30 C2240,50 2320,10 2400,30 C2480,50 2560,10 2640,30 C2720,50 2800,10 2880,30 L2880,80 L1440,80 Z" fill="rgba(186,230,253,0.6)" />
        </svg>
      </div>
    </div>
  );
}

function DesertTheme() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #fbbf24 0%, #f97316 25%, #ea580c 50%, #c2410c 70%, #92400e 100%)",
      }} />
      {/* Hot sun */}
      <div className="absolute rounded-full" style={{
        width: 100, height: 100, top: "8%", left: "50%",
        transform: "translateX(-50%)",
        background: "radial-gradient(circle, #ffffff 0%, #fef9c3 30%, #fde047 60%, transparent 100%)",
        filter: "blur(6px)",
        animation: "sun-pulse 6s ease-in-out infinite",
        opacity: 0.95,
      }} />
      {/* Heat shimmer */}
      <div className="absolute" style={{
        width: "60%", height: "15%", top: "55%", left: "20%",
        background: "radial-gradient(ellipse, rgba(251,191,36,0.25) 0%, transparent 70%)",
        animation: "shimmer 4s ease-in-out infinite",
        filter: "blur(12px)",
      }} />
      {/* Sand particles drifting */}
      {SAND.map((s, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          background: "rgba(253,230,138,0.75)",
          animation: `sand-drift ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
      {/* Dune layers */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 260" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,200 C180,130 360,170 540,140 C720,110 900,160 1080,130 C1260,100 1380,160 1440,145 L1440,260 L0,260 Z" fill="rgba(146,64,14,0.6)" />
          <path d="M0,230 C200,170 400,200 600,175 C800,150 1000,195 1200,165 C1320,148 1400,185 1440,175 L1440,260 L0,260 Z" fill="rgba(180,83,9,0.7)" />
          <path d="M0,250 C150,220 300,240 480,228 C660,216 840,244 1020,230 C1200,216 1340,238 1440,232 L1440,260 L0,260 Z" fill="rgba(217,119,6,0.5)" />
        </svg>
      </div>
    </div>
  );
}

function RainforestTheme() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #022c22 0%, #064e3b 30%, #065f46 55%, #047857 75%, #059669 100%)",
      }} />
      {/* Misty glow in canopy */}
      <div className="absolute" style={{
        width: "80%", height: "30%", top: "10%", left: "10%",
        background: "radial-gradient(ellipse, rgba(52,211,153,0.12) 0%, transparent 70%)",
        animation: "mist-drift 8s ease-in-out infinite",
        filter: "blur(20px)",
      }} />
      {/* Rain streaks */}
      {RAIN.map((d, i) => (
        <div key={i} className="absolute" style={{
          left: `${d.left}%`, top: 0,
          width: 1.5, height: "8vh",
          background: "linear-gradient(180deg, transparent, rgba(167,243,208,0.65), transparent)",
          animation: `rain-fall ${d.dur}s ${d.delay}s linear infinite`,
          transform: "rotate(4deg)",
        }} />
      ))}
      {/* Mist layers at bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: "35%",
        background: "linear-gradient(0deg, rgba(16,185,129,0.18), rgba(52,211,153,0.08), transparent)",
        animation: "mist-drift 12s ease-in-out infinite",
        filter: "blur(4px)",
      }} />
      {/* Canopy silhouette */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 280" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,200 C60,140 120,180 180,130 C240,80 300,160 360,110 C420,60 480,150 540,100 C600,50 660,130 720,90 C780,50 840,140 900,95 C960,50 1020,140 1080,100 C1140,60 1200,150 1260,110 C1320,70 1380,150 1440,120 L1440,280 L0,280 Z" fill="rgba(2,44,34,0.85)" />
          <path d="M0,240 C80,200 160,230 240,210 C320,190 400,225 480,205 C560,185 640,220 720,200 C800,180 880,215 960,200 C1040,185 1120,215 1200,200 C1280,185 1360,215 1440,205 L1440,280 L0,280 Z" fill="rgba(3,65,48,0.9)" />
        </svg>
      </div>
    </div>
  );
}

function MountainTheme() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #0c1b3a 0%, #1e3a5f 20%, #2563eb 45%, #7dd3fc 70%, #e0f2fe 90%, #f0f9ff 100%)",
      }} />
      {/* Moon/sun glow */}
      <div className="absolute rounded-full" style={{
        width: 70, height: 70, top: "7%", right: "18%",
        background: "radial-gradient(circle, #f0f9ff 0%, #bae6fd 50%, transparent 100%)",
        filter: "blur(5px)",
        animation: "sun-pulse 5s ease-in-out infinite",
        opacity: 0.85,
      }} />
      {/* Snowflakes */}
      {SNOW.map((s, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${s.left}%`, top: 0,
          width: s.size, height: s.size,
          background: "rgba(240,249,255,0.9)",
          animation: `snow-fall ${s.dur}s ${s.delay}s linear infinite`,
        }} />
      ))}
      {/* Cloud */}
      <div className="absolute" style={{
        width: "35%", height: 50, top: "15%", left: "5%",
        background: "rgba(240,249,255,0.25)",
        borderRadius: "50%",
        filter: "blur(14px)",
        animation: "cloud-drift 18s ease-in-out infinite alternate",
      }} />
      <div className="absolute" style={{
        width: "25%", height: 40, top: "20%", right: "8%",
        background: "rgba(240,249,255,0.2)",
        borderRadius: "50%",
        filter: "blur(12px)",
        animation: "cloud-drift 22s ease-in-out infinite alternate-reverse",
      }} />
      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          {/* Back range */}
          <path d="M0,280 L80,200 L160,240 L240,160 L320,210 L420,120 L520,180 L600,100 L700,170 L800,130 L900,200 L980,150 L1060,210 L1160,140 L1260,200 L1360,160 L1440,190 L1440,320 L0,320 Z" fill="rgba(30,58,95,0.6)" />
          {/* Snow caps */}
          <path d="M420,120 L450,150 L470,135 L490,155 L510,140 L520,180 Z" fill="rgba(240,249,255,0.8)" />
          <path d="M580,100 L610,130 L625,118 L640,132 L660,120 L700,170 Z" fill="rgba(240,249,255,0.8)" />
          <path d="M780,130 L810,158 L825,145 L840,160 L860,148 L900,200 Z" fill="rgba(240,249,255,0.75)" />
          {/* Front range */}
          <path d="M0,300 L100,240 L200,270 L300,220 L400,260 L500,200 L600,250 L700,215 L800,260 L900,230 L1000,265 L1100,235 L1200,268 L1300,240 L1440,280 L1440,320 L0,320 Z" fill="rgba(12,27,58,0.8)" />
        </svg>
      </div>
    </div>
  );
}

function AuroraTheme() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #020617 0%, #0c0f2e 35%, #1a0f3d 60%, #0f172a 100%)",
      }} />
      {/* Stars */}
      {STARS.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          animation: `star-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
      {/* Aurora band 1 — green */}
      <div className="absolute" style={{
        left: "-10%", top: "12%", width: "120%", height: 140,
        background: "linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.55) 40%, rgba(6,182,212,0.35) 70%, transparent 100%)",
        filter: "blur(22px)",
        borderRadius: "60%",
        animation: "aurora-sway 9s ease-in-out infinite",
      }} />
      {/* Aurora band 2 — purple */}
      <div className="absolute" style={{
        left: "-5%", top: "22%", width: "110%", height: 100,
        background: "linear-gradient(180deg, transparent 0%, rgba(167,139,250,0.5) 45%, rgba(99,102,241,0.35) 75%, transparent 100%)",
        filter: "blur(18px)",
        borderRadius: "50%",
        animation: "aurora-sway 12s 2.5s ease-in-out infinite",
      }} />
      {/* Aurora band 3 — teal/green */}
      <div className="absolute" style={{
        left: "5%", top: "32%", width: "105%", height: 80,
        background: "linear-gradient(180deg, transparent 0%, rgba(52,211,153,0.4) 50%, rgba(20,184,166,0.3) 80%, transparent 100%)",
        filter: "blur(14px)",
        borderRadius: "40%",
        animation: "aurora-sway 7.5s 4s ease-in-out infinite",
      }} />
      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: "25%",
        background: "linear-gradient(0deg, rgba(16,185,129,0.07) 0%, transparent 100%)",
      }} />
      {/* Ground silhouette */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: "12%",
        background: "rgba(2,6,23,0.9)",
        borderTopLeftRadius: "40% 30px",
        borderTopRightRadius: "30% 25px",
      }} />
    </div>
  );
}

function SpringTheme() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 25%, #f5d0fe 50%, #ede9fe 75%, #ddd6fe 100%)",
      }} />
      {/* Soft bokeh circles */}
      {[
        { left: "15%", top: "20%", size: 120, opacity: 0.12, delay: 0 },
        { left: "70%", top: "10%", size: 80, opacity: 0.1, delay: 1.5 },
        { left: "40%", top: "35%", size: 150, opacity: 0.09, delay: 3 },
        { left: "85%", top: "40%", size: 90, opacity: 0.11, delay: 2 },
        { left: "5%",  top: "55%", size: 100, opacity: 0.1, delay: 0.8 },
      ].map((b, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: b.left, top: b.top,
          width: b.size, height: b.size,
          background: `radial-gradient(circle, rgba(244,114,182,${b.opacity * 2}) 0%, rgba(216,180,254,${b.opacity}) 50%, transparent 70%)`,
          filter: "blur(18px)",
          animation: `float-slow ${6 + i}s ${b.delay}s ease-in-out infinite`,
        }} />
      ))}
      {/* Falling petals */}
      {PETALS.map((p, i) => (
        <div key={i} className="absolute" style={{
          left: `${p.left}%`, top: 0,
          width: p.w, height: p.h,
          background: `hsla(${p.hue}, 85%, 78%, 0.85)`,
          borderRadius: "50% 10% 50% 10%",
          animation: `petal-fall ${p.dur}s ${p.delay}s ease-in-out infinite`,
        }} />
      ))}
      {/* Soft glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: "30%",
        background: "linear-gradient(0deg, rgba(244,114,182,0.12) 0%, transparent 100%)",
      }} />
      {/* Ground blossoms */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,80 C100,50 200,70 300,55 C400,40 500,65 600,50 C700,35 800,60 900,48 C1000,36 1100,58 1200,45 C1300,32 1380,55 1440,48 L1440,120 L0,120 Z" fill="rgba(244,114,182,0.2)" />
          <path d="M0,100 C150,80 300,95 450,85 C600,75 750,92 900,82 C1050,72 1200,90 1350,83 C1400,80 1420,88 1440,85 L1440,120 L0,120 Z" fill="rgba(216,180,254,0.3)" />
        </svg>
      </div>
    </div>
  );
}

function ThemeLayer({ theme }: { theme: Theme }) {
  switch (theme) {
    case "ocean":      return <OceanTheme />;
    case "desert":     return <DesertTheme />;
    case "rainforest": return <RainforestTheme />;
    case "mountain":   return <MountainTheme />;
    case "aurora":     return <AuroraTheme />;
    case "spring":     return <SpringTheme />;
  }
}

export function WaveBackground() {
  const [base, setBase] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [incomingVisible, setIncomingVisible] = useState(false);
  const baseRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      if (busyRef.current) return;
      const next = (baseRef.current + 1) % THEMES.length;
      busyRef.current = true;
      setIncoming(next);

      // Two rAF frames ensure the element is mounted & painted before transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIncomingVisible(true);
        });
      });

      setTimeout(() => {
        setBase(next);
        baseRef.current = next;
        setIncoming(null);
        setIncomingVisible(false);
        busyRef.current = false;
      }, FADE_MS + 150);
    };

    const id = setInterval(tick, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base theme — always fully visible */}
      <div className="absolute inset-0">
        <ThemeLayer theme={THEMES[base]} />
      </div>

      {/* Incoming theme — fades in on top */}
      {incoming !== null && (
        <div
          className="absolute inset-0"
          style={{
            opacity: incomingVisible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        >
          <ThemeLayer theme={THEMES[incoming]} />
        </div>
      )}

      {/* Subtle content overlay — improves card readability */}
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}
