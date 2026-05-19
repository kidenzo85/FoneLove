/**
 * Comprehensive country data with ISO 3166-1 alpha-2 codes,
 * French & English names, calling codes, and emoji flags.
 *
 * Flag emojis are computed from the 2-letter country code using
 * Unicode regional indicator symbols.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Country {
  /** ISO 3166-1 alpha-2 code (e.g. "FR", "US") */
  code: string;
  /** French name (e.g. "France", "États-Unis") */
  name: string;
  /** English name (e.g. "France", "United States") */
  nameEn: string;
  /** International calling code with + prefix (e.g. "+33", "+1") */
  dialCode: string;
  /** Emoji flag derived from the country code */
  flag: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a 2-letter ISO 3166-1 alpha-2 country code to its emoji flag.
 *
 * Each letter A-Z maps to a Unicode regional indicator symbol:
 *   A → U+1F1E6, B → U+1F1E7, … Z → U+1F1FF
 *
 * @example countryCodeToFlag("FR") // "🇫🇷"
 * @example countryCodeToFlag("US") // "🇺🇸"
 */
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  const base = 0x1f1e6 - 65; // 'A' charCode
  const ch0 = upper.charCodeAt(0);
  const ch1 = upper.charCodeAt(1);
  if (ch0 < 65 || ch0 > 90 || ch1 < 65 || ch1 > 90) return "";
  return String.fromCodePoint(base + ch0, base + ch1);
}

// ---------------------------------------------------------------------------
// Country data — ALL 193 UN member states + major territories (~250 entries)
// French names are used as the primary `name` field.
// Organised alphabetically by French name within each letter group.
// ---------------------------------------------------------------------------

