import { describe, it, expect } from 'vitest';
import { computeRT, type StackDef } from '../tmm.js';

describe('Transfer Matrix Method (E2)', () => {
  it('bare BK7 substrate — Fresnel reflection ≈ 4.2%', () => {
    const stack: StackDef = { layers: [], substrate: 'BK7' };
    const { R, T } = computeRT(stack, 550);
    // Fresnel: R = ((n-1)/(n+1))² ≈ ((1.52-1)/(1.52+1))² ≈ 0.0426
    expect(R).toBeCloseTo(0.0426, 2);
    expect(T).toBeCloseTo(1 - R, 2);
  });

  it('Air→Air gives R=0, T=1', () => {
    const stack: StackDef = { layers: [], substrate: 'Air' };
    const { R, T } = computeRT(stack, 550);
    expect(R).toBeCloseTo(0, 6);
    expect(T).toBeCloseTo(1, 6);
  });

  it('single SiO2 layer on BK7', () => {
    const stack: StackDef = {
      layers: [{ materialId: 'SiO2', thickness: 100 }],
      substrate: 'BK7',
    };
    const { R, T, A } = computeRT(stack, 550);
    expect(R).toBeGreaterThanOrEqual(0);
    expect(R).toBeLessThanOrEqual(1);
    expect(T).toBeGreaterThanOrEqual(0);
    expect(T).toBeLessThanOrEqual(1);
    expect(A).toBeCloseTo(0, 2); // SiO2 is transparent
    expect(R + T + A).toBeCloseTo(1, 4);
  });

  it('R + T + A = 1 for absorbing metal layer', () => {
    const stack: StackDef = {
      layers: [{ materialId: 'Al', thickness: 20 }],
      substrate: 'BK7',
    };
    const { R, T, A } = computeRT(stack, 550);
    expect(R + T + A).toBeCloseTo(1, 2);
    expect(A).toBeGreaterThan(0); // metal absorbs
  });

  it('thick Al layer gives high reflectance', () => {
    const stack: StackDef = {
      layers: [{ materialId: 'Al', thickness: 200 }],
      substrate: 'BK7',
    };
    const { R } = computeRT(stack, 550);
    expect(R).toBeGreaterThan(0.85);
  });

  it('quarter-wave MgF2 on BK7 at design wavelength', () => {
    const nMgF2 = 1.38; // approx at 550nm
    const dQW = 550 / (4 * nMgF2);
    const stack: StackDef = {
      layers: [{ materialId: 'MgF2', thickness: dQW }],
      substrate: 'BK7',
    };
    const { R } = computeRT(stack, 550);
    // Analytical: R_min = ((1.38²-1×1.52)/(1.38²+1×1.52))² ≈ 0.012
    expect(R).toBeLessThan(0.02);
  });
});
