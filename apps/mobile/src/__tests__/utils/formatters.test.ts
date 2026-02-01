import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatFlightRoute,
  formatPassengerCount,
  formatPhoneNumber,
} from '@/utils/formatters';

describe('formatCurrency', () => {
  it('formats whole dollar amounts', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats large amounts with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000');
  });

  it('rounds decimal amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });
});

describe('formatDate', () => {
  it('formats ISO string', () => {
    // UTC midnight may shift date depending on local timezone
    const result = formatDate('2024-06-15T12:00:00Z');
    expect(result).toBe('Jun 15, 2024');
  });

  it('formats Date object', () => {
    expect(formatDate(new Date(2024, 0, 1))).toBe('Jan 1, 2024');
  });

  it('formats date-only string', () => {
    expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
  });
});

describe('formatDateTime', () => {
  it('formats ISO string with time', () => {
    const result = formatDateTime('2024-06-15T14:30:00Z');
    expect(result).toMatch(/Jun 15, 2024 at/);
  });

  it('formats Date object', () => {
    const result = formatDateTime(new Date(2024, 5, 15, 14, 30));
    expect(result).toMatch(/Jun 15, 2024 at 2:30 PM/);
  });
});

describe('formatTime', () => {
  it('formats morning time', () => {
    expect(formatTime('09:30')).toBe('9:30 AM');
  });

  it('formats afternoon time', () => {
    expect(formatTime('14:00')).toBe('2:00 PM');
  });

  it('formats midnight', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
  });

  it('formats noon', () => {
    expect(formatTime('12:00')).toBe('12:00 PM');
  });

  it('formats 12:30 PM', () => {
    expect(formatTime('12:30')).toBe('12:30 PM');
  });
});

describe('formatRelativeTime', () => {
  it('returns relative string with suffix', () => {
    const recent = new Date(Date.now() - 60000).toISOString();
    const result = formatRelativeTime(recent);
    expect(result).toMatch(/ago/);
  });

  it('handles Date object', () => {
    const result = formatRelativeTime(new Date(Date.now() - 3600000));
    expect(result).toMatch(/ago/);
  });
});

describe('formatFlightRoute', () => {
  it('formats with default separator', () => {
    expect(formatFlightRoute('LAX', 'JFK')).toBe('LAX → JFK');
  });

  it('formats with custom separator', () => {
    expect(formatFlightRoute('LAX', 'JFK', ' - ')).toBe('LAX - JFK');
  });
});

describe('formatPassengerCount', () => {
  it('formats singular', () => {
    expect(formatPassengerCount(1)).toBe('1 passenger');
  });

  it('formats plural', () => {
    expect(formatPassengerCount(5)).toBe('5 passengers');
  });

  it('formats zero as plural', () => {
    expect(formatPassengerCount(0)).toBe('0 passengers');
  });
});

describe('formatPhoneNumber', () => {
  it('formats 10-digit number', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
  });

  it('formats 11-digit number starting with 1', () => {
    expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
  });

  it('returns original for other formats', () => {
    expect(formatPhoneNumber('+44 123')).toBe('+44 123');
  });

  it('strips non-digits before formatting', () => {
    expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
  });
});
