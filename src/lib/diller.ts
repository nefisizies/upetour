export const POPULER_DILLER = [
  "Türkçe", "İngilizce", "Almanca", "Fransızca", "Rusça",
  "Arapça", "İspanyolca", "İtalyanca", "Japonca", "Çince",
  "Portekizce", "Korece", "Hollandaca", "Lehçe", "İsveççe",
];

export const SEVIYELER = [
  { value: "Anadil", label: "Anadil" },
  { value: "C2", label: "C2 — Üst düzey" },
  { value: "C1", label: "C1 — İleri" },
  { value: "B2", label: "B2 — Orta üstü" },
  { value: "B1", label: "B1 — Orta" },
  { value: "A2", label: "A2 — Temel" },
  { value: "A1", label: "A1 — Başlangıç" },
];

// Dile göre ilgili sertifikalar
export const DIL_SERTIFIKALARI: Record<string, string[]> = {
  "İngilizce": ["IELTS", "TOEFL iBT", "TOEFL PBT", "Cambridge C2 (CPE)", "Cambridge C1 (CAE)", "YDS", "YÖKDİL", "PTE Academic"],
  "Almanca":   ["Goethe-Zertifikat", "TestDaF", "DSH", "ÖSD"],
  "Fransızca": ["DELF", "DALF", "TCF", "TEF"],
  "İspanyolca":["DELE", "SIELE"],
  "İtalyanca": ["CILS", "CELI", "PLIDA"],
  "Japonca":   ["JLPT", "J-Test"],
  "Çince":     ["HSK", "HSKK"],
  "Rusça":     ["TORFL", "ТРКИ"],
  "Portekizce":["CELPE-Bras", "CAPLE"],
  "Arapça":    ["ALPT", "ATA"],
  "Korece":    ["TOPIK"],
};

export function getSertifikalar(dil: string): string[] {
  return DIL_SERTIFIKALARI[dil] ?? [];
}
