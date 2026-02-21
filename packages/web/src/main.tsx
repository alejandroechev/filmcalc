import React, { useState, useCallback, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  listMaterialIds, getMaterial, computeSpectrum, summarizeSpectrum,
  spectrumToCSV, layerSummary,
  type StackDef, type Layer, type SpectrumPoint, type SpectrumSummary,
} from '@filmcalc/engine';
import { SpectrumChart } from './components/SpectrumChart';
import { LayerEditor } from './components/LayerEditor';
import { StackDiagram } from './components/StackDiagram';
import { ResultsSummary } from './components/ResultsSummary';
import { Toolbar } from './components/Toolbar';
import type { SampleConfig } from './samples';
import './style.css';

const DEFAULT_LAYERS: Layer[] = [
  { materialId: 'MgF2', thickness: 100 },
];

function App() {
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [substrate, setSubstrate] = useState('BK7');
  const [startNm, setStartNm] = useState(300);
  const [endNm, setEndNm] = useState(1100);
  const [stepNm, setStepNm] = useState(5);
  const [dark, setDark] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

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

  const addLayer = useCallback(() => {
    setLayers(l => [...l, { materialId: 'SiO2', thickness: 100 }]);
  }, []);

  const removeLayer = useCallback((idx: number) => {
    setLayers(l => l.filter((_, i) => i !== idx));
  }, []);

  const updateLayer = useCallback((idx: number, patch: Partial<Layer>) => {
    setLayers(l => l.map((layer, i) => i === idx ? { ...layer, ...patch } : layer));
  }, []);

  const loadSample = useCallback((sample: SampleConfig) => {
    setLayers(sample.data.layers.map(l => ({ materialId: l.material, thickness: l.thickness })));
    setSubstrate(sample.data.substrate);
    setStartNm(sample.data.wavelengthRange.startNm);
    setEndNm(sample.data.wavelengthRange.endNm);
  }, []);

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
    <div className={`app ${dark ? 'dark' : 'light'}`}>
      <header className="header">
        <h1>🎞️ FilmCalc</h1>
        <span className="subtitle">Thin Film Optics Calculator</span>
      </header>

      <Toolbar
        startNm={startNm} endNm={endNm} stepNm={stepNm}
        onStartNm={setStartNm} onEndNm={setEndNm} onStepNm={setStepNm}
        onAddLayer={addLayer}
        onLoadSample={loadSample}
        onExportCSV={handleExportCSV}
        onExportPNG={handleExportPNG}
        dark={dark} onToggleDark={() => setDark(d => !d)}
      />

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

        <div className="panel chart-panel">
          <h2>R / T Spectrum</h2>
          <div ref={chartRef}>
            <SpectrumChart spectrum={spectrum} />
          </div>
        </div>

        <div className="panel stack-panel">
          <h2>Stack Diagram</h2>
          <StackDiagram layers={layers} substrate={substrate} />
        </div>

        <div className="panel summary-panel">
          <h2>Results</h2>
          <ResultsSummary summary={summary} />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
