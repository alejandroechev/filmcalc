import React from 'react';
import { samples, type SampleConfig } from '../samples';

interface Props {
  startNm: number;
  endNm: number;
  stepNm: number;
  onStartNm: (v: number) => void;
  onEndNm: (v: number) => void;
  onStepNm: (v: number) => void;
  onAddLayer: () => void;
  onLoadSample: (sample: SampleConfig) => void;
  dark: boolean;
  onToggleDark: () => void;
}

export function Toolbar({
  startNm, endNm, stepNm,
  onStartNm, onEndNm, onStepNm,
  onAddLayer, onLoadSample,
  dark, onToggleDark,
}: Props) {
  return (
    <div className="toolbar">
      <button className="btn" onClick={onAddLayer}>＋ Add Layer</button>

      <select
        className="btn btn-outline"
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

      <label>λ start</label>
      <input type="number" value={startNm} min={200} max={2000}
        onChange={e => onStartNm(Number(e.target.value))} />

      <label>λ end</label>
      <input type="number" value={endNm} min={200} max={2000}
        onChange={e => onEndNm(Number(e.target.value))} />

      <label>step</label>
      <input type="number" value={stepNm} min={1} max={50}
        onChange={e => onStepNm(Math.max(1, Number(e.target.value)))} />

      <div className="spacer" />

      <button className="btn btn-outline" onClick={() => window.open('/intro.html', '_blank')}>📖 Guide</button>
      <button className="btn btn-outline" onClick={() => window.open('https://github.com/alejandroechev/filmcalc/issues/new', '_blank')} title="Feedback">💬 Feedback</button>
      <button className="btn btn-outline" data-testid="theme-toggle" onClick={onToggleDark}>
        {dark ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
