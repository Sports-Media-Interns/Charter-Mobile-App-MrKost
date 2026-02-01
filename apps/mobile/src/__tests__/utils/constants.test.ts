import {
  AIRCRAFT_CATEGORIES,
  REQUEST_STATUSES,
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  TRIP_TYPES,
  URGENCY_LEVELS,
  SAFETY_RATINGS,
} from '@/utils/constants';

describe('constants', () => {
  describe('AIRCRAFT_CATEGORIES', () => {
    it('has 5 categories', () => {
      expect(AIRCRAFT_CATEGORIES).toHaveLength(5);
    });

    it('each category has required fields', () => {
      for (const cat of AIRCRAFT_CATEGORIES) {
        expect(cat).toHaveProperty('key');
        expect(cat).toHaveProperty('label');
        expect(cat).toHaveProperty('passengers');
        expect(cat).toHaveProperty('range');
      }
    });

    it('includes light jet', () => {
      const light = AIRCRAFT_CATEGORIES.find((c) => c.key === 'light');
      expect(light).toEqual(expect.objectContaining({ key: 'light', label: expect.any(String) }));
    });
  });

  describe('REQUEST_STATUSES', () => {
    it('has 8 statuses', () => {
      expect(REQUEST_STATUSES).toHaveLength(8);
    });

    it('each status has key, label, and color', () => {
      for (const s of REQUEST_STATUSES) {
        expect(typeof s.key).toBe('string');
        expect(s.key.length).toBeGreaterThan(0);
        expect(typeof s.label).toBe('string');
        expect(s.label.length).toBeGreaterThan(0);
        expect(s.color).toMatch(/^#/);
      }
    });
  });

  describe('BOOKING_STATUSES', () => {
    it('has 4 statuses', () => {
      expect(BOOKING_STATUSES).toHaveLength(4);
    });
  });

  describe('PAYMENT_STATUSES', () => {
    it('has 4 statuses', () => {
      expect(PAYMENT_STATUSES).toHaveLength(4);
    });
  });

  describe('TRIP_TYPES', () => {
    it('has 3 trip types', () => {
      expect(TRIP_TYPES).toHaveLength(3);
    });

    it('includes round_trip', () => {
      const roundTrip = TRIP_TYPES.find((t) => t.key === 'round_trip');
      expect(roundTrip).toEqual(expect.objectContaining({ key: 'round_trip', label: expect.any(String) }));
    });
  });

  describe('URGENCY_LEVELS', () => {
    it('has 3 levels', () => {
      expect(URGENCY_LEVELS).toHaveLength(3);
    });

    it('each level has responseTime', () => {
      for (const u of URGENCY_LEVELS) {
        expect(typeof u.responseTime).toBe('string');
        expect(u.responseTime.length).toBeGreaterThan(0);
      }
    });
  });

  describe('SAFETY_RATINGS', () => {
    it('has 4 ratings', () => {
      expect(SAFETY_RATINGS).toHaveLength(4);
    });

    it('each rating has icon', () => {
      for (const r of SAFETY_RATINGS) {
        expect(typeof r.icon).toBe('string');
        expect(r.icon.length).toBeGreaterThan(0);
      }
    });
  });
});
