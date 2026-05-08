export type SehirBilgi = { sehir: string; ulke: string; ulkeKod: string };

export const SEHIR_LISTESI: SehirBilgi[] = [
  // Türkiye
  { sehir: "İstanbul", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Ankara", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "İzmir", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Antalya", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Kapadokya", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Bodrum", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Trabzon", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Bursa", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Konya", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Gaziantep", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Mardin", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Efes", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Pamukkale", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Muğla", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Fethiye", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Alanya", ulke: "Türkiye", ulkeKod: "TR" },
  { sehir: "Marmaris", ulke: "Türkiye", ulkeKod: "TR" },

  // İtalya
  { sehir: "Roma", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Milano", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Venedik", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Floransa", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Napoli", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Turin", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Bologna", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Cenova", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Palermo", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Pisa", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Verona", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Amalfi", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Sorrento", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Capri", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Siena", ulke: "İtalya", ulkeKod: "IT" },
  { sehir: "Cinque Terre", ulke: "İtalya", ulkeKod: "IT" },

  // Fransa
  { sehir: "Paris", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Nice", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Lyon", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Marsilya", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Bordeaux", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Strasbourg", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Cannes", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Monaco", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Toulouse", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Montpellier", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Nantes", ulke: "Fransa", ulkeKod: "FR" },
  { sehir: "Versailles", ulke: "Fransa", ulkeKod: "FR" },

  // İspanya
  { sehir: "Madrid", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Barselona", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Sevilla", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Valencia", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Granada", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Bilbao", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Toledo", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Malaga", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Palma", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "İbiza", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Cordoba", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "San Sebastian", ulke: "İspanya", ulkeKod: "ES" },
  { sehir: "Tenerife", ulke: "İspanya", ulkeKod: "ES" },

  // Almanya
  { sehir: "Berlin", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Münih", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Hamburg", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Frankfurt", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Köln", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Düsseldorf", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Stuttgart", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Dresden", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Heidelberg", ulke: "Almanya", ulkeKod: "DE" },
  { sehir: "Nürnberg", ulke: "Almanya", ulkeKod: "DE" },

  // Yunanistan
  { sehir: "Atina", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Selanik", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Santorini", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Mykonos", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Rodos", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Girit", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Korfu", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Zakynthos", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Paros", ulke: "Yunanistan", ulkeKod: "GR" },
  { sehir: "Milos", ulke: "Yunanistan", ulkeKod: "GR" },

  // Portekiz
  { sehir: "Lizbon", ulke: "Portekiz", ulkeKod: "PT" },
  { sehir: "Porto", ulke: "Portekiz", ulkeKod: "PT" },
  { sehir: "Sintra", ulke: "Portekiz", ulkeKod: "PT" },
  { sehir: "Algarve", ulke: "Portekiz", ulkeKod: "PT" },
  { sehir: "Madeira", ulke: "Portekiz", ulkeKod: "PT" },
  { sehir: "Azorlar", ulke: "Portekiz", ulkeKod: "PT" },

  // Hollanda
  { sehir: "Amsterdam", ulke: "Hollanda", ulkeKod: "NL" },
  { sehir: "Rotterdam", ulke: "Hollanda", ulkeKod: "NL" },
  { sehir: "Lahey", ulke: "Hollanda", ulkeKod: "NL" },
  { sehir: "Utrecht", ulke: "Hollanda", ulkeKod: "NL" },

  // Belçika
  { sehir: "Brüksel", ulke: "Belçika", ulkeKod: "BE" },
  { sehir: "Bruges", ulke: "Belçika", ulkeKod: "BE" },
  { sehir: "Gent", ulke: "Belçika", ulkeKod: "BE" },
  { sehir: "Anvers", ulke: "Belçika", ulkeKod: "BE" },

  // İsviçre
  { sehir: "Zürih", ulke: "İsviçre", ulkeKod: "CH" },
  { sehir: "Cenevre", ulke: "İsviçre", ulkeKod: "CH" },
  { sehir: "Bern", ulke: "İsviçre", ulkeKod: "CH" },
  { sehir: "Luzern", ulke: "İsviçre", ulkeKod: "CH" },
  { sehir: "İnterlaken", ulke: "İsviçre", ulkeKod: "CH" },
  { sehir: "Lozan", ulke: "İsviçre", ulkeKod: "CH" },

  // Avusturya
  { sehir: "Viyana", ulke: "Avusturya", ulkeKod: "AT" },
  { sehir: "Salzburg", ulke: "Avusturya", ulkeKod: "AT" },
  { sehir: "İnnsbruck", ulke: "Avusturya", ulkeKod: "AT" },
  { sehir: "Graz", ulke: "Avusturya", ulkeKod: "AT" },

  // Çek Cumhuriyeti
  { sehir: "Prag", ulke: "Çek Cumhuriyeti", ulkeKod: "CZ" },
  { sehir: "Brno", ulke: "Çek Cumhuriyeti", ulkeKod: "CZ" },
  { sehir: "Karlovy Vary", ulke: "Çek Cumhuriyeti", ulkeKod: "CZ" },

  // Macaristan
  { sehir: "Budapeşte", ulke: "Macaristan", ulkeKod: "HU" },
  { sehir: "Debrecen", ulke: "Macaristan", ulkeKod: "HU" },

  // Polonya
  { sehir: "Varşova", ulke: "Polonya", ulkeKod: "PL" },
  { sehir: "Krakow", ulke: "Polonya", ulkeKod: "PL" },
  { sehir: "Gdansk", ulke: "Polonya", ulkeKod: "PL" },
  { sehir: "Wroclaw", ulke: "Polonya", ulkeKod: "PL" },

  // Hırvatistan
  { sehir: "Dubrovnik", ulke: "Hırvatistan", ulkeKod: "HR" },
  { sehir: "Split", ulke: "Hırvatistan", ulkeKod: "HR" },
  { sehir: "Zagreb", ulke: "Hırvatistan", ulkeKod: "HR" },
  { sehir: "Zadar", ulke: "Hırvatistan", ulkeKod: "HR" },
  { sehir: "Pula", ulke: "Hırvatistan", ulkeKod: "HR" },

  // Birleşik Krallık
  { sehir: "Londra", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Edinburgh", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Manchester", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Liverpool", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Birmingham", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Oxford", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Cambridge", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Bath", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Glasgow", ulke: "İngiltere", ulkeKod: "GB" },
  { sehir: "Bristol", ulke: "İngiltere", ulkeKod: "GB" },

  // İrlanda
  { sehir: "Dublin", ulke: "İrlanda", ulkeKod: "IE" },
  { sehir: "Cork", ulke: "İrlanda", ulkeKod: "IE" },
  { sehir: "Galway", ulke: "İrlanda", ulkeKod: "IE" },

  // Norveç
  { sehir: "Oslo", ulke: "Norveç", ulkeKod: "NO" },
  { sehir: "Bergen", ulke: "Norveç", ulkeKod: "NO" },
  { sehir: "Tromsø", ulke: "Norveç", ulkeKod: "NO" },

  // İsveç
  { sehir: "Stockholm", ulke: "İsveç", ulkeKod: "SE" },
  { sehir: "Göteborg", ulke: "İsveç", ulkeKod: "SE" },
  { sehir: "Malmö", ulke: "İsveç", ulkeKod: "SE" },

  // Danimarka
  { sehir: "Kopenhag", ulke: "Danimarka", ulkeKod: "DK" },
  { sehir: "Aarhus", ulke: "Danimarka", ulkeKod: "DK" },

  // Finlandiya
  { sehir: "Helsinki", ulke: "Finlandiya", ulkeKod: "FI" },
  { sehir: "Rovaniemi", ulke: "Finlandiya", ulkeKod: "FI" },

  // Romanya
  { sehir: "Bükreş", ulke: "Romanya", ulkeKod: "RO" },
  { sehir: "Cluj", ulke: "Romanya", ulkeKod: "RO" },
  { sehir: "Brasov", ulke: "Romanya", ulkeKod: "RO" },

  // Bulgaristan
  { sehir: "Sofya", ulke: "Bulgaristan", ulkeKod: "BG" },
  { sehir: "Varna", ulke: "Bulgaristan", ulkeKod: "BG" },

  // Sırbistan
  { sehir: "Belgrad", ulke: "Sırbistan", ulkeKod: "RS" },

  // Karadağ
  { sehir: "Kotor", ulke: "Karadağ", ulkeKod: "ME" },
  { sehir: "Budva", ulke: "Karadağ", ulkeKod: "ME" },

  // Slovenya
  { sehir: "Ljubljana", ulke: "Slovenya", ulkeKod: "SI" },
  { sehir: "Bled", ulke: "Slovenya", ulkeKod: "SI" },

  // Slovakya
  { sehir: "Bratislava", ulke: "Slovakya", ulkeKod: "SK" },

  // Mısır
  { sehir: "Kahire", ulke: "Mısır", ulkeKod: "EG" },
  { sehir: "Luxor", ulke: "Mısır", ulkeKod: "EG" },
  { sehir: "Hurghada", ulke: "Mısır", ulkeKod: "EG" },
  { sehir: "Şarm el-Şeyh", ulke: "Mısır", ulkeKod: "EG" },
  { sehir: "Aswan", ulke: "Mısır", ulkeKod: "EG" },
  { sehir: "İskenderiye", ulke: "Mısır", ulkeKod: "EG" },

  // Japonya
  { sehir: "Tokyo", ulke: "Japonya", ulkeKod: "JP" },
  { sehir: "Kyoto", ulke: "Japonya", ulkeKod: "JP" },
  { sehir: "Osaka", ulke: "Japonya", ulkeKod: "JP" },
  { sehir: "Hiroshima", ulke: "Japonya", ulkeKod: "JP" },
  { sehir: "Nara", ulke: "Japonya", ulkeKod: "JP" },
  { sehir: "Sapporo", ulke: "Japonya", ulkeKod: "JP" },
  { sehir: "Nagoya", ulke: "Japonya", ulkeKod: "JP" },

  // Güney Kore
  { sehir: "Seul", ulke: "Güney Kore", ulkeKod: "KR" },
  { sehir: "Busan", ulke: "Güney Kore", ulkeKod: "KR" },
  { sehir: "Jeju", ulke: "Güney Kore", ulkeKod: "KR" },

  // Çin
  { sehir: "Pekin", ulke: "Çin", ulkeKod: "CN" },
  { sehir: "Şanghay", ulke: "Çin", ulkeKod: "CN" },
  { sehir: "Guangzhou", ulke: "Çin", ulkeKod: "CN" },
  { sehir: "Şianfu", ulke: "Çin", ulkeKod: "CN" },
  { sehir: "Chengdu", ulke: "Çin", ulkeKod: "CN" },

  // Tayland
  { sehir: "Bangkok", ulke: "Tayland", ulkeKod: "TH" },
  { sehir: "Phuket", ulke: "Tayland", ulkeKod: "TH" },
  { sehir: "Chiang Mai", ulke: "Tayland", ulkeKod: "TH" },
  { sehir: "Pattaya", ulke: "Tayland", ulkeKod: "TH" },
  { sehir: "Koh Samui", ulke: "Tayland", ulkeKod: "TH" },

  // Endonezya
  { sehir: "Bali", ulke: "Endonezya", ulkeKod: "ID" },
  { sehir: "Jakarta", ulke: "Endonezya", ulkeKod: "ID" },
  { sehir: "Yogyakarta", ulke: "Endonezya", ulkeKod: "ID" },
  { sehir: "Lombok", ulke: "Endonezya", ulkeKod: "ID" },

  // Vietnam
  { sehir: "Hanoi", ulke: "Vietnam", ulkeKod: "VN" },
  { sehir: "Ho Chi Minh", ulke: "Vietnam", ulkeKod: "VN" },
  { sehir: "Hoi An", ulke: "Vietnam", ulkeKod: "VN" },
  { sehir: "Ha Long Körfezi", ulke: "Vietnam", ulkeKod: "VN" },

  // Hindistan
  { sehir: "Delhi", ulke: "Hindistan", ulkeKod: "IN" },
  { sehir: "Mumbai", ulke: "Hindistan", ulkeKod: "IN" },
  { sehir: "Agra", ulke: "Hindistan", ulkeKod: "IN" },
  { sehir: "Jaipur", ulke: "Hindistan", ulkeKod: "IN" },
  { sehir: "Goa", ulke: "Hindistan", ulkeKod: "IN" },
  { sehir: "Varanasi", ulke: "Hindistan", ulkeKod: "IN" },
  { sehir: "Bangalore", ulke: "Hindistan", ulkeKod: "IN" },

  // BAE
  { sehir: "Dubai", ulke: "BAE", ulkeKod: "AE" },
  { sehir: "Abu Dabi", ulke: "BAE", ulkeKod: "AE" },
  { sehir: "Sharjah", ulke: "BAE", ulkeKod: "AE" },

  // Suudi Arabistan
  { sehir: "Riyad", ulke: "Suudi Arabistan", ulkeKod: "SA" },
  { sehir: "Mekke", ulke: "Suudi Arabistan", ulkeKod: "SA" },
  { sehir: "Medine", ulke: "Suudi Arabistan", ulkeKod: "SA" },
  { sehir: "AlUla", ulke: "Suudi Arabistan", ulkeKod: "SA" },

  // Ürdün
  { sehir: "Amman", ulke: "Ürdün", ulkeKod: "JO" },
  { sehir: "Petra", ulke: "Ürdün", ulkeKod: "JO" },
  { sehir: "Aqaba", ulke: "Ürdün", ulkeKod: "JO" },

  // İsrail
  { sehir: "Tel Aviv", ulke: "İsrail", ulkeKod: "IL" },
  { sehir: "Kudüs", ulke: "İsrail", ulkeKod: "IL" },

  // Fas
  { sehir: "Marakeş", ulke: "Fas", ulkeKod: "MA" },
  { sehir: "Kazablanka", ulke: "Fas", ulkeKod: "MA" },
  { sehir: "Fez", ulke: "Fas", ulkeKod: "MA" },
  { sehir: "Rabat", ulke: "Fas", ulkeKod: "MA" },
  { sehir: "Agadir", ulke: "Fas", ulkeKod: "MA" },

  // Tunus
  { sehir: "Tunus", ulke: "Tunus", ulkeKod: "TN" },
  { sehir: "Sfaks", ulke: "Tunus", ulkeKod: "TN" },
  { sehir: "Tozeur", ulke: "Tunus", ulkeKod: "TN" },

  // Güney Afrika
  { sehir: "Cape Town", ulke: "Güney Afrika", ulkeKod: "ZA" },
  { sehir: "Johannesburg", ulke: "Güney Afrika", ulkeKod: "ZA" },
  { sehir: "Durban", ulke: "Güney Afrika", ulkeKod: "ZA" },

  // Kenya
  { sehir: "Nairobi", ulke: "Kenya", ulkeKod: "KE" },
  { sehir: "Mombasa", ulke: "Kenya", ulkeKod: "KE" },

  // Tanzanya
  { sehir: "Zanzibar", ulke: "Tanzanya", ulkeKod: "TZ" },
  { sehir: "Dar es Salaam", ulke: "Tanzanya", ulkeKod: "TZ" },

  // ABD
  { sehir: "New York", ulke: "ABD", ulkeKod: "US" },
  { sehir: "Los Angeles", ulke: "ABD", ulkeKod: "US" },
  { sehir: "Miami", ulke: "ABD", ulkeKod: "US" },
  { sehir: "Chicago", ulke: "ABD", ulkeKod: "US" },
  { sehir: "Las Vegas", ulke: "ABD", ulkeKod: "US" },
  { sehir: "San Francisco", ulke: "ABD", ulkeKod: "US" },
  { sehir: "Washington", ulke: "ABD", ulkeKod: "US" },
  { sehir: "Boston", ulke: "ABD", ulkeKod: "US" },
  { sehir: "Orlando", ulke: "ABD", ulkeKod: "US" },
  { sehir: "Seattle", ulke: "ABD", ulkeKod: "US" },
  { sehir: "New Orleans", ulke: "ABD", ulkeKod: "US" },

  // Kanada
  { sehir: "Toronto", ulke: "Kanada", ulkeKod: "CA" },
  { sehir: "Vancouver", ulke: "Kanada", ulkeKod: "CA" },
  { sehir: "Montreal", ulke: "Kanada", ulkeKod: "CA" },
  { sehir: "Quebec", ulke: "Kanada", ulkeKod: "CA" },

  // Meksika
  { sehir: "Mexico City", ulke: "Meksika", ulkeKod: "MX" },
  { sehir: "Cancun", ulke: "Meksika", ulkeKod: "MX" },
  { sehir: "Guadalajara", ulke: "Meksika", ulkeKod: "MX" },
  { sehir: "Playa del Carmen", ulke: "Meksika", ulkeKod: "MX" },

  // Brezilya
  { sehir: "Rio de Janeiro", ulke: "Brezilya", ulkeKod: "BR" },
  { sehir: "São Paulo", ulke: "Brezilya", ulkeKod: "BR" },
  { sehir: "Salvador", ulke: "Brezilya", ulkeKod: "BR" },
  { sehir: "Florianópolis", ulke: "Brezilya", ulkeKod: "BR" },

  // Arjantin
  { sehir: "Buenos Aires", ulke: "Arjantin", ulkeKod: "AR" },
  { sehir: "Mendoza", ulke: "Arjantin", ulkeKod: "AR" },
  { sehir: "Bariloche", ulke: "Arjantin", ulkeKod: "AR" },

  // Peru
  { sehir: "Lima", ulke: "Peru", ulkeKod: "PE" },
  { sehir: "Cusco", ulke: "Peru", ulkeKod: "PE" },
  { sehir: "Machu Picchu", ulke: "Peru", ulkeKod: "PE" },

  // Kolombiya
  { sehir: "Bogota", ulke: "Kolombiya", ulkeKod: "CO" },
  { sehir: "Cartagena", ulke: "Kolombiya", ulkeKod: "CO" },
  { sehir: "Medellin", ulke: "Kolombiya", ulkeKod: "CO" },

  // Avustralya
  { sehir: "Sydney", ulke: "Avustralya", ulkeKod: "AU" },
  { sehir: "Melbourne", ulke: "Avustralya", ulkeKod: "AU" },
  { sehir: "Brisbane", ulke: "Avustralya", ulkeKod: "AU" },
  { sehir: "Perth", ulke: "Avustralya", ulkeKod: "AU" },
  { sehir: "Cairns", ulke: "Avustralya", ulkeKod: "AU" },

  // Yeni Zelanda
  { sehir: "Auckland", ulke: "Yeni Zelanda", ulkeKod: "NZ" },
  { sehir: "Wellington", ulke: "Yeni Zelanda", ulkeKod: "NZ" },
  { sehir: "Queenstown", ulke: "Yeni Zelanda", ulkeKod: "NZ" },

  // Singapur
  { sehir: "Singapur", ulke: "Singapur", ulkeKod: "SG" },

  // Malezya
  { sehir: "Kuala Lumpur", ulke: "Malezya", ulkeKod: "MY" },
  { sehir: "Penang", ulke: "Malezya", ulkeKod: "MY" },
  { sehir: "Langkawi", ulke: "Malezya", ulkeKod: "MY" },

  // Filipinler
  { sehir: "Manila", ulke: "Filipinler", ulkeKod: "PH" },
  { sehir: "Boracay", ulke: "Filipinler", ulkeKod: "PH" },
  { sehir: "Cebu", ulke: "Filipinler", ulkeKod: "PH" },

  // Sri Lanka
  { sehir: "Colombo", ulke: "Sri Lanka", ulkeKod: "LK" },
  { sehir: "Kandy", ulke: "Sri Lanka", ulkeKod: "LK" },

  // Nepal
  { sehir: "Katmandu", ulke: "Nepal", ulkeKod: "NP" },
  { sehir: "Pokhara", ulke: "Nepal", ulkeKod: "NP" },

  // Rusya
  { sehir: "Moskova", ulke: "Rusya", ulkeKod: "RU" },
  { sehir: "St. Petersburg", ulke: "Rusya", ulkeKod: "RU" },

  // Ukrayna
  { sehir: "Kiev", ulke: "Ukrayna", ulkeKod: "UA" },
  { sehir: "Lviv", ulke: "Ukrayna", ulkeKod: "UA" },

  // Gürcistan
  { sehir: "Tiflis", ulke: "Gürcistan", ulkeKod: "GE" },
  { sehir: "Batum", ulke: "Gürcistan", ulkeKod: "GE" },

  // Azerbaycan
  { sehir: "Bakü", ulke: "Azerbaycan", ulkeKod: "AZ" },

  // Ermenistan
  { sehir: "Erivan", ulke: "Ermenistan", ulkeKod: "AM" },

  // Özbekistan
  { sehir: "Semerkant", ulke: "Özbekistan", ulkeKod: "UZ" },
  { sehir: "Taşkent", ulke: "Özbekistan", ulkeKod: "UZ" },
  { sehir: "Buhara", ulke: "Özbekistan", ulkeKod: "UZ" },

  // Küba
  { sehir: "Havana", ulke: "Küba", ulkeKod: "CU" },

  // İzlanda
  { sehir: "Reykjavik", ulke: "İzlanda", ulkeKod: "IS" },
];

export function sehirdenUlkeBul(sehirAdi: string): { ulke: string; ulkeKod: string } | null {
  const bulunan = SEHIR_LISTESI.find(
    (s) => s.sehir.toLowerCase() === sehirAdi.toLowerCase()
  );
  return bulunan ? { ulke: bulunan.ulke, ulkeKod: bulunan.ulkeKod } : null;
}
