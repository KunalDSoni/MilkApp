import { renderHook, act } from '@testing-library/react-native';
import { useDebouncedCallback } from '@/lib/useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls after delay', () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('arg1');
    });

    expect(fn).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(fn).toHaveBeenCalledWith('arg1');
  });

  it('debounces calls', () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('preserves latest args', () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 100));

    act(() => {
      result.current('a');
    });
    act(() => {
      jest.advanceTimersByTime(50);
    });
    act(() => {
      result.current('b');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(fn).toHaveBeenCalledWith('b');
  });
});
