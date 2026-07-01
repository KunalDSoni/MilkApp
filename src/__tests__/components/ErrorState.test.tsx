import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '@/components/ErrorState';

describe('ErrorState', () => {
  it('shows error message', () => {
    const { getByText } = render(<ErrorState message="Something broke" />);
    expect(getByText('Something broke')).toBeTruthy();
  });

  it('shows default message when none provided', () => {
    const { getByText } = render(<ErrorState />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('retry button works', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorState onRetry={onRetry} />);
    fireEvent.press(getByText('Try again'));
    expect(onRetry).toHaveBeenCalled();
  });
});
