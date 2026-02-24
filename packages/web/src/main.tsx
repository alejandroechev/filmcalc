import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import {
  listMaterialIds, getMaterial, computeSpectrum, summarizeSpectrum,
  spectrumToCSV, layerSummary,
  type StackDef, type Layer, type SpectrumPoint, type SpectrumSummary,
} from '@filmcalc/engine';
import { SpectrumChart } from './components/SpectrumChart';
import { LayerEditor } from './components/LayerEditor';
import { StackDiagram } from './components/StackDiagram';
import { ResultsSummary } from './components/ResultsSummary';
import { Toolbar, type RangePresetId } from './components/Toolbar';
import type { SampleConfig } from './samples';
import './style.css';

inject();

const DEFAULT_LAYERS: Layer[] = [
  { materialId: 'MgF2', thickness: 100 },
];

const STORAGE_KEY = 'filmcalc-state';

interface SavedState {
  layers: Layer[];
  substrate: string;
  startNm: number;
  endNm: number;
  stepNm: number;
  rangePreset?: RangePresetId;
}

function loadSavedState(): SavedState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch { return null; }
}

const RANGE_PRESETS: Record<Exclude<RangePresetId, 'custom'>, { start: number; end: number }> = {
  default: { start: 300, end: 1100 },
  uv: { start: 200, end: 400 },
  vis: { start: 400, end: 700 },
  visnir: { start: 400, end: 1100 },
  swir: { start: 900, end: 2500 },
  mwir: { start: 3000, end: 5000 },
  lwir: { start: 8000, end: 14000 },
};

function normalizeRange(startNm: number, endNm: number): { startNm: number; endNm: number } {
  const boundedStart = Math.max(200, Math.min(20000, Math.round(startNm)));
  const boundedEnd = Math.max(200, Math.min(20000, Math.round(endNm)));
  return boundedStart <= boundedEnd
    ? { startNm: boundedStart, endNm: boundedEnd }
    : { startNm: boundedEnd, endNm: boundedStart };
}

function detectPreset(startNm: number, endNm: number): RangePresetId {
  const matched = (Object.entries(RANGE_PRESETS) as Array<[Exclude<RangePresetId, 'custom'>, { start: number; end: number }]>)
    .find(([, range]) => range.start === startNm && range.end === endNm);
  return matched ? matched[0] : 'custom';
}