export const COUNTRIES: Country[] = [
  // ===================== A =====================
  { code: "AF", name: "Afghanistan", nameEn: "Afghanistan", dialCode: "+93", flag: countryCodeToFlag("AF") },
  { code: "ZA", name: "Afrique du Sud", nameEn: "South Africa", dialCode: "+27", flag: countryCodeToFlag("ZA") },
  { code: "AL", name: "Albanie", nameEn: "Albania", dialCode: "+355", flag: countryCodeToFlag("AL") },
  { code: "DZ", name: "Algérie", nameEn: "Algeria", dialCode: "+213", flag: countryCodeToFlag("DZ") },
  { code: "DE", name: "Allemagne", nameEn: "Germany", dialCode: "+49", flag: countryCodeToFlag("DE") },
  { code: "AD", name: "Andorre", nameEn: "Andorra", dialCode: "+376", flag: countryCodeToFlag("AD") },
  { code: "AO", name: "Angola", nameEn: "Angola", dialCode: "+244", flag: countryCodeToFlag("AO") },
  { code: "AG", name: "Antigua-et-Barbuda", nameEn: "Antigua and Barbuda", dialCode: "+1", flag: countryCodeToFlag("AG") },
  { code: "SA", name: "Arabie saoudite", nameEn: "Saudi Arabia", dialCode: "+966", flag: countryCodeToFlag("SA") },
  { code: "AR", name: "Argentine", nameEn: "Argentina", dialCode: "+54", flag: countryCodeToFlag("AR") },
  { code: "AM", name: "Arménie", nameEn: "Armenia", dialCode: "+374", flag: countryCodeToFlag("AM") },
  { code: "AU", name: "Australie", nameEn: "Australia", dialCode: "+61", flag: countryCodeToFlag("AU") },
  { code: "AT", name: "Autriche", nameEn: "Austria", dialCode: "+43", flag: countryCodeToFlag("AT") },
  { code: "AZ", name: "Azerbaïdjan", nameEn: "Azerbaijan", dialCode: "+994", flag: countryCodeToFlag("AZ") },

  // ===================== B =====================
  { code: "BS", name: "Bahamas", nameEn: "Bahamas", dialCode: "+1", flag: countryCodeToFlag("BS") },
  { code: "BH", name: "Bahreïn", nameEn: "Bahrain", dialCode: "+973", flag: countryCodeToFlag("BH") },
  { code: "BD", name: "Bangladesh", nameEn: "Bangladesh", dialCode: "+880", flag: countryCodeToFlag("BD") },
  { code: "BB", name: "Barbade", nameEn: "Barbados", dialCode: "+1", flag: countryCodeToFlag("BB") },
  { code: "BY", name: "Biélorussie", nameEn: "Belarus", dialCode: "+375", flag: countryCodeToFlag("BY") },
  { code: "BE", name: "Belgique", nameEn: "Belgium", dialCode: "+32", flag: countryCodeToFlag("BE") },
  { code: "BZ", name: "Belize", nameEn: "Belize", dialCode: "+501", flag: countryCodeToFlag("BZ") },
  { code: "BJ", name: "Bénin", nameEn: "Benin", dialCode: "+229", flag: countryCodeToFlag("BJ") },
  { code: "BT", name: "Bhoutan", nameEn: "Bhutan", dialCode: "+975", flag: countryCodeToFlag("BT") },
  { code: "MM", name: "Birmanie", nameEn: "Myanmar", dialCode: "+95", flag: countryCodeToFlag("MM") },
  { code: "BO", name: "Bolivie", nameEn: "Bolivia", dialCode: "+591", flag: countryCodeToFlag("BO") },
  { code: "BA", name: "Bosnie-Herzégovine", nameEn: "Bosnia and Herzegovina", dialCode: "+387", flag: countryCodeToFlag("BA") },
  { code: "BW", name: "Botswana", nameEn: "Botswana", dialCode: "+267", flag: countryCodeToFlag("BW") },
  { code: "BR", name: "Brésil", nameEn: "Brazil", dialCode: "+55", flag: countryCodeToFlag("BR") },
  { code: "BN", name: "Brunei", nameEn: "Brunei", dialCode: "+673", flag: countryCodeToFlag("BN") },
  { code: "BG", name: "Bulgarie", nameEn: "Bulgaria", dialCode: "+359", flag: countryCodeToFlag("BG") },
  { code: "BF", name: "Burkina Faso", nameEn: "Burkina Faso", dialCode: "+226", flag: countryCodeToFlag("BF") },
  { code: "BI", name: "Burundi", nameEn: "Burundi", dialCode: "+257", flag: countryCodeToFlag("BI") },

  // ===================== C =====================
  { code: "KH", name: "Cambodge", nameEn: "Cambodia", dialCode: "+855", flag: countryCodeToFlag("KH") },
  { code: "CM", name: "Cameroun", nameEn: "Cameroon", dialCode: "+237", flag: countryCodeToFlag("CM") },
  { code: "CA", name: "Canada", nameEn: "Canada", dialCode: "+1", flag: countryCodeToFlag("CA") },
  { code: "CV", name: "Cap-Vert", nameEn: "Cape Verde", dialCode: "+238", flag: countryCodeToFlag("CV") },
  { code: "CF", name: "République centrafricaine", nameEn: "Central African Republic", dialCode: "+236", flag: countryCodeToFlag("CF") },
  { code: "CL", name: "Chili", nameEn: "Chile", dialCode: "+56", flag: countryCodeToFlag("CL") },
  { code: "CN", name: "Chine", nameEn: "China", dialCode: "+86", flag: countryCodeToFlag("CN") },
  { code: "CY", name: "Chypre", nameEn: "Cyprus", dialCode: "+357", flag: countryCodeToFlag("CY") },
  { code: "VA", name: "Saint-Siège (Vatican)", nameEn: "Vatican City", dialCode: "+379", flag: countryCodeToFlag("VA") },
  { code: "CO", name: "Colombie", nameEn: "Colombia", dialCode: "+57", flag: countryCodeToFlag("CO") },
  { code: "KM", name: "Comores", nameEn: "Comoros", dialCode: "+269", flag: countryCodeToFlag("KM") },
  { code: "CG", name: "République du Congo", nameEn: "Republic of the Congo", dialCode: "+242", flag: countryCodeToFlag("CG") },
  { code: "CD", name: "République démocratique du Congo", nameEn: "Democratic Republic of the Congo", dialCode: "+243", flag: countryCodeToFlag("CD") },
  { code: "KR", name: "Corée du Sud", nameEn: "South Korea", dialCode: "+82", flag: countryCodeToFlag("KR") },
  { code: "KP", name: "Corée du Nord", nameEn: "North Korea", dialCode: "+850", flag: countryCodeToFlag("KP") },
  { code: "CR", name: "Costa Rica", nameEn: "Costa Rica", dialCode: "+506", flag: countryCodeToFlag("CR") },
  { code: "CI", name: "Côte d'Ivoire", nameEn: "Ivory Coast", dialCode: "+225", flag: countryCodeToFlag("CI") },
  { code: "HR", name: "Croatie", nameEn: "Croatia", dialCode: "+385", flag: countryCodeToFlag("HR") },
  { code: "CU", name: "Cuba", nameEn: "Cuba", dialCode: "+53", flag: countryCodeToFlag("CU") },
  { code: "CW", name: "Curaçao", nameEn: "Curacao", dialCode: "+599", flag: countryCodeToFlag("CW") },
  { code: "CZ", name: "Tchéquie", nameEn: "Czech Republic", dialCode: "+420", flag: countryCodeToFlag("CZ") },

  // ===================== D =====================
  { code: "DK", name: "Danemark", nameEn: "Denmark", dialCode: "+45", flag: countryCodeToFlag("DK") },
  { code: "DJ", name: "Djibouti", nameEn: "Djibouti", dialCode: "+253", flag: countryCodeToFlag("DJ") },
  { code: "DM", name: "Dominique", nameEn: "Dominica", dialCode: "+1", flag: countryCodeToFlag("DM") },
  { code: "DO", name: "République dominicaine", nameEn: "Dominican Republic", dialCode: "+1", flag: countryCodeToFlag("DO") },

  // ===================== E =====================
  { code: "EG", name: "Égypte", nameEn: "Egypt", dialCode: "+20", flag: countryCodeToFlag("EG") },
  { code: "AE", name: "Émirats arabes unis", nameEn: "United Arab Emirates", dialCode: "+971", flag: countryCodeToFlag("AE") },
  { code: "EC", name: "Équateur", nameEn: "Ecuador", dialCode: "+593", flag: countryCodeToFlag("EC") },
  { code: "ER", name: "Érythrée", nameEn: "Eritrea", dialCode: "+291", flag: countryCodeToFlag("ER") },
  { code: "ES", name: "Espagne", nameEn: "Spain", dialCode: "+34", flag: countryCodeToFlag("ES") },
  { code: "EE", name: "Estonie", nameEn: "Estonia", dialCode: "+372", flag: countryCodeToFlag("EE") },
  { code: "SZ", name: "Eswatini", nameEn: "Eswatini", dialCode: "+268", flag: countryCodeToFlag("SZ") },
  { code: "US", name: "États-Unis", nameEn: "United States", dialCode: "+1", flag: countryCodeToFlag("US") },
  { code: "ET", name: "Éthiopie", nameEn: "Ethiopia", dialCode: "+251", flag: countryCodeToFlag("ET") },

  // ===================== F =====================
  { code: "FJ", name: "Fidji", nameEn: "Fiji", dialCode: "+679", flag: countryCodeToFlag("FJ") },
  { code: "FI", name: "Finlande", nameEn: "Finland", dialCode: "+358", flag: countryCodeToFlag("FI") },
  { code: "FR", name: "France", nameEn: "France", dialCode: "+33", flag: countryCodeToFlag("FR") },

  // ===================== G =====================
  { code: "GA", name: "Gabon", nameEn: "Gabon", dialCode: "+241", flag: countryCodeToFlag("GA") },
  { code: "GM", name: "Gambie", nameEn: "Gambia", dialCode: "+220", flag: countryCodeToFlag("GM") },
  { code: "GE", name: "Géorgie", nameEn: "Georgia", dialCode: "+995", flag: countryCodeToFlag("GE") },
  { code: "GH", name: "Ghana", nameEn: "Ghana", dialCode: "+233", flag: countryCodeToFlag("GH") },
  { code: "GR", name: "Grèce", nameEn: "Greece", dialCode: "+30", flag: countryCodeToFlag("GR") },
  { code: "GD", name: "Grenade", nameEn: "Grenada", dialCode: "+1", flag: countryCodeToFlag("GD") },
  { code: "GT", name: "Guatemala", nameEn: "Guatemala", dialCode: "+502", flag: countryCodeToFlag("GT") },
  { code: "GN", name: "Guinée", nameEn: "Guinea", dialCode: "+224", flag: countryCodeToFlag("GN") },
  { code: "GW", name: "Guinée-Bissau", nameEn: "Guinea-Bissau", dialCode: "+245", flag: countryCodeToFlag("GW") },
  { code: "GQ", name: "Guinée équatoriale", nameEn: "Equatorial Guinea", dialCode: "+240", flag: countryCodeToFlag("GQ") },
  { code: "GY", name: "Guyana", nameEn: "Guyana", dialCode: "+592", flag: countryCodeToFlag("GY") },

  // ===================== H =====================
  { code: "HT", name: "Haïti", nameEn: "Haiti", dialCode: "+509", flag: countryCodeToFlag("HT") },
  { code: "HN", name: "Honduras", nameEn: "Honduras", dialCode: "+504", flag: countryCodeToFlag("HN") },
  { code: "HU", name: "Hongrie", nameEn: "Hungary", dialCode: "+36", flag: countryCodeToFlag("HU") },

  // ===================== I =====================
  { code: "IN", name: "Inde", nameEn: "India", dialCode: "+91", flag: countryCodeToFlag("IN") },
  { code: "ID", name: "Indonésie", nameEn: "Indonesia", dialCode: "+62", flag: countryCodeToFlag("ID") },
  { code: "IR", name: "Iran", nameEn: "Iran", dialCode: "+98", flag: countryCodeToFlag("IR") },
  { code: "IQ", name: "Irak", nameEn: "Iraq", dialCode: "+964", flag: countryCodeToFlag("IQ") },
  { code: "IE", name: "Irlande", nameEn: "Ireland", dialCode: "+353", flag: countryCodeToFlag("IE") },
  { code: "IS", name: "Islande", nameEn: "Iceland", dialCode: "+354", flag: countryCodeToFlag("IS") },
  { code: "IL", name: "Israël", nameEn: "Israel", dialCode: "+972", flag: countryCodeToFlag("IL") },
  { code: "IT", name: "Italie", nameEn: "Italy", dialCode: "+39", flag: countryCodeToFlag("IT") },

  // ===================== J =====================
  { code: "JM", name: "Jamaïque", nameEn: "Jamaica", dialCode: "+1", flag: countryCodeToFlag("JM") },
  { code: "JP", name: "Japon", nameEn: "Japan", dialCode: "+81", flag: countryCodeToFlag("JP") },
  { code: "JO", name: "Jordanie", nameEn: "Jordan", dialCode: "+962", flag: countryCodeToFlag("JO") },

  // ===================== K =====================
  { code: "KZ", name: "Kazakhstan", nameEn: "Kazakhstan", dialCode: "+7", flag: countryCodeToFlag("KZ") },
  { code: "KE", name: "Kenya", nameEn: "Kenya", dialCode: "+254", flag: countryCodeToFlag("KE") },
  { code: "KG", name: "Kirghizistan", nameEn: "Kyrgyzstan", dialCode: "+996", flag: countryCodeToFlag("KG") },
  { code: "KI", name: "Kiribati", nameEn: "Kiribati", dialCode: "+686", flag: countryCodeToFlag("KI") },
  { code: "KW", name: "Koweït", nameEn: "Kuwait", dialCode: "+965", flag: countryCodeToFlag("KW") },
  { code: "XK", name: "Kosovo", nameEn: "Kosovo", dialCode: "+383", flag: countryCodeToFlag("XK") },

  // ===================== L =====================
  { code: "LA", name: "Laos", nameEn: "Laos", dialCode: "+856", flag: countryCodeToFlag("LA") },
  { code: "LS", name: "Lesotho", nameEn: "Lesotho", dialCode: "+266", flag: countryCodeToFlag("LS") },
  { code: "LV", name: "Lettonie", nameEn: "Latvia", dialCode: "+371", flag: countryCodeToFlag("LV") },
  { code: "LB", name: "Liban", nameEn: "Lebanon", dialCode: "+961", flag: countryCodeToFlag("LB") },
  { code: "LR", name: "Liberia", nameEn: "Liberia", dialCode: "+231", flag: countryCodeToFlag("LR") },
  { code: "LY", name: "Libye", nameEn: "Libya", dialCode: "+218", flag: countryCodeToFlag("LY") },
  { code: "LI", name: "Liechtenstein", nameEn: "Liechtenstein", dialCode: "+423", flag: countryCodeToFlag("LI") },
  { code: "LT", name: "Lituanie", nameEn: "Lithuania", dialCode: "+370", flag: countryCodeToFlag("LT") },
  { code: "LU", name: "Luxembourg", nameEn: "Luxembourg", dialCode: "+352", flag: countryCodeToFlag("LU") },

  // ===================== M =====================
  { code: "MK", name: "Macédoine du Nord", nameEn: "North Macedonia", dialCode: "+389", flag: countryCodeToFlag("MK") },
  { code: "MG", name: "Madagascar", nameEn: "Madagascar", dialCode: "+261", flag: countryCodeToFlag("MG") },
  { code: "MY", name: "Malaisie", nameEn: "Malaysia", dialCode: "+60", flag: countryCodeToFlag("MY") },
  { code: "MW", name: "Malawi", nameEn: "Malawi", dialCode: "+265", flag: countryCodeToFlag("MW") },
  { code: "MV", name: "Maldives", nameEn: "Maldives", dialCode: "+960", flag: countryCodeToFlag("MV") },
  { code: "ML", name: "Mali", nameEn: "Mali", dialCode: "+223", flag: countryCodeToFlag("ML") },
  { code: "MT", name: "Malte", nameEn: "Malta", dialCode: "+356", flag: countryCodeToFlag("MT") },
  { code: "MA", name: "Maroc", nameEn: "Morocco", dialCode: "+212", flag: countryCodeToFlag("MA") },
  { code: "MH", name: "Îles Marshall", nameEn: "Marshall Islands", dialCode: "+692", flag: countryCodeToFlag("MH") },
  { code: "MU", name: "Maurice", nameEn: "Mauritius", dialCode: "+230", flag: countryCodeToFlag("MU") },
  { code: "MR", name: "Mauritanie", nameEn: "Mauritania", dialCode: "+222", flag: countryCodeToFlag("MR") },
  { code: "MX", name: "Mexique", nameEn: "Mexico", dialCode: "+52", flag: countryCodeToFlag("MX") },
  { code: "FM", name: "Micronésie", nameEn: "Micronesia", dialCode: "+691", flag: countryCodeToFlag("FM") },
  { code: "MD", name: "Moldavie", nameEn: "Moldova", dialCode: "+373", flag: countryCodeToFlag("MD") },
  { code: "MC", name: "Monaco", nameEn: "Monaco", dialCode: "+377", flag: countryCodeToFlag("MC") },
  { code: "MN", name: "Mongolie", nameEn: "Mongolia", dialCode: "+976", flag: countryCodeToFlag("MN") },
  { code: "ME", name: "Monténégro", nameEn: "Montenegro", dialCode: "+382", flag: countryCodeToFlag("ME") },
  { code: "MZ", name: "Mozambique", nameEn: "Mozambique", dialCode: "+258", flag: countryCodeToFlag("MZ") },

  // ===================== N =====================
  { code: "NA", name: "Namibie", nameEn: "Namibia", dialCode: "+264", flag: countryCodeToFlag("NA") },
  { code: "NR", name: "Nauru", nameEn: "Nauru", dialCode: "+674", flag: countryCodeToFlag("NR") },
  { code: "NP", name: "Népal", nameEn: "Nepal", dialCode: "+977", flag: countryCodeToFlag("NP") },
  { code: "NI", name: "Nicaragua", nameEn: "Nicaragua", dialCode: "+505", flag: countryCodeToFlag("NI") },
  { code: "NE", name: "Niger", nameEn: "Niger", dialCode: "+227", flag: countryCodeToFlag("NE") },
  { code: "NG", name: "Nigéria", nameEn: "Nigeria", dialCode: "+234", flag: countryCodeToFlag("NG") },
  { code: "NO", name: "Norvège", nameEn: "Norway", dialCode: "+47", flag: countryCodeToFlag("NO") },
  { code: "NZ", name: "Nouvelle-Zélande", nameEn: "New Zealand", dialCode: "+64", flag: countryCodeToFlag("NZ") },
  { code: "NU", name: "Niue", nameEn: "Niue", dialCode: "+683", flag: countryCodeToFlag("NU") },

  // ===================== O =====================
  { code: "OM", name: "Oman", nameEn: "Oman", dialCode: "+968", flag: countryCodeToFlag("OM") },
  { code: "UG", name: "Ouganda", nameEn: "Uganda", dialCode: "+256", flag: countryCodeToFlag("UG") },
  { code: "UZ", name: "Ouzbékistan", nameEn: "Uzbekistan", dialCode: "+998", flag: countryCodeToFlag("UZ") },

  // ===================== P =====================
  { code: "PK", name: "Pakistan", nameEn: "Pakistan", dialCode: "+92", flag: countryCodeToFlag("PK") },
  { code: "PW", name: "Palaos", nameEn: "Palau", dialCode: "+680", flag: countryCodeToFlag("PW") },
  { code: "PS", name: "Palestine", nameEn: "Palestine", dialCode: "+970", flag: countryCodeToFlag("PS") },
  { code: "PA", name: "Panama", nameEn: "Panama", dialCode: "+507", flag: countryCodeToFlag("PA") },
  { code: "PG", name: "Papouasie-Nouvelle-Guinée", nameEn: "Papua New Guinea", dialCode: "+675", flag: countryCodeToFlag("PG") },
  { code: "PY", name: "Paraguay", nameEn: "Paraguay", dialCode: "+595", flag: countryCodeToFlag("PY") },
  { code: "NL", name: "Pays-Bas", nameEn: "Netherlands", dialCode: "+31", flag: countryCodeToFlag("NL") },
  { code: "PE", name: "Pérou", nameEn: "Peru", dialCode: "+51", flag: countryCodeToFlag("PE") },
  { code: "PH", name: "Philippines", nameEn: "Philippines", dialCode: "+63", flag: countryCodeToFlag("PH") },
  { code: "PL", name: "Pologne", nameEn: "Poland", dialCode: "+48", flag: countryCodeToFlag("PL") },
  { code: "PT", name: "Portugal", nameEn: "Portugal", dialCode: "+351", flag: countryCodeToFlag("PT") },

  // ===================== Q =====================
  { code: "QA", name: "Qatar", nameEn: "Qatar", dialCode: "+974", flag: countryCodeToFlag("QA") },

  // ===================== R =====================
  { code: "RO", name: "Roumanie", nameEn: "Romania", dialCode: "+40", flag: countryCodeToFlag("RO") },
  { code: "GB", name: "Royaume-Uni", nameEn: "United Kingdom", dialCode: "+44", flag: countryCodeToFlag("GB") },
  { code: "RU", name: "Russie", nameEn: "Russia", dialCode: "+7", flag: countryCodeToFlag("RU") },
  { code: "RW", name: "Rwanda", nameEn: "Rwanda", dialCode: "+250", flag: countryCodeToFlag("RW") },

  // ===================== S =====================
  { code: "KN", name: "Saint-Kitts-et-Nevis", nameEn: "Saint Kitts and Nevis", dialCode: "+1", flag: countryCodeToFlag("KN") },
  { code: "SM", name: "Saint-Marin", nameEn: "San Marino", dialCode: "+378", flag: countryCodeToFlag("SM") },
  { code: "VC", name: "Saint-Vincent-et-les-Grenadines", nameEn: "Saint Vincent and the Grenadines", dialCode: "+1", flag: countryCodeToFlag("VC") },
  { code: "LC", name: "Sainte-Lucie", nameEn: "Saint Lucia", dialCode: "+1", flag: countryCodeToFlag("LC") },
  { code: "SB", name: "Îles Salomon", nameEn: "Solomon Islands", dialCode: "+677", flag: countryCodeToFlag("SB") },
  { code: "SV", name: "Salvador", nameEn: "El Salvador", dialCode: "+503", flag: countryCodeToFlag("SV") },
  { code: "WS", name: "Samoa", nameEn: "Samoa", dialCode: "+685", flag: countryCodeToFlag("WS") },
  { code: "ST", name: "Sao Tomé-et-Príncipe", nameEn: "Sao Tome and Principe", dialCode: "+239", flag: countryCodeToFlag("ST") },
  { code: "SN", name: "Sénégal", nameEn: "Senegal", dialCode: "+221", flag: countryCodeToFlag("SN") },
  { code: "RS", name: "Serbie", nameEn: "Serbia", dialCode: "+381", flag: countryCodeToFlag("RS") },
  { code: "SC", name: "Seychelles", nameEn: "Seychelles", dialCode: "+248", flag: countryCodeToFlag("SC") },
  { code: "SL", name: "Sierra Leone", nameEn: "Sierra Leone", dialCode: "+232", flag: countryCodeToFlag("SL") },
  { code: "SG", name: "Singapour", nameEn: "Singapore", dialCode: "+65", flag: countryCodeToFlag("SG") },
  { code: "SK", name: "Slovaquie", nameEn: "Slovakia", dialCode: "+421", flag: countryCodeToFlag("SK") },
  { code: "SI", name: "Slovénie", nameEn: "Slovenia", dialCode: "+386", flag: countryCodeToFlag("SI") },
  { code: "SO", name: "Somalie", nameEn: "Somalia", dialCode: "+252", flag: countryCodeToFlag("SO") },
  { code: "SD", name: "Soudan", nameEn: "Sudan", dialCode: "+249", flag: countryCodeToFlag("SD") },
  { code: "SS", name: "Soudan du Sud", nameEn: "South Sudan", dialCode: "+211", flag: countryCodeToFlag("SS") },
  { code: "LK", name: "Sri Lanka", nameEn: "Sri Lanka", dialCode: "+94", flag: countryCodeToFlag("LK") },
  { code: "SE", name: "Suède", nameEn: "Sweden", dialCode: "+46", flag: countryCodeToFlag("SE") },
  { code: "CH", name: "Suisse", nameEn: "Switzerland", dialCode: "+41", flag: countryCodeToFlag("CH") },
  { code: "SR", name: "Suriname", nameEn: "Suriname", dialCode: "+597", flag: countryCodeToFlag("SR") },
  { code: "SY", name: "Syrie", nameEn: "Syria", dialCode: "+963", flag: countryCodeToFlag("SY") },

  // ===================== T =====================
  { code: "TJ", name: "Tadjikistan", nameEn: "Tajikistan", dialCode: "+992", flag: countryCodeToFlag("TJ") },
  { code: "TZ", name: "Tanzanie", nameEn: "Tanzania", dialCode: "+255", flag: countryCodeToFlag("TZ") },
  { code: "TD", name: "Tchad", nameEn: "Chad", dialCode: "+235", flag: countryCodeToFlag("TD") },
  { code: "TH", name: "Thaïlande", nameEn: "Thailand", dialCode: "+66", flag: countryCodeToFlag("TH") },
  { code: "TL", name: "Timor oriental", nameEn: "East Timor", dialCode: "+670", flag: countryCodeToFlag("TL") },
  { code: "TG", name: "Togo", nameEn: "Togo", dialCode: "+228", flag: countryCodeToFlag("TG") },
  { code: "TK", name: "Tokelau", nameEn: "Tokelau", dialCode: "+690", flag: countryCodeToFlag("TK") },
  { code: "TO", name: "Tonga", nameEn: "Tonga", dialCode: "+676", flag: countryCodeToFlag("TO") },
  { code: "TT", name: "Trinité-et-Tobago", nameEn: "Trinidad and Tobago", dialCode: "+1", flag: countryCodeToFlag("TT") },
  { code: "TN", name: "Tunisie", nameEn: "Tunisia", dialCode: "+216", flag: countryCodeToFlag("TN") },
  { code: "TM", name: "Turkménistan", nameEn: "Turkmenistan", dialCode: "+993", flag: countryCodeToFlag("TM") },
  { code: "TR", name: "Turquie", nameEn: "Turkey", dialCode: "+90", flag: countryCodeToFlag("TR") },
  { code: "TV", name: "Tuvalu", nameEn: "Tuvalu", dialCode: "+688", flag: countryCodeToFlag("TV") },

  // ===================== U =====================
  { code: "UA", name: "Ukraine", nameEn: "Ukraine", dialCode: "+380", flag: countryCodeToFlag("UA") },
  { code: "UY", name: "Uruguay", nameEn: "Uruguay", dialCode: "+598", flag: countryCodeToFlag("UY") },

  // ===================== V =====================
  { code: "VU", name: "Vanuatu", nameEn: "Vanuatu", dialCode: "+678", flag: countryCodeToFlag("VU") },
  { code: "VE", name: "Venezuela", nameEn: "Venezuela", dialCode: "+58", flag: countryCodeToFlag("VE") },
  { code: "VN", name: "Viêt Nam", nameEn: "Vietnam", dialCode: "+84", flag: countryCodeToFlag("VN") },

  // ===================== Y =====================
  { code: "YE", name: "Yémen", nameEn: "Yemen", dialCode: "+967", flag: countryCodeToFlag("YE") },

  // ===================== Z =====================
  { code: "ZM", name: "Zambie", nameEn: "Zambia", dialCode: "+260", flag: countryCodeToFlag("ZM") },
  { code: "ZW", name: "Zimbabwe", nameEn: "Zimbabwe", dialCode: "+263", flag: countryCodeToFlag("ZW") },

  // ======================================================================
  // TERRITORIES, DEPENDENCIES & SPECIAL REGIONS
  // ======================================================================

  // --- American territories ---
  { code: "AS", name: "Samoa américaines", nameEn: "American Samoa", dialCode: "+1", flag: countryCodeToFlag("AS") },
  { code: "GU", name: "Guam", nameEn: "Guam", dialCode: "+1", flag: countryCodeToFlag("GU") },
  { code: "MP", name: "Îles Mariannes du Nord", nameEn: "Northern Mariana Islands", dialCode: "+1", flag: countryCodeToFlag("MP") },
  { code: "PR", name: "Porto Rico", nameEn: "Puerto Rico", dialCode: "+1", flag: countryCodeToFlag("PR") },
  { code: "VI", name: "Îles Vierges américaines", nameEn: "U.S. Virgin Islands", dialCode: "+1", flag: countryCodeToFlag("VI") },
  { code: "UM", name: "Îles mineures éloignées des États-Unis", nameEn: "U.S. Minor Outlying Islands", dialCode: "+1", flag: countryCodeToFlag("UM") },

  // --- British territories ---
  { code: "AI", name: "Anguilla", nameEn: "Anguilla", dialCode: "+1", flag: countryCodeToFlag("AI") },
  { code: "BM", name: "Bermudes", nameEn: "Bermuda", dialCode: "+1", flag: countryCodeToFlag("BM") },
  { code: "IO", name: "Territoire britannique de l'océan Indien", nameEn: "British Indian Ocean Territory", dialCode: "+246", flag: countryCodeToFlag("IO") },
  { code: "VG", name: "Îles Vierges britanniques", nameEn: "British Virgin Islands", dialCode: "+1", flag: countryCodeToFlag("VG") },
  { code: "KY", name: "Îles Caïmans", nameEn: "Cayman Islands", dialCode: "+1", flag: countryCodeToFlag("KY") },
  { code: "FK", name: "Îles Malouines", nameEn: "Falkland Islands", dialCode: "+500", flag: countryCodeToFlag("FK") },
  { code: "GI", name: "Gibraltar", nameEn: "Gibraltar", dialCode: "+350", flag: countryCodeToFlag("GI") },
  { code: "MS", name: "Montserrat", nameEn: "Montserrat", dialCode: "+1", flag: countryCodeToFlag("MS") },
  { code: "PN", name: "Îles Pitcairn", nameEn: "Pitcairn Islands", dialCode: "+64", flag: countryCodeToFlag("PN") },
  { code: "SH", name: "Sainte-Hélène", nameEn: "Saint Helena", dialCode: "+290", flag: countryCodeToFlag("SH") },
  { code: "TC", name: "Îles Turques-et-Caïques", nameEn: "Turks and Caicos Islands", dialCode: "+1", flag: countryCodeToFlag("TC") },
  { code: "GG", name: "Guernesey", nameEn: "Guernsey", dialCode: "+44", flag: countryCodeToFlag("GG") },
  { code: "JE", name: "Jersey", nameEn: "Jersey", dialCode: "+44", flag: countryCodeToFlag("JE") },
  { code: "IM", name: "Île de Man", nameEn: "Isle of Man", dialCode: "+44", flag: countryCodeToFlag("IM") },

  // --- French territories ---
  { code: "BL", name: "Saint-Barthélemy", nameEn: "Saint Barthelemy", dialCode: "+590", flag: countryCodeToFlag("BL") },
  { code: "GF", name: "Guyane française", nameEn: "French Guiana", dialCode: "+594", flag: countryCodeToFlag("GF") },
  { code: "GP", name: "Guadeloupe", nameEn: "Guadeloupe", dialCode: "+590", flag: countryCodeToFlag("GP") },
  { code: "MF", name: "Saint-Martin (France)", nameEn: "Saint Martin (French part)", dialCode: "+590", flag: countryCodeToFlag("MF") },
  { code: "MQ", name: "Martinique", nameEn: "Martinique", dialCode: "+596", flag: countryCodeToFlag("MQ") },
  { code: "NC", name: "Nouvelle-Calédonie", nameEn: "New Caledonia", dialCode: "+687", flag: countryCodeToFlag("NC") },
  { code: "PF", name: "Polynésie française", nameEn: "French Polynesia", dialCode: "+689", flag: countryCodeToFlag("PF") },
  { code: "RE", name: "La Réunion", nameEn: "Reunion", dialCode: "+262", flag: countryCodeToFlag("RE") },
  { code: "PM", name: "Saint-Pierre-et-Miquelon", nameEn: "Saint Pierre and Miquelon", dialCode: "+508", flag: countryCodeToFlag("PM") },
  { code: "WF", name: "Wallis-et-Futuna", nameEn: "Wallis and Futuna", dialCode: "+681", flag: countryCodeToFlag("WF") },
  { code: "YT", name: "Mayotte", nameEn: "Mayotte", dialCode: "+262", flag: countryCodeToFlag("YT") },
  { code: "TF", name: "Terres australes françaises", nameEn: "French Southern Territories", dialCode: "+262", flag: countryCodeToFlag("TF") },

  // --- Dutch territories ---
  { code: "AW", name: "Aruba", nameEn: "Aruba", dialCode: "+297", flag: countryCodeToFlag("AW") },
  { code: "SX", name: "Saint-Martin (Pays-Bas)", nameEn: "Sint Maarten (Dutch part)", dialCode: "+1", flag: countryCodeToFlag("SX") },
  { code: "BQ", name: "Pays-Bas caribéens", nameEn: "Caribbean Netherlands", dialCode: "+599", flag: countryCodeToFlag("BQ") },

  // --- Danish territories ---
  { code: "GL", name: "Groenland", nameEn: "Greenland", dialCode: "+299", flag: countryCodeToFlag("GL") },
  { code: "FO", name: "Îles Féroé", nameEn: "Faroe Islands", dialCode: "+298", flag: countryCodeToFlag("FO") },

  // --- Finnish territory ---
  { code: "AX", name: "Îles Åland", nameEn: "Aland Islands", dialCode: "+358", flag: countryCodeToFlag("AX") },

  // --- Norwegian territories ---
  { code: "BV", name: "Île Bouvet", nameEn: "Bouvet Island", dialCode: "+47", flag: countryCodeToFlag("BV") },
  { code: "SJ", name: "Svalbard et Jan Mayen", nameEn: "Svalbard and Jan Mayen", dialCode: "+47", flag: countryCodeToFlag("SJ") },

  // --- Chinese territories ---
  { code: "HK", name: "Hong Kong", nameEn: "Hong Kong", dialCode: "+852", flag: countryCodeToFlag("HK") },
  { code: "MO", name: "Macao", nameEn: "Macao", dialCode: "+853", flag: countryCodeToFlag("MO") },
  { code: "TW", name: "Taïwan", nameEn: "Taiwan", dialCode: "+886", flag: countryCodeToFlag("TW") },

  // --- Australian territories ---
  { code: "CC", name: "Îles Cocos", nameEn: "Cocos Islands", dialCode: "+61", flag: countryCodeToFlag("CC") },
  { code: "CX", name: "Île Christmas", nameEn: "Christmas Island", dialCode: "+61", flag: countryCodeToFlag("CX") },
  { code: "NF", name: "Île Norfolk", nameEn: "Norfolk Island", dialCode: "+672", flag: countryCodeToFlag("NF") },
  { code: "HM", name: "Îles Heard-et-MacDonald", nameEn: "Heard Island and McDonald Islands", dialCode: "+672", flag: countryCodeToFlag("HM") },

  // --- New Zealand territories ---
  { code: "CK", name: "Îles Cook", nameEn: "Cook Islands", dialCode: "+682", flag: countryCodeToFlag("CK") },

  // --- Other territories ---
  { code: "AC", name: "Île de l'Ascension", nameEn: "Ascension Island", dialCode: "+247", flag: countryCodeToFlag("AC") },
  { code: "TA", name: "Tristan da Cunha", nameEn: "Tristan da Cunha", dialCode: "+290", flag: countryCodeToFlag("TA") },
  { code: "DG", name: "Diego Garcia", nameEn: "Diego Garcia", dialCode: "+246", flag: countryCodeToFlag("DG") },

  // --- Antarctic ---
  { code: "AQ", name: "Antarctique", nameEn: "Antarctica", dialCode: "+672", flag: countryCodeToFlag("AQ") },

  // --- Disputed / special ---
  { code: "EH", name: "Sahara occidental", nameEn: "Western Sahara", dialCode: "+212", flag: countryCodeToFlag("EH") },
  { code: "GS", name: "Géorgie du Sud-et-les Îles Sandwich du Sud", nameEn: "South Georgia and the South Sandwich Islands", dialCode: "+500", flag: countryCodeToFlag("GS") },
];

