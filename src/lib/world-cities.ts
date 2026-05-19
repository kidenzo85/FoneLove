/**
 * Comprehensive world cities database with predictive search.
 * Covers all continents, all countries — "jusqu'aux moindres recoins de la terre".
 */

export interface WorldCity {
  name: string        // City name (French or local)
  nameEn: string      // English name
  country: string     // ISO 3166-1 alpha-2
  countryName: string // Country name in French
  region: string      // Region/state/province
  population: number  // For sorting relevance
  lat: number
  lng: number
}

// Accent-insensitive comparison helper
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-']/g, ' ')
}

export const WORLD_CITIES: WorldCity[] = [
  // ============================================================
  // AFRICA — All 54 countries
  // ============================================================
  // Algeria (DZ)
  { name: 'Alger', nameEn: 'Algiers', country: 'DZ', countryName: 'Algérie', region: 'Alger', population: 3400000, lat: 36.75, lng: 3.04 },
  { name: 'Oran', nameEn: 'Oran', country: 'DZ', countryName: 'Algérie', region: 'Oran', population: 860000, lat: 35.70, lng: -0.63 },
  { name: 'Constantine', nameEn: 'Constantine', country: 'DZ', countryName: 'Algérie', region: 'Constantine', population: 450000, lat: 36.37, lng: 6.61 },
  { name: 'Annaba', nameEn: 'Annaba', country: 'DZ', countryName: 'Algérie', region: 'Annaba', population: 260000, lat: 36.90, lng: 7.77 },
  { name: 'Sétif', nameEn: 'Setif', country: 'DZ', countryName: 'Algérie', region: 'Sétif', population: 250000, lat: 36.19, lng: 5.41 },

  // Angola (AO)
  { name: 'Luanda', nameEn: 'Luanda', country: 'AO', countryName: 'Angola', region: 'Luanda', population: 2800000, lat: -8.84, lng: 13.23 },
  { name: 'Huambo', nameEn: 'Huambo', country: 'AO', countryName: 'Angola', region: 'Huambo', population: 230000, lat: -12.78, lng: 15.74 },
  { name: 'Lobito', nameEn: 'Lobito', country: 'AO', countryName: 'Angola', region: 'Benguela', population: 210000, lat: -12.36, lng: 13.54 },

  // Benin (BJ)
  { name: 'Cotonou', nameEn: 'Cotonou', country: 'BJ', countryName: 'Bénin', region: 'Littoral', population: 780000, lat: 6.37, lng: 2.43 },
  { name: 'Porto-Novo', nameEn: 'Porto-Novo', country: 'BJ', countryName: 'Bénin', region: 'Ouémé', population: 270000, lat: 6.50, lng: 2.62 },
  { name: 'Parakou', nameEn: 'Parakou', country: 'BJ', countryName: 'Bénin', region: 'Borgou', population: 190000, lat: 9.34, lng: 2.62 },

  // Botswana (BW)
  { name: 'Gaborone', nameEn: 'Gaborone', country: 'BW', countryName: 'Botswana', region: 'South East', population: 270000, lat: -24.65, lng: 25.91 },
  { name: 'Francistown', nameEn: 'Francistown', country: 'BW', countryName: 'Botswana', region: 'North East', population: 100000, lat: -21.17, lng: 27.51 },

  // Burkina Faso (BF)
  { name: 'Ouagadougou', nameEn: 'Ouagadougou', country: 'BF', countryName: 'Burkina Faso', region: 'Centre', population: 2200000, lat: 12.37, lng: -1.52 },
  { name: 'Bobo-Dioulasso', nameEn: 'Bobo-Dioulasso', country: 'BF', countryName: 'Burkina Faso', region: 'Hauts-Bassins', population: 550000, lat: 11.18, lng: -4.30 },
  { name: 'Koudougou', nameEn: 'Koudougou', country: 'BF', countryName: 'Burkina Faso', region: 'Centre-Ouest', population: 130000, lat: 12.25, lng: -2.37 },

  // Burundi (BI)
  { name: 'Bujumbura', nameEn: 'Bujumbura', country: 'BI', countryName: 'Burundi', region: 'Bujumbura', population: 650000, lat: -3.38, lng: 29.36 },
  { name: 'Gitega', nameEn: 'Gitega', country: 'BI', countryName: 'Burundi', region: 'Gitega', population: 130000, lat: -3.43, lng: 29.93 },

  // Cameroon (CM)
  { name: 'Douala', nameEn: 'Douala', country: 'CM', countryName: 'Cameroun', region: 'Littoral', population: 2900000, lat: 4.05, lng: 9.77 },
  { name: 'Yaoundé', nameEn: 'Yaounde', country: 'CM', countryName: 'Cameroun', region: 'Centre', population: 2700000, lat: 3.87, lng: 11.52 },
  { name: 'Garoua', nameEn: 'Garoua', country: 'CM', countryName: 'Cameroun', region: 'Nord', population: 490000, lat: 9.30, lng: 13.40 },
  { name: 'Bafoussam', nameEn: 'Bafoussam', country: 'CM', countryName: 'Cameroun', region: 'Ouest', population: 350000, lat: 5.48, lng: 10.43 },
  { name: 'Bamenda', nameEn: 'Bamenda', country: 'CM', countryName: 'Cameroun', region: 'Nord-Ouest', population: 400000, lat: 5.96, lng: 10.16 },
  { name: 'Maroua', nameEn: 'Maroua', country: 'CM', countryName: 'Cameroun', region: 'Extrême-Nord', population: 330000, lat: 10.59, lng: 14.32 },
  { name: 'Ngaoundéré', nameEn: 'Ngaoundere', country: 'CM', countryName: 'Cameroun', region: 'Adamaoua', population: 230000, lat: 7.32, lng: 13.58 },
  { name: 'Bertoua', nameEn: 'Bertoua', country: 'CM', countryName: 'Cameroun', region: 'Est', population: 130000, lat: 4.58, lng: 13.68 },
  { name: 'Limbe', nameEn: 'Limbe', country: 'CM', countryName: 'Cameroun', region: 'Sud-Ouest', population: 84000, lat: 4.02, lng: 9.21 },
  { name: 'Kumba', nameEn: 'Kumba', country: 'CM', countryName: 'Cameroun', region: 'Sud-Ouest', population: 144000, lat: 4.64, lng: 9.44 },
  { name: 'Buéa', nameEn: 'Buea', country: 'CM', countryName: 'Cameroun', region: 'Sud-Ouest', population: 95000, lat: 4.16, lng: 9.23 },
  { name: 'Édéa', nameEn: 'Edea', country: 'CM', countryName: 'Cameroun', region: 'Littoral', population: 122000, lat: 3.78, lng: 10.13 },
  { name: 'Kribi', nameEn: 'Kribi', country: 'CM', countryName: 'Cameroun', region: 'Sud', population: 60000, lat: 2.94, lng: 9.91 },
  { name: 'Mbalmayo', nameEn: 'Mbalmayo', country: 'CM', countryName: 'Cameroun', region: 'Centre', population: 75000, lat: 3.52, lng: 11.50 },
  { name: 'Foumban', nameEn: 'Foumban', country: 'CM', countryName: 'Cameroun', region: 'Ouest', population: 114000, lat: 5.52, lng: 10.90 },
  { name: 'Dschang', nameEn: 'Dschang', country: 'CM', countryName: 'Cameroun', region: 'Ouest', population: 87000, lat: 5.45, lng: 10.07 },

  // Cape Verde (CV)
  { name: 'Praia', nameEn: 'Praia', country: 'CV', countryName: 'Cap-Vert', region: 'Santiago', population: 130000, lat: 14.92, lng: -23.51 },
  { name: 'Mindelo', nameEn: 'Mindelo', country: 'CV', countryName: 'Cap-Vert', region: 'São Vicente', population: 76000, lat: 16.88, lng: -24.99 },

  // Central African Republic (CF)
  { name: 'Bangui', nameEn: 'Bangui', country: 'CF', countryName: 'République centrafricaine', region: 'Bangui', population: 890000, lat: 4.36, lng: 18.56 },

  // Chad (TD)
  { name: "N'Djaména", nameEn: "N'Djamena", country: 'TD', countryName: 'Tchad', region: 'Chari-Baguirmi', population: 1100000, lat: 12.11, lng: 15.05 },
  { name: 'Moundou', nameEn: 'Moundou', country: 'TD', countryName: 'Tchad', region: 'Logone Occidental', population: 140000, lat: 8.57, lng: 16.08 },

  // Comoros (KM)
  { name: 'Moroni', nameEn: 'Moroni', country: 'KM', countryName: 'Comores', region: 'Grande Comore', population: 55000, lat: -11.70, lng: 43.25 },

  // Congo (CG)
  { name: 'Brazzaville', nameEn: 'Brazzaville', country: 'CG', countryName: 'République du Congo', region: 'Brazzaville', population: 1800000, lat: -4.26, lng: 15.28 },
  { name: 'Pointe-Noire', nameEn: 'Pointe-Noire', country: 'CG', countryName: 'République du Congo', region: 'Pointe-Noire', population: 830000, lat: -4.80, lng: 11.86 },

  // DR Congo (CD)
  { name: 'Kinshasa', nameEn: 'Kinshasa', country: 'CD', countryName: 'République démocratique du Congo', region: 'Kinshasa', population: 14300000, lat: -4.33, lng: 15.31 },
  { name: 'Lubumbashi', nameEn: 'Lubumbashi', country: 'CD', countryName: 'République démocratique du Congo', region: 'Haut-Katanga', population: 2000000, lat: -11.66, lng: 27.48 },
  { name: 'Mbuji-Mayi', nameEn: 'Mbuji-Mayi', country: 'CD', countryName: 'République démocratique du Congo', region: 'Kasaï-Oriental', population: 1700000, lat: -6.14, lng: 23.59 },
  { name: 'Kisangani', nameEn: 'Kisangani', country: 'CD', countryName: 'République démocratique du Congo', region: 'Tshopo', population: 900000, lat: 0.52, lng: 25.20 },
  { name: 'Goma', nameEn: 'Goma', country: 'CD', countryName: 'République démocratique du Congo', region: 'Nord-Kivu', population: 650000, lat: -1.67, lng: 29.22 },
  { name: 'Bukavu', nameEn: 'Bukavu', country: 'CD', countryName: 'République démocratique du Congo', region: 'Sud-Kivu', population: 810000, lat: -2.51, lng: 28.84 },
  { name: 'Kananga', nameEn: 'Kananga', country: 'CD', countryName: 'République démocratique du Congo', region: 'Kasaï-Central', population: 680000, lat: -5.90, lng: 22.41 },

  // Côte d'Ivoire (CI)
  { name: 'Abidjan', nameEn: 'Abidjan', country: 'CI', countryName: "Côte d'Ivoire", region: 'Abidjan', population: 4700000, lat: 5.36, lng: -4.01 },
  { name: 'Yamoussoukro', nameEn: 'Yamoussoukro', country: 'CI', countryName: "Côte d'Ivoire", region: 'Lacs', population: 240000, lat: 6.83, lng: -5.27 },
  { name: 'Bouaké', nameEn: 'Bouake', country: 'CI', countryName: "Côte d'Ivoire", region: 'Vallée du Bandama', population: 550000, lat: 7.69, lng: -5.04 },
  { name: 'Daloa', nameEn: 'Daloa', country: 'CI', countryName: "Côte d'Ivoire", region: 'Haut-Sassandra', population: 250000, lat: 6.88, lng: -6.45 },
  { name: 'San-Pédro', nameEn: 'San-Pedro', country: 'CI', countryName: "Côte d'Ivoire", region: 'Bas-Sassandra', population: 200000, lat: 4.75, lng: -6.64 },

  // Djibouti (DJ)
  { name: 'Djibouti', nameEn: 'Djibouti', country: 'DJ', countryName: 'Djibouti', region: 'Djibouti', population: 530000, lat: 11.59, lng: 43.15 },

  // Egypt (EG)
  { name: 'Le Caire', nameEn: 'Cairo', country: 'EG', countryName: 'Égypte', region: 'Caire', population: 10000000, lat: 30.04, lng: 31.24 },
  { name: 'Alexandrie', nameEn: 'Alexandria', country: 'EG', countryName: 'Égypte', region: 'Alexandrie', population: 5200000, lat: 31.20, lng: 29.92 },
  { name: 'Gizeh', nameEn: 'Giza', country: 'EG', countryName: 'Égypte', region: 'Gizeh', population: 4200000, lat: 30.01, lng: 31.21 },
  { name: 'Louxor', nameEn: 'Luxor', country: 'EG', countryName: 'Égypte', region: 'Louxor', population: 510000, lat: 25.69, lng: 32.64 },
  { name: 'Assouan', nameEn: 'Aswan', country: 'EG', countryName: 'Égypte', region: 'Assouan', population: 290000, lat: 24.09, lng: 32.90 },

  // Equatorial Guinea (GQ)
  { name: 'Malabo', nameEn: 'Malabo', country: 'GQ', countryName: 'Guinée équatoriale', region: 'Bioko Norte', population: 190000, lat: 3.75, lng: 8.77 },
  { name: 'Bata', nameEn: 'Bata', country: 'GQ', countryName: 'Guinée équatoriale', region: 'Litoral', population: 250000, lat: 1.87, lng: 9.77 },

  // Eritrea (ER)
  { name: 'Asmara', nameEn: 'Asmara', country: 'ER', countryName: 'Érythrée', region: 'Maekel', population: 650000, lat: 15.33, lng: 38.93 },

  // Eswatini (SZ)
  { name: 'Mbabane', nameEn: 'Mbabane', country: 'SZ', countryName: 'Eswatini', region: 'Hhohho', population: 95000, lat: -26.32, lng: 31.13 },
  { name: 'Manzini', nameEn: 'Manzini', country: 'SZ', countryName: 'Eswatini', region: 'Manzini', population: 110000, lat: -26.50, lng: 31.38 },

  // Ethiopia (ET)
  { name: 'Addis-Abeba', nameEn: 'Addis Ababa', country: 'ET', countryName: 'Éthiopie', region: 'Addis-Abeba', population: 3400000, lat: 9.02, lng: 38.75 },
  { name: 'Dire Dawa', nameEn: 'Dire Dawa', country: 'ET', countryName: 'Éthiopie', region: 'Dire Dawa', population: 400000, lat: 9.60, lng: 41.85 },
  { name: 'Gondar', nameEn: 'Gondar', country: 'ET', countryName: 'Éthiopie', region: 'Amhara', population: 370000, lat: 12.61, lng: 37.46 },
  { name: 'Mekelle', nameEn: 'Mekelle', country: 'ET', countryName: 'Éthiopie', region: 'Tigré', population: 310000, lat: 13.50, lng: 39.47 },
  { name: 'Bahir Dar', nameEn: 'Bahir Dar', country: 'ET', countryName: 'Éthiopie', region: 'Amhara', population: 280000, lat: 11.60, lng: 37.38 },
  { name: 'Hawassa', nameEn: 'Hawassa', country: 'ET', countryName: 'Éthiopie', region: 'Sidama', population: 320000, lat: 7.05, lng: 38.48 },

  // Gabon (GA)
  { name: 'Libreville', nameEn: 'Libreville', country: 'GA', countryName: 'Gabon', region: 'Estuaire', population: 800000, lat: 0.39, lng: 9.45 },
  { name: 'Port-Gentil', nameEn: 'Port-Gentil', country: 'GA', countryName: 'Gabon', region: 'Ogooué-Maritime', population: 140000, lat: -0.72, lng: 8.78 },

  // Gambia (GM)
  { name: 'Banjul', nameEn: 'Banjul', country: 'GM', countryName: 'Gambie', region: 'Banjul', population: 36000, lat: 13.46, lng: -16.58 },
  { name: 'Serrekunda', nameEn: 'Serrekunda', country: 'GM', countryName: 'Gambie', region: 'Kanifing', population: 340000, lat: 13.44, lng: -16.68 },

  // Ghana (GH)
  { name: 'Accra', nameEn: 'Accra', country: 'GH', countryName: 'Ghana', region: 'Grand Accra', population: 2500000, lat: 5.56, lng: -0.19 },
  { name: 'Kumasi', nameEn: 'Kumasi', country: 'GH', countryName: 'Ghana', region: 'Ashanti', population: 2100000, lat: 6.69, lng: -1.62 },
  { name: 'Tamale', nameEn: 'Tamale', country: 'GH', countryName: 'Ghana', region: 'Région du Nord', population: 400000, lat: 9.40, lng: -0.84 },
  { name: 'Cape Coast', nameEn: 'Cape Coast', country: 'GH', countryName: 'Ghana', region: 'Centre', population: 170000, lat: 5.10, lng: -1.25 },

  // Guinea (GN)
  { name: 'Conakry', nameEn: 'Conakry', country: 'GN', countryName: 'Guinée', region: 'Conakry', population: 1900000, lat: 9.51, lng: -13.71 },
  { name: 'Kankan', nameEn: 'Kankan', country: 'GN', countryName: 'Guinée', region: 'Kankan', population: 200000, lat: 10.38, lng: -9.30 },

  // Guinea-Bissau (GW)
  { name: 'Bissau', nameEn: 'Bissau', country: 'GW', countryName: 'Guinée-Bissau', region: 'Bissau', population: 430000, lat: 11.86, lng: -15.60 },

  // Kenya (KE)
  { name: 'Nairobi', nameEn: 'Nairobi', country: 'KE', countryName: 'Kenya', region: 'Nairobi', population: 4400000, lat: -1.29, lng: 36.82 },
  { name: 'Mombasa', nameEn: 'Mombasa', country: 'KE', countryName: 'Kenya', region: 'Mombasa', population: 1200000, lat: -4.05, lng: 39.67 },
  { name: 'Kisumu', nameEn: 'Kisumu', country: 'KE', countryName: 'Kenya', region: 'Kisumu', population: 410000, lat: -0.10, lng: 34.75 },
  { name: 'Nakuru', nameEn: 'Nakuru', country: 'KE', countryName: 'Kenya', region: 'Nakuru', population: 310000, lat: -0.30, lng: 36.08 },

  // Lesotho (LS)
  { name: 'Maseru', nameEn: 'Maseru', country: 'LS', countryName: 'Lesotho', region: 'Maseru', population: 270000, lat: -29.31, lng: 27.48 },

  // Liberia (LR)
  { name: 'Monrovia', nameEn: 'Monrovia', country: 'LR', countryName: 'Libéria', region: 'Montserrado', population: 1100000, lat: 6.31, lng: -10.77 },

  // Libya (LY)
  { name: 'Tripoli', nameEn: 'Tripoli', country: 'LY', countryName: 'Libye', region: 'Tripoli', population: 1200000, lat: 32.90, lng: 13.18 },
  { name: 'Benghazi', nameEn: 'Benghazi', country: 'LY', countryName: 'Libye', region: 'Benghazi', population: 680000, lat: 32.12, lng: 20.07 },
  { name: 'Misrata', nameEn: 'Misrata', country: 'LY', countryName: 'Libye', region: 'Misrata', population: 350000, lat: 32.38, lng: 15.10 },

  // Madagascar (MG)
  { name: 'Antananarivo', nameEn: 'Antananarivo', country: 'MG', countryName: 'Madagascar', region: 'Analamanga', population: 1400000, lat: -18.88, lng: 47.51 },
  { name: 'Toamasina', nameEn: 'Toamasina', country: 'MG', countryName: 'Madagascar', region: 'Atsinanana', population: 280000, lat: -18.15, lng: 49.40 },
  { name: 'Fianarantsoa', nameEn: 'Fianarantsoa', country: 'MG', countryName: 'Madagascar', region: 'Haute Matsiatra', population: 190000, lat: -21.44, lng: 47.09 },

  // Malawi (MW)
  { name: 'Lilongwe', nameEn: 'Lilongwe', country: 'MW', countryName: 'Malawi', region: 'Lilongwe', population: 990000, lat: -13.97, lng: 33.79 },
  { name: 'Blantyre', nameEn: 'Blantyre', country: 'MW', countryName: 'Malawi', region: 'Blantyre', population: 810000, lat: -15.79, lng: 35.01 },

  // Mali (ML)
  { name: 'Bamako', nameEn: 'Bamako', country: 'ML', countryName: 'Mali', region: 'Bamako', population: 2200000, lat: 12.65, lng: -8.00 },
  { name: 'Sikasso', nameEn: 'Sikasso', country: 'ML', countryName: 'Mali', region: 'Sikasso', population: 230000, lat: 11.32, lng: -5.67 },

  // Mauritania (MR)
  { name: 'Nouakchott', nameEn: 'Nouakchott', country: 'MR', countryName: 'Mauritanie', region: 'Nouakchott', population: 1100000, lat: 18.09, lng: -15.98 },

  // Mauritius (MU)
  { name: 'Port-Louis', nameEn: 'Port Louis', country: 'MU', countryName: 'Maurice', region: 'Port-Louis', population: 150000, lat: -20.16, lng: 57.50 },
  { name: 'Curepipe', nameEn: 'Curepipe', country: 'MU', countryName: 'Maurice', region: 'Plaines Wilhems', population: 80000, lat: -20.32, lng: 57.52 },

  // Morocco (MA)
  { name: 'Casablanca', nameEn: 'Casablanca', country: 'MA', countryName: 'Maroc', region: 'Casablanca-Settat', population: 3700000, lat: 33.57, lng: -7.59 },
  { name: 'Rabat', nameEn: 'Rabat', country: 'MA', countryName: 'Maroc', region: 'Rabat-Salé-Kénitra', population: 1900000, lat: 34.02, lng: -6.84 },
  { name: 'Marrakech', nameEn: 'Marrakech', country: 'MA', countryName: 'Maroc', region: 'Marrakech-Safi', population: 930000, lat: 31.63, lng: -8.01 },
  { name: 'Fès', nameEn: 'Fez', country: 'MA', countryName: 'Maroc', region: 'Fès-Meknès', population: 1150000, lat: 34.03, lng: -5.00 },
  { name: 'Tanger', nameEn: 'Tangier', country: 'MA', countryName: 'Maroc', region: 'Tanger-Tétouan-Al Hoceïma', population: 1050000, lat: 35.78, lng: -5.81 },
  { name: 'Agadir', nameEn: 'Agadir', country: 'MA', countryName: 'Maroc', region: 'Souss-Massa', population: 600000, lat: 30.43, lng: -9.60 },
  { name: 'Meknès', nameEn: 'Meknes', country: 'MA', countryName: 'Maroc', region: 'Fès-Meknès', population: 630000, lat: 33.89, lng: -5.55 },
  { name: 'Oujda', nameEn: 'Oujda', country: 'MA', countryName: 'Maroc', region: 'Oriental', population: 500000, lat: 34.68, lng: -1.91 },

  // Mozambique (MZ)
  { name: 'Maputo', nameEn: 'Maputo', country: 'MZ', countryName: 'Mozambique', region: 'Maputo', population: 1200000, lat: -25.97, lng: 32.57 },
  { name: 'Beira', nameEn: 'Beira', country: 'MZ', countryName: 'Mozambique', region: 'Sofala', population: 470000, lat: -19.84, lng: 34.87 },
  { name: 'Nampula', nameEn: 'Nampula', country: 'MZ', countryName: 'Mozambique', region: 'Nampula', population: 470000, lat: -15.12, lng: 39.27 },

  // Namibia (NA)
  { name: 'Windhoek', nameEn: 'Windhoek', country: 'NA', countryName: 'Namibie', region: 'Khomas', population: 380000, lat: -22.57, lng: 17.08 },

  // Niger (NE)
  { name: 'Niamey', nameEn: 'Niamey', country: 'NE', countryName: 'Niger', region: 'Niamey', population: 1100000, lat: 13.51, lng: 2.11 },
  { name: 'Zinder', nameEn: 'Zinder', country: 'NE', countryName: 'Niger', region: 'Zinder', population: 260000, lat: 13.81, lng: 8.99 },
  { name: 'Maradi', nameEn: 'Maradi', country: 'NE', countryName: 'Niger', region: 'Maradi', population: 230000, lat: 13.49, lng: 7.10 },

  // Nigeria (NG)
  { name: 'Lagos', nameEn: 'Lagos', country: 'NG', countryName: 'Nigéria', region: 'Lagos', population: 15400000, lat: 6.52, lng: 3.38 },
  { name: 'Abuja', nameEn: 'Abuja', country: 'NG', countryName: 'Nigéria', region: 'Territoire de la Capitale', population: 3600000, lat: 9.06, lng: 7.49 },
  { name: 'Kano', nameEn: 'Kano', country: 'NG', countryName: 'Nigéria', region: 'Kano', population: 4000000, lat: 12.00, lng: 8.52 },
  { name: 'Ibadan', nameEn: 'Ibadan', country: 'NG', countryName: 'Nigéria', region: 'Oyo', population: 3600000, lat: 7.38, lng: 3.93 },
  { name: 'Port Harcourt', nameEn: 'Port Harcourt', country: 'NG', countryName: 'Nigéria', region: 'Rivers', population: 2100000, lat: 4.82, lng: 7.05 },
  { name: 'Benin City', nameEn: 'Benin City', country: 'NG', countryName: 'Nigéria', region: 'Edo', population: 1500000, lat: 6.34, lng: 5.62 },
  { name: 'Kaduna', nameEn: 'Kaduna', country: 'NG', countryName: 'Nigéria', region: 'Kaduna', population: 1600000, lat: 10.52, lng: 7.44 },

  // Rwanda (RW)
  { name: 'Kigali', nameEn: 'Kigali', country: 'RW', countryName: 'Rwanda', region: 'Kigali', population: 1200000, lat: -1.94, lng: 30.06 },
  { name: 'Butare', nameEn: 'Butare', country: 'RW', countryName: 'Rwanda', region: 'Sud', population: 90000, lat: -2.60, lng: 29.74 },

  // Sao Tome and Principe (ST)
  { name: 'São Tomé', nameEn: 'Sao Tome', country: 'ST', countryName: 'Sao Tomé-et-Príncipe', region: 'São Tomé', population: 72000, lat: 0.33, lng: 6.73 },

  // Senegal (SN)
  { name: 'Dakar', nameEn: 'Dakar', country: 'SN', countryName: 'Sénégal', region: 'Dakar', population: 1200000, lat: 14.69, lng: -17.44 },
  { name: 'Saint-Louis', nameEn: 'Saint-Louis', country: 'SN', countryName: 'Sénégal', region: 'Saint-Louis', population: 230000, lat: 16.03, lng: -16.50 },
  { name: 'Thiès', nameEn: 'Thies', country: 'SN', countryName: 'Sénégal', region: 'Thiès', population: 270000, lat: 14.79, lng: -16.94 },
  { name: 'Ziguinchor', nameEn: 'Ziguinchor', country: 'SN', countryName: 'Sénégal', region: 'Ziguinchor', population: 200000, lat: 12.56, lng: -16.27 },
  { name: 'Kaolack', nameEn: 'Kaolack', country: 'SN', countryName: 'Sénégal', region: 'Kaolack', population: 180000, lat: 14.17, lng: -16.08 },

  // Seychelles (SC)
  { name: 'Victoria', nameEn: 'Victoria', country: 'SC', countryName: 'Seychelles', region: 'Mahé', population: 28000, lat: -4.62, lng: 55.45 },

  // Sierra Leone (SL)
  { name: 'Freetown', nameEn: 'Freetown', country: 'SL', countryName: 'Sierra Leone', region: 'Ouest', population: 950000, lat: 8.49, lng: -13.24 },

  // Somalia (SO)
  { name: 'Mogadiscio', nameEn: 'Mogadishu', country: 'SO', countryName: 'Somalie', region: 'Banaadir', population: 1600000, lat: 2.05, lng: 45.34 },
  { name: 'Hargeisa', nameEn: 'Hargeisa', country: 'SO', countryName: 'Somalie', region: 'Maroodi Jeex', population: 800000, lat: 9.56, lng: 44.07 },

  // South Africa (ZA)
  { name: 'Johannesburg', nameEn: 'Johannesburg', country: 'ZA', countryName: 'Afrique du Sud', region: 'Gauteng', population: 5600000, lat: -26.20, lng: 28.05 },
  { name: 'Le Cap', nameEn: 'Cape Town', country: 'ZA', countryName: 'Afrique du Sud', region: 'Cap-Occidental', population: 4400000, lat: -33.92, lng: 18.42 },
  { name: 'Durban', nameEn: 'Durban', country: 'ZA', countryName: 'Afrique du Sud', region: 'KwaZulu-Natal', population: 3600000, lat: -29.86, lng: 31.02 },
  { name: 'Pretoria', nameEn: 'Pretoria', country: 'ZA', countryName: 'Afrique du Sud', region: 'Gauteng', population: 2500000, lat: -25.75, lng: 28.19 },
  { name: 'Port Elizabeth', nameEn: 'Port Elizabeth', country: 'ZA', countryName: 'Afrique du Sud', region: 'Cap-Oriental', population: 1200000, lat: -33.96, lng: 25.60 },

  // South Sudan (SS)
  { name: 'Djouba', nameEn: 'Juba', country: 'SS', countryName: 'Soudan du Sud', region: 'Équateur-Central', population: 530000, lat: 4.85, lng: 31.60 },

  // Sudan (SD)
  { name: 'Khartoum', nameEn: 'Khartoum', country: 'SD', countryName: 'Soudan', region: 'Khartoum', population: 5300000, lat: 15.50, lng: 32.56 },
  { name: 'Omdurman', nameEn: 'Omdurman', country: 'SD', countryName: 'Soudan', region: 'Khartoum', population: 2800000, lat: 15.64, lng: 32.48 },
  { name: 'Port-Soudan', nameEn: 'Port Sudan', country: 'SD', countryName: 'Soudan', region: 'Mer Rouge', population: 490000, lat: 19.62, lng: 37.22 },

  // Tanzania (TZ)
  { name: 'Dar es Salaam', nameEn: 'Dar es Salaam', country: 'TZ', countryName: 'Tanzanie', region: 'Dar es Salaam', population: 6400000, lat: -6.79, lng: 39.28 },
  { name: 'Dodoma', nameEn: 'Dodoma', country: 'TZ', countryName: 'Tanzanie', region: 'Dodoma', population: 410000, lat: -6.16, lng: 35.75 },
  { name: 'Arusha', nameEn: 'Arusha', country: 'TZ', countryName: 'Tanzanie', region: 'Arusha', population: 420000, lat: -3.39, lng: 36.69 },
  { name: 'Mwanza', nameEn: 'Mwanza', country: 'TZ', countryName: 'Tanzanie', region: 'Mwanza', population: 380000, lat: -2.52, lng: 32.90 },
  { name: 'Zanzibar', nameEn: 'Zanzibar', country: 'TZ', countryName: 'Tanzanie', region: 'Zanzibar', population: 260000, lat: -6.16, lng: 39.20 },

  // Togo (TG)
  { name: 'Lomé', nameEn: 'Lome', country: 'TG', countryName: 'Togo', region: 'Maritime', population: 950000, lat: 6.13, lng: 1.22 },
  { name: 'Sokodé', nameEn: 'Sokode', country: 'TG', countryName: 'Togo', region: 'Centrale', population: 130000, lat: 8.98, lng: 1.13 },

  // Tunisia (TN)
  { name: 'Tunis', nameEn: 'Tunis', country: 'TN', countryName: 'Tunisie', region: 'Tunis', population: 640000, lat: 36.81, lng: 10.17 },
  { name: 'Sfax', nameEn: 'Sfax', country: 'TN', countryName: 'Tunisie', region: 'Sfax', population: 330000, lat: 34.74, lng: 10.76 },
  { name: 'Sousse', nameEn: 'Sousse', country: 'TN', countryName: 'Tunisie', region: 'Sousse', population: 270000, lat: 35.83, lng: 10.64 },

  // Uganda (UG)
  { name: 'Kampala', nameEn: 'Kampala', country: 'UG', countryName: 'Ouganda', region: 'Kampala', population: 1700000, lat: 0.35, lng: 32.58 },
  { name: 'Entebbe', nameEn: 'Entebbe', country: 'UG', countryName: 'Ouganda', region: 'Wakiso', population: 87000, lat: 0.06, lng: 32.47 },

  // Zambia (ZM)
  { name: 'Lusaka', nameEn: 'Lusaka', country: 'ZM', countryName: 'Zambie', region: 'Lusaka', population: 2800000, lat: -15.39, lng: 28.32 },
  { name: 'Kitwe', nameEn: 'Kitwe', country: 'ZM', countryName: 'Zambie', region: 'Copperbelt', population: 520000, lat: -12.80, lng: 28.21 },
  { name: 'Ndola', nameEn: 'Ndola', country: 'ZM', countryName: 'Zambie', region: 'Copperbelt', population: 500000, lat: -12.96, lng: 28.64 },

  // Zimbabwe (ZW)
  { name: 'Harare', nameEn: 'Harare', country: 'ZW', countryName: 'Zimbabwe', region: 'Harare', population: 1600000, lat: -17.83, lng: 31.05 },
  { name: 'Bulawayo', nameEn: 'Bulawayo', country: 'ZW', countryName: 'Zimbabwe', region: 'Bulawayo', population: 680000, lat: -20.15, lng: 28.58 },

  // ============================================================
  // AMERICAS
  // ============================================================
  // Argentina (AR)
  { name: 'Buenos Aires', nameEn: 'Buenos Aires', country: 'AR', countryName: 'Argentine', region: 'Buenos Aires', population: 15000000, lat: -34.60, lng: -58.38 },
  { name: 'Córdoba', nameEn: 'Cordoba', country: 'AR', countryName: 'Argentine', region: 'Córdoba', population: 1600000, lat: -31.42, lng: -64.18 },
  { name: 'Rosario', nameEn: 'Rosario', country: 'AR', countryName: 'Argentine', region: 'Santa Fe', population: 1100000, lat: -32.95, lng: -60.64 },
  { name: 'Mendoza', nameEn: 'Mendoza', country: 'AR', countryName: 'Argentine', region: 'Mendoza', population: 950000, lat: -32.89, lng: -68.83 },

  // Bolivia (BO)
  { name: 'La Paz', nameEn: 'La Paz', country: 'BO', countryName: 'Bolivie', region: 'La Paz', population: 810000, lat: -16.50, lng: -68.15 },
  { name: 'Santa Cruz', nameEn: 'Santa Cruz', country: 'BO', countryName: 'Bolivie', region: 'Santa Cruz', population: 1500000, lat: -17.78, lng: -63.18 },
  { name: 'Cochabamba', nameEn: 'Cochabamba', country: 'BO', countryName: 'Bolivie', region: 'Cochabamba', population: 640000, lat: -17.39, lng: -66.16 },

  // Brazil (BR)
  { name: 'São Paulo', nameEn: 'Sao Paulo', country: 'BR', countryName: 'Brésil', region: 'São Paulo', population: 12300000, lat: -23.55, lng: -46.63 },
  { name: 'Rio de Janeiro', nameEn: 'Rio de Janeiro', country: 'BR', countryName: 'Brésil', region: 'Rio de Janeiro', population: 6700000, lat: -22.91, lng: -43.17 },
  { name: 'Brasília', nameEn: 'Brasilia', country: 'BR', countryName: 'Brésil', region: 'Distrito Federal', population: 3100000, lat: -15.79, lng: -47.88 },
  { name: 'Salvador', nameEn: 'Salvador', country: 'BR', countryName: 'Brésil', region: 'Bahia', population: 2900000, lat: -12.97, lng: -38.51 },
  { name: 'Fortaleza', nameEn: 'Fortaleza', country: 'BR', countryName: 'Brésil', region: 'Ceará', population: 2700000, lat: -3.72, lng: -38.53 },
  { name: 'Belo Horizonte', nameEn: 'Belo Horizonte', country: 'BR', countryName: 'Brésil', region: 'Minas Gerais', population: 2500000, lat: -19.92, lng: -43.94 },
  { name: 'Manaus', nameEn: 'Manaus', country: 'BR', countryName: 'Brésil', region: 'Amazonas', population: 2100000, lat: -3.12, lng: -60.02 },
  { name: 'Curitiba', nameEn: 'Curitiba', country: 'BR', countryName: 'Brésil', region: 'Paraná', population: 1900000, lat: -25.43, lng: -49.27 },
  { name: 'Recife', nameEn: 'Recife', country: 'BR', countryName: 'Brésil', region: 'Pernambuco', population: 1600000, lat: -8.05, lng: -34.87 },
  { name: 'Porto Alegre', nameEn: 'Porto Alegre', country: 'BR', countryName: 'Brésil', region: 'Rio Grande do Sul', population: 1500000, lat: -30.03, lng: -51.23 },

  // Canada (CA)
  { name: 'Toronto', nameEn: 'Toronto', country: 'CA', countryName: 'Canada', region: 'Ontario', population: 6200000, lat: 43.65, lng: -79.38 },
  { name: 'Montréal', nameEn: 'Montreal', country: 'CA', countryName: 'Canada', region: 'Québec', population: 4200000, lat: 45.50, lng: -73.57 },
  { name: 'Vancouver', nameEn: 'Vancouver', country: 'CA', countryName: 'Canada', region: 'Colombie-Britannique', population: 2600000, lat: 49.28, lng: -123.12 },
  { name: 'Calgary', nameEn: 'Calgary', country: 'CA', countryName: 'Canada', region: 'Alberta', population: 1500000, lat: 51.05, lng: -114.07 },
  { name: 'Ottawa', nameEn: 'Ottawa', country: 'CA', countryName: 'Canada', region: 'Ontario', population: 1400000, lat: 45.42, lng: -75.70 },
  { name: 'Québec', nameEn: 'Quebec City', country: 'CA', countryName: 'Canada', region: 'Québec', population: 800000, lat: 46.81, lng: -71.21 },

  // Chile (CL)
  { name: 'Santiago', nameEn: 'Santiago', country: 'CL', countryName: 'Chili', region: 'Région Métropolitaine', population: 6300000, lat: -33.45, lng: -70.67 },
  { name: 'Valparaíso', nameEn: 'Valparaiso', country: 'CL', countryName: 'Chili', region: 'Valparaíso', population: 950000, lat: -33.05, lng: -71.60 },
  { name: 'Concepción', nameEn: 'Concepcion', country: 'CL', countryName: 'Chili', region: 'Biobío', population: 720000, lat: -36.83, lng: -73.04 },

  // Colombia (CO)
  { name: 'Bogotá', nameEn: 'Bogota', country: 'CO', countryName: 'Colombie', region: 'Bogotá', population: 7400000, lat: 4.71, lng: -74.07 },
  { name: 'Medellín', nameEn: 'Medellin', country: 'CO', countryName: 'Colombie', region: 'Antioquia', population: 2600000, lat: 6.25, lng: -75.56 },
  { name: 'Cali', nameEn: 'Cali', country: 'CO', countryName: 'Colombie', region: 'Valle del Cauca', population: 2200000, lat: 3.45, lng: -76.53 },
  { name: 'Barranquilla', nameEn: 'Barranquilla', country: 'CO', countryName: 'Colombie', region: 'Atlántico', population: 1200000, lat: 10.96, lng: -74.78 },
  { name: 'Carthagène', nameEn: 'Cartagena', country: 'CO', countryName: 'Colombie', region: 'Bolívar', population: 900000, lat: 10.39, lng: -75.51 },

  // Costa Rica (CR)
  { name: 'San José', nameEn: 'San Jose', country: 'CR', countryName: 'Costa Rica', region: 'San José', population: 1100000, lat: 9.93, lng: -84.08 },

  // Cuba (CU)
  { name: 'La Havane', nameEn: 'Havana', country: 'CU', countryName: 'Cuba', region: 'La Havane', population: 2100000, lat: 23.11, lng: -82.37 },
  { name: 'Santiago de Cuba', nameEn: 'Santiago de Cuba', country: 'CU', countryName: 'Cuba', region: 'Santiago de Cuba', population: 510000, lat: 20.02, lng: -75.82 },

  // Dominican Republic (DO)
  { name: 'Saint-Domingue', nameEn: 'Santo Domingo', country: 'DO', countryName: 'République dominicaine', region: 'Distrito Nacional', population: 3400000, lat: 18.49, lng: -69.93 },
  { name: 'Santiago de los Caballeros', nameEn: 'Santiago de los Caballeros', country: 'DO', countryName: 'République dominicaine', region: 'Santiago', population: 800000, lat: 19.45, lng: -70.70 },

  // Ecuador (EC)
  { name: 'Quito', nameEn: 'Quito', country: 'EC', countryName: 'Équateur', region: 'Pichincha', population: 2800000, lat: -0.18, lng: -78.47 },
  { name: 'Guayaquil', nameEn: 'Guayaquil', country: 'EC', countryName: 'Équateur', region: 'Guayas', population: 2700000, lat: -2.17, lng: -79.92 },
  { name: 'Cuenca', nameEn: 'Cuenca', country: 'EC', countryName: 'Équateur', region: 'Azuay', population: 400000, lat: -2.90, lng: -79.01 },

  // El Salvador (SV)
  { name: 'San Salvador', nameEn: 'San Salvador', country: 'SV', countryName: 'Salvador', region: 'San Salvador', population: 1700000, lat: 13.70, lng: -89.22 },

  // Guatemala (GT)
  { name: 'Guatemala', nameEn: 'Guatemala City', country: 'GT', countryName: 'Guatemala', region: 'Guatemala', population: 3000000, lat: 14.63, lng: -90.51 },

  // Haiti (HT)
  { name: 'Port-au-Prince', nameEn: 'Port-au-Prince', country: 'HT', countryName: 'Haïti', region: 'Ouest', population: 2900000, lat: 18.54, lng: -72.34 },
  { name: 'Cap-Haïtien', nameEn: 'Cap-Haitien', country: 'HT', countryName: 'Haïti', region: 'Nord', population: 280000, lat: 19.76, lng: -72.20 },

  // Honduras (HN)
  { name: 'Tegucigalpa', nameEn: 'Tegucigalpa', country: 'HN', countryName: 'Honduras', region: 'Francisco Morazán', population: 1100000, lat: 14.08, lng: -87.21 },
  { name: 'San Pedro Sula', nameEn: 'San Pedro Sula', country: 'HN', countryName: 'Honduras', region: 'Cortés', population: 800000, lat: 15.51, lng: -88.02 },

  // Jamaica (JM)
  { name: 'Kingston', nameEn: 'Kingston', country: 'JM', countryName: 'Jamaïque', region: 'Kingston', population: 590000, lat: 18.00, lng: -76.79 },

  // Mexico (MX)
  { name: 'Mexico', nameEn: 'Mexico City', country: 'MX', countryName: 'Mexique', region: 'CDMX', population: 9200000, lat: 19.43, lng: -99.13 },
  { name: 'Guadalajara', nameEn: 'Guadalajara', country: 'MX', countryName: 'Mexique', region: 'Jalisco', population: 5300000, lat: 20.67, lng: -103.35 },
  { name: 'Monterrey', nameEn: 'Monterrey', country: 'MX', countryName: 'Mexique', region: 'Nuevo León', population: 4800000, lat: 25.67, lng: -100.31 },
  { name: 'Puebla', nameEn: 'Puebla', country: 'MX', countryName: 'Mexique', region: 'Puebla', population: 3100000, lat: 19.04, lng: -98.20 },
  { name: 'Cancún', nameEn: 'Cancun', country: 'MX', countryName: 'Mexique', region: 'Quintana Roo', population: 890000, lat: 21.16, lng: -86.85 },
  { name: 'Tijuana', nameEn: 'Tijuana', country: 'MX', countryName: 'Mexique', region: 'Baja California', population: 1900000, lat: 32.51, lng: -117.02 },

  // Nicaragua (NI)
  { name: 'Managua', nameEn: 'Managua', country: 'NI', countryName: 'Nicaragua', region: 'Managua', population: 1100000, lat: 12.15, lng: -86.27 },

  // Panama (PA)
  { name: 'Panama', nameEn: 'Panama City', country: 'PA', countryName: 'Panama', region: 'Panamá', population: 1300000, lat: 8.98, lng: -79.52 },

  // Paraguay (PY)
  { name: 'Asunción', nameEn: 'Asuncion', country: 'PY', countryName: 'Paraguay', region: 'Capital', population: 1100000, lat: -25.26, lng: -57.58 },

  // Peru (PE)
  { name: 'Lima', nameEn: 'Lima', country: 'PE', countryName: 'Pérou', region: 'Lima', population: 9700000, lat: -12.05, lng: -77.04 },
  { name: 'Cuzco', nameEn: 'Cusco', country: 'PE', countryName: 'Pérou', region: 'Cusco', population: 430000, lat: -13.53, lng: -71.97 },
  { name: 'Arequipa', nameEn: 'Arequipa', country: 'PE', countryName: 'Pérou', region: 'Arequipa', population: 860000, lat: -16.41, lng: -71.53 },

  // Trinidad and Tobago (TT)
  { name: 'Port-d\'Espagne', nameEn: 'Port of Spain', country: 'TT', countryName: 'Trinité-et-Tobago', region: 'Port-d\'Espagne', population: 37000, lat: 10.66, lng: -61.51 },
  { name: 'San Fernando', nameEn: 'San Fernando', country: 'TT', countryName: 'Trinité-et-Tobago', region: 'San Fernando', population: 55000, lat: 10.28, lng: -61.47 },

  // Uruguay (UY)
  { name: 'Montevideo', nameEn: 'Montevideo', country: 'UY', countryName: 'Uruguay', region: 'Montevideo', population: 1400000, lat: -34.88, lng: -56.17 },

  // USA (US)
  { name: 'New York', nameEn: 'New York', country: 'US', countryName: 'États-Unis', region: 'New York', population: 8300000, lat: 40.71, lng: -74.01 },
  { name: 'Los Angeles', nameEn: 'Los Angeles', country: 'US', countryName: 'États-Unis', region: 'Californie', population: 4000000, lat: 34.05, lng: -118.24 },
  { name: 'Chicago', nameEn: 'Chicago', country: 'US', countryName: 'États-Unis', region: 'Illinois', population: 2700000, lat: 41.88, lng: -87.63 },
  { name: 'Houston', nameEn: 'Houston', country: 'US', countryName: 'États-Unis', region: 'Texas', population: 2300000, lat: 29.76, lng: -95.37 },
  { name: 'Miami', nameEn: 'Miami', country: 'US', countryName: 'États-Unis', region: 'Floride', population: 470000, lat: 25.76, lng: -80.19 },
  { name: 'San Francisco', nameEn: 'San Francisco', country: 'US', countryName: 'États-Unis', region: 'Californie', population: 880000, lat: 37.77, lng: -122.42 },
  { name: 'Washington', nameEn: 'Washington', country: 'US', countryName: 'États-Unis', region: 'D.C.', population: 700000, lat: 38.91, lng: -77.04 },
  { name: 'Seattle', nameEn: 'Seattle', country: 'US', countryName: 'États-Unis', region: 'Washington', population: 750000, lat: 47.61, lng: -122.33 },
  { name: 'Boston', nameEn: 'Boston', country: 'US', countryName: 'États-Unis', region: 'Massachusetts', population: 690000, lat: 42.36, lng: -71.06 },
  { name: 'Atlanta', nameEn: 'Atlanta', country: 'US', countryName: 'États-Unis', region: 'Géorgie', population: 500000, lat: 33.75, lng: -84.39 },
  { name: 'Dallas', nameEn: 'Dallas', country: 'US', countryName: 'États-Unis', region: 'Texas', population: 1300000, lat: 32.78, lng: -96.80 },
  { name: 'Philadelphie', nameEn: 'Philadelphia', country: 'US', countryName: 'États-Unis', region: 'Pennsylvanie', population: 1600000, lat: 39.95, lng: -75.17 },
  { name: 'La Nouvelle-Orléans', nameEn: 'New Orleans', country: 'US', countryName: 'États-Unis', region: 'Louisiane', population: 390000, lat: 29.95, lng: -90.07 },

  // Venezuela (VE)
  { name: 'Caracas', nameEn: 'Caracas', country: 'VE', countryName: 'Venezuela', region: 'Capital', population: 2900000, lat: 10.49, lng: -66.88 },
  { name: 'Maracaïbo', nameEn: 'Maracaibo', country: 'VE', countryName: 'Venezuela', region: 'Zulia', population: 2000000, lat: 10.64, lng: -71.64 },
  { name: 'Valencia', nameEn: 'Valencia', country: 'VE', countryName: 'Venezuela', region: 'Carabobo', population: 1400000, lat: 10.18, lng: -67.99 },

  // ============================================================
  // EUROPE
  // ============================================================
  // France (FR)
  { name: 'Paris', nameEn: 'Paris', country: 'FR', countryName: 'France', region: 'Île-de-France', population: 2160000, lat: 48.86, lng: 2.35 },
  { name: 'Marseille', nameEn: 'Marseille', country: 'FR', countryName: 'France', region: 'PACA', population: 870000, lat: 43.30, lng: 5.37 },
  { name: 'Lyon', nameEn: 'Lyon', country: 'FR', countryName: 'France', region: 'Auvergne-Rhône-Alpes', population: 520000, lat: 45.75, lng: 4.85 },
  { name: 'Toulouse', nameEn: 'Toulouse', country: 'FR', countryName: 'France', region: 'Occitanie', population: 490000, lat: 43.60, lng: 1.44 },
  { name: 'Nice', nameEn: 'Nice', country: 'FR', countryName: 'France', region: 'PACA', population: 340000, lat: 43.71, lng: 7.26 },
  { name: 'Nantes', nameEn: 'Nantes', country: 'FR', countryName: 'France', region: 'Pays de la Loire', population: 310000, lat: 47.22, lng: -1.55 },
  { name: 'Strasbourg', nameEn: 'Strasbourg', country: 'FR', countryName: 'France', region: 'Grand Est', population: 280000, lat: 48.57, lng: 7.75 },
  { name: 'Bordeaux', nameEn: 'Bordeaux', country: 'FR', countryName: 'France', region: 'Nouvelle-Aquitaine', population: 260000, lat: 44.84, lng: -0.58 },
  { name: 'Lille', nameEn: 'Lille', country: 'FR', countryName: 'France', region: 'Hauts-de-France', population: 230000, lat: 50.63, lng: 3.06 },
  { name: 'Rennes', nameEn: 'Rennes', country: 'FR', countryName: 'France', region: 'Bretagne', population: 220000, lat: 48.11, lng: -1.68 },
  { name: 'Montpellier', nameEn: 'Montpellier', country: 'FR', countryName: 'France', region: 'Occitanie', population: 290000, lat: 43.61, lng: 3.88 },
  { name: 'Douala', nameEn: 'Douala', country: 'CM', countryName: 'Cameroun', region: 'Littoral', population: 2900000, lat: 4.05, lng: 9.77 },

  // Germany (DE)
  { name: 'Berlin', nameEn: 'Berlin', country: 'DE', countryName: 'Allemagne', region: 'Berlin', population: 3700000, lat: 52.52, lng: 13.41 },
  { name: 'Munich', nameEn: 'Munich', country: 'DE', countryName: 'Allemagne', region: 'Bavière', population: 1500000, lat: 48.14, lng: 11.58 },
  { name: 'Hambourg', nameEn: 'Hamburg', country: 'DE', countryName: 'Allemagne', region: 'Hambourg', population: 1900000, lat: 53.55, lng: 9.99 },
  { name: 'Francfort', nameEn: 'Frankfurt', country: 'DE', countryName: 'Allemagne', region: 'Hesse', population: 780000, lat: 50.11, lng: 8.68 },
  { name: 'Cologne', nameEn: 'Cologne', country: 'DE', countryName: 'Allemagne', region: 'Rhénanie-du-Nord-Westphalie', population: 1080000, lat: 50.94, lng: 6.96 },

  // UK (GB)
  { name: 'Londres', nameEn: 'London', country: 'GB', countryName: 'Royaume-Uni', region: 'Grand Londres', population: 9000000, lat: 51.51, lng: -0.13 },
  { name: 'Manchester', nameEn: 'Manchester', country: 'GB', countryName: 'Royaume-Uni', region: 'Grand Manchester', population: 550000, lat: 53.48, lng: -2.24 },
  { name: 'Birmingham', nameEn: 'Birmingham', country: 'GB', countryName: 'Royaume-Uni', region: 'Midlands de l\'Ouest', population: 1140000, lat: 52.48, lng: -1.90 },
  { name: 'Édimbourg', nameEn: 'Edinburgh', country: 'GB', countryName: 'Royaume-Uni', region: 'Écosse', population: 520000, lat: 55.95, lng: -3.19 },
  { name: 'Liverpool', nameEn: 'Liverpool', country: 'GB', countryName: 'Royaume-Uni', region: 'Merseyside', population: 500000, lat: 53.41, lng: -2.99 },

  // Italy (IT)
  { name: 'Rome', nameEn: 'Rome', country: 'IT', countryName: 'Italie', region: 'Latium', population: 2900000, lat: 41.90, lng: 12.50 },
  { name: 'Milan', nameEn: 'Milan', country: 'IT', countryName: 'Italie', region: 'Lombardie', population: 1400000, lat: 45.46, lng: 9.19 },
  { name: 'Naples', nameEn: 'Naples', country: 'IT', countryName: 'Italie', region: 'Campanie', population: 970000, lat: 40.85, lng: 14.27 },
  { name: 'Florence', nameEn: 'Florence', country: 'IT', countryName: 'Italie', region: 'Toscane', population: 380000, lat: 43.77, lng: 11.26 },
  { name: 'Venise', nameEn: 'Venice', country: 'IT', countryName: 'Italie', region: 'Vénétie', population: 260000, lat: 45.44, lng: 12.32 },
  { name: 'Turin', nameEn: 'Turin', country: 'IT', countryName: 'Italie', region: 'Piémont', population: 880000, lat: 45.07, lng: 7.69 },

  // Spain (ES)
  { name: 'Madrid', nameEn: 'Madrid', country: 'ES', countryName: 'Espagne', region: 'Madrid', population: 3300000, lat: 40.42, lng: -3.70 },
  { name: 'Barcelone', nameEn: 'Barcelona', country: 'ES', countryName: 'Espagne', region: 'Catalogne', population: 1600000, lat: 41.39, lng: 2.17 },
  { name: 'Valence', nameEn: 'Valencia', country: 'ES', countryName: 'Espagne', region: 'Valence', population: 800000, lat: 39.47, lng: -0.38 },
  { name: 'Séville', nameEn: 'Seville', country: 'ES', countryName: 'Espagne', region: 'Andalousie', population: 690000, lat: 37.39, lng: -5.98 },

  // Portugal (PT)
  { name: 'Lisbonne', nameEn: 'Lisbon', country: 'PT', countryName: 'Portugal', region: 'Lisbonne', population: 510000, lat: 38.72, lng: -9.14 },
  { name: 'Porto', nameEn: 'Porto', country: 'PT', countryName: 'Portugal', region: 'Porto', population: 220000, lat: 41.15, lng: -8.61 },

  // Netherlands (NL)
  { name: 'Amsterdam', nameEn: 'Amsterdam', country: 'NL', countryName: 'Pays-Bas', region: 'Hollande-Septentrionale', population: 870000, lat: 52.37, lng: 4.90 },
  { name: 'Rotterdam', nameEn: 'Rotterdam', country: 'NL', countryName: 'Pays-Bas', region: 'Hollande-Méridionale', population: 650000, lat: 51.92, lng: 4.48 },
  { name: 'La Haye', nameEn: 'The Hague', country: 'NL', countryName: 'Pays-Bas', region: 'Hollande-Méridionale', population: 550000, lat: 52.07, lng: 4.30 },

  // Belgium (BE)
  { name: 'Bruxelles', nameEn: 'Brussels', country: 'BE', countryName: 'Belgique', region: 'Bruxelles-Capitale', population: 1800000, lat: 50.85, lng: 4.35 },
  { name: 'Anvers', nameEn: 'Antwerp', country: 'BE', countryName: 'Belgique', region: 'Anvers', population: 520000, lat: 51.22, lng: 4.42 },

  // Switzerland (CH)
  { name: 'Zurich', nameEn: 'Zurich', country: 'CH', countryName: 'Suisse', region: 'Zurich', population: 430000, lat: 47.37, lng: 8.54 },
  { name: 'Genève', nameEn: 'Geneva', country: 'CH', countryName: 'Suisse', region: 'Genève', population: 200000, lat: 46.20, lng: 6.14 },
  { name: 'Lausanne', nameEn: 'Lausanne', country: 'CH', countryName: 'Suisse', region: 'Vaud', population: 140000, lat: 46.52, lng: 6.63 },
  { name: 'Berne', nameEn: 'Bern', country: 'CH', countryName: 'Suisse', region: 'Berne', population: 130000, lat: 46.95, lng: 7.45 },

  // Austria (AT)
  { name: 'Vienne', nameEn: 'Vienna', country: 'AT', countryName: 'Autriche', region: 'Vienne', population: 1900000, lat: 48.21, lng: 16.37 },

  // Poland (PL)
  { name: 'Varsovie', nameEn: 'Warsaw', country: 'PL', countryName: 'Pologne', region: 'Mazovie', population: 1800000, lat: 52.23, lng: 21.01 },
  { name: 'Cracovie', nameEn: 'Krakow', country: 'PL', countryName: 'Pologne', region: 'Petite-Pologne', population: 780000, lat: 50.06, lng: 19.95 },

  // Czech Republic (CZ)
  { name: 'Prague', nameEn: 'Prague', country: 'CZ', countryName: 'Tchéquie', region: 'Prague', population: 1300000, lat: 50.08, lng: 14.44 },

  // Sweden (SE)
  { name: 'Stockholm', nameEn: 'Stockholm', country: 'SE', countryName: 'Suède', region: 'Stockholm', population: 980000, lat: 59.33, lng: 18.07 },
  { name: 'Göteborg', nameEn: 'Gothenburg', country: 'SE', countryName: 'Suède', region: 'Västra Götaland', population: 580000, lat: 57.71, lng: 11.97 },

  // Norway (NO)
  { name: 'Oslo', nameEn: 'Oslo', country: 'NO', countryName: 'Norvège', region: 'Oslo', population: 700000, lat: 59.91, lng: 10.75 },

  // Denmark (DK)
  { name: 'Copenhague', nameEn: 'Copenhagen', country: 'DK', countryName: 'Danemark', region: 'Hovedstaden', population: 630000, lat: 55.68, lng: 12.57 },

  // Finland (FI)
  { name: 'Helsinki', nameEn: 'Helsinki', country: 'FI', countryName: 'Finlande', region: 'Uusimaa', population: 660000, lat: 60.17, lng: 24.94 },

  // Ireland (IE)
  { name: 'Dublin', nameEn: 'Dublin', country: 'IE', countryName: 'Irlande', region: 'Leinster', population: 550000, lat: 53.35, lng: -6.26 },

  // Greece (GR)
  { name: 'Athènes', nameEn: 'Athens', country: 'GR', countryName: 'Grèce', region: 'Attique', population: 660000, lat: 37.98, lng: 23.73 },
  { name: 'Thessalonique', nameEn: 'Thessaloniki', country: 'GR', countryName: 'Grèce', region: 'Macédoine-Centrale', population: 320000, lat: 40.64, lng: 22.94 },

  // Romania (RO)
  { name: 'Bucarest', nameEn: 'Bucharest', country: 'RO', countryName: 'Roumanie', region: 'Bucarest', population: 1900000, lat: 44.43, lng: 26.10 },

  // Hungary (HU)
  { name: 'Budapest', nameEn: 'Budapest', country: 'HU', countryName: 'Hongrie', region: 'Budapest', population: 1800000, lat: 47.50, lng: 19.04 },

  // Ukraine (UA)
  { name: 'Kiev', nameEn: 'Kyiv', country: 'UA', countryName: 'Ukraine', region: 'Kiev', population: 2900000, lat: 50.45, lng: 30.52 },
  { name: 'Kharkiv', nameEn: 'Kharkiv', country: 'UA', countryName: 'Ukraine', region: 'Kharkiv', population: 1440000, lat: 49.99, lng: 36.23 },
  { name: 'Odessa', nameEn: 'Odesa', country: 'UA', countryName: 'Ukraine', region: 'Odessa', population: 1010000, lat: 46.48, lng: 30.73 },

  // Russia (RU)
  { name: 'Moscou', nameEn: 'Moscow', country: 'RU', countryName: 'Russie', region: 'Moscou', population: 12600000, lat: 55.76, lng: 37.62 },
  { name: 'Saint-Pétersbourg', nameEn: 'Saint Petersburg', country: 'RU', countryName: 'Russie', region: 'Saint-Pétersbourg', population: 5400000, lat: 59.93, lng: 30.32 },
  { name: 'Novossibirsk', nameEn: 'Novosibirsk', country: 'RU', countryName: 'Russie', region: 'Novossibirsk', population: 1600000, lat: 55.03, lng: 82.92 },
  { name: 'Kazan', nameEn: 'Kazan', country: 'RU', countryName: 'Russie', region: 'Tatarstan', population: 1300000, lat: 55.79, lng: 49.11 },
  { name: 'Sotchi', nameEn: 'Sochi', country: 'RU', countryName: 'Russie', region: 'Krasnodar', population: 440000, lat: 43.60, lng: 39.72 },

  // Turkey (TR)
  { name: 'Istanbul', nameEn: 'Istanbul', country: 'TR', countryName: 'Turquie', region: 'Istanbul', population: 15500000, lat: 41.01, lng: 28.98 },
  { name: 'Ankara', nameEn: 'Ankara', country: 'TR', countryName: 'Turquie', region: 'Ankara', population: 5700000, lat: 39.93, lng: 32.86 },
  { name: 'Izmir', nameEn: 'Izmir', country: 'TR', countryName: 'Turquie', region: 'Izmir', population: 4300000, lat: 38.42, lng: 27.13 },
  { name: 'Antalya', nameEn: 'Antalya', country: 'TR', countryName: 'Turquie', region: 'Antalya', population: 2400000, lat: 36.89, lng: 30.71 },

  // Croatia (HR)
  { name: 'Zagreb', nameEn: 'Zagreb', country: 'HR', countryName: 'Croatie', region: 'Zagreb', population: 800000, lat: 45.81, lng: 15.98 },
  { name: 'Split', nameEn: 'Split', country: 'HR', countryName: 'Croatie', region: 'Split-Dalmatie', population: 180000, lat: 43.51, lng: 16.44 },
  { name: 'Dubrovnik', nameEn: 'Dubrovnik', country: 'HR', countryName: 'Croatie', region: 'Dubrovnik-Neretva', population: 43000, lat: 42.64, lng: 18.09 },

  // Serbia (RS)
  { name: 'Belgrade', nameEn: 'Belgrade', country: 'RS', countryName: 'Serbie', region: 'Belgrade', population: 1400000, lat: 44.79, lng: 20.47 },

  // Bulgaria (BG)
  { name: 'Sofia', nameEn: 'Sofia', country: 'BG', countryName: 'Bulgarie', region: 'Sofia', population: 1300000, lat: 42.70, lng: 23.32 },

  // Portugal islands
  { name: 'Funchal', nameEn: 'Funchal', country: 'PT', countryName: 'Portugal', region: 'Madère', population: 112000, lat: 32.67, lng: -16.93 },

  // Luxembourg (LU)
  { name: 'Luxembourg', nameEn: 'Luxembourg', country: 'LU', countryName: 'Luxembourg', region: 'Luxembourg', population: 120000, lat: 49.61, lng: 6.13 },

  // Monaco (MC)
  { name: 'Monaco', nameEn: 'Monaco', country: 'MC', countryName: 'Monaco', region: 'Monaco', population: 39000, lat: 43.74, lng: 7.42 },

  // Andorra (AD)
  { name: 'Andorre-la-Vieille', nameEn: 'Andorra la Vella', country: 'AD', countryName: 'Andorre', region: 'Andorre-la-Vieille', population: 23000, lat: 42.51, lng: 1.52 },

  // San Marino (SM)
  { name: 'Saint-Marin', nameEn: 'San Marino', country: 'SM', countryName: 'Saint-Marin', region: 'Saint-Marin', population: 4500, lat: 43.94, lng: 12.45 },

  // Malta (MT)
  { name: 'La Valette', nameEn: 'Valletta', country: 'MT', countryName: 'Malte', region: 'La Valette', population: 6200, lat: 35.90, lng: 14.51 },

  // Iceland (IS)
  { name: 'Reykjavik', nameEn: 'Reykjavik', country: 'IS', countryName: 'Islande', region: 'Capitale', population: 130000, lat: 64.15, lng: -21.94 },

  // Estonia (EE)
  { name: 'Tallinn', nameEn: 'Tallinn', country: 'EE', countryName: 'Estonie', region: 'Harju', population: 450000, lat: 59.44, lng: 24.75 },

  // Latvia (LV)
  { name: 'Riga', nameEn: 'Riga', country: 'LV', countryName: 'Lettonie', region: 'Riga', population: 630000, lat: 56.95, lng: 24.11 },

  // Lithuania (LT)
  { name: 'Vilnius', nameEn: 'Vilnius', country: 'LT', countryName: 'Lituanie', region: 'Vilnius', population: 580000, lat: 54.69, lng: 25.28 },

  // Slovakia (SK)
  { name: 'Bratislava', nameEn: 'Bratislava', country: 'SK', countryName: 'Slovaquie', region: 'Bratislava', population: 440000, lat: 48.15, lng: 17.11 },

  // Slovenia (SI)
  { name: 'Ljubljana', nameEn: 'Ljubljana', country: 'SI', countryName: 'Slovénie', region: 'Ljubljana', population: 300000, lat: 46.06, lng: 14.51 },

  // North Macedonia (MK)
  { name: 'Skopje', nameEn: 'Skopje', country: 'MK', countryName: 'Macédoine du Nord', region: 'Skopje', population: 570000, lat: 41.99, lng: 21.43 },

  // Albania (AL)
  { name: 'Tirana', nameEn: 'Tirana', country: 'AL', countryName: 'Albanie', region: 'Tirana', population: 500000, lat: 41.33, lng: 19.82 },

  // Montenegro (ME)
  { name: 'Podgorica', nameEn: 'Podgorica', country: 'ME', countryName: 'Monténégro', region: 'Podgorica', population: 160000, lat: 42.44, lng: 19.26 },

  // Bosnia (BA)
  { name: 'Sarajevo', nameEn: 'Sarajevo', country: 'BA', countryName: 'Bosnie-Herzégovine', region: 'Sarajevo', population: 280000, lat: 43.86, lng: 18.41 },

  // Moldova (MD)
  { name: 'Chisinau', nameEn: 'Chisinau', country: 'MD', countryName: 'Moldavie', region: 'Chisinau', population: 530000, lat: 47.01, lng: 28.87 },

  // Belarus (BY)
  { name: 'Minsk', nameEn: 'Minsk', country: 'BY', countryName: 'Biélorussie', region: 'Minsk', population: 2000000, lat: 53.90, lng: 27.57 },

  // Georgia (GE)
  { name: 'Tbilissi', nameEn: 'Tbilisi', country: 'GE', countryName: 'Géorgie', region: 'Tbilissi', population: 1100000, lat: 41.72, lng: 44.78 },
  { name: 'Batoumi', nameEn: 'Batumi', country: 'GE', countryName: 'Géorgie', region: 'Adjarie', population: 170000, lat: 41.64, lng: 41.64 },

  // Armenia (AM)
  { name: 'Erevan', nameEn: 'Yerevan', country: 'AM', countryName: 'Arménie', region: 'Erevan', population: 1100000, lat: 40.18, lng: 44.51 },

  // Azerbaijan (AZ)
  { name: 'Bakou', nameEn: 'Baku', country: 'AZ', countryName: 'Azerbaïdjan', region: 'Bakou', population: 2300000, lat: 40.41, lng: 49.87 },

  // Kosovo (XK)
  { name: 'Pristina', nameEn: 'Pristina', country: 'XK', countryName: 'Kosovo', region: 'Pristina', population: 210000, lat: 42.67, lng: 21.17 },

  // Cyprus (CY)
  { name: 'Nicosie', nameEn: 'Nicosia', country: 'CY', countryName: 'Chypre', region: 'Nicosie', population: 330000, lat: 35.19, lng: 33.38 },
  { name: 'Limassol', nameEn: 'Limassol', country: 'CY', countryName: 'Chypre', region: 'Limassol', population: 240000, lat: 34.68, lng: 33.04 },

  // ============================================================
  // ASIA
  // ============================================================
  // China (CN)
  { name: 'Pékin', nameEn: 'Beijing', country: 'CN', countryName: 'Chine', region: 'Pékin', population: 21500000, lat: 39.90, lng: 116.41 },
  { name: 'Shanghai', nameEn: 'Shanghai', country: 'CN', countryName: 'Chine', region: 'Shanghai', population: 24900000, lat: 31.23, lng: 121.47 },
  { name: 'Guangzhou', nameEn: 'Guangzhou', country: 'CN', countryName: 'Chine', region: 'Guangdong', population: 18700000, lat: 23.13, lng: 113.26 },
  { name: 'Shenzhen', nameEn: 'Shenzhen', country: 'CN', countryName: 'Chine', region: 'Guangdong', population: 17600000, lat: 22.54, lng: 114.06 },
  { name: 'Chengdu', nameEn: 'Chengdu', country: 'CN', countryName: 'Chine', region: 'Sichuan', population: 16300000, lat: 30.57, lng: 104.07 },
  { name: 'Hong Kong', nameEn: 'Hong Kong', country: 'HK', countryName: 'Hong Kong', region: 'Hong Kong', population: 7500000, lat: 22.32, lng: 114.17 },
  { name: 'Macao', nameEn: 'Macau', country: 'MO', countryName: 'Macao', region: 'Macao', population: 680000, lat: 22.20, lng: 113.54 },

  // Japan (JP)
  { name: 'Tokyo', nameEn: 'Tokyo', country: 'JP', countryName: 'Japon', region: 'Tokyo', population: 13900000, lat: 35.68, lng: 139.69 },
  { name: 'Osaka', nameEn: 'Osaka', country: 'JP', countryName: 'Japon', region: 'Osaka', population: 2700000, lat: 34.69, lng: 135.50 },
  { name: 'Kyoto', nameEn: 'Kyoto', country: 'JP', countryName: 'Japon', region: 'Kyoto', population: 1500000, lat: 35.01, lng: 135.77 },
  { name: 'Yokohama', nameEn: 'Yokohama', country: 'JP', countryName: 'Japon', region: 'Kanagawa', population: 3700000, lat: 35.44, lng: 139.64 },
  { name: 'Sapporo', nameEn: 'Sapporo', country: 'JP', countryName: 'Japon', region: 'Hokkaido', population: 2000000, lat: 43.06, lng: 141.35 },

  // South Korea (KR)
  { name: 'Séoul', nameEn: 'Seoul', country: 'KR', countryName: 'Corée du Sud', region: 'Séoul', population: 9700000, lat: 37.57, lng: 126.98 },
  { name: 'Busan', nameEn: 'Busan', country: 'KR', countryName: 'Corée du Sud', region: 'Busan', population: 3400000, lat: 35.18, lng: 129.08 },

  // Taiwan (TW)
  { name: 'Taipei', nameEn: 'Taipei', country: 'TW', countryName: 'Taïwan', region: 'Taipei', population: 2600000, lat: 25.03, lng: 121.57 },
  { name: 'Kaohsiung', nameEn: 'Kaohsiung', country: 'TW', countryName: 'Taïwan', region: 'Kaohsiung', population: 2700000, lat: 22.63, lng: 120.30 },

  // India (IN)
  { name: 'New Delhi', nameEn: 'New Delhi', country: 'IN', countryName: 'Inde', region: 'Delhi', population: 32000000, lat: 28.61, lng: 77.21 },
  { name: 'Mumbai', nameEn: 'Mumbai', country: 'IN', countryName: 'Inde', region: 'Maharashtra', population: 21000000, lat: 19.08, lng: 72.88 },
  { name: 'Bangalore', nameEn: 'Bangalore', country: 'IN', countryName: 'Inde', region: 'Karnataka', population: 12400000, lat: 12.97, lng: 77.59 },
  { name: 'Chennai', nameEn: 'Chennai', country: 'IN', countryName: 'Inde', region: 'Tamil Nadu', population: 10500000, lat: 13.08, lng: 80.27 },
  { name: 'Calcutta', nameEn: 'Kolkata', country: 'IN', countryName: 'Inde', region: 'Bengale-Occidental', population: 14900000, lat: 22.57, lng: 88.36 },
  { name: 'Hyderabad', nameEn: 'Hyderabad', country: 'IN', countryName: 'Inde', region: 'Telangana', population: 10200000, lat: 17.39, lng: 78.49 },

  // Indonesia (ID)
  { name: 'Jakarta', nameEn: 'Jakarta', country: 'ID', countryName: 'Indonésie', region: 'Jakarta', population: 10600000, lat: -6.21, lng: 106.85 },
  { name: 'Bali', nameEn: 'Bali', country: 'ID', countryName: 'Indonésie', region: 'Bali', population: 4400000, lat: -8.34, lng: 115.09 },
  { name: 'Surabaya', nameEn: 'Surabaya', country: 'ID', countryName: 'Indonésie', region: 'Java-Est', population: 2900000, lat: -7.26, lng: 112.75 },
  { name: 'Bandung', nameEn: 'Bandung', country: 'ID', countryName: 'Indonésie', region: 'Java-Ouest', population: 2500000, lat: -6.92, lng: 107.62 },

  // Thailand (TH)
  { name: 'Bangkok', nameEn: 'Bangkok', country: 'TH', countryName: 'Thaïlande', region: 'Bangkok', population: 10500000, lat: 13.76, lng: 100.50 },
  { name: 'Chiang Mai', nameEn: 'Chiang Mai', country: 'TH', countryName: 'Thaïlande', region: 'Chiang Mai', population: 130000, lat: 18.79, lng: 98.98 },
  { name: 'Phuket', nameEn: 'Phuket', country: 'TH', countryName: 'Thaïlande', region: 'Phuket', population: 400000, lat: 7.88, lng: 98.39 },

  // Vietnam (VN)
  { name: 'Hanoï', nameEn: 'Hanoi', country: 'VN', countryName: 'Viêt Nam', region: 'Hanoï', population: 8100000, lat: 21.03, lng: 105.85 },
  { name: 'Hô Chi Minh-Ville', nameEn: 'Ho Chi Minh City', country: 'VN', countryName: 'Viêt Nam', region: 'Hô Chi Minh', population: 8900000, lat: 10.82, lng: 106.63 },
  { name: 'Da Nang', nameEn: 'Da Nang', country: 'VN', countryName: 'Viêt Nam', region: 'Da Nang', population: 1100000, lat: 16.05, lng: 108.20 },

  // Philippines (PH)
  { name: 'Manille', nameEn: 'Manila', country: 'PH', countryName: 'Philippines', region: 'Manille', population: 1800000, lat: 14.60, lng: 120.98 },
  { name: 'Cebu', nameEn: 'Cebu', country: 'PH', countryName: 'Philippines', region: 'Cebu', population: 950000, lat: 10.31, lng: 123.89 },

  // Malaysia (MY)
  { name: 'Kuala Lumpur', nameEn: 'Kuala Lumpur', country: 'MY', countryName: 'Malaisie', region: 'Kuala Lumpur', population: 1800000, lat: 3.14, lng: 101.69 },
  { name: 'Penang', nameEn: 'Penang', country: 'MY', countryName: 'Malaisie', region: 'Penang', population: 750000, lat: 5.42, lng: 100.33 },

  // Singapore (SG)
  { name: 'Singapour', nameEn: 'Singapore', country: 'SG', countryName: 'Singapour', region: 'Singapour', population: 5700000, lat: 1.35, lng: 103.82 },

  // Myanmar (MM)
  { name: 'Rangoun', nameEn: 'Yangon', country: 'MM', countryName: 'Birmanie', region: 'Rangoun', population: 5200000, lat: 16.87, lng: 96.20 },
  { name: 'Naypyidaw', nameEn: 'Naypyidaw', country: 'MM', countryName: 'Birmanie', region: 'Naypyidaw', population: 1100000, lat: 19.76, lng: 96.08 },

  // Cambodia (KH)
  { name: 'Phnom Penh', nameEn: 'Phnom Penh', country: 'KH', countryName: 'Cambodge', region: 'Phnom Penh', population: 2200000, lat: 11.56, lng: 104.92 },
  { name: 'Siem Reap', nameEn: 'Siem Reap', country: 'KH', countryName: 'Cambodge', region: 'Siem Reap', population: 230000, lat: 13.36, lng: 103.86 },

  // Laos (LA)
  { name: 'Vientiane', nameEn: 'Vientiane', country: 'LA', countryName: 'Laos', region: 'Vientiane', population: 820000, lat: 17.97, lng: 102.63 },
  { name: 'Luang Prabang', nameEn: 'Luang Prabang', country: 'LA', countryName: 'Laos', region: 'Luang Prabang', population: 56000, lat: 19.89, lng: 102.13 },

  // Bangladesh (BD)
  { name: 'Dacca', nameEn: 'Dhaka', country: 'BD', countryName: 'Bangladesh', region: 'Dacca', population: 22000000, lat: 23.81, lng: 90.41 },
  { name: 'Chittagong', nameEn: 'Chittagong', country: 'BD', countryName: 'Bangladesh', region: 'Chittagong', population: 4700000, lat: 22.36, lng: 91.78 },

  // Pakistan (PK)
  { name: 'Islamabad', nameEn: 'Islamabad', country: 'PK', countryName: 'Pakistan', region: 'Islamabad', population: 1100000, lat: 33.69, lng: 73.04 },
  { name: 'Karachi', nameEn: 'Karachi', country: 'PK', countryName: 'Pakistan', region: 'Sind', population: 14900000, lat: 24.86, lng: 67.01 },
  { name: 'Lahore', nameEn: 'Lahore', country: 'PK', countryName: 'Pakistan', region: 'Pendjab', population: 11100000, lat: 31.55, lng: 74.35 },

  // Sri Lanka (LK)
  { name: 'Colombo', nameEn: 'Colombo', country: 'LK', countryName: 'Sri Lanka', region: 'Colombo', population: 750000, lat: 6.93, lng: 79.85 },

  // Nepal (NP)
  { name: 'Katmandou', nameEn: 'Kathmandu', country: 'NP', countryName: 'Népal', region: 'Bagmati', population: 1000000, lat: 27.72, lng: 85.32 },

  // Bhutan (BT)
  { name: 'Thimphou', nameEn: 'Thimphu', country: 'BT', countryName: 'Bhoutan', region: 'Thimphou', population: 100000, lat: 27.47, lng: 89.64 },

  // Maldives (MV)
  { name: 'Malé', nameEn: 'Male', country: 'MV', countryName: 'Maldives', region: 'Malé', population: 130000, lat: 4.17, lng: 73.51 },

  // Afghanistan (AF)
  { name: 'Kaboul', nameEn: 'Kabul', country: 'AF', countryName: 'Afghanistan', region: 'Kaboul', population: 4500000, lat: 34.53, lng: 69.17 },

  // Iran (IR)
  { name: 'Téhéran', nameEn: 'Tehran', country: 'IR', countryName: 'Iran', region: 'Téhéran', population: 8700000, lat: 35.69, lng: 51.39 },
  { name: 'Ispahan', nameEn: 'Isfahan', country: 'IR', countryName: 'Iran', region: 'Ispahan', population: 1900000, lat: 32.65, lng: 51.67 },
  { name: 'Chiraz', nameEn: 'Shiraz', country: 'IR', countryName: 'Iran', region: 'Fars', population: 1500000, lat: 29.59, lng: 52.58 },

  // Iraq (IQ)
  { name: 'Bagdad', nameEn: 'Baghdad', country: 'IQ', countryName: 'Irak', region: 'Bagdad', population: 7600000, lat: 33.31, lng: 44.37 },
  { name: 'Erbil', nameEn: 'Erbil', country: 'IQ', countryName: 'Irak', region: 'Kurdistan', population: 1500000, lat: 36.19, lng: 44.01 },

  // Saudi Arabia (SA)
  { name: 'Riyad', nameEn: 'Riyadh', country: 'SA', countryName: 'Arabie saoudite', region: 'Riyad', population: 7600000, lat: 24.71, lng: 46.68 },
  { name: 'Djeddah', nameEn: 'Jeddah', country: 'SA', countryName: 'Arabie saoudite', region: 'La Mecque', population: 4600000, lat: 21.49, lng: 39.19 },
  { name: 'La Mecque', nameEn: 'Mecca', country: 'SA', countryName: 'Arabie saoudite', region: 'La Mecque', population: 2000000, lat: 21.39, lng: 39.86 },

  // UAE (AE)
  { name: 'Dubaï', nameEn: 'Dubai', country: 'AE', countryName: 'Émirats arabes unis', region: 'Dubaï', population: 3500000, lat: 25.20, lng: 55.27 },
  { name: 'Abou Dabi', nameEn: 'Abu Dhabi', country: 'AE', countryName: 'Émirats arabes unis', region: 'Abou Dabi', population: 1500000, lat: 24.45, lng: 54.65 },
  { name: 'Charjah', nameEn: 'Sharjah', country: 'AE', countryName: 'Émirats arabes unis', region: 'Charjah', population: 1400000, lat: 25.35, lng: 55.42 },

  // Qatar (QA)
  { name: 'Doha', nameEn: 'Doha', country: 'QA', countryName: 'Qatar', region: 'Doha', population: 2400000, lat: 25.29, lng: 51.53 },

  // Kuwait (KW)
  { name: 'Koweït', nameEn: 'Kuwait City', country: 'KW', countryName: 'Koweït', region: 'Al Asimah', population: 63000, lat: 29.37, lng: 47.98 },

  // Bahrain (BH)
  { name: 'Manama', nameEn: 'Manama', country: 'BH', countryName: 'Bahreïn', region: 'Manama', population: 160000, lat: 26.23, lng: 50.59 },

  // Oman (OM)
  { name: 'Mascate', nameEn: 'Muscat', country: 'OM', countryName: 'Oman', region: 'Mascate', population: 1400000, lat: 23.59, lng: 58.39 },

  // Yemen (YE)
  { name: 'Sanaa', nameEn: 'Sanaa', country: 'YE', countryName: 'Yémen', region: 'Sanaa', population: 3900000, lat: 15.37, lng: 44.19 },
  { name: 'Aden', nameEn: 'Aden', country: 'YE', countryName: 'Yémen', region: 'Aden', population: 880000, lat: 12.78, lng: 45.04 },

  // Jordan (JO)
  { name: 'Amman', nameEn: 'Amman', country: 'JO', countryName: 'Jordanie', region: 'Amman', population: 4500000, lat: 31.95, lng: 35.93 },

  // Lebanon (LB)
  { name: 'Beyrouth', nameEn: 'Beirut', country: 'LB', countryName: 'Liban', region: 'Beyrouth', population: 2400000, lat: 33.89, lng: 35.50 },

  // Syria (SY)
  { name: 'Damas', nameEn: 'Damascus', country: 'SY', countryName: 'Syrie', region: 'Damas', population: 2200000, lat: 33.51, lng: 36.29 },
  { name: 'Alep', nameEn: 'Aleppo', country: 'SY', countryName: 'Syrie', region: 'Alep', population: 2100000, lat: 36.20, lng: 37.16 },

  // Israel (IL)
  { name: 'Jérusalem', nameEn: 'Jerusalem', country: 'IL', countryName: 'Israël', region: 'Jérusalem', population: 920000, lat: 31.77, lng: 35.23 },
  { name: 'Tel-Aviv', nameEn: 'Tel Aviv', country: 'IL', countryName: 'Israël', region: 'Tel-Aviv', population: 460000, lat: 32.09, lng: 34.77 },

  // Palestine (PS)
  { name: 'Gaza', nameEn: 'Gaza', country: 'PS', countryName: 'Palestine', region: 'Gaza', population: 600000, lat: 31.35, lng: 34.31 },
  { name: 'Ramallah', nameEn: 'Ramallah', country: 'PS', countryName: 'Palestine', region: 'Cisjordanie', population: 38000, lat: 31.90, lng: 35.21 },

  // Kazakhstan (KZ)
  { name: 'Astana', nameEn: 'Astana', country: 'KZ', countryName: 'Kazakhstan', region: 'Astana', population: 1100000, lat: 51.17, lng: 71.43 },
  { name: 'Almaty', nameEn: 'Almaty', country: 'KZ', countryName: 'Kazakhstan', region: 'Almaty', population: 2000000, lat: 43.24, lng: 76.95 },

  // Uzbekistan (UZ)
  { name: 'Tachkent', nameEn: 'Tashkent', country: 'UZ', countryName: 'Ouzbékistan', region: 'Tachkent', population: 2600000, lat: 41.30, lng: 69.28 },
  { name: 'Samarcande', nameEn: 'Samarkand', country: 'UZ', countryName: 'Ouzbékistan', region: 'Samarcande', population: 540000, lat: 39.65, lng: 66.96 },
  { name: 'Boukhara', nameEn: 'Bukhara', country: 'UZ', countryName: 'Ouzbékistan', region: 'Boukhara', population: 280000, lat: 39.77, lng: 64.43 },

  // Kyrgyzstan (KG)
  { name: 'Bichkek', nameEn: 'Bishkek', country: 'KG', countryName: 'Kirghizistan', region: 'Bichkek', population: 1000000, lat: 42.87, lng: 74.59 },

  // Tajikistan (TJ)
  { name: 'Douchanbé', nameEn: 'Dushanbe', country: 'TJ', countryName: 'Tadjikistan', region: 'Douchanbé', population: 820000, lat: 38.56, lng: 68.77 },

  // Turkmenistan (TM)
  { name: 'Achgabat', nameEn: 'Ashgabat', country: 'TM', countryName: 'Turkménistan', region: 'Achgabat', population: 730000, lat: 37.95, lng: 58.38 },

  // Mongolia (MN)
  { name: 'Oulan-Bator', nameEn: 'Ulaanbaatar', country: 'MN', countryName: 'Mongolie', region: 'Oulan-Bator', population: 1500000, lat: 47.92, lng: 106.91 },

  // North Korea (KP)
  { name: 'Pyongyang', nameEn: 'Pyongyang', country: 'KP', countryName: 'Corée du Nord', region: 'Pyongyang', population: 2900000, lat: 39.03, lng: 125.75 },

  // Brunei (BN)
  { name: 'Bandar Seri Begawan', nameEn: 'Bandar Seri Begawan', country: 'BN', countryName: 'Brunei', region: 'Brunei-Muara', population: 240000, lat: 4.89, lng: 114.94 },

  // East Timor (TL)
  { name: 'Dili', nameEn: 'Dili', country: 'TL', countryName: 'Timor oriental', region: 'Dili', population: 220000, lat: -8.56, lng: 125.57 },

  // ============================================================
  // OCEANIA
  // ============================================================
  // Australia (AU)
  { name: 'Sydney', nameEn: 'Sydney', country: 'AU', countryName: 'Australie', region: 'Nouvelle-Galles du Sud', population: 5300000, lat: -33.87, lng: 151.21 },
  { name: 'Melbourne', nameEn: 'Melbourne', country: 'AU', countryName: 'Australie', region: 'Victoria', population: 5100000, lat: -37.81, lng: 144.96 },
  { name: 'Brisbane', nameEn: 'Brisbane', country: 'AU', countryName: 'Australie', region: 'Queensland', population: 2500000, lat: -27.47, lng: 153.03 },
  { name: 'Perth', nameEn: 'Perth', country: 'AU', countryName: 'Australie', region: 'Australie-Occidentale', population: 2100000, lat: -31.95, lng: 115.86 },
  { name: 'Adélaïde', nameEn: 'Adelaide', country: 'AU', countryName: 'Australie', region: 'Australie-Méridionale', population: 1400000, lat: -34.93, lng: 138.60 },

  // New Zealand (NZ)
  { name: 'Auckland', nameEn: 'Auckland', country: 'NZ', countryName: 'Nouvelle-Zélande', region: 'Auckland', population: 1600000, lat: -36.85, lng: 174.76 },
  { name: 'Wellington', nameEn: 'Wellington', country: 'NZ', countryName: 'Nouvelle-Zélande', region: 'Wellington', population: 220000, lat: -41.29, lng: 174.78 },

  // Fiji (FJ)
  { name: 'Suva', nameEn: 'Suva', country: 'FJ', countryName: 'Fidji', region: 'Central', population: 88000, lat: -18.14, lng: 178.44 },

  // Papua New Guinea (PG)
  { name: 'Port Moresby', nameEn: 'Port Moresby', country: 'PG', countryName: 'Papouasie-Nouvelle-Guinée', region: 'National Capital', population: 400000, lat: -6.31, lng: 147.15 },

  // Samoa (WS)
  { name: 'Apia', nameEn: 'Apia', country: 'WS', countryName: 'Samoa', region: 'Tuamasaga', population: 38000, lat: -13.83, lng: -171.75 },

  // Tonga (TO)
  { name: "Nuku'alofa", nameEn: "Nuku'alofa", country: 'TO', countryName: 'Tonga', region: 'Tongatapu', population: 28000, lat: -21.21, lng: -175.20 },

  // Vanuatu (VU)
  { name: 'Port-Vila', nameEn: 'Port Vila', country: 'VU', countryName: 'Vanuatu', region: 'Shefa', population: 52000, lat: -17.73, lng: 168.32 },

  // Solomon Islands (SB)
  { name: 'Honiara', nameEn: 'Honiara', country: 'SB', countryName: 'Îles Salomon', region: 'Guadalcanal', population: 84000, lat: -9.43, lng: 160.02 },

  // Kiribati (KI)
  { name: 'Tarawa', nameEn: 'Tarawa', country: 'KI', countryName: 'Kiribati', region: 'Gilbert', population: 53000, lat: 1.33, lng: 172.98 },

  // Micronesia (FM)
  { name: 'Kolonia', nameEn: 'Kolonia', country: 'FM', countryName: 'Micronésie', region: 'Pohnpei', population: 7000, lat: 6.96, lng: 158.21 },

  // Marshall Islands (MH)
  { name: 'Majuro', nameEn: 'Majuro', country: 'MH', countryName: 'Îles Marshall', region: 'Majuro', population: 28000, lat: 7.09, lng: 171.38 },

  // Palau (PW)
  { name: 'Koror', nameEn: 'Koror', country: 'PW', countryName: 'Palaos', region: 'Koror', population: 11000, lat: 7.34, lng: 134.48 },

  // Nauru (NR)
  { name: 'Yaren', nameEn: 'Yaren', country: 'NR', countryName: 'Nauru', region: 'Yaren', population: 1100, lat: -0.55, lng: 166.92 },

  // Tuvalu (TV)
  { name: 'Funafuti', nameEn: 'Funafuti', country: 'TV', countryName: 'Tuvalu', region: 'Funafuti', population: 6200, lat: -8.52, lng: 179.20 },

  // New Caledonia (NC)
  { name: 'Nouméa', nameEn: 'Noumea', country: 'NC', countryName: 'Nouvelle-Calédonie', region: 'Sud', population: 94000, lat: -22.27, lng: 166.46 },

  // French Polynesia (PF)
  { name: 'Papeete', nameEn: 'Papeete', country: 'PF', countryName: 'Polynésie française', region: 'Îles du Vent', population: 27000, lat: -17.54, lng: -149.57 },

  // Reunion (RE)
  { name: 'Saint-Denis', nameEn: 'Saint-Denis', country: 'RE', countryName: 'La Réunion', region: 'Saint-Denis', population: 150000, lat: -20.88, lng: 55.45 },
  { name: 'Saint-Pierre', nameEn: 'Saint-Pierre', country: 'RE', countryName: 'La Réunion', region: 'Saint-Pierre', population: 84000, lat: -21.34, lng: 55.48 },

  // Guam (GU)
  { name: 'Hagåtña', nameEn: 'Hagatna', country: 'GU', countryName: 'Guam', region: 'Guam', population: 1050, lat: 13.48, lng: 144.75 },

  // Caribbean entries
  { name: 'La Basse-Terre', nameEn: 'Basse-Terre', country: 'GP', countryName: 'Guadeloupe', region: 'Basse-Terre', population: 11000, lat: 16.00, lng: -61.73 },
  { name: 'Pointe-à-Pitre', nameEn: 'Pointe-a-Pitre', country: 'GP', countryName: 'Guadeloupe', region: 'Pointe-à-Pitre', population: 17000, lat: 16.24, lng: -61.53 },
  { name: 'Fort-de-France', nameEn: 'Fort-de-France', country: 'MQ', countryName: 'Martinique', region: 'Fort-de-France', population: 84000, lat: 14.60, lng: -61.07 },
  { name: 'Cayenne', nameEn: 'Cayenne', country: 'GF', countryName: 'Guyane française', region: 'Cayenne', population: 58000, lat: 4.94, lng: -52.33 },
  { name: 'Saint-Denis', nameEn: 'Saint-Denis', country: 'RE', countryName: 'La Réunion', region: 'Saint-Denis', population: 150000, lat: -20.88, lng: 55.45 },
  { name: 'Mamoudzou', nameEn: 'Mamoudzou', country: 'YT', countryName: 'Mayotte', region: 'Mamoudzou', population: 71000, lat: -12.78, lng: 45.23 },

  // Greenland (GL)
  { name: 'Nuuk', nameEn: 'Nuuk', country: 'GL', countryName: 'Groenland', region: 'Sermersooq', population: 19000, lat: 64.17, lng: -51.74 },

  // Bermuda (BM)
  { name: 'Hamilton', nameEn: 'Hamilton', country: 'BM', countryName: 'Bermudes', region: 'Hamilton', population: 850, lat: 32.29, lng: -64.78 },

  // Barbados (BB)
  { name: 'Bridgetown', nameEn: 'Bridgetown', country: 'BB', countryName: 'Barbade', region: 'Bridgetown', population: 110000, lat: 13.10, lng: -59.62 },

  // Bahamas (BS)
  { name: 'Nassau', nameEn: 'Nassau', country: 'BS', countryName: 'Bahamas', region: 'New Providence', population: 270000, lat: 25.05, lng: -77.35 },

  // Suriname (SR)
  { name: 'Paramaribo', nameEn: 'Paramaribo', country: 'SR', countryName: 'Suriname', region: 'Paramaribo', population: 240000, lat: 5.87, lng: -55.17 },

  // Guyana (GY)
  { name: 'Georgetown', nameEn: 'Georgetown', country: 'GY', countryName: 'Guyana', region: 'Georgetown', population: 240000, lat: 6.80, lng: -58.16 },

  // Belize (BZ)
  { name: 'Belmopan', nameEn: 'Belmopan', country: 'BZ', countryName: 'Belize', region: 'Cayo', population: 20000, lat: 17.25, lng: -88.77 },

  // Madagascar additional
  { name: 'Antsirabe', nameEn: 'Antsirabe', country: 'MG', countryName: 'Madagascar', region: 'Vakinankaratra', population: 240000, lat: -19.87, lng: 47.03 },
]

