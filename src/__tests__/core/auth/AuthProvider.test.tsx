import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, AuthContext } from '@/core/auth/AuthProvider';
import * as session from '@/core/auth/session';
import * as authApi from '@/features/auth/api';

jest.mock('@/features/auth/api', () => ({
  logout: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: jest.fn() }),
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children', () => {
    const { getByText } = render(
      <AuthProvider>
        <Text>Hello</Text>
      </AuthProvider>
    );
    expect(getByText('Hello')).toBeTruthy();
  });
});
