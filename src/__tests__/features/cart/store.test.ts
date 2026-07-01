import { useCart } from '@/features/cart/store';

describe('useCart store', () => {
  beforeEach(() => {
    useCart.getState().clear();
  });

  it('initial state: empty', () => {
    expect(useCart.getState().quantities).toEqual({});
    expect(useCart.getState().itemCount()).toBe(0);
    expect(useCart.getState().lines()).toEqual([]);
  });

  it('setQty: adds item', () => {
    useCart.getState().setQty('p1', 5);
    expect(useCart.getState().quantities).toEqual({ p1: 5 });
    expect(useCart.getState().itemCount()).toBe(1);
  });

  it('setQty: updates existing', () => {
    useCart.getState().setQty('p1', 5);
    useCart.getState().setQty('p1', 10);
    expect(useCart.getState().quantities).toEqual({ p1: 10 });
  });

  it('setQty: qty=0 removes item', () => {
    useCart.getState().setQty('p1', 5);
    useCart.getState().setQty('p1', 0);
    expect(useCart.getState().quantities).toEqual({});
    expect(useCart.getState().itemCount()).toBe(0);
  });

  it('clear: empties cart', () => {
    useCart.getState().setQty('p1', 5);
    useCart.getState().setQty('p2', 3);
    useCart.getState().clear();
    expect(useCart.getState().quantities).toEqual({});
    expect(useCart.getState().itemCount()).toBe(0);
  });

  it('lines: returns CartLine[]', () => {
    useCart.getState().setQty('p1', 5);
    useCart.getState().setQty('p2', 3);
    expect(useCart.getState().lines()).toEqual([
      { productId: 'p1', qty: 5 },
      { productId: 'p2', qty: 3 },
    ]);
  });

  it('itemCount: counts items', () => {
    expect(useCart.getState().itemCount()).toBe(0);
    useCart.getState().setQty('p1', 5);
    expect(useCart.getState().itemCount()).toBe(1);
    useCart.getState().setQty('p2', 3);
    expect(useCart.getState().itemCount()).toBe(2);
    useCart.getState().setQty('p1', 0);
    expect(useCart.getState().itemCount()).toBe(1);
  });
});
