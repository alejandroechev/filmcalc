/**
 * Material database — refractive index n(λ) + extinction coefficient k(λ).
 *
 * Data from published Sellmeier / Drude-Lorentz coefficients and tabulated values.
 * Wavelength λ is always in **nanometers**.
 */

export interface RefractiveIndex {
  n: number;
  k: number;
}

export interface MaterialDef {
  name: string;
  /** CSS color for stack visualisation */
  color: string;
  /** Returns {n, k} at wavelength λ (nm) */
  nk(lambdaNm: number): RefractiveIndex;
}

// ---------- helpers ----------

/** Sellmeier equation: n² = 1 + Σ Bᵢλ²/(λ²-Cᵢ)  — λ in µm internally */
function sellmeier(coeffs: [number, number][]): (lnm: number) => RefractiveIndex {
  return (lnm) => {
    const l2 = (lnm / 1000) ** 2; // µm²
    let n2 = 1;
    for (const [B, C] of coeffs) n2 += (B * l2) / (l2 - C);
    return { n: Math.sqrt(Math.max(n2, 1)), k: 0 };
  };
}

/** Linear interpolation of tabulated [λ(nm), n, k] data */
function tabulated(data: [number, number, number][]): (lnm: number) => RefractiveIndex {
  return (lnm) => {
    if (lnm <= data[0][0]) return { n: data[0][1], k: data[0][2] };
    if (lnm >= data[data.length - 1][0]) return { n: data[data.length - 1][1], k: data[data.length - 1][2] };
    for (let i = 0; i < data.length - 1; i++) {
      if (lnm >= data[i][0] && lnm <= data[i + 1][0]) {
        const t = (lnm - data[i][0]) / (data[i + 1][0] - data[i][0]);
        return {
          n: data[i][1] + t * (data[i + 1][1] - data[i][1]),
          k: data[i][2] + t * (data[i + 1][2] - data[i][2]),
        };
      }
    }
    return { n: data[0][1], k: data[0][2] };
  };
}

// ---------- material data ----------

/** SiO2 — fused silica (Malitson 1965 Sellmeier) */
const sio2Nk = sellmeier([
  [0.6961663, 0.0684043 ** 2],
  [0.4079426, 0.1162414 ** 2],
  [0.8974794, 9.896161 ** 2],
]);

/** TiO2 — thin-film amorphous (Siefke 2016, fit for 300-1100nm range) */
const tio2Nk = sellmeier([
  [4.1560, 0.2120 ** 2],
  [0.1300, 5.2000 ** 2],
]);

/** MgF2 — magnesium fluoride ordinary (Dodge 1984) */
const mgf2Nk = sellmeier([
  [0.48755108, 0.04338408 ** 2],
  [0.39875031, 0.09461442 ** 2],
  [2.3120353, 23.793604 ** 2],
]);

/** Si3N4 — silicon nitride (Luke 2015) */
const si3n4Nk = sellmeier([
  [3.0249, 0.1353406 ** 2],
  [40314.0, 1239.842 ** 2],
]);

/** Al2O3 — sapphire (Malitson 1962) */
const al2o3Nk = sellmeier([
  [1.4313493, 0.0726631 ** 2],
  [0.65054713, 0.1193242 ** 2],
  [5.3414021, 18.028251 ** 2],
]);

/** Ta2O5 — approx Sellmeier from Bright et al. */
const ta2o5Nk = sellmeier([
  [3.42, 0.178 ** 2],
  [0.10, 10.0 ** 2],
]);

/** BK7 — Schott BK7 glass Sellmeier */
const bk7Nk = sellmeier([
  [1.03961212, 0.00600069867],
  [0.231792344, 0.0200179144],
  [1.01046945, 103.560653],
]);

// Metals — tabulated n,k (Palik handbook, sampled at key wavelengths)
const alData: [number, number, number][] = [
  [300, 0.28, 3.61], [350, 0.37, 4.24], [400, 0.49, 4.86],
  [450, 0.62, 5.47], [500, 0.77, 6.08], [550, 0.93, 6.69],
  [600, 1.12, 7.26], [650, 1.35, 7.79], [700, 1.55, 8.31],
  [750, 1.83, 8.60], [800, 2.08, 8.45], [850, 2.15, 8.58],
  [900, 2.20, 8.80], [1000, 2.40, 9.60], [1100, 2.60, 10.40],
];

