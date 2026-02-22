import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { SpectrumPoint } from '@filmcalc/engine';

interface Props {
  spectrum: SpectrumPoint[];
  dark?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div><strong>{label} nm</strong></div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {(p.value * 100).toFixed(2)}%
        </div>
      ))}
    </div>
  );
}

export function SpectrumChart({ spectrum, dark }: Props) {
  const data = spectrum.map(p => ({
    wavelength: p.wavelength,
    R: p.R,
    T: p.T,
    A: p.A,
  }));

  const axisColor = dark ? '#adb5bd' : '#495057';

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="wavelength"
          label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -2, fontSize: 12, fill: axisColor }}
          tick={{ fontSize: 11, fill: axisColor }}
        />
        <YAxis
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          domain={[0, 1]}
          label={{ value: 'R / T (%)', angle: -90, position: 'insideLeft', fontSize: 12, fill: axisColor }}
          tick={{ fontSize: 11, fill: axisColor }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="R" name="Reflectance" stroke="#e63946" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="T" name="Transmittance" stroke="#457b9d" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="A" name="Absorptance" stroke="#6c757d" dot={false} strokeWidth={1} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
