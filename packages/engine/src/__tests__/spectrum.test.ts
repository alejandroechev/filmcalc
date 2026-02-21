import { describe, it, expect } from 'vitest';
import { computeSpectrum, summarizeSpectrum } from '../spectrum.js';
import type { StackDef } from '../tmm.js';

describe('Spectrum Computation (E3)', () => {
  const bareGlass: StackDef = { layers: [], substrate: 'BK7' };

  it('produces correct number of points', () => {
    const pts = computeSpectrum(bareGlass, { startNm: 400, endNm: 700, stepNm: 10 });
    expect(pts.length).toBe(31); // (700-400)/10 + 1
  });

  it('each point has wavelength, R, T, A', () => {
    const pts = computeSpectrum(bareGlass, { startNm: 500, endNm: 600, stepNm: 50 });
    for (const p of pts) {
      expect(p.wavelength).toBeGreaterThanOrEqual(500);
      expect(p.R).toBeGreaterThanOrEqual(0);
      expect(p.T).toBeGreaterThanOrEqual(0);
      expect(p.R + p.T + p.A).toBeCloseTo(1, 3);
    }
  });

  it('R + T + A ≈ 1 for dielectric across full range', () => {
    const pts = computeSpectrum(bareGlass);
    for (const p of pts) {
      expect(p.R + p.T + p.A).toBeCloseTo(1, 3);
    }
  });

  it('default range is 300–1100 step 5', () => {
    const pts = computeSpectrum(bareGlass);
    expect(pts[0].wavelength).toBe(300);
    expect(pts[pts.length - 1].wavelength).toBe(1100);
    expect(pts.length).toBe(161); // (1100-300)/5 + 1
  });

  it('quarter-wave AR shows dip near design wavelength', () => {
    const nMgF2 = 1.38;
    const design = 550;
    const dQW = design / (4 * nMgF2);
    const stack: StackDef = {
      layers: [{ materialId: 'MgF2', thickness: dQW }],
      substrate: 'BK7',
    };
    const pts = computeSpectrum(stack, { startNm: 400, endNm: 700, stepNm: 5 });
    // Find minimum R
    let minR = Infinity;
    let minLam = 0;
    for (const p of pts) {
      if (p.R < minR) { minR = p.R; minLam = p.wavelength; }
    }
    // Design wavelength should be near the minimum
    expect(Math.abs(minLam - design)).toBeLessThan(30);
    expect(minR).toBeLessThan(0.02);
  });
});

describe('Spectrum Summary', () => {
  it('computes peaks and visible averages', () => {
    const stack: StackDef = { layers: [], substrate: 'BK7' };
    const pts = computeSpectrum(stack);
    const summary = summarizeSpectrum(pts);
    expect(summary.peakR.value).toBeGreaterThan(0);
    expect(summary.peakT.value).toBeGreaterThan(0);
    expect(summary.avgR_visible).toBeGreaterThan(0);
    expect(summary.avgT_visible).toBeGreaterThan(0);
    expect(summary.avgR_visible + summary.avgT_visible).toBeCloseTo(1, 1);
  });
});
