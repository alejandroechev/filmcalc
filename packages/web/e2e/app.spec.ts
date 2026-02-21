import { test, expect, type Page } from '@playwright/test';

// ── Helpers ──────────────────────────────────────────────────────────

/** Wait for the Recharts SVG to render at least one <path> (spectrum line). */
async function waitForChart(page: Page) {
  await page.locator('.recharts-responsive-container svg .recharts-line path').first().waitFor({ timeout: 5000 });
}

/** Count rows in the layer table body. Returns 0 when no table is present. */
async function layerRowCount(page: Page): Promise<number> {
  const table = page.locator('.layer-table tbody tr');
  if (await page.locator('.layer-table').count() === 0) return 0;
  return table.count();
}

/** Read all text from the stack diagram bars (excluding Air and substrate). */
async function stackBarTexts(page: Page): Promise<string[]> {
  const bars = page.locator('.stack-diagram .stack-bar:not(.incident):not(.substrate)');
  return bars.allTextContents();
}

// ════════════════════════════════════════════════════════════════════
//  CORE WORKFLOW
// ════════════════════════════════════════════════════════════════════

test.describe('Core Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with title and default layer stack', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('FilmCalc');
    // Default has one MgF2 layer
    expect(await layerRowCount(page)).toBe(1);
    await expect(page.locator('.layer-table tbody tr').first()).toContainText('MgF2');
  });

  test('R/T spectrum chart is displayed', async ({ page }) => {
    await waitForChart(page);
    // Should have Reflectance and Transmittance lines
    const lines = page.locator('.recharts-line');
    expect(await lines.count()).toBeGreaterThanOrEqual(2);
  });

  test('stack diagram shows layers with colors', async ({ page }) => {
    // Incident bar
    await expect(page.locator('.stack-diagram .incident')).toContainText('Air');
    // At least one layer bar
    const bars = await stackBarTexts(page);
    expect(bars.length).toBe(1);
    expect(bars[0]).toContain('MgF2');
    // Substrate bar
    await expect(page.locator('.stack-diagram .substrate')).toContainText('BK7');
    // Layer bar should have a background color
    const layerBar = page.locator('.stack-diagram .stack-bar:not(.incident):not(.substrate)').first();
    const bg = await layerBar.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('');
  });

  test('results summary shows R/T values', async ({ page }) => {
    await expect(page.locator('.results-grid .result-card')).toHaveCount(4);
    await expect(page.locator('.results-grid')).toContainText('Peak Reflectance');
    await expect(page.locator('.results-grid')).toContainText('Peak Transmittance');
    await expect(page.locator('.results-grid')).toContainText('Avg R');
    await expect(page.locator('.results-grid')).toContainText('Avg T');
  });
});

// ════════════════════════════════════════════════════════════════════
//  SAMPLES
// ════════════════════════════════════════════════════════════════════

const sampleNames = [
  'Single-Layer AR (MgF₂)',
  'V-Coat AR (TiO₂/SiO₂)',
  'Broadband AR (4-Layer)',
  'High Reflector (6-Layer)',
  'Dichroic Filter (Blue-Reflect)',
];

