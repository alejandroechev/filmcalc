export { getMaterial, listMaterials, listMaterialIds, type MaterialDef, type RefractiveIndex } from './materials.js';
export { computeRT, layerMatrix, type Layer, type StackDef, type RTResult } from './tmm.js';
export { computeSpectrum, summarizeSpectrum, type SpectrumPoint, type SpectrumOptions, type SpectrumSummary } from './spectrum.js';
export { quarterWaveAR, analyticalQWReflectance, highReflectorStack, analyticalHRReflectance } from './designs.js';
export { spectrumToCSV, layerSummary, type LayerSummaryRow } from './export.js';
