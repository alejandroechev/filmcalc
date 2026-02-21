import { describe, it, expect } from 'vitest';
import { getMaterial, listMaterials, listMaterialIds } from '../materials.js';

describe('Material Database (E1)', () => {
  it('lists known materials', () => {
    const ids = listMaterialIds();
    expect(ids).toContain('SiO2');
    expect(ids).toContain('TiO2');
    expect(ids).toContain('MgF2');
    expect(ids).toContain('Al');
    expect(ids).toContain('Ag');
    expect(ids).toContain('Au');
    expect(ids).toContain('Si');
    expect(ids).toContain('BK7');
    expect(ids).toContain('Air');
    expect(ids.length).toBeGreaterThanOrEqual(12);
  });

  it('SiO2 n ≈ 1.46 at 550nm (Malitson)', () => {
    const { n, k } = getMaterial('SiO2').nk(550);
    expect(n).toBeCloseTo(1.46, 1);
    expect(k).toBe(0);
  });

  it('TiO2 n ≈ 2.45 at 550nm', () => {
    const { n } = getMaterial('TiO2').nk(550);
    expect(n).toBeGreaterThan(2.2);
    expect(n).toBeLessThan(2.8);
  });

  it('MgF2 n ≈ 1.38 at 550nm', () => {
    const { n } = getMaterial('MgF2').nk(550);
    expect(n).toBeCloseTo(1.38, 1);
  });

  it('BK7 n ≈ 1.52 at 550nm', () => {
    const { n } = getMaterial('BK7').nk(550);
    expect(n).toBeCloseTo(1.52, 1);
  });

  it('Air n = 1', () => {
    const { n, k } = getMaterial('Air').nk(550);
    expect(n).toBe(1);
    expect(k).toBe(0);
  });

  it('Al has significant k (metallic)', () => {
    const { k } = getMaterial('Al').nk(550);
    expect(k).toBeGreaterThan(3);
  });

  it('Ag has significant k at 600nm', () => {
    const { k } = getMaterial('Ag').nk(600);
    expect(k).toBeGreaterThan(3);
  });

  it('Au has significant k at 700nm', () => {
    const { k } = getMaterial('Au').nk(700);
    expect(k).toBeGreaterThan(3);
  });

  it('Si n ≈ 3.9 at 600nm', () => {
    const { n } = getMaterial('Si').nk(600);
    expect(n).toBeCloseTo(3.9, 0);
  });

  it('throws for unknown material', () => {
    expect(() => getMaterial('UnknownMat')).toThrow('Unknown material');
  });

  it('interpolation works between tabulated points', () => {
    const { n: n400 } = getMaterial('Al').nk(400);
    const { n: n425 } = getMaterial('Al').nk(425);
    const { n: n450 } = getMaterial('Al').nk(450);
    // 425nm is between 400 and 450 — interpolated n should be between them
    expect(n425).toBeGreaterThan(Math.min(n400, n450) - 0.01);
    expect(n425).toBeLessThan(Math.max(n400, n450) + 0.01);
  });

  it('each material has a color', () => {
    for (const m of listMaterials()) {
      expect(m.color).toBeTruthy();
    }
  });
});
