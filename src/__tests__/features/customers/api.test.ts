import { fetchCustomers, createCustomer, fetchSalesTeam } from '@/features/customers/api';
import { apiClient } from '@/core/api/client';

jest.mock('@/core/config/env', () => ({
  env: { apiUrl: 'https://api.example.com', useMocks: false, sentryDsn: undefined },
}));

describe('customers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchCustomers: returns list', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: [{
        id: 'c1', outletName: 'Store 1', address: 'Addr 1', route: 'R1',
        gstin: null, phone: '+919000000001', whatsapp: null,
        paymentTerms: null, outletType: 'EXISTING', salesOfficer: null, createdAt: '2026-01-01T00:00:00Z',
      }],
    });
    const result = await fetchCustomers();
    expect(result).toHaveLength(1);
    expect(result[0].outletName).toBe('Store 1');
  });

  it('createCustomer: transforms phone to E.164', async () => {
    jest.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        id: 'c2', outletName: 'New Store', address: 'Addr', route: 'R1',
        gstin: null, phone: '+919000000002', whatsapp: null,
        paymentTerms: null, outletType: 'NEW', salesOfficer: null, createdAt: '2026-07-01T00:00:00Z',
      },
    });
    const result = await createCustomer({
      outletName: 'New Store', address: 'Addr', route: 'R1', phone: '9000000002',
      outletType: 'NEW',
    });
    expect(apiClient.post).toHaveBeenCalledWith('/customers', expect.objectContaining({
      phone: '+919000000002',
    }));
    expect(result.outletName).toBe('New Store');
  });

  it('fetchSalesTeam: returns reps', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: [{ id: 'rep_1', name: 'Amit', phone: '+919000000010' }],
    });
    const result = await fetchSalesTeam();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Amit');
  });
});
