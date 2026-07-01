import { productSchema, productUnitLabel } from '@/features/products/schemas';

describe('productSchema', () => {
  it('valid -> passes', () => {
    const result = productSchema.safeParse({
      id: 'p1', sku: 'SKU1', name: 'Milk', category: 'MILK', uom: 'LITRE',
      packSize: '1.000', taxRate: '0', isReturnablePack: false, active: true,
    });
    expect(result.success).toBe(true);
  });
});

describe('productUnitLabel', () => {
  it('LITRE <1 -> ml', () => {
    expect(productUnitLabel({ uom: 'LITRE', packSize: '0.500' })).toBe('500 ml');
  });

  it('KG <1 -> g', () => {
    expect(productUnitLabel({ uom: 'KG', packSize: '0.400' })).toBe('400 g');
  });

  it('LITRE >=1 -> original unit', () => {
    expect(productUnitLabel({ uom: 'LITRE', packSize: '1.000' })).toBe('1 L');
  });

  it('KG >=1 -> original unit', () => {
    expect(productUnitLabel({ uom: 'KG', packSize: '5.000' })).toBe('5 kg');
  });

  it('piece -> label', () => {
    expect(productUnitLabel({ uom: 'PIECE', packSize: '1.000' })).toBe('1 pc');
  });

  it('pouch -> label', () => {
    expect(productUnitLabel({ uom: 'POUCH', packSize: '1.000' })).toBe('1 pouch');
  });

  it('ML -> label', () => {
    expect(productUnitLabel({ uom: 'ML', packSize: '325.000' })).toBe('325 ml');
  });

  it('GRAM -> label', () => {
    expect(productUnitLabel({ uom: 'GRAM', packSize: '180.000' })).toBe('180 g');
  });
});
