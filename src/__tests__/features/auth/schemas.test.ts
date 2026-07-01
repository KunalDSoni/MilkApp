import { phoneSchema, otpSchema, toE164 } from '@/features/auth/schemas';

describe('phoneSchema', () => {
  it('valid number -> passes', () => {
    expect(phoneSchema.safeParse('9876543210').success).toBe(true);
  });

  it('starts with 5 -> fails', () => {
    const result = phoneSchema.safeParse('5123456789');
    expect(result.success).toBe(false);
  });

  it('9 digits -> fails', () => {
    const result = phoneSchema.safeParse('987654321');
    expect(result.success).toBe(false);
  });

  it('11 digits -> fails', () => {
    const result = phoneSchema.safeParse('98765432101');
    expect(result.success).toBe(false);
  });
});

describe('otpSchema', () => {
  it('6 digits -> passes', () => {
    expect(otpSchema.safeParse('123456').success).toBe(true);
  });

  it('5 digits -> fails', () => {
    const result = otpSchema.safeParse('12345');
    expect(result.success).toBe(false);
  });

  it('non-digits -> fails', () => {
    const result = otpSchema.safeParse('abc123');
    expect(result.success).toBe(false);
  });
});

describe('toE164', () => {
  it('adds +91 prefix', () => {
    expect(toE164('9876543210')).toBe('+919876543210');
  });
});
