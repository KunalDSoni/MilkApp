import { cn } from '@/lib/cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible', null, undefined)).toBe('base visible');
  });

  it('deduplicates conflicting classes', () => {
    const result = cn('px-4', 'px-2');
    expect(result).not.toContain('px-4');
    expect(result).toBe('px-2');
  });
});