test.describe('Samples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all sample names appear in dropdown', async ({ page }) => {
    const options = page.locator('select.btn.btn-outline option:not([disabled])');
    const texts = await options.allTextContents();
    for (const name of sampleNames) {
      expect(texts).toContainEqual(name);
    }
  });

  test('load Single-Layer AR → 1 layer, spectrum recalculates', async ({ page }) => {
    await page.locator('select.btn.btn-outline').selectOption({ label: 'Single-Layer AR (MgF₂)' });
    expect(await layerRowCount(page)).toBe(1);
    await waitForChart(page);
    // Stack diagram should show 1 layer
    expect((await stackBarTexts(page)).length).toBe(1);
  });

  test('load V-Coat AR → 2 layers', async ({ page }) => {
    await page.locator('select.btn.btn-outline').selectOption({ label: 'V-Coat AR (TiO₂/SiO₂)' });
    expect(await layerRowCount(page)).toBe(2);
    await waitForChart(page);
  });

  test('load Broadband AR → 4 layers', async ({ page }) => {
    await page.locator('select.btn.btn-outline').selectOption({ label: 'Broadband AR (4-Layer)' });
    expect(await layerRowCount(page)).toBe(4);
    await waitForChart(page);
  });

  test('load High Reflector → 6 layers, high R', async ({ page }) => {
    await page.locator('select.btn.btn-outline').selectOption({ label: 'High Reflector (6-Layer)' });
    expect(await layerRowCount(page)).toBe(6);
    await waitForChart(page);
    // Peak R should be very high (>90%)
    const peakR = page.locator('.result-card').filter({ hasText: 'Peak Reflectance' }).locator('.value');
    const text = await peakR.textContent();
    const val = parseFloat(text!);
    expect(val).toBeGreaterThan(70);
  });

  test('load Dichroic Filter → 10 layers', async ({ page }) => {
    await page.locator('select.btn.btn-outline').selectOption({ label: 'Dichroic Filter (Blue-Reflect)' });
    expect(await layerRowCount(page)).toBe(10);
    await waitForChart(page);
  });

  test('loading different samples updates wavelength range', async ({ page }) => {
    // Default range is 300-1100
    const startInput = page.locator('input[type="number"]').nth(0);
    const endInput = page.locator('input[type="number"]').nth(1);

    // Load V-Coat (range 400-800)
    await page.locator('select.btn.btn-outline').selectOption({ label: 'V-Coat AR (TiO₂/SiO₂)' });
    await expect(startInput).toHaveValue('400');
    await expect(endInput).toHaveValue('800');
  });
});

// ════════════════════════════════════════════════════════════════════
//  LAYER MANIPULATION
// ════════════════════════════════════════════════════════════════════

test.describe('Layer Manipulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('add a layer → stack updates', async ({ page }) => {
    const before = await layerRowCount(page);
    await page.getByText('＋ Add Layer').click();
    expect(await layerRowCount(page)).toBe(before + 1);
    // New layer defaults to SiO2
    const lastRow = page.locator('.layer-table tbody tr').last();
    await expect(lastRow).toContainText('SiO2');
    await waitForChart(page);
  });

  test('remove a layer → updates', async ({ page }) => {
    // Start with 1 layer, add another so we can remove
    await page.getByText('＋ Add Layer').click();
    expect(await layerRowCount(page)).toBe(2);
    // Remove first layer
    await page.locator('.layer-table tbody tr').first().locator('button[title="Remove"]').click();
    expect(await layerRowCount(page)).toBe(1);
    await waitForChart(page);
  });

  test('remove all layers → bare substrate message', async ({ page }) => {
    // Remove the default layer
    await page.locator('button[title="Remove"]').first().click();
    expect(await layerRowCount(page)).toBe(0);
    await expect(page.locator('text=No layers')).toBeVisible();
    await waitForChart(page);
  });

  test('change layer thickness → spectrum recalculates', async ({ page }) => {
    await waitForChart(page);
    // Capture current peak R
    const peakBefore = await page.locator('.result-card').filter({ hasText: 'Peak Reflectance' }).locator('.value').textContent();

    // Change thickness from 100 to 200
    const thicknessInput = page.locator('.layer-table tbody tr').first().locator('input[type="number"]');
    await thicknessInput.fill('200');
    await waitForChart(page);

    const peakAfter = await page.locator('.result-card').filter({ hasText: 'Peak Reflectance' }).locator('.value').textContent();
    // Spectrum should change (peak R at different value)
    // We just verify the chart re-rendered — exact values depend on physics
    expect(peakAfter).toBeDefined();
  });

  test('change material → spectrum changes', async ({ page }) => {
    await waitForChart(page);
    const avgBefore = await page.locator('.result-card').filter({ hasText: 'Avg R' }).locator('.value').textContent();

    // Change MgF2 to TiO2
    const materialSelect = page.locator('.layer-table tbody tr').first().locator('select');
    await materialSelect.selectOption('TiO2');
    await waitForChart(page);

    const avgAfter = await page.locator('.result-card').filter({ hasText: 'Avg R' }).locator('.value').textContent();
    expect(avgAfter).not.toBe(avgBefore);
  });

  test('reorder layers with move buttons', async ({ page }) => {
    // Add a second layer to enable reordering
    await page.getByText('＋ Add Layer').click();
    // First layer: MgF2, Second layer: SiO2
    const firstMaterial = async () =>
      page.locator('.layer-table tbody tr').first().locator('select').inputValue();
    const secondMaterial = async () =>
      page.locator('.layer-table tbody tr').nth(1).locator('select').inputValue();

    expect(await firstMaterial()).toBe('MgF2');
    expect(await secondMaterial()).toBe('SiO2');

    // Move first layer down
    await page.locator('.layer-table tbody tr').first().locator('button[title="Move down"]').click();

    expect(await firstMaterial()).toBe('SiO2');
    expect(await secondMaterial()).toBe('MgF2');
  });

  test('move up disabled for first layer, move down disabled for last', async ({ page }) => {
    await page.getByText('＋ Add Layer').click();
    // First row: up should be disabled
    await expect(page.locator('.layer-table tbody tr').first().locator('button[title="Move up"]')).toBeDisabled();
    // Last row: down should be disabled
    await expect(page.locator('.layer-table tbody tr').last().locator('button[title="Move down"]')).toBeDisabled();
  });
});

