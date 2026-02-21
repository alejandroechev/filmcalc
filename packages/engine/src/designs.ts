/**
 * Common thin-film designs with analytical validation.
 */
import type { StackDef } from './tmm.js';

/** Single-layer quarter-wave anti-reflection coating.
 *  d = λ_design / (4·n_layer) */
export function quarterWaveAR(
  layerMaterial: string,
  substrate: string,
  designWavelength: number,
  layerN: number,
): StackDef {
  const thickness = designWavelength / (4 * layerN);
  return {
    incident: 'Air',
    layers: [{ materialId: layerMaterial, thickness }],
    substrate,
  };
}

/** Analytical minimum reflectance for a single-layer QW AR coating.
 *  R_min = ((n_layer² - n0·ns) / (n_layer² + n0·ns))²  */
export function analyticalQWReflectance(n0: number, nLayer: number, nSub: number): number {
  const num = nLayer * nLayer - n0 * nSub;
  const den = nLayer * nLayer + n0 * nSub;
  return (num / den) ** 2;
}

/** Quarter-wave high-reflector stack: (H L)^N H on substrate */
export function highReflectorStack(
  highMat: string,
  lowMat: string,
  substrate: string,
  designWavelength: number,
  nH: number,
  nL: number,
  pairs: number,
): StackDef {
  const dH = designWavelength / (4 * nH);
  const dL = designWavelength / (4 * nL);
  const layers: { materialId: string; thickness: number }[] = [];
  for (let i = 0; i < pairs; i++) {
    layers.push({ materialId: highMat, thickness: dH });
    layers.push({ materialId: lowMat, thickness: dL });
  }
  layers.push({ materialId: highMat, thickness: dH });
  return { incident: 'Air', layers, substrate };
}

/** Analytical reflectance for (H L)^N H quarter-wave stack
 *  R = ((n0·ns - nH^(2N+2)/nL^(2N)) / (n0·ns + nH^(2N+2)/nL^(2N)))²  */
export function analyticalHRReflectance(
  n0: number, nH: number, nL: number, nSub: number, pairs: number,
): number {
  const ratio = (nH ** (2 * pairs + 2)) / (nL ** (2 * pairs));
  const num = n0 * nSub - ratio;
  const den = n0 * nSub + ratio;
  return (num / den) ** 2;
}
