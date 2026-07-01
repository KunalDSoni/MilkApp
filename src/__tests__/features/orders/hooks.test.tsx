import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentWindow, useOrders } from '@/features/orders/hooks';
import * as api from '@/features/orders/api';
import { useCart } from '@/features/cart/store';

jest.mock('@/features/orders/api', () => ({
  fetchCurrentWindow: jest.fn(),
  fetchOrders: jest.fn(),
  createOrder: jest.fn(),
  submitOrder: jest.fn(),
  fetchOrderById: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: any) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('orders hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.getState().clear();
  });

  it('useCurrentWindow: returns window', async () => {
    (api.fetchCurrentWindow as jest.Mock).mockResolvedValue({
      id: 'win_1',
      deliveryDate: '2026-07-02',
      cutoffAt: '2026-07-02T10:00:00Z',
      status: 'OPEN',
    });
    const { result, waitForNextUpdate } = renderHook(() => useCurrentWindow(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.data?.id).toBe('win_1');
  });

  it('useOrders: returns list', async () => {
    (api.fetchOrders as jest.Mock).mockResolvedValue([]);
    const { result, waitForNextUpdate } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.data).toEqual([]);
  });
});
