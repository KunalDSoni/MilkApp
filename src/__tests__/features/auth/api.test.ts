import { requestOtp, verifyOtp, logout } from '@/features/auth/api';
import { apiClient } from '@/core/api/client';

jest.mock('@/core/config/env', () => ({
  env: { apiUrl: 'https://api.example.com', useMocks: false, sentryDsn: undefined },
}));

jest.mock('@/core/auth/jwt', () => ({
  userFromToken: jest.fn(() => ({
    id: 'ret_1',
    name: 'Retailer',
    phone: '9000000001',
    role: 'RETAILER',
    shopName: null,
    distributorId: 'dist_1',
  })),
}));

jest.mock('@/features/auth/schemas', () => ({
  ...jest.requireActual('@/features/auth/schemas'),
  authTokensSchema: { parse: (d: any) => d },
  otpRequestResponseSchema: { parse: (d: any) => d },
}));

describe('auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('calls correct endpoint', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValue({ data: { message: 'OTP sent' } });
      await requestOtp('9000000001');
      expect(apiClient.post).toHaveBeenCalledWith('/auth/otp/request', {
        phone: '+919000000001',
      });
    });
  });

  describe('verifyOtp', () => {
    it('valid -> returns VerifyResult', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValue({
        data: { accessToken: 'acc', refreshToken: 'ref', expiresIn: 3600 },
      });
      const result = await verifyOtp('9000000001', '123456');
      expect(result.accessToken).toBe('acc');
      expect(result.refreshToken).toBe('ref');
      expect(result.user).toBeDefined();
    });

    it('real API -> parses tokens + builds user', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValue({
        data: { accessToken: 'acc-token', refreshToken: 'ref-token' },
      });
      const result = await verifyOtp('9000000001', '654321');
      expect(result.accessToken).toBe('acc-token');
      expect(result.refreshToken).toBe('ref-token');
    });
  });

  describe('logout', () => {
    it('calls API', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValue({});
      await logout();
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });
});
