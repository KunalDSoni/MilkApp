import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '@/features/products/components/ProductCard';

const mockProduct = {
  id: 'p1',
  sku: 'MILK-1L',
  name: 'Gold Milk',
  category: 'MILK' as const,
  uom: 'LITRE' as const,
  packSize: '1.000',
  taxRate: '0',
  isReturnablePack: false,
  active: true,
};

describe('ProductCard', () => {
  it('displays product info', () => {
    const { getByText } = render(
      <ProductCard product={mockProduct} quantity={0} onChange={() => {}} />,
    );
    expect(getByText('Gold Milk')).toBeTruthy();
    expect(getByText('1 L')).toBeTruthy();
  });

  it('quantity stepper integration', () => {
    const onChange = jest.fn();
    const { getAllByRole, getByText } = render(
      <ProductCard product={mockProduct} quantity={5} onChange={onChange} />,
    );
    expect(getByText('5')).toBeTruthy();
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[1]);
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('shows unavailable when inactive', () => {
    const inactive = { ...mockProduct, active: false };
    const { getByText } = render(
      <ProductCard product={inactive} quantity={0} onChange={() => {}} />,
    );
    expect(getByText('Unavailable')).toBeTruthy();
  });
});
