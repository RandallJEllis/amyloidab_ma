# Corrections in evidence release 0.1.1

Release date: 16 August 2026

This release corrects two errors found during a source-to-display numerical audit.

## Biomarker-confirmation classification

CREAD, GRADUATE I, GRADUATE II, and Marguerite RoAD required amyloid pathology at enrollment but were omitted from the primary script's biomarker-confirmed list. The corrected classification contains 12 trials and is now derived and checked against the Cochrane study-characteristics file. This changes 23 biomarker-confirmed result rows: six previously reported estimates and 17 newly estimable specifications. It does not change the Cochrane class pool, the >=10-CL condition, the response-criteria condition, the lecanemab-plus-donanemab condition, or continuous-clearance models.

## Analysis-identifier preservation

The extended script imported analysis identifiers using automatic numeric type inference, converting `4.10` to `4.1`. This mixed the single Symptomatic ARIA-H row with the two-study Any ARIA analysis in two condition-level extended sensitivity tables. Analysis IDs are now imported as character strings and explicitly validated. Trial-specific agent and absolute-safety values were numerically correct, but the identifier attached to the Symptomatic ARIA-H row was also corrected from `4.1` to `4.10`.

## Preventive checks

The pipeline now stops if biomarker flags disagree with the Cochrane study-characteristics source or extended annotations, if `4.10` is not preserved, if an analysis identifier is malformed, if confidence intervals or variances are invalid, or if reconstructed Cochrane point estimates differ by 0.00005 or more.
