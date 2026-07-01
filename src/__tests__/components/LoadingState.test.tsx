import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingState } from '@/components/LoadingState';

describe('LoadingState', () => {
  it('shows loading indicator', () => {
    const { getByText } = render(<LoadingState />);
    expect(getByText('Loading…')).toBeTruthy();
  });

  it('shows custom message', () => {
    const { getByText } = render(<LoadingState message="Please wait" />);
    expect(getByText('Please wait')).toBeTruthy();
  });
});
