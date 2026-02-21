/**
 * Export utilities — CSV generation and layer summary.
 */
import type { SpectrumPoint } from './spectrum.js';
import type { StackDef } from './tmm.js';
import { getMaterial } from './materials.js';

/** Generate CSV string from spectrum data */
export function spectrumToCSV(points: SpectrumPoint[]): string {
  const lines = ['Wavelength (nm),R (%),T (%),A (%)'];
  for (const p of points) {
    lines.push(`${p.wavelength},${(p.R * 100).toFixed(4)},${(p.T * 100).toFixed(4)},${(p.A * 100).toFixed(4)}`);
  }
  return lines.join('\n');
}

export interface LayerSummaryRow {
  index: number;
  material: string;
  materialName: string;
  thickness: number;
}

/** Generate a layer summary table */
export function layerSummary(stack: StackDef): {
  incident: string;
  substrate: string;
  layers: LayerSummaryRow[];
} {
  return {
    incident: stack.incident ?? 'Air',
    substrate: stack.substrate,
    layers: stack.layers.map((l, i) => ({
      index: i + 1,
      material: l.materialId,
      materialName: getMaterial(l.materialId).name,
      thickness: l.thickness,
    })),
  };
}
