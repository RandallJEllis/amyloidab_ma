# Updating the living meta-analysis

## Evidence update

1. Run the primary and extended reanalysis pipelines in the analysis workspace.
2. Complete duplicate verification and adjudicate any changed extraction,
   eligibility, endpoint, or risk-of-bias decisions.
3. Refresh the website registry and downloadable artifacts:

   ```bash
   node living-meta-analysis-site/scripts/build-evidence-data.mjs
   node living-meta-analysis-site/scripts/build-static.mjs
   ```

4. Replace the contents of this repository's `public/` directory with the
   contents of `living-meta-analysis-site/dist/client/`.
5. Increment the evidence version and release date in the source registry and
   visible website copy.
6. Update the changelog below and run `node scripts/verify.mjs`.
7. Commit and push to GitHub. Cloudflare Pages will deploy the new release.

## Release discipline

- Preserve a tagged GitHub release for every substantive evidence update.
- Record added, removed, or corrected studies and every changed adjudication.
- Distinguish corrections from new-evidence updates.
- Reassess risk of bias, certainty, and interpretation when new trials enter.
- Keep canonical analyses locked; label new sensitivity analyses prospectively.
- Archive publication-grade releases with a permanent DOI when possible.

## Changelog

### 0.1.0 — 2026-08-15

- Initial interactive release based on the Cochrane evidence package.
- Added response-conforming plaque-clearance restrictions.
- Added continuous Centiloid meta-regression.
- Added agent, target-class, termination, MID, and absolute-safety sensitivities.

