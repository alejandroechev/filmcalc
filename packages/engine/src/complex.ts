/** Complex number helpers — minimal, no dependencies */
export interface Complex {
  re: number;
  im: number;
}

export const cx = (re: number, im = 0): Complex => ({ re, im });

export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}
export function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}
export function cMul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
export function cDiv(a: Complex, b: Complex): Complex {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}
export function cAbs2(a: Complex): number {
  return a.re * a.re + a.im * a.im;
}
export function cCos(a: Complex): Complex {
  return { re: Math.cos(a.re) * Math.cosh(a.im), im: -Math.sin(a.re) * Math.sinh(a.im) };
}
export function cSin(a: Complex): Complex {
  return { re: Math.sin(a.re) * Math.cosh(a.im), im: Math.cos(a.re) * Math.sinh(a.im) };
}
export function cSqrt(a: Complex): Complex {
  const r = Math.sqrt(Math.sqrt(a.re * a.re + a.im * a.im));
  const theta = Math.atan2(a.im, a.re) / 2;
  return { re: r * Math.cos(theta), im: r * Math.sin(theta) };
}
export function cScale(s: number, a: Complex): Complex {
  return { re: s * a.re, im: s * a.im };
}

/** 2×2 complex matrix */
export type Mat2 = [[Complex, Complex], [Complex, Complex]];

export function matMul(a: Mat2, b: Mat2): Mat2 {
  return [
    [
      cAdd(cMul(a[0][0], b[0][0]), cMul(a[0][1], b[1][0])),
      cAdd(cMul(a[0][0], b[0][1]), cMul(a[0][1], b[1][1])),
    ],
    [
      cAdd(cMul(a[1][0], b[0][0]), cMul(a[1][1], b[1][0])),
      cAdd(cMul(a[1][0], b[0][1]), cMul(a[1][1], b[1][1])),
    ],
  ];
}

export function matIdentity(): Mat2 {
  return [
    [cx(1), cx(0)],
    [cx(0), cx(1)],
  ];
}
