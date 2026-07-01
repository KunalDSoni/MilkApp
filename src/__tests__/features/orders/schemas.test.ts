import { orderStatusSchema, orderWindowSchema, orderSchema, orderLineSchema, windowStatusSchema } from '@/features/orders/schemas';

describe('orderStatusSchema', () => {
  it('accepts all valid statuses', () => {
    const statuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'DISPATCHED', 'DELIVERED', 'SETTLED', 'CANCELLED'];
    for (const s of statuses) {
      expect(orderStatusSchema.parse(s)).toBe(s);
    }
  });

  it('rejects invalid status', () => {
    expect(() => orderStatusSchema.parse('INVALID')).toThrow();
  });
});

describe('windowStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(windowStatusSchema.parse('OPEN')).toBe('OPEN');
    expect(windowStatusSchema.parse('LOCKED')).toBe('LOCKED');
  });
});

describe('orderLineSchema', () => {
  it('valid line passes', () => {
    const result = orderLineSchema.safeParse({ productId: 'p1', unitPrice: 10, qty: 5 });
    expect(result.success).toBe(true);
  });
});

describe('orderSchema', () => {
  it('valid order passes', () => {
    const result = orderSchema.safeParse({
      id: 'ord_1',
      deliveryDate: '2026-07-02',
      status: 'DRAFT',
      source: 'MANUAL',
      subtotal: 100,
      taxTotal: 5,
      total: 105,
      items: [{ productId: 'p1', unitPrice: 10, qty: 5 }],
      createdAt: '2026-07-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });
});
