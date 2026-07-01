import { fetchProducts } from '@/features/products/api';
import { apiClient } from '@/core/api/client';

jest.mock('@/core/config/env', () => ({
  env: { apiUrl: 'https://api.example.com', useMocks: false, sentryDsn: undefined },
}));

describe('products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns products', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: [{ id: 'p1', sku: 'SKU1', name: 'Milk', category: 'MILK', uom: 'LITRE', packSize: '1.000', taxRate: '0', isReturnablePack: false, active: true }],
    });
    const result = await fetchProducts();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Milk');
  });

  it('sends active:true', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });
    await fetchProducts();
    expect(apiClient.get).toHaveBeenCalledWith('/catalog/products', {
      params: { active: true },
    });
  });
});
