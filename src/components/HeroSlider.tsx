"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1569958132716-89b39cf2c4f1?w=1920&q=80",
    title: "Kapadokya",
    sub: "Peri bacaları ve balon turları",
  },
  {
    url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&q=80",
    title: "İstanbul",
    sub: "Tarihin kalbi, iki kıtanın buluşma noktası",
  },
  {
    url: "https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=1920&q=80",
    title: "Pamukkale",
    sub: "Beyaz travertenler, antik şifa suları",
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
    title: "Ege Kıyıları",
    sub: "Turkuaz sular, antik limanlar",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % SLIDES.length);
        setFading(false);
      }, 600);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0">
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${s.url})`,
            opacity: i === current ? (fading ? 0 : 1) : 0,
          }}
        />
      ))}
      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* slide location badge */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === current ? "var(--primary)" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* location label */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center transition-opacity duration-500 z-10"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <p className="text-white/90 text-sm font-medium tracking-widest uppercase">
          {SLIDES[current].title}
        </p>
      </div>
    </div>
  );
}
