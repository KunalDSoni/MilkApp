import { WEEKDAYS, FULL_WEEK_MASK, maskHasDay, toggleMaskDay, formatMask } from '@/lib/constants';

describe('constants', () => {
  it('WEEKDAYS has 7 entries', () => {
    expect(WEEKDAYS).toHaveLength(7);
  });

  it('FULL_WEEK_MASK is 127', () => {
    expect(FULL_WEEK_MASK).toBe(127);
  });

  it('maskHasDay works correctly', () => {
    expect(maskHasDay(1, 0)).toBe(true);
    expect(maskHasDay(1, 1)).toBe(false);
    expect(maskHasDay(127, 0)).toBe(true);
    expect(maskHasDay(127, 6)).toBe(true);
  });

  it('toggleMaskDay toggles bits', () => {
    expect(toggleMaskDay(1, 0)).toBe(0);
    expect(toggleMaskDay(0, 0)).toBe(1);
  });

  it('formatMask returns "Every day" for full mask', () => {
    expect(formatMask(127)).toBe('Every day');
  });

  it('formatMask returns comma-separated days', () => {
    const result = formatMask(65); // Mon + Sun: 64+1
    expect(result).toContain('Mon');
    expect(result).toContain('Sun');
  });

  it('formatMask returns "No days selected" for 0', () => {
    expect(formatMask(0)).toBe('No days selected');
  });
});
