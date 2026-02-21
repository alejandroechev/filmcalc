/**
 * Spectrum computation — sweep wavelengths and compute R/T/A.
 */
import { computeRT, type StackDef, type RTResult } from './tmm.js';

export interface SpectrumPoint {
  wavelength: number;
  R: number;
  T: number;
  A: number;
}

export interface SpectrumOptions {
  /** start wavelength in nm (default 300) */
  startNm?: number;
  /** end wavelength in nm (default 1100) */
  endNm?: number;
  /** step in nm (default 5) */
  stepNm?: number;
}

export function computeSpectrum(
  stack: StackDef,
  opts: SpectrumOptions = {},
): SpectrumPoint[] {
  const start = opts.startNm ?? 300;
  const end = opts.endNm ?? 1100;
  const step = opts.stepNm ?? 5;
  const points: SpectrumPoint[] = [];
  for (let lam = start; lam <= end; lam += step) {
    const { R, T, A } = computeRT(stack, lam);
    points.push({ wavelength: lam, R, T, A });
  }
  return points;
}

export interface SpectrumSummary {
  peakR: { wavelength: number; value: number };
  peakT: { wavelength: number; value: number };
  avgR_visible: number;
  avgT_visible: number;
}

/** Compute summary statistics from a spectrum */
export function summarizeSpectrum(points: SpectrumPoint[]): SpectrumSummary {
  let peakR = { wavelength: 0, value: -Infinity };
  let peakT = { wavelength: 0, value: -Infinity };
  let sumR = 0, sumT = 0, visCount = 0;

  for (const p of points) {
    if (p.R > peakR.value) peakR = { wavelength: p.wavelength, value: p.R };
    if (p.T > peakT.value) peakT = { wavelength: p.wavelength, value: p.T };
    if (p.wavelength >= 400 && p.wavelength <= 700) {
      sumR += p.R;
      sumT += p.T;
      visCount++;
    }
  }

  return {
    peakR,
    peakT,
    avgR_visible: visCount ? sumR / visCount : 0,
    avgT_visible: visCount ? sumT / visCount : 0,
  };
}
