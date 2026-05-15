"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Send, MessageCircle, MapPin, Phone, Calendar, MoreHorizontal, Paperclip, CheckCheck } from "lucide-react";

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

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? 28 : 40;
  const fs = size === "sm" ? 11 : 14;
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: s, height: s, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},45%,55%)`,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: fs, fontWeight: 700, color: "#fff",
    }}>
      {initials}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10,
  background: "transparent", border: "none",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
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

  const seciliKisi = konusmalar.find(k => k.userId === secili);

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
        setMesajlar(prev => [...prev, mesaj]);
      }
    });
  }

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 140px)", minHeight: 500 }}>

      {/* Threads sidebar */}
      <aside className="card" style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-1)" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--upe-ink)" }}>Mesajlar</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--fg-3)" }}>{konusmalar.length} konuşma</p>
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          {konusmalar.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, padding: 24, gap: 8 }}>
              <MessageCircle size={32} style={{ color: "var(--fg-4)" }} />
              <p style={{ fontSize: 13, color: "var(--fg-3)", textAlign: "center" }}>Henüz mesaj yok</p>
            </div>
          ) : (
            konusmalar.map(k => {
              const on = k.userId === secili;
              return (
                <button
                  key={k.userId}
                  onClick={() => setSecili(k.userId)}
                  style={{
                    width: "100%", display: "flex", gap: 12, padding: "12px 16px",
                    cursor: "pointer", textAlign: "left",
                    background: on ? "var(--upe-teal-50)" : "transparent",
                    borderTop: "1px solid var(--border-1)",
                    borderLeft: on ? "3px solid var(--upe-teal)" : "3px solid transparent",
                    borderRight: "none", borderBottom: "none",
                    outline: "none",
                  }}
                >
                  {k.foto
                    ? <img src={k.foto} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    : <Avatar name={k.ad} />
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--upe-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.ad}</span>
                      {k.okunmamis > 0 && (
                        <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9999, background: "var(--upe-teal)", color: "#fff", fontSize: 10.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{k.okunmamis}</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: k.okunmamis > 0 ? "var(--fg-1)" : "var(--fg-3)", fontWeight: k.okunmamis > 0 ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{k.sonMesaj}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Thread panel */}
      <section className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        {!secili ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <MessageCircle size={40} style={{ color: "var(--fg-4)" }} />
            <p style={{ color: "var(--fg-3)" }}>Bir konuşma seç</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border-1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {seciliKisi?.foto
                  ? <img src={seciliKisi.foto} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                  : <Avatar name={seciliKisi?.ad ?? ""} />
                }
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--upe-ink)" }}>{seciliKisi?.ad}</span>
                  <p style={{ margin: 0, fontSize: 11.5, color: "var(--fg-3)" }}>
                    {seciliKisi?.rol === "ACENTE" ? "Seyahat Acentesi" : "Tur Rehberi"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={iconBtn}><Phone size={16} style={{ color: "var(--fg-2)" }} /></button>
                <button style={iconBtn}><Calendar size={16} style={{ color: "var(--fg-2)" }} /></button>
                <button style={iconBtn}><MoreHorizontal size={16} style={{ color: "var(--fg-2)" }} /></button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", background: "linear-gradient(to bottom, var(--bg-page) 0%, var(--bg-card) 100%)", display: "flex", flexDirection: "column", gap: 8 }}>
              {yukleniyor ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--upe-teal)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
                </div>
              ) : mesajlar.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>Henüz mesaj yok</div>
              ) : (
                mesajlar.map(m => {
                  const benden = m.fromUserId === benimId;
                  const tarih = new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: benden ? "flex-end" : "flex-start", maxWidth: "75%", alignSelf: benden ? "flex-end" : "flex-start" }}>
                      <div style={{
                        padding: "10px 14px",
                        borderRadius: benden ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: benden ? "var(--upe-teal)" : "#fff",
                        color: benden ? "#fff" : "var(--fg-1)",
                        border: benden ? "none" : "1px solid var(--border-1)",
                        fontSize: 13.5, lineHeight: 1.55,
                        boxShadow: benden ? "0 1px 2px rgba(13,115,119,0.18)" : "var(--shadow-xs)",
                      }}>
                        {m.content}
                      </div>
                      <span style={{ fontSize: 10.5, color: "var(--fg-4)", marginTop: 4, padding: "0 6px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {tarih}
                        {benden && <CheckCheck size={10} style={{ color: "var(--upe-teal)" }} />}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={altRef} />
            </div>

            {/* Composer */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-1)", background: "#fff" }}>
              <form onSubmit={gonder} style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <button type="button" style={iconBtn}><Paperclip size={16} style={{ color: "var(--fg-2)" }} /></button>
                <textarea
                  value={yeni}
                  onChange={e => setYeni(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); gonder(e as any); } }}
                  rows={1}
                  placeholder="Mesajını yaz..."
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 16,
                    border: "1px solid var(--border-2)", fontSize: 13.5,
                    fontFamily: "inherit", resize: "none", outline: "none",
                    color: "var(--fg-1)", lineHeight: 1.5,
                  }}
                />
                <button
                  type="submit"
                  disabled={!yeni.trim() || gonderiyor}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "10px 16px", borderRadius: 12, border: "none",
                    background: yeni.trim() ? "var(--upe-teal)" : "var(--bg-muted)",
                    color: yeni.trim() ? "#fff" : "var(--fg-4)",
                    fontSize: 13.5, fontWeight: 600, cursor: yeni.trim() ? "pointer" : "default",
                    fontFamily: "inherit", transition: "all 150ms",
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Müsaitim, devam edelim", "Fiyat listesini gönderiyorum", "Biraz sonra geri dönerim"].map(q => (
                  <button key={q} type="button" onClick={() => setYeni(q)}
                    style={{ fontSize: 11.5, padding: "4px 10px", borderRadius: 9999, background: "var(--upe-teal-50)", color: "var(--upe-teal-700)", border: "1px solid var(--upe-teal-200)", fontFamily: "inherit", cursor: "pointer" }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
