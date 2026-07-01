import { customerFormSchema } from '@/features/customers/schemas';

describe('customerFormSchema', () => {
  it('valid -> passes', () => {
    const result = customerFormSchema.safeParse({
      outletName: 'Test Store',
      address: '123 Main St',
      route: 'Route A',
      phone: '9876543210',
      outletType: 'EXISTING',
    });
    expect(result.success).toBe(true);
  });

  it('empty name -> fails', () => {
    const result = customerFormSchema.safeParse({
      outletName: '',
      address: 'Addr',
      route: 'Route A',
      phone: '9876543210',
      outletType: 'EXISTING',
    });
    expect(result.success).toBe(false);
  });

  it('invalid phone -> fails', () => {
    const result = customerFormSchema.safeParse({
      outletName: 'Store',
      address: 'Addr',
      route: 'Route A',
      phone: '1234567890',
      outletType: 'EXISTING',
    });
    expect(result.success).toBe(false);
  });

  it('optional gstin empty -> ok', () => {
    const result = customerFormSchema.safeParse({
      outletName: 'Store',
      address: 'Addr',
      route: 'Route A',
      phone: '9876543210',
      outletType: 'EXISTING',
      gstin: '',
    });
    expect(result.success).toBe(true);
  });

  it('invalid GSTIN -> fails', () => {
    const result = customerFormSchema.safeParse({
      outletName: 'Store',
      address: 'Addr',
      route: 'Route A',
      phone: '9876543210',
      outletType: 'EXISTING',
      gstin: 'invalid-gst',
    });
    expect(result.success).toBe(false);
  });

  it('valid 15-char GST -> passes', () => {
    const result = customerFormSchema.safeParse({
      outletName: 'Store',
      address: 'Addr',
      route: 'Route A',
      phone: '9876543210',
      outletType: 'EXISTING',
      gstin: '07AABCK1234M1Z5',
    });
    expect(result.success).toBe(true);
  });
});
