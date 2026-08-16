# Living Amyloid Evidence: unified reproducibility package

Evidence version: **0.1.1**  
Evidence date: **16 August 2026**

This single archive reproduces the statistical results displayed by Living Amyloid Evidence from the complete Cochrane CD016297 data package. It contains the raw Cochrane input, both analysis stages, published result snapshots, the exact website evidence registry, documentation, checksums, and automated verification.

## Quick start

You need R 4.4 or later and a recent Node.js installation. The statistical scripts require the R packages `metafor`, `dplyr`, `readr`, `tidyr`, `ggplot2`, and `jsonlite`.

From this directory:

```sh
Rscript environment/install_dependencies.R  # only if packages are missing
./run_all.sh
```

`run_all.sh` performs the complete auditable chain:

1. Reads the raw Cochrane analysis files in `data/raw/cochrane/`.
2. Generates every primary table, JSON object, and statistical figure.
3. Uses those generated primary tables as the only input to the extended analysis.
4. Generates every extended table, JSON object, and statistical figure.
5. Builds the exact `evidence.json` collection used by the public website.
6. Compares all generated CSVs with the published snapshots and compares the generated website registry with the published registry.

Recreated files are written to `generated/`; the immutable published snapshots remain under `results/` and `site/`. A successful run ends with:

```text
PASS: primary tables, extended tables, and website evidence registry match the published package.
```

## What “primary” and “extended” mean

**Primary** does not mean that every primary result was prespecified in the original Cochrane protocol. It means the first stage of this reanalysis: reproduction of the Cochrane class pools followed by the evidence-set restrictions requested in the published response, raw-scale mean differences, and continuous amyloid-clearance meta-regression.

**Extended** means the second-stage analyses developed to investigate additional criticisms in the response. It starts from the generated primary cleaned rows and examines individual antibodies, early termination, target class, absolute safety, clinical-threshold compatibility, trial-level moderators, leave-one-antibody-out influence, percentage slowing, and descriptive benefit-harm profiles.

The extended results cannot be generated until the primary stage succeeds. That dependency is explicit in `run_all.sh`.

## The five primary evidence-set conditions

The number of contributing studies is outcome-specific: a trial belongs to a condition globally but contributes only when it reports the selected endpoint and time point.

| Condition | Rule | Globally eligible studies |
|---|---|---|
| All antibodies / Cochrane class pool | Every eligible trial in the corresponding Cochrane analysis | All 17 trials listed below |
| Biomarker-confirmed | Amyloid pathology required at enrollment in the Cochrane study-characteristics source | CLARITY AD; CREAD; CREAD 2; EMERGE; ENGAGE; ENVISION; EXPEDITION 3; GRADUATE I; GRADUATE II; Marguerite RoAD; SCarlet RoAD; TRAILBLAZER-ALZ 2 |
| Clears >=10 CL | Matched placebo-adjusted amyloid PET change <= -10 Centiloids; missing values are excluded, not imputed | EMERGE; ENGAGE; TRAILBLAZER-ALZ 2; SCarlet RoAD; Marguerite RoAD; CLARITY AD; GRADUATE I; GRADUATE II |
| Response criteria | Biomarker-confirmed **and** approved-generation **and** clears >=10 CL | EMERGE; ENGAGE; CLARITY AD; TRAILBLAZER-ALZ 2 |
| Lecanemab + donanemab | Currently active-agent sensitivity at the evidence date | CLARITY AD; TRAILBLAZER-ALZ 2 |

The trial flags used by the website are in `results/primary/tables/cleaned_analysis_rows.csv`. The separately sourced clinical annotations used by extended analyses are in `results/extended/tables/trial_annotations.csv`. These files are both retained because they serve different purposes; the code and source-note columns make every classification inspectable.

## Trials and agents covered

The package contains 17 trials of seven antibodies:

| Antibody | Trials |
|---|---|
| Aducanumab | EMERGE; ENGAGE; ENVISION |
| Bapineuzumab | 3000 Non Carriers; 3001 Carriers; Bapineuzumab-301; Bapineuzumab-302 |
| Crenezumab | CREAD; CREAD 2 |
| Donanemab | TRAILBLAZER-ALZ 2 |
| Gantenerumab | SCarlet RoAD; Marguerite RoAD; GRADUATE I; GRADUATE II |
| Lecanemab | CLARITY AD |
| Solanezumab | EXPEDITION/EXPEDITION 2; EXPEDITION 3 |