// ---------------------------------------------------------------------------
// Lookup index for O(1) code-based retrieval
// ---------------------------------------------------------------------------

const _byCode = new Map<string, Country>();
for (const c of COUNTRIES) {
  // Last entry wins if there are duplicates (territory section takes precedence)
  _byCode.set(c.code.toUpperCase(), c);
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Search countries by name (French & English), ISO code, or dial code.
 *
 * Results are sorted by relevance:
 *  1. Exact ISO code match
 *  2. Name starts with query (French)
 *  3. Name starts with query (English)
 *  4. Dial code starts with query
 *  5. Name contains query (French)
 *  6. Name contains query (English)
 *
 * @param query - Search string (case-insensitive)
 * @returns Matching countries sorted by relevance
 */
export function searchCountries(query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES;

  const results: Array<{ country: Country; rank: number }> = [];

  for (const country of COUNTRIES) {
    const nameLower = country.name.toLowerCase();
    const nameEnLower = country.nameEn.toLowerCase();
    const codeLower = country.code.toLowerCase();
    const dial = country.dialCode;

    let rank = 0;

    // 1. Exact code match — highest priority
    if (codeLower === q) {
      rank = 1;
    }
    // 2. French name starts with query
    else if (nameLower.startsWith(q)) {
      rank = 2;
    }
    // 3. English name starts with query
    else if (nameEnLower.startsWith(q)) {
      rank = 3;
    }
    // 4. Dial code starts with query (e.g. "+33" or "33")
    else if (dial.startsWith(q) || dial.startsWith("+" + q)) {
      rank = 4;
    }
    // 5. French name contains query
    else if (nameLower.includes(q)) {
      rank = 5;
    }
    // 6. English name contains query
    else if (nameEnLower.includes(q)) {
      rank = 6;
    }

    if (rank > 0) {
      results.push({ country, rank });
    }
  }

  // Sort by relevance rank, then alphabetically by French name
  results.sort((a, b) => a.rank - b.rank || a.country.name.localeCompare(b.country.name, "fr"));

  return results.map((r) => r.country);
}

/**
 * Retrieve a country by its ISO 3166-1 alpha-2 code.
 *
 * @param code - Two-letter country code (case-insensitive)
 * @returns The matching Country, or undefined if not found
 */
export function getCountryByCode(code: string): Country | undefined {
  return _byCode.get(code.toUpperCase());
}

/**
 * Format a phone number with the country's international dial code.
 *
 * Strips any leading zeros from the local number and prepends the dial code.
 * If the phone number already starts with `+` it is returned as-is.
 *
 * @param phone   - Local phone number (may contain spaces, dashes, etc.)
 * @param dialCode - International dial code (e.g. "+33")
 * @returns Formatted phone number with dial code
 *
 * @example
 * formatPhoneWithCountry("0612345678", "+33")  // "+33612345678"
 * formatPhoneWithCountry("612345678", "+1")    // "+1612345678"
 * formatPhoneWithCountry("+33612345678", "+33") // "+33612345678"
 */
export function formatPhoneWithCountry(phone: string, dialCode: string): string {
  // Strip all whitespace and dashes for normalisation
  const cleaned = phone.replace(/[\s\-().]/g, "");

  // Already in international format
  if (cleaned.startsWith("+")) return cleaned;

  // Remove leading zeros from the local number
  const localPart = cleaned.replace(/^0+/, "");

  return `${dialCode}${localPart}`;
}
