import React from 'react';
import { render } from '@testing-library/react-native';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';

describe('OrderStatusBadge', () => {
  it('renders DRAFT status', () => {
    const { getByText } = render(<OrderStatusBadge status="DRAFT" />);
    expect(getByText('Draft')).toBeTruthy();
  });

  it('renders SUBMITTED status', () => {
    const { getByText } = render(<OrderStatusBadge status="SUBMITTED" />);
    expect(getByText('Submitted')).toBeTruthy();
  });

  it('renders APPROVED status', () => {
    const { getByText } = render(<OrderStatusBadge status="APPROVED" />);
    expect(getByText('Approved')).toBeTruthy();
  });

  it('renders REJECTED status', () => {
    const { getByText } = render(<OrderStatusBadge status="REJECTED" />);
    expect(getByText('Rejected')).toBeTruthy();
  });

  it('renders DELIVERED status', () => {
    const { getByText } = render(<OrderStatusBadge status="DELIVERED" />);
    expect(getByText('Delivered')).toBeTruthy();
  });

  it('renders CANCELLED status', () => {
    const { getByText } = render(<OrderStatusBadge status="CANCELLED" />);
    expect(getByText('Cancelled')).toBeTruthy();
  });
});