function App() {
  const saved = loadSavedState();
  const initialRange = normalizeRange(saved?.startNm ?? 300, saved?.endNm ?? 1100);
  const [layers, setLayers] = useState<Layer[]>(saved?.layers ?? DEFAULT_LAYERS);
  const [substrate, setSubstrate] = useState(saved?.substrate ?? 'BK7');
  const [startNm, setStartNm] = useState(initialRange.startNm);
  const [endNm, setEndNm] = useState(initialRange.endNm);
  const [stepNm, setStepNm] = useState(saved?.stepNm ?? 5);
  const [rangePreset, setRangePreset] = useState<RangePresetId>(
    saved?.rangePreset ?? detectPreset(initialRange.startNm, initialRange.endNm),
  );
  const [dark, setDark] = useState(() => localStorage.getItem('filmcalc-theme') === 'dark');
  const chartRef = useRef<HTMLDivElement>(null);
  const openFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('filmcalc-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Debounced persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ layers, substrate, startNm, endNm, stepNm, rangePreset })); } catch { /* noop */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [layers, substrate, startNm, endNm, stepNm, rangePreset]);

  const stack: StackDef = useMemo(() => ({
    incident: 'Air',
    layers,
    substrate,
  }), [layers, substrate]);

  const spectrum: SpectrumPoint[] = useMemo(
    () => computeSpectrum(stack, { startNm, endNm, stepNm }),
    [stack, startNm, endNm, stepNm],
  );

  const summary: SpectrumSummary = useMemo(
    () => summarizeSpectrum(spectrum),
    [spectrum],
  );

  const handleExportCSV = useCallback(() => {
    const csv = spectrumToCSV(spectrum);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filmcalc-spectrum.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [spectrum]);

  const handleExportPNG = useCallback(async () => {
    if (!chartRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(chartRef.current, { backgroundColor: dark ? '#1e1e1e' : '#ffffff' });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'filmcalc-chart.png';
    a.click();
  }, [dark]);

  const handleExportSVG = useCallback(() => {
    if (!chartRef.current) return;
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filmcalc-chart.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const addLayer = useCallback(() => {
    setLayers(l => [...l, { materialId: 'SiO2', thickness: 100 }]);
  }, []);

  const removeLayer = useCallback((idx: number) => {
    setLayers(l => l.filter((_, i) => i !== idx));
  }, []);

  const updateLayer = useCallback((idx: number, patch: Partial<Layer>) => {
    setLayers(l => l.map((layer, i) => i === idx ? { ...layer, ...patch } : layer));
  }, []);

  const handleNew = useCallback(() => {
    setLayers([...DEFAULT_LAYERS]);
    setSubstrate('BK7');
    setStartNm(300);
    setEndNm(1100);
    setStepNm(5);
    setRangePreset('default');
  }, []);

  const handleOpen = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target?.result as string) as SavedState;
        if (config.layers) setLayers(config.layers);
        if (config.substrate) setSubstrate(config.substrate);
        if (config.startNm && config.endNm) {
          const nextRange = normalizeRange(config.startNm, config.endNm);
          setStartNm(nextRange.startNm);
          setEndNm(nextRange.endNm);
          setRangePreset(config.rangePreset ?? detectPreset(nextRange.startNm, nextRange.endNm));
        }
        if (config.stepNm) setStepNm(config.stepNm);
      } catch { alert('Invalid JSON config file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleSave = useCallback(() => {
    const config: SavedState = { layers, substrate, startNm, endNm, stepNm, rangePreset };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'filmcalc-config.json'; a.click();
    URL.revokeObjectURL(url);
  }, [layers, substrate, startNm, endNm, stepNm]);

  const loadSample = useCallback((sample: SampleConfig) => {
    setLayers(sample.data.layers.map(l => ({ materialId: l.material, thickness: l.thickness })));
    setSubstrate(sample.data.substrate);
    const nextRange = normalizeRange(sample.data.wavelengthRange.startNm, sample.data.wavelengthRange.endNm);
    setStartNm(nextRange.startNm);
    setEndNm(nextRange.endNm);
    setRangePreset(detectPreset(nextRange.startNm, nextRange.endNm));
  }, []);

  const handleRangePreset = useCallback((preset: RangePresetId) => {
    setRangePreset(preset);
    if (preset === 'custom') return;
    const next = RANGE_PRESETS[preset];
    setStartNm(next.start);
    setEndNm(next.end);
  }, []);

  const handleStartNm = useCallback((value: number) => {
    const next = normalizeRange(value, endNm);
    setStartNm(next.startNm);
    setEndNm(next.endNm);
    setRangePreset(detectPreset(next.startNm, next.endNm));
  }, [endNm]);

  const handleEndNm = useCallback((value: number) => {
    const next = normalizeRange(startNm, value);
    setStartNm(next.startNm);
    setEndNm(next.endNm);
    setRangePreset(detectPreset(next.startNm, next.endNm));
  }, [startNm]);

  const moveLayer = useCallback((idx: number, dir: -1 | 1) => {
    setLayers(l => {
      const next = [...l];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return l;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🎞️ FilmCalc</h1>
        <span className="subtitle">Thin Film Optics Calculator</span>
      </header>

      <Toolbar
        startNm={startNm} endNm={endNm} stepNm={stepNm}
        rangePreset={rangePreset}
        onStartNm={handleStartNm} onEndNm={handleEndNm} onStepNm={setStepNm}
        onRangePreset={handleRangePreset}
        onAddLayer={addLayer}
        onLoadSample={loadSample}
        dark={dark} onToggleDark={() => setDark(d => !d)}
        onNew={handleNew}
        onOpenFile={() => openFileRef.current?.click()}
        onSave={handleSave}
      />
      <input ref={openFileRef} type="file" accept=".json" style={{ display: 'none' }}
        onChange={handleOpen} data-testid="open-file-input" />

      <div className="main-grid">
        <div className="panel editor-panel">
          <h2>Layer Stack</h2>
          <LayerEditor
            layers={layers}
            substrate={substrate}
            onUpdate={updateLayer}
            onRemove={removeLayer}
            onMove={moveLayer}
            onSubstrateChange={setSubstrate}
          />
        </div>

        <div className="panel stack-panel">
          <h2>Stack Diagram</h2>
          <StackDiagram layers={layers} substrate={substrate} />
        </div>

        <div className="panel chart-panel">
          <h2>R / T Spectrum
            <span className="panel-actions">
              <button onClick={handleExportPNG} title="Export PNG">🖼️ PNG</button>
              <button onClick={handleExportSVG} title="Export SVG">📐 SVG</button>
            </span>
          </h2>
          <div ref={chartRef}>
            <SpectrumChart spectrum={spectrum} dark={dark} />
          </div>
        </div>

        <div className="panel summary-panel">
          <h2>Results
            <span className="panel-actions">
              <button onClick={handleExportCSV} title="Export CSV">📄 CSV</button>
            </span>
          </h2>
          <ResultsSummary summary={summary} />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
