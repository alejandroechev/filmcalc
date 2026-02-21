import React from 'react';
import { getMaterial, type Layer } from '@filmcalc/engine';

interface Props {
  layers: Layer[];
  substrate: string;
}

export function StackDiagram({ layers, substrate }: Props) {
  const maxThick = Math.max(40, ...layers.map(l => l.thickness));

  return (
    <div className="stack-diagram">
      <div className="stack-bar incident">Air ↓ light</div>
      {layers.map((layer, i) => {
        const mat = getMaterial(layer.materialId);
        const h = Math.max(20, (layer.thickness / maxThick) * 80);
        return (
          <div
            key={i}
            className="stack-bar"
            style={{ backgroundColor: mat.color, height: h }}
            title={`${mat.name} — ${layer.thickness} nm`}
          >
            {layer.materialId} {layer.thickness}nm
          </div>
        );
      })}
      <div className="stack-bar substrate" style={{ backgroundColor: getMaterial(substrate).color }}>
        {substrate} (substrate)
      </div>
    </div>
  );
}
