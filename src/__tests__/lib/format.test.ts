import { formatCurrency, formatDate, formatTime, formatCountdown, formatQty } from '@/lib/format';

describe('formatCurrency', () => {
  it('formats INR', () => {
    const result = formatCurrency(1234);
    expect(result).toContain('₹');
    expect(result).toContain('1');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('handles large numbers', () => {
    const result = formatCurrency(100000);
    expect(result).toContain('₹');
  });
});

describe('formatQty', () => {
  it('formats quantity with unit', () => {
    expect(formatQty(5, 'L')).toBe('5 × L');
  });
});

describe('formatDate', () => {
  it('formats ISO date', () => {
    const result = formatDate('2026-07-01T00:00:00Z');
    expect(result).toContain('Jul');
    expect(result).toContain('2026');
  });
});

describe('formatTime', () => {
  it('formats ISO time', () => {
    const result = formatTime('2026-07-01T10:30:00Z');
    // Timezone shifts hour/minute; just verify format (e.g. "4:00 pm" or "10:30 AM")
    expect(result).toMatch(/^\d{1,2}:\d{2}\s?(am|pm|AM|PM)?$/);
  });
});

describe('formatCountdown', () => {
  it('future time -> shows remaining', () => {
    const future = new Date(Date.now() + 7200_000).toISOString();
    const result = formatCountdown(future);
    expect(result).toContain('h');
    expect(result).toContain('m left');
  });

  it('past time -> Closed', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(formatCountdown(past)).toBe('Closed');
  });

  it('less than 1 hour -> only minutes', () => {
    const future = new Date(Date.now() + 1800_000).toISOString();
    expect(formatCountdown(future)).toMatch(/^\d+m left$/);
  });

  it('exactly at cutoff -> Closed', () => {
    const now = Date.now();
    expect(formatCountdown(new Date(now).toISOString(), now)).toBe('Closed');
  });
});
