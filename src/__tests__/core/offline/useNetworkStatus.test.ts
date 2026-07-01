import { renderHook } from '@testing-library/react-native';
import { useIsOnline } from '@/core/offline/useNetworkStatus';

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(),
}));

import { useNetInfo } from '@react-native-community/netinfo';

describe('useIsOnline', () => {
  it('Online -> true', () => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
  });

  it('Offline -> false', () => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: false });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(false);
  });

  it('Unknown -> true (no false flash)', () => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: null });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
  });
});
