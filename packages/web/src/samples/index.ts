export interface SampleConfig {
  id: string;
  name: string;
  description: string;
  data: {
    substrate: string;
    layers: { material: string; thickness: number }[];
    wavelengthRange: { startNm: number; endNm: number };
  };
}

export const samples: SampleConfig[] = [
  {
    id: 'single-ar',
    name: 'Single-Layer AR (MgF₂)',
    description: 'MgF₂ quarter-wave on BK7 at 550 nm — simplest AR coating',
    data: {
      substrate: 'BK7',
      layers: [
        { material: 'MgF2', thickness: 99.6 },   // λ/(4n) = 550/(4×1.38)
      ],
      wavelengthRange: { startNm: 300, endNm: 1100 },
    },
  },
  {
    id: 'vcoat-ar',
    name: 'V-Coat AR (TiO₂/SiO₂)',
    description: 'Two-layer V-coat on BK7 optimized for near-zero R at 550 nm',
    data: {
      substrate: 'BK7',
      layers: [
        { material: 'SiO2', thickness: 94.2 },    // outer — low index QW
        { material: 'TiO2', thickness: 51.9 },     // inner — high index QW
      ],
      wavelengthRange: { startNm: 400, endNm: 800 },
    },
  },
  {
    id: 'broadband-ar',
    name: 'Broadband AR (4-Layer)',
    description: 'Al₂O₃/TiO₂/SiO₂/MgF₂ on BK7 — low R across 400–700 nm visible range',
    data: {
      substrate: 'BK7',
      layers: [
        { material: 'MgF2', thickness: 92.0 },    // outer — lowest index
        { material: 'SiO2', thickness: 16.0 },
        { material: 'TiO2', thickness: 105.0 },
        { material: 'Al2O3', thickness: 75.0 },    // inner — medium index
      ],
      wavelengthRange: { startNm: 350, endNm: 800 },
    },
  },
  {
    id: 'high-reflector',
    name: 'High Reflector (6-Layer)',
    description: 'Alternating TiO₂/SiO₂ quarter-wave stack on BK7 — >99% R at 633 nm',
    data: {
      substrate: 'BK7',
      layers: [
        // 3 pairs (H L) at 633 nm, outer to inner
        { material: 'SiO2', thickness: 108.4 },   // λ/(4n) = 633/(4×1.46)
        { material: 'TiO2', thickness: 59.7 },    // λ/(4n) = 633/(4×2.65)
        { material: 'SiO2', thickness: 108.4 },
        { material: 'TiO2', thickness: 59.7 },
        { material: 'SiO2', thickness: 108.4 },
        { material: 'TiO2', thickness: 59.7 },
      ],
      wavelengthRange: { startNm: 400, endNm: 900 },
    },
  },
  {
    id: 'dichroic',
    name: 'Dichroic Filter (Blue-Reflect)',
    description: '10-layer TiO₂/SiO₂ stack — reflects blue (<500 nm), transmits red',
    data: {
      substrate: 'BK7',
      layers: [
        // 5 pairs (H L) at 480 nm design wavelength
        { material: 'SiO2', thickness: 82.2 },    // λ/(4n) = 480/(4×1.46)
        { material: 'TiO2', thickness: 45.3 },    // λ/(4n) = 480/(4×2.65)
        { material: 'SiO2', thickness: 82.2 },
        { material: 'TiO2', thickness: 45.3 },
        { material: 'SiO2', thickness: 82.2 },
        { material: 'TiO2', thickness: 45.3 },
        { material: 'SiO2', thickness: 82.2 },
        { material: 'TiO2', thickness: 45.3 },
        { material: 'SiO2', thickness: 82.2 },
        { material: 'TiO2', thickness: 45.3 },
      ],
      wavelengthRange: { startNm: 350, endNm: 800 },
    },
  },
];
