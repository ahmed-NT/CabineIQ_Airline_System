export interface Airport {
  lat: number;
  lng: number;
  city: string;
}

// RAM IT team replaces this with real DB call later
export const AIRPORTS: Record<string, Airport> = {
  CMN: { lat: 33.3675, lng: -7.5898, city: 'Casablanca' },
  CDG: { lat: 49.0097, lng: 2.5479, city: 'Paris' },
  JFK: { lat: 40.6413, lng: -73.7781, city: 'New York' },
  LHR: { lat: 51.47, lng: -0.4543, city: 'London' },
  MAD: { lat: 40.4983, lng: -3.5676, city: 'Madrid' },
  BCN: { lat: 41.2974, lng: 2.0833, city: 'Barcelona' },
  DXB: { lat: 25.2532, lng: 55.3657, city: 'Dubai' },
  GVA: { lat: 46.2381, lng: 6.1089, city: 'Geneva' },
  MRS: { lat: 43.4353, lng: 5.2214, city: 'Marseille' },
  LYS: { lat: 45.7256, lng: 5.0811, city: 'Lyon' },
  NCE: { lat: 43.6584, lng: 7.2159, city: 'Nice' },
  TUN: { lat: 36.851, lng: 10.2272, city: 'Tunis' },
  ALG: { lat: 36.691, lng: 3.2154, city: 'Algiers' },
  CAI: { lat: 30.1219, lng: 31.4056, city: 'Cairo' },
  DAK: { lat: 14.7397, lng: -17.4902, city: 'Dakar' },
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

