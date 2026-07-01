import { normalizeError } from '@/core/api/errors';

describe('normalizeError', () => {
  it('AxiosError with response -> structured error', () => {
    const axiosError = new Error('Request failed') as any;
    axiosError.isAxiosError = true;
    axiosError.response = { status: 400, data: { message: 'Bad request', code: 'BAD_REQUEST' } };

    const result = normalizeError(axiosError);
    expect(result).toEqual({
      code: 'BAD_REQUEST',
      message: 'Bad request',
      status: 400,
      fieldErrors: undefined,
      isNetwork: false,
    });
  });

  it('AxiosError without response -> network error', () => {
    const axiosError = new Error('Network Error') as any;
    axiosError.isAxiosError = true;
    axiosError.response = undefined;

    const result = normalizeError(axiosError);
    expect(result).toEqual({
      code: 'NETWORK',
      message: 'No internet connection. Check your network and retry.',
      status: 0,
      isNetwork: true,
    });
  });

  it('AxiosError 500 -> generic message', () => {
    const axiosError = new Error('Server error') as any;
    axiosError.isAxiosError = true;
    axiosError.response = { status: 500, data: {} };

    const result = normalizeError(axiosError);
    expect(result.message).toBe('Something went wrong. Please try again.');
    expect(result.code).toBe('HTTP_500');
    expect(result.status).toBe(500);
  });

  it('AxiosError 400 -> server message', () => {
    const axiosError = new Error('Bad request') as any;
    axiosError.isAxiosError = true;
    axiosError.response = { status: 400, data: { message: 'Invalid phone' } };

    const result = normalizeError(axiosError);
    expect(result.message).toBe('Invalid phone');
    expect(result.status).toBe(400);
  });

  it('Non-Axios error -> UNKNOWN code', () => {
    const result = normalizeError(new Error('Something broke'));
    expect(result).toEqual({
      code: 'UNKNOWN',
      message: 'Something broke',
      status: 0,
      isNetwork: false,
    });
  });

  it('Error with fieldErrors -> preserves them', () => {
    const axiosError = new Error('Validation failed') as any;
    axiosError.isAxiosError = true;
    axiosError.response = {
      status: 422,
      data: { message: 'Validation failed', fieldErrors: { name: 'Name is required' } },
    };

    const result = normalizeError(axiosError);
    expect(result.fieldErrors).toEqual({ name: 'Name is required' });
  });

  it('String error -> wrapped', () => {
    const result = normalizeError('oops');
    expect(result).toEqual({
      code: 'UNKNOWN',
      message: 'Something went wrong. Please try again.',
      status: 0,
      isNetwork: false,
    });
  });

  it('AxiosError 400 with array message -> picks first', () => {
    const axiosError = new Error('Validation') as any;
    axiosError.isAxiosError = true;
    axiosError.response = {
      status: 400,
      data: { message: ['First error', 'Second error'] },
    };

    const result = normalizeError(axiosError);
    expect(result.message).toBe('First error');
  });
});
