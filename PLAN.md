# FilmCalc — Thin Film Optics (Transfer Matrix Method)

## Mission
Replace TFCalc / Essential Macleod (expensive Windows-only) with a free browser-based thin film calculator.

## Architecture
- `packages/engine/` — Transfer matrix method, material database, R/T spectrum computation
- `packages/web/` — React + Vite, layer stack editor, R/T spectrum chart
- `packages/cli/` — Node runner for batch computations

## MVP Features (Free Tier)
1. Define layer stack: substrate + up to 10 layers (material, thickness in nm)
2. Built-in material library (SiO2, TiO2, MgF2, Al, Ag, Au, Si, glass)
3. Compute R(λ) and T(λ) spectra from 300–1100 nm
4. Display R/T plot with hover-over values
5. Export spectrum as CSV + chart as PNG

## Engine Tasks

### E1: Material Database
- Refractive index n(λ) and extinction coefficient k(λ) for common materials
- SiO2, TiO2, MgF2, Si3N4, Al2O3, Ta2O5 (dielectrics)
- Al, Ag, Au, Cu (metals)
- BK7 glass, fused silica, Si (substrates)
- Data from published sources (Palik, RefractiveIndex.info — CC-licensed)
- Interpolation between tabulated wavelengths
- **Validation**: Compare n,k to RefractiveIndex.info at spot wavelengths

### E2: Transfer Matrix Method
- For each layer at wavelength λ:
  - Phase: `δ = 2π × n × d / λ`
  - Matrix: `M = [[cos(δ), i×sin(δ)/η], [i×η×sin(δ), cos(δ)]]`
  - η = n × cos(θ) for s-pol, n / cos(θ) for p-pol (normal incidence: η = n)
- System matrix: `M_total = M₁ × M₂ × ... × Mₙ`
- Reflectance: `r = (η₀M₁₁ + η₀ηsM₁₂ - M₂₁ - ηsM₂₂) / (η₀M₁₁ + η₀ηsM₁₂ + M₂₁ + ηsM₂₂)`
- R = |r|², T = (ηs/η₀) × |t|²
- **Validation**: Known single-layer anti-reflection coating at quarter-wave thickness

### E3: Spectrum Computation
- Loop wavelengths from 300nm to 1100nm (1nm or 5nm steps)
- At each λ: build transfer matrix, compute R and T
- Handle complex n+ik for absorbing materials
- **Validation**: Quarter-wave stack reflectance at design wavelength

### E4: Common Designs
- Quarter-wave anti-reflection (single layer MgF2 on glass)
- High-reflector (quarter-wave stack of H/L pairs)
- Bandpass filter
- **Validation**: Analytical solutions for QW designs

### E5: Export
- Spectrum data: wavelength, R, T, A (absorption = 1-R-T)
- Layer stack summary
- CSV export

## Web UI Tasks

### W1: Layer Stack Editor
- Table: Layer# | Material (dropdown) | Thickness (nm)
- Add/Remove/Reorder layers
- Substrate selector at bottom
- Color-coded layer visualization (vertical stack diagram)

### W2: R/T Spectrum Chart
- Recharts: wavelength (nm) x-axis, R/T (%) y-axis
- R and T as separate colored lines
- Hover: show exact R, T, A values at cursor wavelength
- Toggle R/T/A visibility

### W3: Layer Stack Diagram
- Visual representation of the film stack (horizontal bars)
- Thickness proportional to bar height
- Material color coding
- Light beam entering from top

### W4: Results Summary
- Peak reflectance/transmittance and wavelength
- Average R/T over visible range (400-700nm)

### W5: Export
- Download spectrum CSV
- Download chart as PNG/SVG
- Print-friendly design summary

### W6: Toolbar & Theme
- Add Layer, Compute, Export buttons
- Wavelength range selector
- Light/dark theme

## Key Equations
- Phase: `δ = 2πnd/λ`
- Transfer matrix per layer: `[[cos δ, i sin δ/η], [iη sin δ, cos δ]]`
- Fresnel reflection: `r = (η₀M₁₁ + η₀ηsM₁₂ - M₂₁ - ηsM₂₂) / (denom)`
- Quarter-wave: d = λ/(4n) → R_min at design wavelength

## Validation Strategy
- Single-layer QW AR coating: analytical R = ((n₁²-n₀ns)/(n₁²+n₀ns))²
- Multi-layer high-reflector: compare to published reflectance data
- RefractiveIndex.info published spectra for known designs
- Macleod textbook worked examples
