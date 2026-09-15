# Corrections in evidence release 0.3.0

Release date: 15 September 2026

This release adds investigator-defined Centiloid clearance sensitivities at ≥2, ≥4, ≥6, ≥8, and ≥12 CL alongside the existing ≥10-CL condition. These thresholds are not supplied by Snyder et al.; they are a ladder for showing how trial inclusion and pooled estimates change as the operational plaque-reduction rule varies. The ≥10-CL response condition and the Marguerite RoAD quarantine are unchanged.

# Corrections in evidence release 0.2.0

Release date: 11 September 2026

Marguerite RoAD's previously mapped −59.65 CL measurement came from a high-dose extension context; a compatible randomized-phase placebo-adjusted contrast was not established. The measurement is now quarantined as unknown. Clinical observations remain in conditions that do not require PET. Seven clearance-selected specifications become empty and other affected 24-month estimates change; see `public/downloads/release-differences.csv` for the numerical ledger. The 18-month headline estimates are unchanged.

The interface now identifies the investigator-defined ≥10-CL/biomarker/approval intersection explicitly. Snyder et al. did not supply this numerical definition. Independent filters, fresh-output audits, source pairing ledgers, reproducible manuscript generation and pinned dependencies are added. Exact instrument-version and clinical-estimand verification remains open; see `analysis/reproducibility/AUDIT.md`.

## Corrections in evidence release 0.1.1

Release date: 16 August 2026

This release corrects two errors found during a source-to-display numerical audit.

## Biomarker-confirmation classification

CREAD, GRADUATE I, GRADUATE II, and Marguerite RoAD required amyloid pathology at enrollment but were omitted from the primary script's biomarker-confirmed list. The corrected classification contains 12 trials and is now derived and checked against the Cochrane study-characteristics file. This changes 23 biomarker-confirmed result rows: six previously reported estimates and 17 newly estimable specifications. It does not change the Cochrane class pool, the >=10-CL condition, the response-criteria condition, the lecanemab-plus-donanemab condition, or continuous-clearance models.

## Analysis-identifier preservation

The extended script imported analysis identifiers using automatic numeric type inference, converting `4.10` to `4.1`. This mixed the single Symptomatic ARIA-H row with the two-study Any ARIA analysis in two condition-level extended sensitivity tables. Analysis IDs are now imported as character strings and explicitly validated. Trial-specific agent and absolute-safety values were numerically correct, but the identifier attached to the Symptomatic ARIA-H row was also corrected from `4.1` to `4.10`.

## Preventive checks

The pipeline now stops if biomarker flags disagree with the Cochrane study-characteristics source or extended annotations, if `4.10` is not preserved, if an analysis identifier is malformed, if confidence intervals or variances are invalid, or if reconstructed Cochrane point estimates differ by 0.00005 or more.
