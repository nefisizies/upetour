import Link from "next/link";

type MiniEtkinlik = { baslangic: Date | string; bitis: Date | string | null; tur: string };

function pad2(n: number) { return String(n).padStart(2, "0"); }
function toDateStr(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

const GUNLER = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

export function MiniTakvim({ etkinlikler, yil, ay }: { etkinlikler: MiniEtkinlik[]; yil: number; ay: number }) {
  const bugunStr = toDateStr(new Date());

  const ilkGun = new Date(yil, ay - 1, 1);
  const baslangicOffset = (ilkGun.getDay() + 6) % 7;
  const ayGunSayisi = new Date(yil, ay, 0).getDate();
  const hucreler: (number | null)[] = [
    ...Array(baslangicOffset).fill(null),
    ...Array.from({ length: ayGunSayisi }, (_, i) => i + 1),
  ];
  while (hucreler.length % 7 !== 0) hucreler.push(null);

  const eventDays = new Set<string>();
  const rezervasyonDays = new Set<string>();
  etkinlikler.forEach((e) => {
    const bas = new Date(e.baslangic as string); bas.setHours(0, 0, 0, 0);
    const bit = e.bitis ? new Date(e.bitis as string) : null;
    if (bit) bit.setHours(0, 0, 0, 0);
    const gun = new Date(bas);
    while (!bit || gun <= bit) {
      const k = toDateStr(gun);
      if (e.tur === "REZERVASYON") rezervasyonDays.add(k);
      else eventDays.add(k);
      gun.setDate(gun.getDate() + 1);
      if (!bit) break;
    }
  });

  return (
    <Link href="/dashboard/rehber/takvim" className="block group select-none">
      <p className="text-[11px] font-semibold text-gray-400 mb-2 group-hover:text-[#0a7ea4] transition-colors text-center">
        {AYLAR[ay - 1]} {yil}
      </p>
      <div className="grid grid-cols-7 gap-px">
        {GUNLER.map((g) => (
          <div key={g} className="text-[9px] text-center text-gray-300 font-medium pb-1">{g}</div>
        ))}
        {hucreler.map((gun, i) => {
          if (!gun) return <div key={i} className="aspect-square" />;
          const tarihStr = `${yil}-${pad2(ay)}-${pad2(gun)}`;
          const bugunMu = tarihStr === bugunStr;
          const hasRez = rezervasyonDays.has(tarihStr);
          const hasManuel = eventDays.has(tarihStr);
          const hasEvent = hasRez || hasManuel;
          return (
            <div key={i} className={`aspect-square flex items-center justify-center rounded text-[11px] font-medium ${
              bugunMu
                ? "bg-[#0a7ea4] text-white"
                : hasEvent
                  ? hasRez
                    ? "bg-purple-100 text-purple-700"
                    : "bg-[#0a7ea4]/15 text-[#0a7ea4]"
                  : "text-gray-400"
            }`}>
              {gun}
            </div>
          );
        })}
      </div>
    </Link>
  );
}
