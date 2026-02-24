import React, { useState } from 'react';
import { samples, type SampleConfig } from '../samples';
import { FeedbackModal } from './FeedbackModal';

export type RangePresetId =
  | 'default'
  | 'uv'
  | 'vis'
  | 'visnir'
  | 'swir'
  | 'mwir'
  | 'lwir'
  | 'custom';

interface Props {
  startNm: number;
  endNm: number;
  stepNm: number;
  rangePreset: RangePresetId;
  onStartNm: (v: number) => void;
  onEndNm: (v: number) => void;
  onStepNm: (v: number) => void;
  onRangePreset: (preset: RangePresetId) => void;
  onAddLayer: () => void;
  onLoadSample: (sample: SampleConfig) => void;
  dark: boolean;
  onToggleDark: () => void;
  onNew: () => void;
  onOpenFile: () => void;
  onSave: () => void;
}

export function Toolbar({
  startNm, endNm, stepNm,
  rangePreset,
  onStartNm, onEndNm, onStepNm, onRangePreset,
  onAddLayer, onLoadSample,
  dark, onToggleDark,
  onNew, onOpenFile, onSave,
}: Props) {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="toolbar">
      <div className="toolbar-row toolbar-row-main">
        <button className="btn" data-testid="new-btn" onClick={onNew}>📄 New</button>
        <button className="btn" data-testid="open-btn" onClick={onOpenFile}>📂 Open</button>

        <select
          className="btn btn-outline"
          data-testid="sample-select"
          value=""
          onChange={e => {
            const s = samples.find(s => s.id === e.target.value);
            if (s) onLoadSample(s);
          }}
        >
          <option value="" disabled>📂 Samples</option>
          {samples.map(s => (
            <option key={s.id} value={s.id} title={s.description}>{s.name}</option>
          ))}
        </select>

        <button className="btn" data-testid="save-btn" onClick={onSave}>💾 Save</button>

        <div className="spacer" />

        <button className="btn btn-outline" onClick={() => window.open('/intro.html', '_blank')}>📖 Guide</button>
        <button className="btn btn-outline" onClick={() => setShowFeedback(true)} title="Feedback">💬 Feedback</button>
        <a href="https://github.com/alejandroechev/filmcalc" target="_blank" rel="noopener" className="github-link">GitHub</a>
        <button className="btn btn-outline" data-testid="theme-toggle" onClick={onToggleDark}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="toolbar-row toolbar-row-controls">
        <button className="btn" onClick={onAddLayer}>＋ Add Layer</button>

        <label>Range</label>
        <select
          className="btn btn-outline range-select"
          data-testid="range-preset-select"
          value={rangePreset}
          onChange={e => onRangePreset(e.target.value as RangePresetId)}
        >
          <option value="default">Default (300–1100)</option>
          <option value="uv">UV (200–400)</option>
          <option value="vis">VIS (400–700)</option>
          <option value="visnir">VIS-NIR (400–1100)</option>
          <option value="swir">SWIR (900–2500)</option>
          <option value="mwir">MWIR (3000–5000)</option>
          <option value="lwir">LWIR (8000–14000)</option>
          <option value="custom">Custom</option>
        </select>

        <label>λ start</label>
        <input type="number" value={startNm} min={200} max={20000}
          onChange={e => onStartNm(Number(e.target.value))} />

        <label>λ end</label>
        <input type="number" value={endNm} min={200} max={20000}
          onChange={e => onEndNm(Number(e.target.value))} />

        <label>step</label>
        <input type="number" value={stepNm} min={1} max={200}
          onChange={e => onStepNm(Math.max(1, Number(e.target.value)))} />
      </div>
      <FeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} product="FilmCalc" />
    </div>
  );
}