const agData: [number, number, number][] = [
  [300, 1.34, 0.93], [350, 1.60, 1.15], [400, 0.07, 1.93],
  [450, 0.04, 2.42], [500, 0.05, 2.87], [550, 0.06, 3.33],
  [600, 0.07, 3.75], [650, 0.08, 4.18], [700, 0.10, 4.58],
  [750, 0.11, 5.00], [800, 0.14, 5.38], [900, 0.17, 6.10],
  [1000, 0.21, 6.82], [1100, 0.26, 7.50],
];

const auData: [number, number, number][] = [
  [300, 1.55, 1.85], [350, 1.70, 1.87], [400, 1.68, 1.95],
  [450, 1.52, 1.83], [500, 0.83, 1.84], [550, 0.33, 2.32],
  [600, 0.17, 3.07], [650, 0.14, 3.70], [700, 0.13, 4.26],
  [750, 0.14, 4.79], [800, 0.16, 5.26], [900, 0.17, 6.15],
  [1000, 0.26, 6.93], [1100, 0.30, 7.70],
];

const cuData: [number, number, number][] = [
  [300, 1.38, 1.57], [350, 1.37, 1.76], [400, 1.39, 1.89],
  [450, 1.26, 2.10], [500, 1.04, 2.59], [550, 0.87, 2.60],
  [600, 0.22, 3.41], [650, 0.21, 3.67], [700, 0.21, 4.05],
  [800, 0.24, 4.74], [900, 0.27, 5.39], [1000, 0.32, 6.03],
  [1100, 0.37, 6.67],
];

/** Silicon — tabulated (Green & Keevers) */
const siData: [number, number, number][] = [
  [300, 4.97, 4.12], [350, 5.44, 3.56], [400, 5.57, 0.39],
  [450, 4.68, 0.14], [500, 4.30, 0.07], [550, 4.08, 0.04],
  [600, 3.94, 0.03], [650, 3.84, 0.02], [700, 3.77, 0.01],
  [750, 3.72, 0.008], [800, 3.68, 0.005], [900, 3.62, 0.002],
  [1000, 3.58, 0.001], [1100, 3.54, 0.0005],
];

// ---------- registry ----------

const materials: Map<string, MaterialDef> = new Map();

function reg(id: string, name: string, color: string, nk: (l: number) => RefractiveIndex) {
  materials.set(id, { name, color, nk });
}

// Dielectrics
reg('SiO2', 'SiO2 (Fused Silica)', '#8ecae6', sio2Nk);
reg('TiO2', 'TiO2 (Titanium Dioxide)', '#fb8500', tio2Nk);
reg('MgF2', 'MgF2 (Magnesium Fluoride)', '#b5e48c', mgf2Nk);
reg('Si3N4', 'Si3N4 (Silicon Nitride)', '#cdb4db', si3n4Nk);
reg('Al2O3', 'Al2O3 (Sapphire)', '#ffd6ff', al2o3Nk);
reg('Ta2O5', 'Ta2O5 (Tantalum Pentoxide)', '#e5989b', ta2o5Nk);
// Metals
reg('Al', 'Aluminium', '#adb5bd', tabulated(alData));
reg('Ag', 'Silver', '#dee2e6', tabulated(agData));
reg('Au', 'Gold', '#ffd700', tabulated(auData));
reg('Cu', 'Copper', '#d4840e', tabulated(cuData));
// Substrates
reg('BK7', 'BK7 Glass', '#a8dadc', bk7Nk);
reg('Si', 'Silicon', '#495057', tabulated(siData));
reg('Air', 'Air', '#ffffff', () => ({ n: 1, k: 0 }));

export function getMaterial(id: string): MaterialDef {
  const m = materials.get(id);
  if (!m) throw new Error(`Unknown material: ${id}`);
  return m;
}

export function listMaterials(): MaterialDef[] {
  return [...materials.values()];
}

export function listMaterialIds(): string[] {
  return [...materials.keys()];
}
