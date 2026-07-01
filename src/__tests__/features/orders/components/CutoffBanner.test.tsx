import React from 'react';
import { render } from '@testing-library/react-native';
import { CutoffBanner } from '@/features/orders/components/CutoffBanner';

describe('CutoffBanner', () => {
  it('before cutoff -> shows time remaining', () => {
    const future = new Date(Date.now() + 7200_000).toISOString();
    const { getByText } = render(<CutoffBanner cutoffAt={future} status="OPEN" />);
    expect(getByText('Order window open')).toBeTruthy();
  });

  it('after cutoff -> shows closed', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const { getByText } = render(<CutoffBanner cutoffAt={past} status="LOCKED" />);
    expect(getByText('Window closed')).toBeTruthy();
    expect(getByText('Cutoff has passed')).toBeTruthy();
  });

  it('less than 1 hour -> urgent styling', () => {
    const thirtyMins = new Date(Date.now() + 1800_000).toISOString();
    const { getByText } = render(<CutoffBanner cutoffAt={thirtyMins} status="OPEN" />);
    expect(getByText('Order window open')).toBeTruthy();
  });
});
