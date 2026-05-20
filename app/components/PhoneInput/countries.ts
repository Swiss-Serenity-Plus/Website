export interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

export const PRIORITY: Country[] = [
  { code: "CH", name: "Suisse", dial: "+41", flag: "🇨🇭" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", dial: "+32", flag: "🇧🇪" },
];

export const OTHERS: Country[] = [
  { code: "DE", name: "Allemagne", dial: "+49", flag: "🇩🇪" },
  { code: "AT", name: "Autriche", dial: "+43", flag: "🇦🇹" },
  { code: "ES", name: "Espagne", dial: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italie", dial: "+39", flag: "🇮🇹" },
  { code: "LU", name: "Luxembourg", dial: "+352", flag: "🇱🇺" },
  { code: "LI", name: "Liechtenstein", dial: "+423", flag: "🇱🇮" },
  { code: "MC", name: "Monaco", dial: "+377", flag: "🇲🇨" },
  { code: "GB", name: "Royaume-Uni", dial: "+44", flag: "🇬🇧" },
  { code: "IE", name: "Irlande", dial: "+353", flag: "🇮🇪" },
  { code: "NL", name: "Pays-Bas", dial: "+31", flag: "🇳🇱" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "SE", name: "Suède", dial: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norvège", dial: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Danemark", dial: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finlande", dial: "+358", flag: "🇫🇮" },
  { code: "IS", name: "Islande", dial: "+354", flag: "🇮🇸" },
  { code: "PL", name: "Pologne", dial: "+48", flag: "🇵🇱" },
  { code: "CZ", name: "République tchèque", dial: "+420", flag: "🇨🇿" },
  { code: "GR", name: "Grèce", dial: "+30", flag: "🇬🇷" },
  { code: "HU", name: "Hongrie", dial: "+36", flag: "🇭🇺" },
  { code: "RO", name: "Roumanie", dial: "+40", flag: "🇷🇴" },
  { code: "SK", name: "Slovaquie", dial: "+421", flag: "🇸🇰" },
  { code: "SI", name: "Slovénie", dial: "+386", flag: "🇸🇮" },
  { code: "HR", name: "Croatie", dial: "+385", flag: "🇭🇷" },
  { code: "BG", name: "Bulgarie", dial: "+359", flag: "🇧🇬" },
  { code: "EE", name: "Estonie", dial: "+372", flag: "🇪🇪" },
  { code: "LV", name: "Lettonie", dial: "+371", flag: "🇱🇻" },
  { code: "LT", name: "Lituanie", dial: "+370", flag: "🇱🇹" },
  { code: "MT", name: "Malte", dial: "+356", flag: "🇲🇹" },
  { code: "CY", name: "Chypre", dial: "+357", flag: "🇨🇾" },
  { code: "US", name: "États-Unis", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "MX", name: "Mexique", dial: "+52", flag: "🇲🇽" },
  { code: "BR", name: "Brésil", dial: "+55", flag: "🇧🇷" },
  { code: "AR", name: "Argentine", dial: "+54", flag: "🇦🇷" },
  { code: "JP", name: "Japon", dial: "+81", flag: "🇯🇵" },
  { code: "KR", name: "Corée du Sud", dial: "+82", flag: "🇰🇷" },
  { code: "CN", name: "Chine", dial: "+86", flag: "🇨🇳" },
  { code: "IN", name: "Inde", dial: "+91", flag: "🇮🇳" },
  { code: "AU", name: "Australie", dial: "+61", flag: "🇦🇺" },
  { code: "NZ", name: "Nouvelle-Zélande", dial: "+64", flag: "🇳🇿" },
  { code: "ZA", name: "Afrique du Sud", dial: "+27", flag: "🇿🇦" },
  { code: "MA", name: "Maroc", dial: "+212", flag: "🇲🇦" },
  { code: "DZ", name: "Algérie", dial: "+213", flag: "🇩🇿" },
  { code: "TN", name: "Tunisie", dial: "+216", flag: "🇹🇳" },
  { code: "SN", name: "Sénégal", dial: "+221", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { code: "CM", name: "Cameroun", dial: "+237", flag: "🇨🇲" },
  { code: "TR", name: "Turquie", dial: "+90", flag: "🇹🇷" },
  { code: "IL", name: "Israël", dial: "+972", flag: "🇮🇱" },
  { code: "AE", name: "Émirats arabes unis", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Arabie saoudite", dial: "+966", flag: "🇸🇦" },
  { code: "RU", name: "Russie", dial: "+7", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", dial: "+380", flag: "🇺🇦" },
  { code: "TH", name: "Thaïlande", dial: "+66", flag: "🇹🇭" },
  { code: "SG", name: "Singapour", dial: "+65", flag: "🇸🇬" },
];

export const ALL_COUNTRIES: Country[] = [...PRIORITY, ...OTHERS];

export function findByCode(code: string): Country | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code);
}
