import React from 'react';
import { listMaterialIds, getMaterial, type Layer } from '@filmcalc/engine';

interface Props {
  layers: Layer[];
  substrate: string;
  onUpdate: (idx: number, patch: Partial<Layer>) => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  onSubstrateChange: (id: string) => void;
}

const materialIds = listMaterialIds();
const substrates = ['BK7', 'SiO2', 'Si', 'Air'];

export function LayerEditor({ layers, substrate, onUpdate, onRemove, onMove, onSubstrateChange }: Props) {
  return (
    <div>
      {layers.length === 0 && (
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', padding: '8px 0' }}>
          No layers — bare substrate. Click "Add Layer" to begin.
        </p>
      )}
      {layers.length > 0 && (
        <table className="layer-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Material</th>
              <th>d (nm)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {layers.map((layer, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <select
                    value={layer.materialId}
                    onChange={e => onUpdate(i, { materialId: e.target.value })}
                  >
                    {materialIds.map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={layer.thickness}
                    onChange={e => onUpdate(i, { thickness: Math.max(1, Number(e.target.value)) })}
                  />
                </td>
                <td>
                  <div className="layer-actions">
                    <button className="btn-icon" title="Move up" onClick={() => onMove(i, -1)} disabled={i === 0}>↑</button>
                    <button className="btn-icon" title="Move down" onClick={() => onMove(i, 1)} disabled={i === layers.length - 1}>↓</button>
                    <button className="btn-icon" title="Remove" onClick={() => onRemove(i)} style={{ color: 'var(--danger)' }}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="substrate-row">
        <label>Substrate:</label>
        <select value={substrate} onChange={e => onSubstrateChange(e.target.value)}>
          {substrates.map(id => (
            <option key={id} value={id}>{id} — {getMaterial(id).name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