Six trials are coded as terminated for futility and nine as terminated early for any reason, matching the counts stated by Cochrane. The detailed status, target-class, biomarker, and source notes are in `trial_annotations.csv`.

## Directory map

```text
README.md                         This guide
CITATION.cff                      Citation metadata
run_all.sh                        One-command end-to-end reproduction
verify.sh                         Standalone verification
code/
  01_primary_reanalysis.R         Cochrane data -> primary results
  02_extended_reanalysis.R        Generated primary rows -> extended results
  03_build_evidence_registry.mjs  Primary + extended JSON -> website registry
  04_verify_outputs.R             Table-by-table CSV comparison
  05_verify_evidence.mjs          Website-registry comparison
data/raw/
  README.md                       Raw-data provenance and direct inputs
  cochrane/                       Complete supplied CD016297 data package
results/
  primary/tables/                 Published primary CSV and JSON snapshots
  extended/tables/                Published extended CSV and JSON snapshots
site/
  README.md                       Website data explanation
  evidence.json                   Exact published evidence registry
environment/
  install_dependencies.R          Installs missing direct R dependencies
  session-info.txt                Environment used for the published run
  R-packages.csv                  Direct package versions used
manifest/
  SHA256SUMS.txt                  Checksums for all non-manifest distributed files
  file-provenance.csv             File-level source/generator/role index
  website-field-provenance.csv    Website collection -> result source map
generated/                        Created only when the pipeline is run
```

## Raw Cochrane data

`data/raw/cochrane/` is the complete supplied Cochrane Review Data Package for CD016297. It contains:

- Analysis data: overall estimates/settings, subgroup estimates, and every study row in every analysis.
- Study data: study characteristics, study arms, study results, risk-of-bias assessments, included references, ongoing studies, awaiting-classification studies, and excluded studies.
- Other references and the Cochrane data-package provenance page.

The primary analysis reads only `CD016297-data-rows.csv` and `CD016297-overall-estimates-and-settings.csv`; the remaining raw files are included so the source package is complete. No raw values are overwritten. Checksums allow a user to confirm that their copy has not changed. `manifest/file-provenance.csv` inventories every distributed file. `manifest/SHA256SUMS.txt` covers every file except itself and `file-provenance.csv`; those two are excluded because regenerating either manifest would recursively change its own digest.

## Primary generated files

All primary tabular snapshots are under `results/primary/` and are generated by `code/01_primary_reanalysis.R`. The figures listed below are regenerated into `generated/primary/`; the corresponding published images are omitted from this computational archive to keep the single download compact.

| File | Meaning |
|---|---|
| `tables/cleaned_analysis_rows.csv` | Master trial-outcome rows after group filtering, effect transformations, Centiloid join, and five condition flags |
| `tables/amyloid_clearance_mapping.csv` | Trial-level Centiloid estimate, source, dose/time qualification, and missingness note |
| `tables/all_outcome_sensitivity_results.csv` | Every available outcome under every estimable evidence-set condition |
| `tables/raw_mean_difference_results.csv` | Same-scale unstandardized mean differences when arm means, SDs, and N are complete |
| `tables/continuous_clearance_meta_regression.csv` | SMD and raw-MD slopes per additional 10 CL cleared |
| `tables/reproduction_check.csv` | Reconstructed class-pool point estimates compared with the supplied Cochrane overall estimates |
| `tables/analysis_results.json` | Machine-readable bundle of all primary objects used downstream |
| `figures/priority_endpoint_comparison.png` | Priority endpoint comparison across conditions |
| `figures/raw_mean_difference_comparison.png` | Raw-scale condition comparison |
| `figures/clearance_meta_regression_*.png` | Trial-level clearance/effect plots for ADAS-Cog and CDR-SB |

The primary models use inverse-variance random effects with REML, Hartung-Knapp inference for three or more studies, and normal/Wald inference for one or two studies. Risk ratios are pooled on the log scale and exponentiated for reporting. See comments in the R script for exact formulas and direction conventions.

## Extended generated files

All extended tabular snapshots are under `results/extended/` and are generated by `code/02_extended_reanalysis.R` from the newly generated primary rows. Extended figures are regenerated into `generated/extended/` and are not duplicated as published image snapshots in this archive.

