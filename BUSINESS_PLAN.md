# FilmCalc — Business Plan

## 1. Product Overview

**FilmCalc** is a free, browser-based thin film optics calculator implementing the transfer matrix method (TMM) for multilayer reflectance and transmittance spectrum computation. It targets optical engineers, thin film coating technicians, and researchers who currently rely on expensive desktop software (Essential Macleod ~$5K/yr, TFCalc ~$3K/yr) or limited free tools (OpenFilters).

**Core value proposition:** Accurate TMM calculations with a built-in material library, interactive stack diagram, and real-time R/T spectrum — all running in the browser with zero installation.

## 2. Current State

### Test Coverage
- **68 tests total** (34 unit + 34 E2E)
- TMM engine validated against analytical solutions
- 11-material library (SiO2, TiO2, MgF2, Si3N4, Al2O3, Ta2O5, Al, Ag, Au, Cu, BK7)

### Market Research Scores
| Metric | Score |
|--------|-------|
| Pro Use (would professionals use this?) | 70% |
| Scales (can this scale to real workflows?) | 55% |
| Useful (does the free tier solve real problems?) | 80% |
| Incremental Premium (would users pay $199–349/yr?) | 60% |
| Major Premium (would users pay $499–799/yr?) | 75% |

### Competitive Landscape
| Product | Price | Strengths | Weaknesses |
|---------|-------|-----------|------------|
| Essential Macleod | ~$5,000/yr | Industry standard, full optimization, oblique angles | Expensive, Windows-only, dated UI |
| TFCalc | ~$3,000/yr | Comprehensive, good material database | Expensive, desktop-only |
| OpenFilters | Free | Open source, basic TMM | Limited UI, no active development |
| **FilmCalc** | **Free** | Browser-based, correct TMM, real-time spectrum | Normal incidence only, ~10 layers, no optimization |

### Current Strengths
- Correct TMM implementation validated against analytical solutions
- 11-material library with n,k dispersion data (Palik handbook, RefractiveIndex.info)
- Real-time R/T spectrum plot
- Interactive stack diagram with layer editing
- Zero installation, runs in any modern browser

### Current Weaknesses
- Normal incidence only (no oblique angle support)
- Limited to ~10 layers (no deep stack performance)
- No design optimization or target matching
- No custom material upload
- No export to coating machine formats

## 3. Validation Strategy

All engine calculations are validated against published reference data:

| Source | Method | Status |
|--------|--------|--------|
| Single-layer QW AR coating | Analytical: `R = ((n₁²−n₀ns)/(n₁²+n₀ns))²` | ✅ Passing |
| Macleod "Thin-Film Optical Filters" | Textbook worked examples (multilayer stacks) | ✅ Passing |
| RefractiveIndex.info | Published design spectra (CC-licensed data) | ✅ Passing |

**Validation requirements for new features:**
- Oblique angles: Fresnel s/p polarization against Hecht "Optics" examples
- Optimization: converge to known optimal AR/HR designs
- Group delay: compare against published chirped mirror GDD curves

## 4. Monetization Phases

### Phase 1 — Free Tier (Current)
**Price:** Free forever
**Features:**
- TMM calculation (normal incidence)
- 11-material built-in library
- R/T spectrum plot (real-time)
- Stack diagram editor
- Up to ~10 layers

**Goal:** Build user base, establish credibility, gather feedback.

### Phase 2 — Incremental Premium ($199–349/yr)
Target users who need production-capable features but can't justify $3–5K/yr.

| Feature | Effort | Revenue Impact |
|---------|--------|----------------|
| Oblique angle incidence (s/p polarization) | L | High — required for AR coatings, filters |
| Extended material library (50+ materials) | M | Medium — convenience, saves manual entry |
| Design optimization with targets | L | High — core workflow for coating engineers |
| Export to coating machine formats | M | Medium — bridges design to manufacturing |

**Oblique angles** unlocks the most common professional use case (designing coatings for non-normal incidence). **Optimization** transforms FilmCalc from a calculator into a design tool.

