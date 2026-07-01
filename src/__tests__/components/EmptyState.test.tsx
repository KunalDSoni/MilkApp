import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '@/components/EmptyState';

describe('EmptyState', () => {
  it('shows empty message', () => {
    const { getByText } = render(<EmptyState title="No items" />);
    expect(getByText('No items')).toBeTruthy();
  });

  it('shows subtitle', () => {
    const { getByText } = render(<EmptyState title="Empty" subtitle="Nothing here yet" />);
    expect(getByText('Nothing here yet')).toBeTruthy();
  });

  it('action button works', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <EmptyState title="Empty" actionLabel="Add item" onAction={onAction} />,
    );
    fireEvent.press(getByText('Add item'));
    expect(onAction).toHaveBeenCalled();
  });
});
