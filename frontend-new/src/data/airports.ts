export interface Airport {
  lat: number;
  lng: number;
  city: string;
}

// RAM IT team replaces this with real DB call later
export const AIRPORTS: Record<string, Airport> = {
  // Morocco
  CMN: { lat: 33.3675, lng: -7.5898, city: 'Casablanca' },
  RAK: { lat: 31.6069, lng: -8.0363, city: 'Marrakech' },
  AGA: { lat: 30.325, lng: -9.4131, city: 'Agadir' },
  FEZ: { lat: 33.9273, lng: -4.978, city: 'Fes' },
  TNG: { lat: 35.7269, lng: -5.9169, city: 'Tangier' },
  OUD: { lat: 34.7872, lng: -1.924, city: 'Oujda' },
  NDR: { lat: 34.9888, lng: -3.0282, city: 'Nador' },
  RBA: { lat: 34.0515, lng: -6.7515, city: 'Rabat' },
  ESU: { lat: 31.3975, lng: -9.6817, city: 'Essaouira' },
  ERH: { lat: 31.9475, lng: -4.3983, city: 'Errachidia' },
  OZZ: { lat: 30.9391, lng: -6.9094, city: 'Ouarzazate' },
  // Europe
  CDG: { lat: 49.0097, lng: 2.5479, city: 'Paris' },
  ORY: { lat: 48.7233, lng: 2.3794, city: 'Paris Orly' },
  JFK: { lat: 40.6413, lng: -73.7781, city: 'New York' },
  LHR: { lat: 51.47, lng: -0.4543, city: 'London' },
  LGW: { lat: 51.1537, lng: -0.1821, city: 'London Gatwick' },
  MAD: { lat: 40.4983, lng: -3.5676, city: 'Madrid' },
  BCN: { lat: 41.2974, lng: 2.0833, city: 'Barcelona' },
  DXB: { lat: 25.2532, lng: 55.3657, city: 'Dubai' },
  GVA: { lat: 46.2381, lng: 6.1089, city: 'Geneva' },
  MRS: { lat: 43.4353, lng: 5.2214, city: 'Marseille' },
  LYS: { lat: 45.7256, lng: 5.0811, city: 'Lyon' },
  NCE: { lat: 43.6584, lng: 7.2159, city: 'Nice' },
  FCO: { lat: 41.8003, lng: 12.2389, city: 'Rome' },
  MXP: { lat: 45.6306, lng: 8.7281, city: 'Milan' },
  FRA: { lat: 50.0379, lng: 8.5622, city: 'Frankfurt' },
  AMS: { lat: 52.3105, lng: 4.7683, city: 'Amsterdam' },
  BRU: { lat: 50.9014, lng: 4.4844, city: 'Brussels' },
  IST: { lat: 41.2753, lng: 28.7519, city: 'Istanbul' },
  ATH: { lat: 37.9364, lng: 23.9445, city: 'Athens' },
  LIS: { lat: 38.7756, lng: -9.1354, city: 'Lisbon' },
  ZRH: { lat: 47.4647, lng: 8.5492, city: 'Zurich' },
  VIE: { lat: 48.1103, lng: 16.5697, city: 'Vienna' },
  CPH: { lat: 55.618, lng: 12.656, city: 'Copenhagen' },
  MUC: { lat: 48.3537, lng: 11.775, city: 'Munich' },
  TLS: { lat: 43.6291, lng: 1.3638, city: 'Toulouse' },
  BOD: { lat: 44.8283, lng: -0.7153, city: 'Bordeaux' },
  NTE: { lat: 47.1532, lng: -1.6108, city: 'Nantes' },
  STR: { lat: 48.6899, lng: 9.2220, city: 'Stuttgart' },
  BLQ: { lat: 44.5354, lng: 11.2887, city: 'Bologna' },
  // Africa
  TUN: { lat: 36.851, lng: 10.2272, city: 'Tunis' },
  ALG: { lat: 36.691, lng: 3.2154, city: 'Algiers' },
  CAI: { lat: 30.1219, lng: 31.4056, city: 'Cairo' },
  DSS: { lat: 14.6708, lng: -17.0733, city: 'Dakar' },
  DAK: { lat: 14.7397, lng: -17.4902, city: 'Dakar' },
  ABJ: { lat: 5.2614, lng: -3.9262, city: 'Abidjan' },
  ACC: { lat: 5.6052, lng: -0.1668, city: 'Accra' },
  LOS: { lat: 6.5774, lng: 3.3212, city: 'Lagos' },
  NKC: { lat: 18.0977, lng: -15.9486, city: 'Nouakchott' },
  BKO: { lat: 12.5335, lng: -7.9499, city: 'Bamako' },
  OUA: { lat: 12.3532, lng: -1.5124, city: 'Ouagadougou' },
  CKY: { lat: 9.5769, lng: -13.612, city: 'Conakry' },
  FNA: { lat: 8.6164, lng: -13.1956, city: 'Freetown' },
  LFW: { lat: 6.1661, lng: 1.2545, city: 'Lomé' },
  NIM: { lat: 13.4815, lng: 2.1834, city: 'Niamey' },
  DLA: { lat: 4.0061, lng: 9.7194, city: 'Douala' },
  LBV: { lat: 0.4586, lng: 9.4123, city: 'Libreville' },
  BJL: { lat: 13.338, lng: -16.652, city: 'Banjul' },
  // Middle East & Americas
  DOH: { lat: 25.2731, lng: 51.6081, city: 'Doha' },
  RUH: { lat: 24.9576, lng: 46.6988, city: 'Riyadh' },
  JED: { lat: 21.6796, lng: 39.1565, city: 'Jeddah' },
  BEY: { lat: 33.8209, lng: 35.4884, city: 'Beirut' },
  IAD: { lat: 38.9531, lng: -77.4565, city: 'Washington' },
  YUL: { lat: 45.4706, lng: -73.7408, city: 'Montreal' },
  MIA: { lat: 25.7959, lng: -80.287, city: 'Miami' },
  GRU: { lat: -23.4356, lng: -46.4731, city: 'São Paulo' },
  PEK: { lat: 40.0799, lng: 116.6031, city: 'Beijing' },
};

export function getAirportCoords(iata: string): Airport | null {
  return AIRPORTS[iata] || null;
}

export function getFlightArc(origin: string, destination: string) {
  const src = AIRPORTS[origin];
  const dst = AIRPORTS[destination];
  if (!src || !dst) return null;
  return {
    startLat: src.lat,
    startLng: src.lng,
    endLat: dst.lat,
    endLng: dst.lng,
    srcCity: src.city,
    dstCity: dst.city,
  };
}

