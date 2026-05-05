"use client";

import { useState, useEffect, useRef } from "react";

const THEMES = ["ocean", "desert", "rainforest", "mountain", "aurora", "spring"] as const;
type Theme = (typeof THEMES)[number];

const CYCLE_MS = 60_000;
const FADE_MS = 2_500;

// ─── Canvas: Heavy Rain ───────────────────────────────────────────────────────

function RainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    type Drop = { x: number; y: number; spd: number; len: number; op: number };
    const make = (): Drop => ({
      x: Math.random() * (canvas.width + 200) - 100,
      y: Math.random() * canvas.height,
      spd: 12 + Math.random() * 10,
      len: 18 + Math.random() * 28,
      op: 0.25 + Math.random() * 0.55,
    });
    const drops: Drop[] = Array.from({ length: 160 }, make);
    let id = 0;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach(d => {
        d.y += d.spd;
        d.x += d.spd * 0.12; // slight wind angle
        if (d.y > canvas.height + d.len) { d.y = -d.len - Math.random() * 60; d.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.strokeStyle = `rgba(200,240,255,${d.op})`;
        ctx.lineWidth = 1;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.len * 0.12, d.y + d.len);
        ctx.stroke();
      });
      id = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Canvas: Aurora Borealis ──────────────────────────────────────────────────

function AuroraCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random() * 0.78,
      r: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      spd: 1.2 + Math.random() * 2.5,
    }));

    // Aurora bands: [baseYFraction, [R,G,B], bandHeightFraction, sineFreq, animSpeed, phaseOffset]
    const bands = [
      { y: 0.16, rgb: [0, 255, 120] as [number,number,number], h: 0.16, f: 0.0032, s: 0.28, p: 0 },
      { y: 0.25, rgb: [200, 50, 255] as [number,number,number], h: 0.13, f: 0.0042, s: 0.22, p: 2.1 },
      { y: 0.20, rgb: [0, 220, 210] as [number,number,number], h: 0.10, f: 0.0028, s: 0.35, p: 4.4 },
      { y: 0.30, rgb: [80, 255, 160] as [number,number,number], h: 0.08, f: 0.005,  s: 0.18, p: 1.2 },
    ];

    const drawBand = (b: typeof bands[0], t: number, alpha: number, blur: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const yc = h * b.y;
      const half = h * b.h * 0.5;
      const [r, g, bl] = b.rgb;
      const step = 5;

      const upper: [number,number][] = [];
      const lower: [number,number][] = [];
      for (let x = 0; x <= w; x += step) {
        const wave = Math.sin(x * b.f + t * b.s + b.p) * 45
                   + Math.sin(x * b.f * 2.7 + t * b.s * 1.6 + b.p) * 20;
        upper.push([x, yc - half + wave]);
        lower.push([x, yc + half + wave]);
      }

      ctx.save();
      if (blur > 0) ctx.filter = `blur(${blur}px)`;
      const grad = ctx.createLinearGradient(0, yc - half, 0, yc + half);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.3, `rgba(${r},${g},${bl},${alpha})`);
      grad.addColorStop(0.7, `rgba(${r},${g},${bl},${alpha * 0.75})`);
      grad.addColorStop(1, "transparent");
      ctx.beginPath();
      upper.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i][0], lower[i][1]);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    };

    let t = 0;
    let id = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Stars
      stars.forEach(s => {
        const op = 0.2 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.spd + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      });
      // Each band: outer glow → main body → bright core
      bands.forEach(b => {
        drawBand(b, t, 0.22, 40);
        drawBand(b, t, 0.5, 14);
        drawBand(b, t, 0.82, 3);
      });
      t += 0.007;
      id = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Canvas: Cherry Blossom Petals ───────────────────────────────────────────

function PetalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    type Petal = { x: number; y: number; vx: number; vy: number; rot: number; rotV: number; rx: number; ry: number; hue: number; op: number };
    const make = (): Petal => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 2,
      vy: 1.2 + Math.random() * 2.5,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.055,
      rx: 9 + Math.random() * 13,
      ry: 5 + Math.random() * 7,
      hue: 330 + Math.random() * 30,
      op: 0.6 + Math.random() * 0.4,
    });
    const petals: Petal[] = Array.from({ length: 45 }, () => { const p = make(); p.y = Math.random() * canvas.height; return p; });

    let t = 0;
    let id = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const wind = Math.sin(t * 0.35) * 1.4;
      petals.forEach(p => {
        p.x += p.vx + wind;
        p.y += p.vy;
        p.rot += p.rotV;
        if (p.y > canvas.height + 20) Object.assign(p, make());
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.op;
        // Petal gradient: white center → hot pink edge
        const g = ctx.createRadialGradient(0, -p.ry * 0.3, 0, 0, 0, p.rx);
        g.addColorStop(0, "#fff5f9");
        g.addColorStop(0.45, `hsl(${p.hue},90%,82%)`);
        g.addColorStop(1, `hsl(${p.hue},80%,62%)`);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        // Center vein
        ctx.globalAlpha = p.op * 0.25;
        ctx.beginPath();
        ctx.moveTo(0, -p.ry * 0.85);
        ctx.lineTo(0, p.ry * 0.85);
        ctx.strokeStyle = `hsl(${p.hue},65%,52%)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();
      });
      t += 0.016;
      id = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Deterministic PRNG for CSS-animated themes ───────────────────────────────

function rng(seed: number) {
  let s = seed | 0;
  return (): number => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 4294967296; };
}

const SNOW = Array.from({ length: 22 }, (_, i) => {
  const r = rng(i * 17 + 3);
  return { left: r() * 100, delay: r() * 9, dur: 6 + r() * 8, size: 3 + Math.round(r() * 6) };
});

const SAND = Array.from({ length: 22 }, (_, i) => {
  const r = rng(i * 19 + 11);
  return { left: r() * 100, top: 22 + r() * 62, delay: r() * 7, dur: 3 + r() * 6, size: 2 + Math.round(r() * 3) };
});

// ─── Theme Components ─────────────────────────────────────────────────────────

function OceanTheme() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fde68a 0%, #fb923c 18%, #f472b6 36%, #818cf8 54%, #38bdf8 70%, #0ea5e9 82%, #0369a1 100%)" }} />
      <div className="absolute rounded-full" style={{ width: 120, height: 120, top: "6%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, #fef9c3 0%, #fde047 40%, #fb923c 80%, transparent 100%)", filter: "blur(4px)", animation: "sun-pulse 4s ease-in-out infinite", opacity: 0.9 }} />
      <div className="absolute" style={{ width: "30%", height: "25%", top: "52%", left: "35%", background: "radial-gradient(ellipse, rgba(254,249,195,0.35) 0%, transparent 70%)", animation: "shimmer 3s ease-in-out infinite", filter: "blur(8px)" }} />
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
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fbbf24 0%, #f97316 25%, #ea580c 50%, #c2410c 70%, #92400e 100%)" }} />
      <div className="absolute rounded-full" style={{ width: 100, height: 100, top: "8%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, #ffffff 0%, #fef9c3 30%, #fde047 60%, transparent 100%)", filter: "blur(6px)", animation: "sun-pulse 6s ease-in-out infinite", opacity: 0.95 }} />
      <div className="absolute" style={{ width: "60%", height: "15%", top: "55%", left: "20%", background: "radial-gradient(ellipse, rgba(251,191,36,0.2) 0%, transparent 70%)", animation: "shimmer 4s ease-in-out infinite", filter: "blur(12px)" }} />
      {SAND.map((s, i) => (
        <div key={i} className="absolute rounded-full" style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, background: "rgba(253,230,138,0.8)", animation: `sand-drift ${s.dur}s ${s.delay}s ease-in-out infinite` }} />
      ))}
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
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #011a0f 0%, #022c22 25%, #064e3b 50%, #047857 72%, #059669 88%, #10b981 100%)" }} />
      {/* Atmospheric glow */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 25%, rgba(52,211,153,0.1) 0%, transparent 65%)", animation: "mist-drift 12s ease-in-out infinite" }} />
      {/* Full-screen canvas rain */}
      <RainCanvas />
      {/* Ground mist */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "38%", background: "linear-gradient(0deg, rgba(6,78,59,0.65) 0%, rgba(4,120,87,0.15) 55%, transparent 100%)", animation: "mist-drift 16s ease-in-out infinite", filter: "blur(3px)" }} />
      {/* Canopy silhouette */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 300" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,220 C55,158 115,198 168,150 C221,102 278,178 335,135 C392,92 445,168 502,122 C559,76 614,155 670,112 C726,69 782,148 840,110 C898,72 954,150 1010,112 C1066,74 1122,152 1178,118 C1234,84 1290,158 1346,126 C1385,104 1420,148 1440,135 L1440,300 L0,300 Z" fill="rgba(1,26,15,0.9)" />
          <path d="M0,262 C90,240 180,258 270,248 C360,238 450,255 540,245 C630,235 720,252 810,242 C900,232 990,250 1080,240 C1170,230 1260,248 1350,240 C1400,236 1430,244 1440,242 L1440,300 L0,300 Z" fill="rgba(2,44,34,0.95)" />
        </svg>
      </div>
    </div>
  );
}

function MountainTheme() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0c1b3a 0%, #1e3a5f 20%, #2563eb 45%, #7dd3fc 70%, #e0f2fe 90%, #f0f9ff 100%)" }} />
      <div className="absolute rounded-full" style={{ width: 70, height: 70, top: "7%", right: "18%", background: "radial-gradient(circle, #f0f9ff 0%, #bae6fd 50%, transparent 100%)", filter: "blur(5px)", animation: "sun-pulse 5s ease-in-out infinite", opacity: 0.85 }} />
      {SNOW.map((s, i) => (
        <div key={i} className="absolute rounded-full" style={{ left: `${s.left}%`, top: 0, width: s.size, height: s.size, background: "rgba(240,249,255,0.92)", animation: `snow-fall ${s.dur}s ${s.delay}s linear infinite` }} />
      ))}
      <div className="absolute" style={{ width: "38%", height: 55, top: "14%", left: "4%", background: "rgba(240,249,255,0.22)", borderRadius: "50%", filter: "blur(16px)", animation: "cloud-drift 20s ease-in-out infinite alternate" }} />
      <div className="absolute" style={{ width: "28%", height: 44, top: "19%", right: "7%", background: "rgba(240,249,255,0.18)", borderRadius: "50%", filter: "blur(14px)", animation: "cloud-drift 25s ease-in-out infinite alternate-reverse" }} />
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,280 L80,200 L160,240 L240,160 L320,210 L420,120 L520,180 L600,100 L700,170 L800,130 L900,200 L980,150 L1060,210 L1160,140 L1260,200 L1360,160 L1440,190 L1440,320 L0,320 Z" fill="rgba(30,58,95,0.6)" />
          <path d="M420,120 L450,150 L468,136 L488,154 L510,140 L520,180 Z" fill="rgba(240,249,255,0.85)" />
          <path d="M580,100 L608,130 L623,117 L640,132 L658,120 L700,170 Z" fill="rgba(240,249,255,0.85)" />
          <path d="M780,130 L808,158 L822,146 L840,160 L858,148 L900,200 Z" fill="rgba(240,249,255,0.8)" />
          <path d="M0,300 L100,240 L200,270 L300,220 L400,260 L500,200 L600,250 L700,215 L800,260 L900,230 L1000,265 L1100,235 L1200,268 L1300,240 L1440,280 L1440,320 L0,320 Z" fill="rgba(12,27,58,0.82)" />
        </svg>
      </div>
    </div>
  );
}

function AuroraTheme() {
  return (
    <div className="absolute inset-0">
      {/* Deep space sky */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #00010f 0%, #020818 30%, #040d2e 55%, #030a20 80%, #020612 100%)" }} />
      {/* Canvas: stars + animated aurora bands */}
      <AuroraCanvas />
      {/* Horizon green glow */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "22%", background: "linear-gradient(0deg, rgba(0,200,100,0.12) 0%, transparent 100%)" }} />
      {/* Silhouetted treeline */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 110" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d="M0,70 L20,50 L40,65 L60,40 L80,58 L100,35 L120,52 L140,30 L160,48 L180,35 L200,55 L220,38 L240,55 L260,32 L280,50 L300,36 L320,52 L340,28 L360,48 L380,34 L400,52 L420,30 L440,50 L460,36 L480,54 L500,32 L520,50 L540,36 L560,52 L580,30 L600,48 L620,34 L640,52 L660,28 L680,48 L700,35 L720,52 L740,30 L760,50 L780,36 L800,54 L820,32 L840,52 L860,38 L880,55 L900,34 L920,52 L940,30 L960,48 L980,34 L1000,52 L1020,28 L1040,48 L1060,35 L1080,52 L1100,30 L1120,50 L1140,36 L1160,54 L1180,32 L1200,50 L1220,36 L1240,52 L1260,30 L1280,50 L1300,36 L1320,54 L1340,32 L1360,50 L1380,38 L1400,56 L1420,40 L1440,58 L1440,110 L0,110 Z" fill="rgba(0,1,15,0.97)" />
        </svg>
      </div>
    </div>
  );
}

function SpringTheme() {
  return (
    <div className="absolute inset-0">
      {/* Warm pink-lavender spring sky */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #ffe0ef 0%, #ffb8d8 22%, #ff9dc8 42%, #f4b8f4 65%, #dba8ff 85%, #c8a0ff 100%)" }} />
      {/* Bokeh light blobs */}
      {[
        { l: "10%", t: "12%", s: 200, a: 0.22, d: 0 },
        { l: "65%", t: "6%",  s: 140, a: 0.18, d: 1.8 },
        { l: "35%", t: "30%", s: 220, a: 0.15, d: 3.5 },
        { l: "80%", t: "32%", s: 150, a: 0.2,  d: 2.2 },
        { l: "3%",  t: "48%", s: 170, a: 0.16, d: 1 },
      ].map((b, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: b.l, top: b.t, width: b.s, height: b.s,
          background: `radial-gradient(circle, rgba(255,160,220,${b.a * 2.2}) 0%, rgba(230,170,255,${b.a}) 50%, transparent 70%)`,
          filter: "blur(25px)",
          animation: `float-slow ${7 + i * 1.2}s ${b.d}s ease-in-out infinite`,
        }} />
      ))}
      {/* Canvas petals */}
      <PetalCanvas />
      {/* Cherry tree silhouettes — left and right */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 340" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          {/* ── Left tree ── */}
          <rect x="58" y="210" width="16" height="130" rx="8" fill="rgba(90,45,18,0.8)" />
          {/* Branches */}
          <path d="M66,225 Q30,195 15,170" stroke="rgba(90,45,18,0.78)" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M66,220 Q105,188 120,160" stroke="rgba(90,45,18,0.75)" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M66,240 Q24,228 8,215" stroke="rgba(90,45,18,0.7)" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M66,232 Q88,215 108,205" stroke="rgba(90,45,18,0.7)" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Blossom clusters */}
          <ellipse cx="15" cy="162" rx="36" ry="28" fill="rgba(255,130,175,0.6)" />
          <ellipse cx="122" cy="152" rx="32" ry="26" fill="rgba(255,155,195,0.58)" />
          <ellipse cx="8"   cy="208" rx="26" ry="20" fill="rgba(255,120,170,0.55)" />
          <ellipse cx="108" cy="197" rx="24" ry="19" fill="rgba(255,140,185,0.55)" />
          <ellipse cx="66"  cy="148" rx="40" ry="32" fill="rgba(255,165,205,0.52)" />
          <ellipse cx="40"  cy="172" rx="30" ry="23" fill="rgba(255,145,188,0.48)" />
          {/* ── Right tree ── */}
          <rect x="1365" y="195" width="16" height="145" rx="8" fill="rgba(90,45,18,0.8)" />
          <path d="M1373,210 Q1408,178 1428,153" stroke="rgba(90,45,18,0.78)" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M1373,207 Q1335,175 1318,148" stroke="rgba(90,45,18,0.75)" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M1373,228 Q1415,215 1432,204" stroke="rgba(90,45,18,0.7)" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M1373,222 Q1350,206 1332,196" stroke="rgba(90,45,18,0.7)" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="1428" cy="145" rx="36" ry="28" fill="rgba(255,130,175,0.6)" />
          <ellipse cx="1317" cy="140" rx="32" ry="26" fill="rgba(255,155,195,0.58)" />
          <ellipse cx="1433" cy="197" rx="26" ry="20" fill="rgba(255,120,170,0.55)" />
          <ellipse cx="1331" cy="189" rx="24" ry="19" fill="rgba(255,140,185,0.55)" />
          <ellipse cx="1373" cy="135" rx="40" ry="32" fill="rgba(255,165,205,0.52)" />
          <ellipse cx="1400" cy="160" rx="30" ry="23" fill="rgba(255,145,188,0.48)" />
          {/* Ground */}
          <path d="M0,300 C200,282 400,296 600,286 C800,276 1000,292 1200,282 C1320,276 1400,290 1440,286 L1440,340 L0,340 Z" fill="rgba(255,170,215,0.35)" />
          <path d="M0,318 C180,308 360,318 540,312 C720,306 900,316 1080,310 C1260,304 1380,314 1440,310 L1440,340 L0,340 Z" fill="rgba(230,150,200,0.4)" />
        </svg>
      </div>
    </div>
  );
}

// ─── Theme Router ─────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

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
      // Two rAFs ensure element is painted before opacity transition fires
      requestAnimationFrame(() => requestAnimationFrame(() => setIncomingVisible(true)));
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
      <div className="absolute inset-0">
        <ThemeLayer theme={THEMES[base]} />
      </div>
      {incoming !== null && (
        <div className="absolute inset-0" style={{ opacity: incomingVisible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-in-out` }}>
          <ThemeLayer theme={THEMES[incoming]} />
        </div>
      )}
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}
