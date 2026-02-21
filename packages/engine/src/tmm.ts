/**
 * Transfer Matrix Method — core TMM engine.
 *
 * Computes reflectance R and transmittance T for a thin-film stack at a given wavelength.
 * Assumes normal incidence (θ = 0).
 */
import {
  cx, cMul, cDiv, cSub, cAdd, cCos, cSin, cAbs2, cScale,
  matMul, matIdentity, type Complex, type Mat2,
} from './complex.js';
import { getMaterial, type RefractiveIndex } from './materials.js';

export interface Layer {
  materialId: string;
  /** thickness in nm */
  thickness: number;
}

export interface StackDef {
  /** incident medium (default 'Air') */
  incident?: string;
  layers: Layer[];
  /** substrate material id */
  substrate: string;
}

export interface RTResult {
  R: number;
  T: number;
  A: number;
}

/** Complex refractive index η = n - ik (Macleod convention: exp(+iωt)) */
function eta(nk: RefractiveIndex): Complex {
  return cx(nk.n, -nk.k);
}

/** Build the characteristic matrix for a single layer at wavelength λ (nm) */
export function layerMatrix(materialId: string, thickness: number, lambdaNm: number): Mat2 {
  const nk = getMaterial(materialId).nk(lambdaNm);
  const n = eta(nk); // complex refractive index
  const delta: Complex = cScale(2 * Math.PI * thickness / lambdaNm, n); // phase δ = 2πnd/λ
  const cosD = cCos(delta);
  const sinD = cSin(delta);
  // M = [[cos δ, i·sin δ / η], [i·η·sin δ, cos δ]]
  const iSinD_over_n = cDiv(cMul(cx(0, 1), sinD), n);
  const iN_sinD = cMul(cMul(cx(0, 1), n), sinD);
  return [
    [cosD, iSinD_over_n],
    [iN_sinD, cosD],
  ];
}

/** Compute R, T for a full stack at wavelength λ (nm) */
export function computeRT(stack: StackDef, lambdaNm: number): RTResult {
  const incidentId = stack.incident ?? 'Air';
  const n0 = eta(getMaterial(incidentId).nk(lambdaNm));
  const ns = eta(getMaterial(stack.substrate).nk(lambdaNm));

  // System matrix = product of all layer matrices
  let M: Mat2 = matIdentity();
  for (const layer of stack.layers) {
    M = matMul(M, layerMatrix(layer.materialId, layer.thickness, lambdaNm));
  }

  const [m11, m12] = M[0];
  const [m21, m22] = M[1];

  // r = (n0·m11 + n0·ns·m12 - m21 - ns·m22) / (n0·m11 + n0·ns·m12 + m21 + ns·m22)
  const n0m11 = cMul(n0, m11);
  const n0nsm12 = cMul(cMul(n0, ns), m12);
  const nsm22 = cMul(ns, m22);

  const rNum = cSub(cSub(cAdd(n0m11, n0nsm12), m21), nsm22);
  const rDen = cAdd(cAdd(cAdd(n0m11, n0nsm12), m21), nsm22);
  const r = cDiv(rNum, rDen);

  // t = 2·n0 / denominator
  const t = cDiv(cScale(2, n0), rDen);

  const R = cAbs2(r);
  const T = (ns.re / n0.re) * cAbs2(t);
  const A = Math.max(0, 1 - R - T);

  return { R, T, A };
}
