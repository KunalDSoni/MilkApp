import React from 'react';
import { render } from '@testing-library/react-native';
import { OrderSummaryCard } from '@/features/orders/components/OrderSummaryCard';

const mockOrder = {
  id: 'ord_1',
  deliveryDate: '2026-07-02',
  status: 'APPROVED' as const,
  source: 'MANUAL' as const,
  subtotal: 100,
  taxTotal: 5,
  total: 105,
  items: [
    { productId: 'p1', unitPrice: 10, qty: 5, qtyApproved: null },
    { productId: 'p2', unitPrice: 20, qty: 3, qtyApproved: null },
  ],
  createdAt: '2026-07-01T00:00:00Z',
};

describe('OrderSummaryCard', () => {
  it('shows order details', () => {
    const { getByText } = render(<OrderSummaryCard order={mockOrder} />);
    expect(getByText('Order summary')).toBeTruthy();
    expect(getByText('Approved')).toBeTruthy();
    expect(getByText('₹105')).toBeTruthy();
  });
});
