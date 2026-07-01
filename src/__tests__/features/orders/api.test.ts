import { fetchCurrentWindow, createOrder, submitOrder, fetchOrders, fetchOrderById } from '@/features/orders/api';
import { apiClient } from '@/core/api/client';

jest.mock('@/core/config/env', () => ({
  env: { apiUrl: 'https://api.example.com', useMocks: false, sentryDsn: undefined },
}));

describe('orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCurrentWindow', () => {
    it('returns OrderWindow', async () => {
      jest.spyOn(apiClient, 'get').mockResolvedValue({
        data: { id: 'win_1', deliveryDate: '2026-07-02', cutoffAt: '2026-07-02T10:00:00Z', status: 'OPEN' },
      });
      const result = await fetchCurrentWindow();
      expect(result).toEqual({
        id: 'win_1',
        deliveryDate: '2026-07-02',
        cutoffAt: '2026-07-02T10:00:00Z',
        status: 'OPEN',
      });
    });

    it('404 -> throws WINDOW_UNAVAILABLE', async () => {
      jest.spyOn(apiClient, 'get').mockRejectedValue({ response: { status: 404 } });
      await expect(fetchCurrentWindow()).rejects.toThrow('No order window is open right now.');
    });
  });

  describe('createOrder', () => {
    it('sends correct payload', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValue({
        data: {
          id: 'ord_1',
          deliveryDate: '2026-07-02',
          status: 'DRAFT',
          source: 'MANUAL',
          subtotal: '100',
          taxTotal: '5',
          total: '105',
          items: [{ productId: 'p1', unitPrice: '10', qtyOrdered: '10', qtyApproved: null }],
          createdAt: '2026-07-01T00:00:00Z',
        },
      });
      const result = await createOrder('win_1', [{ productId: 'p1', qty: 10 }]);
      expect(apiClient.post).toHaveBeenCalledWith('/orders', {
        orderWindowId: 'win_1',
        items: [{ productId: 'p1', qty: '10' }],
      });
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('submitOrder', () => {
    it('sends to correct endpoint', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValue({
        data: {
          id: 'ord_1',
          deliveryDate: '2026-07-02',
          status: 'SUBMITTED',
          source: 'MANUAL',
          subtotal: '100',
          taxTotal: '5',
          total: '105',
          items: [{ productId: 'p1', unitPrice: '10', qtyOrdered: '10', qtyApproved: null }],
          createdAt: '2026-07-01T00:00:00Z',
        },
      });
      const result = await submitOrder('ord_1');
      expect(apiClient.post).toHaveBeenCalledWith('/orders/ord_1/submit');
      expect(result.status).toBe('SUBMITTED');
    });
  });

  describe('fetchOrders', () => {
    it('returns parsed orders', async () => {
      jest.spyOn(apiClient, 'get').mockResolvedValue({
        data: [{
          id: 'ord_1',
          deliveryDate: '2026-07-02',
          status: 'DELIVERED',
          source: 'MANUAL',
          subtotal: '100',
          taxTotal: '5',
          total: '105',
          items: [{ productId: 'p1', unitPrice: '10', qtyOrdered: '10', qtyApproved: '10' }],
          createdAt: '2026-07-01T00:00:00Z',
        }],
      });
      const result = await fetchOrders();
      expect(result).toHaveLength(1);
      expect(result[0].total).toBe(105);
    });

    it('handles empty', async () => {
      jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });
      const result = await fetchOrders();
      expect(result).toEqual([]);
    });
  });

  describe('fetchOrderById', () => {
    it('finds by ID', async () => {
      jest.spyOn(apiClient, 'get').mockResolvedValue({
        data: {
          id: 'ord_1',
          deliveryDate: '2026-07-02',
          status: 'DRAFT',
          source: 'MANUAL',
          subtotal: '100',
          taxTotal: '5',
          total: '105',
          items: [{ productId: 'p1', unitPrice: '10', qtyOrdered: '10', qtyApproved: null }],
          createdAt: '2026-07-01T00:00:00Z',
        },
      });
      const result = await fetchOrderById('ord_1');
      expect(result.id).toBe('ord_1');
    });

    it('not found -> throws', async () => {
      jest.spyOn(apiClient, 'get').mockRejectedValue(new Error('Not found'));
      await expect(fetchOrderById('invalid')).rejects.toThrow();
    });
  });
});
