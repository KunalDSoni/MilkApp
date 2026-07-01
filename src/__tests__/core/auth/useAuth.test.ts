import { renderHook } from '@testing-library/react-native';
import { useAuth } from '@/core/auth/useAuth';

describe('useAuth', () => {
  it('throws outside provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
  });
});
