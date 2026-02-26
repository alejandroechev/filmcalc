---
applyTo: "**"
---
# FilmCalc — Thin Film Optics (Transfer Matrix Method)

## Domain
- Optical thin film design and analysis
- Transfer matrix method for multilayer R/T spectrum computation
- Built-in material library (n,k dispersion data)
- Normal incidence reflectance and transmittance

## Key Equations
- Phase thickness: `δ = 2πnd/λ`
- Layer transfer matrix: `[[cos δ, i sin δ/η], [iη sin δ, cos δ]]`
- System matrix: `M = Mₙ × ... × M₁`
- Fresnel reflection: `r = (η₀M₁₁ + η₀ηsM₁₂ - M₂₁ - ηsM₂₂) / (denom)`
- Quarter-wave condition: `d = λ/(4n)`

## Material Database
- Dielectrics: SiO2, TiO2, MgF2, Si3N4, Al2O3, Ta2O5
- Metals: Al, Ag, Au, Cu
- Substrates: BK7 glass, fused silica, Si
- Data from Palik handbook and RefractiveIndex.info (CC-licensed)

## Validation Sources
- Single-layer QW AR: analytical `R = ((n₁²-n₀ns)/(n₁²+n₀ns))²`
- Macleod "Thin-Film Optical Filters" textbook examples
- RefractiveIndex.info published design spectra



# Code Implementation Flow

<important>Mandatory Development Loop (non-negotiable)</important>

## Git Workflow
- **Work directly on master** — solo developer, no branch overhead
- **Commit after every completed unit of work** — never leave working code uncommitted
- **Push after each work session** — remote backup is non-negotiable
- **Tag milestones**: `git tag v0.1.0-mvp` when deploying or reaching a checkpoint
- **Branch only for risky experiments** you might discard — delete after merge or abandon

## Preparation & Definitions
- Use Typescript as default language, unless told otherwise
- Work using TDD with red/green flow ALWAYS
- If its a webapp: Add always Playwright E2E tests
- Separate domain logic from CLI/UI/WebAPI, unless told otherwise
- Every UI/WebAPI feature should have parity with a CLI way of testing that feature

## Validation
After completing any feature:
- Run all new unit tests, validate coverage is over 90%
- Use cli to test new feature
- If its a UI impacting feature: run all e2e tests
- If its a UI impacting feature: do a visual validation using Playwright MCP, take screenshots as you tests and review the screenshots to verify visually all e2e flows and the new feature. <important>If Playwright MCP is not available stop and let the user know</important>

If any of the validations step fail, fix the underlying issue.

## Finishing
- Update documentation for the project based on changes
- <important>Always commit after you finish your work with a message that explain both what is done, the context and a trail of the though process you made </important>


# Deployment

- git push master branch will trigger CI/CD in Github
- CI/CD in Github will run tests, if they pass it will be deployed to Vercel https://filmcalc.vercel.app/
- Umami analytics and Feedback form with Supabase database