### Phase 3 — Major Premium ($499–799/yr)
Target professionals who currently pay $3–5K/yr for Macleod or TFCalc.

| Feature | Effort | Revenue Impact |
|---------|--------|----------------|
| Inverse design (target spectrum → stack) | XL | Very High — flagship differentiator |
| Tolerancing & sensitivity analysis | L | High — production QC requirement |
| Group delay dispersion (GDD) | M | Medium — ultrafast optics niche |
| Custom dispersion models (Sellmeier, Cauchy, Drude) | L | High — unlocks any material |

**Inverse design** is the killer feature — users specify a target R/T spectrum and FilmCalc generates an optimal layer stack. This is the primary reason professionals pay $5K/yr for Macleod.

## 5. Technical Architecture

```
filmcalc/
├── packages/
│   ├── engine/          # Pure TypeScript TMM engine (zero DOM deps)
│   │   ├── src/
│   │   │   ├── tmm.ts           # Transfer matrix method core
│   │   │   ├── materials.ts     # Material library (n,k data)
│   │   │   ├── stack.ts         # Layer stack model
│   │   │   └── spectrum.ts      # R/T spectrum computation
│   │   └── tests/
│   ├── web/             # React + Vite UI
│   │   ├── src/
│   │   │   ├── components/      # Stack editor, spectrum plot, material picker
│   │   │   └── store/           # Zustand with undo/redo
│   └── cli/             # Node runner for batch calculations
├── vercel.json
└── pnpm-workspace.yaml
```

**Key architectural decisions:**
- Engine is pure TypeScript with zero DOM dependencies — testable in Node
- Material library uses interpolated n,k tables (not curve fits) for accuracy
- Complex arithmetic via inline functions (no external library needed)
- Web Workers for expensive calculations (optimization, large stacks)

## 6. Go-to-Market Strategy

### Target Audiences
1. **Graduate students / researchers** — designing custom coatings, need quick R/T calculations
2. **Thin film coating technicians** — verifying designs, checking layer thicknesses
3. **Optical engineers** — designing AR, HR, bandpass, notch filters
4. **Ultrafast optics researchers** — chirped mirrors, GDD analysis (Phase 3)

### Channels
- **SEO:** "thin film calculator", "TMM calculator", "optical coating design tool"
- **Academic forums:** ResearchGate, optics subreddits, OSA/SPIE community boards
- **RefractiveIndex.info:** link partnership (they provide material data, we provide a calculator)
- **Content marketing:** tutorials on AR coating design, Bragg mirrors, metal-dielectric stacks

### Conversion Funnel
1. Free tier attracts students and researchers (high volume, low conversion)
2. Professional users hit normal-incidence limitation → Phase 2 upsell
3. Production users need optimization + tolerancing → Phase 3 upsell

## 7. Revenue Projections

| Phase | Timeline | Price | Target Users | ARR |
|-------|----------|-------|-------------|-----|
| Phase 1 (Free) | Now | $0 | 500+ | $0 |
| Phase 2 (Incremental) | +6 months | $199–349/yr | 50–100 | $10K–35K |
| Phase 3 (Major) | +12 months | $499–799/yr | 20–50 | $10K–40K |
| **Steady State** | +18 months | Mixed | 70–150 paid | **$20K–75K** |

**Key assumption:** Thin film optics is a smaller niche than stormwater or fire protection, but willingness to pay is high (current tools cost $3–5K/yr). Even a 10:1 price advantage at $499/yr is compelling.

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Macleod drops price or goes web | Low | High | Move fast, build community, offer better UX |
| OpenFilters revives development | Medium | Medium | Stay ahead on features, focus on UX/polish |
| TMM accuracy questioned | Low | High | Extensive validation suite, publish comparison data |
| Niche too small for revenue | Medium | Medium | Cross-sell with other optical tools (BeamLab) |
| Optimization algorithm complexity | Medium | Medium | Start with needle optimization, iterate to global |
| Custom material data licensing | Low | Medium | Use only CC-licensed or public-domain sources |
