import React from 'react';
import { render } from '@testing-library/react-native';
import { OfflineBanner } from '@/components/OfflineBanner';

jest.mock('@/core/offline/useNetworkStatus', () => ({
  useIsOnline: jest.fn(),
}));

import { useIsOnline } from '@/core/offline/useNetworkStatus';

describe('OfflineBanner', () => {
  it('shows when offline', () => {
    (useIsOnline as jest.Mock).mockReturnValue(false);
    const { getByText } = render(<OfflineBanner />);
    expect(getByText("You're offline — showing saved data")).toBeTruthy();
  });

  it('hides when online', () => {
    (useIsOnline as jest.Mock).mockReturnValue(true);
    const { queryByText } = render(<OfflineBanner />);
    expect(queryByText("You're offline — showing saved data")).toBeNull();
  });
});