// ---------------------------------------------------------------------------
// Search function
// ---------------------------------------------------------------------------

/**
 * Search cities by name, country, or region.
 * Results are sorted by relevance (exact → prefix → contains → population).
 * Accent-insensitive matching.
 *
 * @param query - Search string (at least 1 character)
 * @param limit - Maximum number of results (default 20)
 * @returns Matching cities sorted by relevance
 */
export function searchCities(query: string, limit = 20): WorldCity[] {
  const q = normalize(query.trim())
  if (!q) return []

  const results: Array<{ city: WorldCity; rank: number }> = []

  for (const city of WORLD_CITIES) {
    const nameNorm = normalize(city.name)
    const nameEnNorm = normalize(city.nameEn)
    const countryNameNorm = normalize(city.countryName)
    const regionNorm = normalize(city.region)

    let rank = 0

    // Exact name match (highest priority)
    if (nameNorm === q || nameEnNorm === q) {
      rank = 1
    }
    // Name starts with query
    else if (nameNorm.startsWith(q) || nameEnNorm.startsWith(q)) {
      rank = 2
    }
    // Country name starts with query
    else if (countryNameNorm.startsWith(q)) {
      rank = 3
    }
    // Region starts with query
    else if (regionNorm.startsWith(q)) {
      rank = 4
    }
    // Name contains query
    else if (nameNorm.includes(q) || nameEnNorm.includes(q)) {
      rank = 5
    }
    // Country contains query
    else if (countryNameNorm.includes(q)) {
      rank = 6
    }
    // Region contains query
    else if (regionNorm.includes(q)) {
      rank = 7
    }

    if (rank > 0) {
      results.push({ city, rank })
    }
  }

  // Sort: rank ascending, then population descending
  results.sort((a, b) => a.rank - b.rank || b.city.population - a.city.population)

  // Deduplicate by name+country (some cities appear twice)
  const seen = new Set<string>()
  const deduped: WorldCity[] = []
  for (const r of results) {
    const key = `${r.city.name}-${r.city.country}`
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(r.city)
    }
    if (deduped.length >= limit) break
  }

  return deduped
}

/**
 * Get a city by exact name match and optional country code.
 */
export function getCityByName(name: string, country?: string): WorldCity | undefined {
  const nameNorm = normalize(name)
  return WORLD_CITIES.find((c) => {
    const match = normalize(c.name) === nameNorm || normalize(c.nameEn) === nameNorm
    return country ? match && c.country === country.toUpperCase() : match
  })
}

/**
 * Get all cities in a given country, sorted by population.
 */
export function getCitiesByCountry(countryCode: string): WorldCity[] {
  const code = countryCode.toUpperCase()
  return WORLD_CITIES
    .filter((c) => c.country === code)
    .sort((a, b) => b.population - a.population)
}