| File | Meaning |
|---|---|
| `tables/trial_annotations.csv` | Auditable agent, target, biomarker, termination, and source coding |
| `tables/annotated_rows.csv` | Primary rows joined to the extended trial annotations |
| `tables/agent_results.csv` | Antibody-specific estimates for every available outcome |
| `tables/raw_agent_results.csv` | Antibody-specific raw mean differences |
| `tables/agent_interactions.csv` | Omnibus tests of between-antibody differences when estimable |
| `tables/termination_sensitivities.csv` | Class pool, exclude-futility, and exclude-all-early-termination estimates |
| `tables/raw_termination_sensitivities.csv` | Termination sensitivities on raw clinical scales |
| `tables/target_class_results.csv` | Estimates by predominant amyloid target class |
| `tables/leave_one_agent_out.csv` | Class estimate after removing each antibody in turn |
| `tables/absolute_safety.csv` | Agent-specific risk differences, excess events per 1000, and NNH/NNTB |
| `tables/absolute_safety_scenarios.csv` | Absolute safety under the main evidence-set conditions |
| `tables/mid_compatibility.csv` | Raw-effect confidence intervals compared with thresholds cited by Cochrane |
| `tables/moderator_results.csv` | Biomarker, futility, publication-year, and ARIA-E proxy meta-regressions |
| `tables/benefit_harm.csv` | Separate agent-level efficacy and harm dimensions without a composite score |
| `tables/percent_slowing.csv` | Descriptive trial-level slowing relative to control decline |
| `tables/quality_control.csv` | Expected study, antibody, termination, and missing-annotation checks |
| `tables/extended_results.json` | Machine-readable bundle of all extended objects |
| `figures/individual_antibody_efficacy.png` | Agent estimates for central efficacy outcomes |
| `figures/absolute_aria_e_by_antibody.png` | Absolute ARIA-E excess by antibody |
| `figures/benefit_harm_matrix.png` | Efficacy and ARIA-E displayed as separate dimensions |

Extended subgroup models use the same REML/Hartung-Knapp convention, with a DerSimonian-Laird fallback only if sparse REML fitting fails. Interactions and moderators are exploratory and unadjusted for multiplicity.

## Reports and workbooks

The public website provides the primary and extended PDF reports and Excel workbooks as separate downloads. They are presentation snapshots derived from the statistical JSON and figures, are not analysis inputs, and are not duplicated in this computational archive. The one-command pipeline intentionally treats them as optional: reproducing the statistical tables and website registry does not require the specialized workbook/report formatting runtime.

## From results to the website

`code/03_build_evidence_registry.mjs` reads the generated primary and extended JSON files plus the generated primary cleaned rows. It writes `generated/site/evidence.json`, which must match `site/evidence.json`. `manifest/website-field-provenance.csv` identifies the source object for every top-level website collection.

The website performs filtering and visualization only; it does not refit a meta-analysis in the browser.

## Verification and expected differences

`verify.sh` compares every generated primary and extended CSV with its published counterpart. Text fields, row order, column order, and missingness must match exactly; numeric fields must agree within a relative tolerance of 1e-8. It then checks that the complete generated website registry matches the published JSON object.

The published run reproduced all Cochrane class-pool point estimates with a maximum absolute difference below 0.00005. Some confidence intervals can differ from RevMan because small-sample and Hartung-Knapp implementations differ across software.

## Interpretation guardrails

- The response-conforming condition is a post-publication sensitivity definition, not a randomized comparison of clearing versus non-clearing antibodies.
- The 10-CL threshold is operational; missing or ambiguous trial-level clearance values are not imputed.
- Continuous clearance analyses are ecological trial-level meta-regressions and cannot demonstrate individual-level mediation.
- Agent and target-class comparisons are cross-trial, not randomized head-to-head comparisons.
- Clinical-threshold analyses test compatibility with values cited in the literature; they do not establish a universal patient-level or between-group MID.
- Exploratory P values are not adjusted for multiplicity.
- This package is research synthesis, not individualized medical advice or a clinical-practice guideline.

## Support and citation

Repository: <https://github.com/RandallJEllis/amyloidab_ma>

Use `CITATION.cff` for package citation metadata. Scientific use should also cite the Cochrane CD016297 review, the response that motivated the specifications, and the eventual associated reanalysis manuscript.