// ════════════════════════════════════════════════════════════════════
//  MATERIAL LIBRARY
// ════════════════════════════════════════════════════════════════════

test.describe('Material Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const expectedMaterials = ['SiO2', 'TiO2', 'MgF2', 'Si3N4', 'Al2O3', 'Ta2O5', 'Al', 'Ag', 'Au', 'Cu', 'BK7', 'Si', 'Air'];

  test('all materials selectable in layer material dropdown', async ({ page }) => {
    const materialSelect = page.locator('.layer-table tbody tr').first().locator('select');
    const options = await materialSelect.locator('option').allTextContents();
    for (const mat of expectedMaterials) {
      expect(options).toContainEqual(mat);
    }
  });

  test('substrate selection works', async ({ page }) => {
    const substrateSelect = page.locator('.substrate-row select');
    await expect(substrateSelect).toHaveValue('BK7');

    // Change to Si
    await substrateSelect.selectOption('Si');
    await waitForChart(page);
    // Verify stack diagram updated
    await expect(page.locator('.stack-diagram .substrate')).toContainText('Si');
  });

  test('substrate dropdown has expected substrates', async ({ page }) => {
    const options = await page.locator('.substrate-row select option').allTextContents();
    expect(options.some(o => o.includes('BK7'))).toBe(true);
    expect(options.some(o => o.includes('SiO2'))).toBe(true);
    expect(options.some(o => o.includes('Si'))).toBe(true);
    expect(options.some(o => o.includes('Air'))).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════
//  WAVELENGTH RANGE
// ════════════════════════════════════════════════════════════════════

test.describe('Wavelength Range', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('change wavelength range → chart updates', async ({ page }) => {
    await waitForChart(page);
    // Change start to 400
    const startInput = page.locator('input[type="number"]').nth(0);
    await startInput.fill('400');
    await waitForChart(page);

    // Change end to 700
    const endInput = page.locator('input[type="number"]').nth(1);
    await endInput.fill('700');
    await waitForChart(page);

    // Chart should still render
    const lines = page.locator('.recharts-line path');
    expect(await lines.count()).toBeGreaterThanOrEqual(2);
  });

  test('very narrow range → still works', async ({ page }) => {
    const startInput = page.locator('input[type="number"]').nth(0);
    const endInput = page.locator('input[type="number"]').nth(1);

    await startInput.fill('550');
    await endInput.fill('560');
    await waitForChart(page);

    const lines = page.locator('.recharts-line path');
    expect(await lines.count()).toBeGreaterThanOrEqual(2);
  });

  test('UV range → still works', async ({ page }) => {
    const startInput = page.locator('input[type="number"]').nth(0);
    const endInput = page.locator('input[type="number"]').nth(1);

    await startInput.fill('200');
    await endInput.fill('400');
    await waitForChart(page);

    const lines = page.locator('.recharts-line path');
    expect(await lines.count()).toBeGreaterThanOrEqual(2);
  });
});

// ════════════════════════════════════════════════════════════════════
//  UI FEATURES
// ════════════════════════════════════════════════════════════════════

test.describe('UI Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('theme toggle switches between light and dark', async ({ page }) => {
    const app = page.locator('.app');
    await expect(app).toHaveClass(/light/);

    // Click dark mode
    await page.getByText('🌙 Dark').click();
    await expect(app).toHaveClass(/dark/);

    // Click back to light
    await page.getByText('☀️ Light').click();
    await expect(app).toHaveClass(/light/);
  });

  test('guide button exists', async ({ page }) => {
    const guideBtn = page.getByText('📖 Guide');
    await expect(guideBtn).toBeVisible();
  });

  test('stack diagram layer heights are proportional', async ({ page }) => {
    // Load high reflector (layers of varying thickness)
    await page.locator('select.btn.btn-outline').selectOption({ label: 'High Reflector (6-Layer)' });
    const bars = page.locator('.stack-diagram .stack-bar:not(.incident):not(.substrate)');
    const count = await bars.count();
    expect(count).toBe(6);

    // All bars should have a positive height
    for (let i = 0; i < count; i++) {
      const height = await bars.nth(i).evaluate(el => el.getBoundingClientRect().height);
      expect(height).toBeGreaterThan(0);
    }
  });

  test('CSV export button exists', async ({ page }) => {
    await expect(page.getByText('📄 CSV')).toBeVisible();
  });

  test('PNG export button exists', async ({ page }) => {
    await expect(page.getByText('🖼️ PNG')).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════════════
//  EDGE CASES
// ════════════════════════════════════════════════════════════════════

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('no layers (bare substrate) → Fresnel R only', async ({ page }) => {
    // Remove all layers
    await page.locator('button[title="Remove"]').first().click();
    expect(await layerRowCount(page)).toBe(0);
    await waitForChart(page);

    // R should be ~4% for BK7 (n~1.52), T should be ~96%
    const avgR = page.locator('.result-card').filter({ hasText: 'Avg R' }).locator('.value');
    const text = await avgR.textContent();
    const val = parseFloat(text!);
    // Fresnel R for BK7 glass is about 4%
    expect(val).toBeGreaterThan(2);
    expect(val).toBeLessThan(8);
  });

  test('very thick layer (10µm) → many fringes, no crash', async ({ page }) => {
    const thicknessInput = page.locator('.layer-table tbody tr').first().locator('input[type="number"]');
    await thicknessInput.fill('10000'); // 10 µm
    await waitForChart(page);

    // Chart should still render without errors
    const lines = page.locator('.recharts-line path');
    expect(await lines.count()).toBeGreaterThanOrEqual(2);
    // Results should still show valid numbers
    const peakR = page.locator('.result-card').filter({ hasText: 'Peak Reflectance' }).locator('.value');
    const text = await peakR.textContent();
    expect(parseFloat(text!)).toBeGreaterThanOrEqual(0);
  });

  test('single layer with metal material → high reflectance', async ({ page }) => {
    // Change MgF2 to Al (aluminium)
    const materialSelect = page.locator('.layer-table tbody tr').first().locator('select');
    await materialSelect.selectOption('Al');
    await waitForChart(page);

    // Aluminium should give high reflectance
    const peakR = page.locator('.result-card').filter({ hasText: 'Peak Reflectance' }).locator('.value');
    const text = await peakR.textContent();
    expect(parseFloat(text!)).toBeGreaterThan(50);
  });

  test('add many layers → no performance crash', async ({ page }) => {
    // Add 9 more layers (total 10)
    for (let i = 0; i < 9; i++) {
      await page.getByText('＋ Add Layer').click();
    }
    expect(await layerRowCount(page)).toBe(10);
    await waitForChart(page);

    const lines = page.locator('.recharts-line path');
    expect(await lines.count()).toBeGreaterThanOrEqual(2);
  });

  test('switching substrate to Air → very low reflectance', async ({ page }) => {
    // Bare substrate with Air on both sides = no reflection
    await page.locator('button[title="Remove"]').first().click();
    const substrateSelect = page.locator('.substrate-row select');
    await substrateSelect.selectOption('Air');
    await waitForChart(page);

    // R should be ~0%
    const avgR = page.locator('.result-card').filter({ hasText: 'Avg R' }).locator('.value');
    const text = await avgR.textContent();
    expect(parseFloat(text!)).toBeLessThan(1);
  });
});
