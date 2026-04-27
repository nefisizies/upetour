export type CountryLicense = {
  country: string;
  flag: string;
  licenseType: string;
  description: string;
  required: boolean;
};

export const COUNTRY_LICENSES: CountryLicense[] = [
  {
    country: "TR",
    flag: "🇹🇷",
    licenseType: "Turist Rehberi Kimlik Kartı",
    description: "T.C. Kültür ve Turizm Bakanlığı tarafından verilen zorunlu rehber kimlik kartı. Kart numarası TR ile başlar (örn. TR-12345).",
    required: true,
  },
  {
    country: "GR",
    flag: "🇬🇷",
    licenseType: "EOT Turist Rehberi Lisansı",
    description: "Yunan Ulusal Turizm Örgütü (EOT) lisansı",
    required: true,
  },
  {
    country: "IT",
    flag: "🇮🇹",
    licenseType: "Abilitazione Guida Turistica",
    description: "İtalya bölgesel turist rehberi yetki belgesi",
    required: true,
  },
  {
    country: "FR",
    flag: "🇫🇷",
    licenseType: "Carte Professionnelle de Guide-Conférencier",
    description: "Fransa Kültür Bakanlığı profesyonel rehber kartı",
    required: true,
  },
  {
    country: "ES",
    flag: "🇪🇸",
    licenseType: "Título de Guía de Turismo",
    description: "İspanya özerk topluluk turist rehberi lisansı",
    required: true,
  },
  {
    country: "GB",
    flag: "🇬🇧",
    licenseType: "Blue Badge Guide",
    description: "İngiltere Turist Rehberler Enstitüsü Blue Badge sertifikası",
    required: false,
  },
  {
    country: "JP",
    flag: "🇯🇵",
    licenseType: "Zenkoku Tsuyaku Annai Shi",
    description: "Japonya Ulusal Hükümet Lisanslı Turist Rehberi",
    required: true,
  },
  {
    country: "DE",
    flag: "🇩🇪",
    licenseType: "Gästeführer Lizenz",
    description: "Almanya eyalet bazlı rehber lisansı",
    required: false,
  },
  {
    country: "OTHER",
    flag: "🌍",
    licenseType: "Diğer Ülke Belgesi",
    description: "Başka bir ülkenin rehberlik belgesi",
    required: false,
  },
];

export const COUNTRY_NAMES: Record<string, string> = {
  TR: "Türkiye",
  GR: "Yunanistan",
  IT: "İtalya",
  FR: "Fransa",
  ES: "İspanya",
  GB: "İngiltere",
  JP: "Japonya",
  DE: "Almanya",
  OTHER: "Diğer",
};
