import { decodeJwt, userFromToken } from '@/core/auth/jwt';

function makeToken(payload: Record<string, unknown>): string {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `header.${b64}.sig`;
}

describe('decodeJwt', () => {
  it('valid token -> returns claims', () => {
    const token = makeToken({
      sub: 'ret_1',
      role: 'DISTRIBUTOR',
      name: 'Test',
      phone: '9000000001',
    });
    const claims = decodeJwt(token);
    expect(claims).toEqual({
      sub: 'ret_1',
      role: 'DISTRIBUTOR',
      name: 'Test',
      phone: '9000000001',
    });
  });

  it('invalid token -> null', () => {
    expect(decodeJwt('not-a-token')).toBeNull();
  });

  it('missing payload -> null', () => {
    expect(decodeJwt('header..sig')).toBeNull();
  });
});

describe('userFromToken', () => {
  it('builds User from claims', () => {
    const token = makeToken({
      sub: 'sub_1',
      retailerId: 'ret_1',
      name: 'Shop Owner',
      phone: '9000000001',
      role: 'RETAILER',
      distributorId: 'dist_1',
    });
    const user = userFromToken(token, '9000000001');
    expect(user).toEqual({
      id: 'ret_1',
      name: 'Shop Owner',
      phone: '9000000001',
      role: 'RETAILER',
      shopName: null,
      distributorId: 'dist_1',
    });
  });

  it('missing claims -> defaults', () => {
    const token = makeToken({ sub: 'sub_1' });
    const user = userFromToken(token, '9000000002');
    expect(user).toEqual({
      id: 'sub_1',
      name: 'Retailer',
      phone: '9000000002',
      role: null,
      shopName: null,
      distributorId: null,
    });
  });
});
