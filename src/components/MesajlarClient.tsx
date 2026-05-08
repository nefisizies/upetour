"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Send, MessageCircle } from "lucide-react";

type Konusmaci = {
  userId: string;
  ad: string;
  foto: string | null;
  rol: string;
  sonMesaj: string;
  sonTarih: Date;
  okunmamis: number;
};

type Mesaj = {
  id: string;
  content: string;
  createdAt: string;
  fromUserId: string;
  from: {
    id: string;
    role: string;
    rehberProfile: { name: string; photoUrl: string | null } | null;
    acenteProfile: { companyName: string; logoUrl: string | null } | null;
  };
};

export function MesajlarClient({
  benimId,
  konusmalar,
  seciliId: ilkSecili,
}: {
  benimId: string;
  konusmalar: Konusmaci[];
  seciliId: string | null;
}) {
  const [secili, setSecili] = useState<string | null>(ilkSecili);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [yeni, setYeni] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [gonderiyor, startTransition] = useTransition();
  const altRef = useRef<HTMLDivElement>(null);

  const seciliKisi = konusmalar.find((k) => k.userId === secili);

  useEffect(() => {
    if (!secili) return;

    async function yukle() {
      setYukleniyor(true);
      try {
        const data = await fetch(`/api/mesaj?ile=${secili}`).then(r => r.json());
        setMesajlar(data);
      } finally {
        setYukleniyor(false);
      }
    }

    async function polling() {
      try {
        const data = await fetch(`/api/mesaj?ile=${secili}`).then(r => r.json());
        setMesajlar(data);
      } catch {}
    }

    yukle();

    // Okundu işaretle
    fetch("/api/mesaj/oku", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId: secili }),
    });

    const interval = setInterval(polling, 5000);
    return () => clearInterval(interval);
  }, [secili]);

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar]);

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!secili || !yeni.trim()) return;
    const icerik = yeni.trim();
    setYeni("");

    startTransition(async () => {
      const res = await fetch("/api/mesaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: secili, content: icerik }),
      });
      if (res.ok) {
        const mesaj = await res.json();
        setMesajlar((prev) => [...prev, mesaj]);
      }
    });
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)] rounded-2xl overflow-hidden" style={{ border: "1px solid var(--card-border)" }}>

      {/* Sol — Konuşmalar */}
      <div className="w-72 shrink-0 flex flex-col border-r" style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--card-inner-border)" }}>
        <div className="px-4 py-4 border-b" style={{ borderColor: "var(--card-inner-border)" }}>
          <p className="text-sm font-semibold text-white">Konuşmalar</p>
          <p className="text-xs text-white/40 mt-0.5">{konusmalar.length} konuşma</p>
        </div>

        {konusmalar.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
            <MessageCircle className="w-8 h-8 text-white/20" />
            <p className="text-sm text-white/40 text-center">Henüz mesaj yok</p>
            <p className="text-xs text-white/25 text-center">Acenteler seninle iletişime geçtiğinde burada görünür</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {konusmalar.map((k) => (
              <button
                key={k.userId}
                onClick={() => setSecili(k.userId)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors"
                style={{
                  background: secili === k.userId ? "rgba(255,255,255,0.08)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={(e) => { if (secili !== k.userId) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (secili !== k.userId) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}>
                  {k.foto ? <img src={k.foto} alt="" className="w-full h-full object-cover" /> : k.ad[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-medium text-white truncate">{k.ad}</p>
                    {k.okunmamis > 0 && (
                      <span className="shrink-0 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center" style={{ background: "var(--primary)" }}>
                        {k.okunmamis}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 truncate mt-0.5">{k.sonMesaj}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sağ — Mesaj thread */}
      <div className="flex-1 flex flex-col" style={{ background: "var(--card-inner-bg)" }}>
        {!secili ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageCircle className="w-12 h-12 text-white/15" />
            <p className="text-white/40">Bir konuşma seç</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--card-inner-border)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}>
                {seciliKisi?.foto
                  ? <img src={seciliKisi.foto} alt="" className="w-full h-full object-cover" />
                  : seciliKisi?.ad[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{seciliKisi?.ad}</p>
                <p className="text-xs text-white/40">Seyahat Acentesi</p>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {yukleniyor ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
                </div>
              ) : mesajlar.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/30 text-sm">Henüz mesaj yok</div>
              ) : (
                mesajlar.map((m) => {
                  const benden = m.fromUserId === benimId;
                  const isim = m.from.acenteProfile?.companyName ?? m.from.rehberProfile?.name ?? "";
                  const tarih = new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={m.id} className={`flex gap-2 ${benden ? "flex-row-reverse" : "flex-row"}`}>
                      {!benden && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" }}>
                          {isim[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className={`max-w-[70%] ${benden ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                          style={benden
                            ? { background: "var(--primary)", color: "white" }
                            : { background: "var(--card-bg)", color: "rgba(255,255,255,0.85)" }
                          }>
                          {m.content}
                        </div>
                        <span className="text-[10px] text-white/30 px-1">{tarih}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={altRef} />
            </div>

            {/* Yanıt formu */}
            <form onSubmit={gonder} className="flex gap-3 px-4 py-4 border-t" style={{ borderColor: "var(--card-inner-border)" }}>
              <input
                value={yeni}
                onChange={(e) => setYeni(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
              />
              <button
                type="submit"
                disabled={!yeni.trim() || gonderiyor}
                className="px-4 py-2.5 rounded-xl text-white disabled:opacity-40 transition-all hover:brightness-110 flex items-center gap-1.5"
                style={{ background: "var(--primary)" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
