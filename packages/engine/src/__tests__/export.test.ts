import { describe, it, expect } from 'vitest';
import { spectrumToCSV, layerSummary } from '../export.js';
import { computeSpectrum } from '../spectrum.js';
import type { StackDef } from '../tmm.js';

describe('Export (E5)', () => {
  const stack: StackDef = {
    layers: [
      { materialId: 'MgF2', thickness: 100 },
      { materialId: 'TiO2', thickness: 50 },
    ],
    substrate: 'BK7',
  };

  it('generates valid CSV header and rows', () => {
    const pts = computeSpectrum(stack, { startNm: 500, endNm: 510, stepNm: 5 });
    const csv = spectrumToCSV(pts);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Wavelength (nm),R (%),T (%),A (%)');
    expect(lines.length).toBe(4); // header + 3 data rows (500, 505, 510)
    // Check a data row has 4 columns
    expect(lines[1].split(',').length).toBe(4);
  });

  it('layerSummary returns correct structure', () => {
    const summary = layerSummary(stack);
    expect(summary.incident).toBe('Air');
    expect(summary.substrate).toBe('BK7');
    expect(summary.layers).toHaveLength(2);
    expect(summary.layers[0].material).toBe('MgF2');
    expect(summary.layers[0].thickness).toBe(100);
    expect(summary.layers[1].material).toBe('TiO2');
    expect(summary.layers[1].index).toBe(2);
  });
});
