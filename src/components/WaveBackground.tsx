"use client";

export function WaveBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #fde68a 0%, #fb923c 18%, #f472b6 36%, #818cf8 54%, #38bdf8 70%, #0ea5e9 82%, #0369a1 100%)",
        }}
      />

      {/* Güneş */}
      <div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          top: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, #fef9c3 0%, #fde047 40%, #fb923c 80%, transparent 100%)",
          filter: "blur(4px)",
          animation: "sun-pulse 4s ease-in-out infinite",
          opacity: 0.9,
        }}
      />

      {/* Işık yansıması (güneş yolu üzerinde) */}
      <div
        className="absolute"
        style={{
          width: "30%",
          height: "25%",
          top: "52%",
          left: "35%",
          background:
            "radial-gradient(ellipse, rgba(254,249,195,0.35) 0%, transparent 70%)",
          animation: "shimmer 3s ease-in-out infinite",
          filter: "blur(8px)",
        }}
      />

      {/* Dalgalar — arka (yavaş) */}
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: "200%",
          animation: "wave-slow 14s linear infinite",
        }}
      >
        <svg viewBox="0 0 1440 220" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path
            d="M0,80 C180,140 360,20 540,80 C720,140 900,20 1080,80 C1260,140 1440,20 1440,80 L1440,220 L0,220 Z"
            fill="rgba(2,132,199,0.45)"
          />
          <path
            d="M1440,80 C1620,140 1800,20 1980,80 C2160,140 2340,20 2520,80 C2700,140 2880,20 2880,80 L2880,220 L1440,220 Z"
            fill="rgba(2,132,199,0.45)"
          />
        </svg>
      </div>

      {/* Dalgalar — orta */}
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: "200%",
          animation: "wave-mid 9s linear infinite",
        }}
      >
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path
            d="M0,60 C200,110 400,10 600,60 C800,110 1000,10 1200,60 C1400,110 1440,30 1440,60 L1440,200 L0,200 Z"
            fill="rgba(14,165,233,0.5)"
          />
          <path
            d="M1440,60 C1640,110 1840,10 2040,60 C2240,110 2440,10 2640,60 C2840,110 2880,30 2880,60 L2880,200 L1440,200 Z"
            fill="rgba(14,165,233,0.5)"
          />
        </svg>
      </div>

      {/* Dalgalar — ön (hızlı) */}
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: "200%",
          animation: "wave-fast 6s linear infinite",
        }}
      >
        <svg viewBox="0 0 1440 170" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path
            d="M0,50 C120,90 280,10 440,50 C600,90 760,10 920,50 C1080,90 1240,10 1440,50 L1440,170 L0,170 Z"
            fill="rgba(56,189,248,0.55)"
          />
          <path
            d="M1440,50 C1560,90 1720,10 1880,50 C2040,90 2200,10 2360,50 C2520,90 2680,10 2880,50 L2880,170 L1440,170 Z"
            fill="rgba(56,189,248,0.55)"
          />
        </svg>
      </div>

      {/* Köpük dalgası — en ön */}
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: "200%",
          animation: "wave-fast 4.5s linear infinite reverse",
        }}
      >
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path
            d="M0,30 C80,50 160,10 240,30 C320,50 400,10 480,30 C560,50 640,10 720,30 C800,50 880,10 960,30 C1040,50 1120,10 1200,30 C1280,50 1360,10 1440,30 L1440,80 L0,80 Z"
            fill="rgba(186,230,253,0.6)"
          />
          <path
            d="M1440,30 C1520,50 1600,10 1680,30 C1760,50 1840,10 1920,30 C2000,50 2080,10 2160,30 C2240,50 2320,10 2400,30 C2480,50 2560,10 2640,30 C2720,50 2800,10 2880,30 L2880,80 L1440,80 Z"
            fill="rgba(186,230,253,0.6)"
          />
        </svg>
      </div>

      {/* İçerik için hafif overlay — kartların okunmasını kolaylaştırır */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}
