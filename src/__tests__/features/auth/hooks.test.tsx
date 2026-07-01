import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRequestOtp, useVerifyOtp } from '@/features/auth/hooks';

jest.mock('@/features/auth/api', () => ({
  requestOtp: jest.fn(),
  verifyOtp: jest.fn(),
}));

jest.mock('@/core/api/errors', () => ({
  normalizeError: jest.fn((e) => e),
}));

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: any) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('auth hooks', () => {
  it('useRequestOtp: exposes mutate function', () => {
    const { result } = renderHook(() => useRequestOtp(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useVerifyOtp: exposes mutate function', () => {
    const { result } = renderHook(() => useVerifyOtp(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});
