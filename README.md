# Living Amyloid Evidence

This repository contains the public, static release of an interactive living
meta-analysis of anti-amyloid antibody trials in Alzheimer's disease.

The site explores how endpoint definitions, biomarker confirmation, plaque
clearance, drug inclusion, target class, and trial status change estimated
benefits and harms. It does not require a database or application server.

## Start here

- Visit the deployed evidence explorer: [Living Amyloid Evidence](https://amyloidab-ma.pages.dev/)
- Download the [primary reanalysis package](public/downloads/primary-reanalysis-package.zip), which contains the response-conforming analyses, data tables, figures, workbook, report, code, and a `REPRODUCIBILITY_GUIDE.md`.
- Download the [extended reanalysis package](public/downloads/extended-reanalysis-package.zip), which contains the agent-level, termination, target-class, safety, MID, moderator, influence, benefit-harm, and quality-control analyses, plus its own `REPRODUCIBILITY_GUIDE.md`.
- Browse the [evidence-update workflow](UPDATE_GUIDE.md) before changing the evidence registry or publishing a new release.

The reproducibility guides are the authoritative map from source inputs to
derived files. They document the exact run order, directory assumptions,
statistical conventions, output manifest, dependencies, and limitations. The
Cochrane source extract is not redistributed in these archives; a rerun
requires the separately supplied source package.

## How the published artifacts are generated

The analysis is organized as a transparent two-stage pipeline:

```text
Cochrane row-level and overall-estimate exports
        │
        ▼
primary reanalysis
  cleaning → Centiloid mapping → inclusion flags
  → scenario meta-analyses → raw mean differences
  → continuous-clearance meta-regression → QC/reproduction checks
        │
        ├── CSV/JSON result tables
        ├── workbook and PDF report
        └── static evidence registry used by the website
        │
        ▼
extended reanalysis
  agent, termination, target-class, safety, MID, moderator,
  influence, benefit-harm, percent-slowing, and QC analyses
```

Reports, workbooks, downloadable CSVs, and the website are presentation layers
over the generated result tables; they do not silently recalculate estimates
in the browser. The primary and extended scripts use inverse-variance
random-effects models with REML, Hartung–Knapp inference for analyses with at
least three studies, and Wald inference for one- or two-study analyses. Sparse
extended subgroup fits use the documented fallback only when needed.

## Repository structure

```text
public/                  Static assets deployed by Cloudflare Workers
  downloads/             Reports, workbooks, CSVs, and reproducibility packages
  evidence.json          Machine-readable evidence registry
  evidence-inline.js     Offline-compatible copy of the registry
scripts/                 Registry build and no-dependency publication checks
  build-evidence-data.mjs Regenerates evidence data and downloadable artifacts
  verify.mjs             Validates the deployable static release
wrangler.jsonc           Cloudflare Worker static-assets configuration
.github/workflows/       Automatic validation for pushes and pull requests
UPDATE_GUIDE.md          Evidence-update workflow
CLOUDFLARE_SETUP.md      One-time deployment instructions
PUBLICATION_CHECKLIST.md Checks required before public release
```

## Validate locally

Any recent Node.js installation can run the release check:

```bash
node scripts/verify.mjs
```

To rebuild the website data after updating the analysis outputs:

```bash
node scripts/build-evidence-data.mjs
npm test
npm run build
```

The evidence registry is embedded, so `public/index.html` can be opened
directly from disk and the interactive controls still work without a local
server.

## Scientific status

Evidence release: **0.1.0**  
Release date: **2026-08-15**

This is a research-synthesis resource, not individualized medical advice.
Subgroup and meta-regression results are aggregate-data analyses and should not
be interpreted as causal individual-level treatment-effect modifiers.
