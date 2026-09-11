# Scientific audit and interpretation, 11 September 2026

This is a single-reviewer audit, not independent duplicate extraction. Release 0.2.0 retains the original Cochrane evidence set and makes uncertainty in investigator-defined restrictions explicit. The literature search remains current through 7 August 2025; this release does not claim a new systematic search.

## Confirmed implementation defects corrected

- The integrity audit now reads fresh primary and extended outputs. It checks duplicate study/outcome keys, missing annotations, confidence-interval ordering, variances, identifiers and reproduction of the source estimates and compatible inference.
- Every row excluded for an invalid effect or variance is exported. Positive denominator and event-count checks run in the audit stage.
- “Response criteria” is replaced in the interface by the explicit investigator-defined inclusion rule. The historical machine key is retained so earlier results remain comparable. Snyder et al. did not specify 10 CL, a time tolerance, or this conjunction of criteria.
- The manuscript is generated from the release registry. Prior manuscript counts and descriptions of prospective specification are superseded.
- The evidence search date is separate from the analysis release date.

## PET mapping correction

The former Marguerite RoAD entry was −59.65 CL, described as high-dose gantenerumab at 208 weeks. Its mapping did not establish a placebo-adjusted PET contrast compatible with the randomized clinical phase. Neve et al. distinguish low-dose double-blind treatment from high-dose open-label treatment and describe PET changes in the extension. We quarantine the old measurement rather than substitute an inferred value. This changes clearance-selected results but does not exclude the trial's clinical data from unrestricted conditions.

Source: Neve et al., 2024, doi:10.3233/JAD-240221, study-design and “Assessment of changes in amyloid load over time” sections. GRADUATE week 116 PET design is documented in Bateman et al., doi:10.1056/NEJMoa2304430, Biomarkers section.

## Remaining source uncertainties

`pet_clinical_pairings.csv` records every included outcome pairing. A time-compatible label checks only an approximate time screen; it does not certify dose, population, PET subgroup, tracer, adjustment model or primary-source numerical verification. Other Centiloid entries inherited from the compilation remain provisional until independently checked. No unknown PET value is treated as evidence of zero amyloid reduction.

The independent time-screen sensitivity uses ±13 weeks around nominal 18- or 24-month windows, and PET after 104 weeks for the >24-month category. These are new exploratory operational choices. A trial with available PET can remain in the historical ≥10-CL condition despite a time mismatch; the stricter time-screen condition makes the impact visible.

## Effect measures and inferential limits

The raw-MD companion uses exported arm means, SDs and corresponding N. Exact ADAS-Cog versions and adjusted-contrast compatibility still require source review. The displayed MD is not an SMD back-conversion. Do not automatically promote all MD results to a common-scale confirmatory analysis. A future verified extraction should record exact version, range, phase, dose, time, population, randomized N, analyzed N, adjusted estimate and its SE, and source page/table.

The package supplies exploratory independent-filter estimates for every retained outcome, including empty sets. It does not infer significance of differences between overlapping conditions. Selection based on approval or futility can select successful agents. Clearance regressions have few observations, ignore PET predictor measurement error and cannot establish mediation. Leave-one-study-out slopes expose influential observations. No causal interpretation or claim of absence of functional unblinding follows from these regressions.

Clinical benchmark tooltips now explain the individual-change origin and mismatch with between-group effects at 18 months. Historical PDF reports and workbooks are retained as clearly labeled v0.1.1 artifacts; the generated manuscript, current tables and registry supersede their numerical summaries where changed.

## Release and review

The authoritative source is `analysis/reproducibility` in the repository. The previous release remains available at baseline Git commit b95530a. New files, raw hashes, environment versions, and generated results are versioned together. Before journal submission, a second reviewer should verify primary-source PET values, clinical estimands and instrument versions; this audit does not certify those unresolved items.
