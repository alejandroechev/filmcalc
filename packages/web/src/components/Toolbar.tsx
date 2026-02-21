import React from 'react';

interface Props {
  startNm: number;
  endNm: number;
  stepNm: number;
  onStartNm: (v: number) => void;
  onEndNm: (v: number) => void;
  onStepNm: (v: number) => void;
  onAddLayer: () => void;
  onExportCSV: () => void;
  onExportPNG: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

export function Toolbar({
  startNm, endNm, stepNm,
  onStartNm, onEndNm, onStepNm,
  onAddLayer, onExportCSV, onExportPNG,
  dark, onToggleDark,
}: Props) {
  return (
    <div className="toolbar">
      <button className="btn" onClick={onAddLayer}>＋ Add Layer</button>

      <div className="spacer" />

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

      <button className="btn btn-outline" onClick={onExportCSV}>📄 CSV</button>
      <button className="btn btn-outline" onClick={onExportPNG}>🖼️ PNG</button>
      <button className="btn btn-outline" onClick={() => window.open('/intro.html', '_blank')}>📖 Guide</button>
      <button className="btn btn-outline" onClick={onToggleDark}>
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}
