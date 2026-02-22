import React from 'react';
import type { SpectrumSummary } from '@filmcalc/engine';

interface Props {
  summary: SpectrumSummary;
}

export function ResultsSummary({ summary }: Props) {
  return (
    <div className="results-grid">
      <div className="result-card">
        <div className="label">Peak Reflectance</div>
        <div className="value" style={{ color: 'var(--color-r)' }}>
          {(summary.peakR.value * 100).toFixed(1)}%
        </div>
        <div className="sub">at {summary.peakR.wavelength} nm</div>
      </div>

      <div className="result-card">
        <div className="label">Peak Transmittance</div>
        <div className="value" style={{ color: 'var(--color-t)' }}>
          {(summary.peakT.value * 100).toFixed(1)}%
        </div>
        <div className="sub">at {summary.peakT.wavelength} nm</div>
      </div>

      <div className="result-card">
        <div className="label">Avg R (visible)</div>
        <div className="value">
          {(summary.avgR_visible * 100).toFixed(2)}%
        </div>
        <div className="sub">400–700 nm</div>
      </div>

      <div className="result-card">
        <div className="label">Avg T (visible)</div>
        <div className="value">
          {(summary.avgT_visible * 100).toFixed(2)}%
        </div>
        <div className="sub">400–700 nm</div>
      </div>
    </div>
  );
}
