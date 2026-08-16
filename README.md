# Living Amyloid Evidence

This repository contains the public, static release of an interactive living
meta-analysis of anti-amyloid antibody trials in Alzheimer's disease.

The site explores how endpoint definitions, biomarker confirmation, plaque
clearance, drug inclusion, target class, and trial status change estimated
benefits and harms. It does not require a database or application server.

## Start here

- Visit the deployed evidence explorer: [Living Amyloid Evidence](https://amyloidab-ma.pages.dev/)
- Download the single [unified reproducibility package](public/downloads/reproducibility-package.zip).
- Read its comprehensive guide in the archive or as [REPRODUCIBILITY_PACKAGE.md](REPRODUCIBILITY_PACKAGE.md).
- Read the documented corrections and preventive audit checks in [CORRECTIONS.md](CORRECTIONS.md).
- Browse the [evidence-update workflow](UPDATE_GUIDE.md) before changing the evidence registry or publishing a new release.

The unified archive contains the complete supplied Cochrane CD016297 data
package, separate `results/primary/` and `results/extended/` snapshots, numbered
source scripts, environment records, file- and website-field provenance,
checksums, and automated verification. It therefore traces a runnable path from
the raw Cochrane inputs to the exact evidence registry displayed by the site.

## How the published artifacts are generated

```text
Complete Cochrane CD016297 data package
        │
        ▼
01_primary_reanalysis.R
  cleaning → Centiloid mapping → five evidence-set conditions
  → scenario meta-analyses → raw mean differences
  → continuous-clearance meta-regression → reproduction checks
        │
        ▼
02_extended_reanalysis.R
  agent, termination, target-class, safety, clinical-threshold,
  moderator, influence, benefit-harm, percent-slowing, and QC analyses
        │
        ▼
03_build_evidence_registry.mjs
  exact website evidence.json
        │
        ▼
04/05 verification scripts
  compare every generated CSV and the complete registry with published snapshots
```

Reports, workbooks, downloadable CSVs, and the website are presentation layers
over the generated result tables; they do not silently recalculate estimates
in the browser. Run `./run_all.sh` in the extracted package to recreate the
results in `generated/` and verify them against the published snapshots.

## Repository structure

```text
public/                  Static assets deployed by Cloudflare Workers
  downloads/             Reports, workbooks, CSVs, and the unified package
  evidence.json          Machine-readable evidence registry
  evidence-inline.js     Offline-compatible copy of the registry
scripts/                 Registry build and no-dependency publication checks
  build-evidence-data.mjs Regenerates evidence data and downloadable artifacts
  verify.mjs             Validates the deployable static release
REPRODUCIBILITY_PACKAGE.md
                         Full documentation shipped inside the archive
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

The evidence registry is embedded, so `public/index.html` can be opened
directly from disk and the interactive controls still work without a local
server.

## Scientific status

Evidence release: **0.1.1**  
Release date: **2026-08-16**

This is a research-synthesis resource, not individualized medical advice.
Subgroup and meta-regression results are aggregate-data analyses and should not
be interpreted as causal individual-level treatment-effect modifiers.
