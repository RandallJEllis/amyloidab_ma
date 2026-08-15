# Living Amyloid Evidence

This repository contains the public, static release of an interactive living
meta-analysis of anti-amyloid antibody trials in Alzheimer's disease.

The site explores how endpoint definitions, biomarker confirmation, plaque
clearance, drug inclusion, target class, and trial status change estimated
benefits and harms. It does not require a database or application server.

## Repository structure

```text
public/                  Static assets deployed by Cloudflare Workers
  downloads/             Reports, workbooks, CSVs, and reproducibility packages
  evidence.json          Machine-readable evidence registry
  evidence-inline.js     Offline-compatible copy of the registry
scripts/verify.mjs       No-dependency publication validation
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

You can open `public/index.html` directly from disk. The evidence registry is
embedded so the interactive controls work without a local server.

## Scientific status

Evidence release: **0.1.0**  
Release date: **2026-08-15**

This is a research-synthesis resource, not individualized medical advice.
Subgroup and meta-regression results are aggregate-data analyses and should not
be interpreted as causal individual-level treatment-effect modifiers.
