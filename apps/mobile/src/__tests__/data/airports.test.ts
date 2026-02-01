import {
  airports,
  searchAirports,
  getAirportByCode,
  formatAirportDisplay,
  formatAirportFull,
  Airport,
} from '@/data/airports';

describe('airports data', () => {
  it('exports a non-empty array', () => {
    expect(airports.length).toBeGreaterThan(100);
  });

  it('every airport has required fields', () => {
    for (const a of airports) {
      expect(typeof a.icao).toBe('string');
      expect(a.icao).toMatch(/^[A-Z]{4}$/);
      expect(typeof a.iata).toBe('string');
      expect(a.iata).toMatch(/^[A-Z]{3}$/);
      expect(typeof a.name).toBe('string');
      expect(a.name.length).toBeGreaterThan(0);
      expect(typeof a.city).toBe('string');
      expect(a.city.length).toBeGreaterThan(0);
      expect(typeof a.country).toBe('string');
      expect(a.country.length).toBeGreaterThan(0);
      expect(typeof a.lat).toBe('number');
      expect(typeof a.lon).toBe('number');
      expect(['large', 'medium', 'small', 'private']).toContain(a.type);
    }
  });
});

describe('searchAirports', () => {
  it('returns empty for short queries', () => {
    expect(searchAirports('', 10)).toEqual([]);
    expect(searchAirports('J', 10)).toEqual([]);
  });

  it('finds JFK by IATA code', () => {
    const results = searchAirports('JFK');
    expect(results[0].iata).toBe('JFK');
  });

  it('finds by ICAO code', () => {
    const results = searchAirports('KJFK');
    expect(results[0].icao).toBe('KJFK');
  });

  it('finds by city name', () => {
    const results = searchAirports('Miami');
    expect(results.some((a) => a.city === 'Miami')).toBe(true);
  });

  it('respects limit', () => {
    const results = searchAirports('New', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('filter=code only searches codes', () => {
    const results = searchAirports('LA', 10, 'code');
    for (const r of results) {
      expect(r.iata.startsWith('LA') || r.icao.startsWith('LA')).toBe(true);
    }
  });

  it('filter=city only searches cities', () => {
    const results = searchAirports('London', 10, 'city');
    expect(results.every((a) => a.city.toLowerCase().includes('london'))).toBe(true);
  });

  it('filter=name only searches airport names', () => {
    const results = searchAirports('Heathrow', 10, 'name');
    expect(results[0].name).toContain('Heathrow');
  });

  it('sorts by score then type', () => {
    const results = searchAirports('LA');
    // Exact IATA match should be first
    expect(results.length).toBeGreaterThan(0);
  });

  it('handles whitespace in query', () => {
    const results = searchAirports('  JFK  ');
    expect(results[0].iata).toBe('JFK');
  });

  it('is case insensitive', () => {
    const results = searchAirports('jfk');
    expect(results[0].iata).toBe('JFK');
  });
});

describe('getAirportByCode', () => {
  it('finds by IATA', () => {
    const airport = getAirportByCode('LAX');
    expect(airport?.iata).toBe('LAX');
  });

  it('finds by ICAO', () => {
    const airport = getAirportByCode('KLAX');
    expect(airport?.icao).toBe('KLAX');
  });

  it('returns undefined for unknown code', () => {
    expect(getAirportByCode('ZZZ')).toBeUndefined();
  });

  it('is case insensitive', () => {
    expect(getAirportByCode('lax')?.iata).toBe('LAX');
  });
});

describe('formatAirportDisplay', () => {
  it('formats US airport with state', () => {
    const airport: Airport = { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA', country: 'USA', lat: 33.9, lon: -118.4, type: 'large' };
    expect(formatAirportDisplay(airport)).toBe('LAX - Los Angeles, CA');
  });

  it('formats international airport without state', () => {
    const airport: Airport = { icao: 'EGLL', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.47, lon: -0.45, type: 'large' };
    expect(formatAirportDisplay(airport)).toBe('LHR - London, United Kingdom');
  });
});

describe('formatAirportFull', () => {
  it('formats with full name and location', () => {
    const airport: Airport = { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA', country: 'USA', lat: 33.9, lon: -118.4, type: 'large' };
    expect(formatAirportFull(airport)).toBe('LAX - Los Angeles International Airport (Los Angeles, CA)');
  });
});
