# Methods and Results: exploratory reanalysis

Release 0.2.0; generated 2026-09-11. Source literature search through 2025-08-07. This document is a submission draft; independent extraction verification remains pending.

## Methods

We reanalyzed aggregate data from Cochrane CD016297 to examine sensitivity to population, antibody inclusion and target-engagement definitions motivated by Snyder et al. These investigator-defined analyses were not prospectively registered. The 10-Centiloid reduction threshold was not specified by Snyder et al. Primary and extended refer to pipeline stages, rather than confirmatory status. The supplied Cochrane study labels, including a combined EXPEDITION/EXPEDITION 2 entry, were retained; counts refer to contributing analysis units.

Clinical and safety outcomes in Cochrane groups 1–9 were retained at their source follow-up categories. The class pool was compared with biomarker-required enrollment, an operational ≥10-CL reduction condition, biomarker-required trials of approved-generation antibodies with ≥10-CL reduction, and lecanemab plus donanemab. Approval status reflects the historical evidence definition. Missing or quarantined PET measurements were not imputed. Marguerite RoAD's previous −59.65 CL mapping was quarantined because the mapping did not establish a compatible randomized-phase placebo-adjusted PET contrast. The trial remains eligible for conditions not requiring a PET value.

Trial effect estimates and confidence intervals were taken from the Cochrane export. Standard errors were reconstructed from 95% intervals using a normal quantile, with risk ratios transformed to the log scale. Random-effects models used REML with Hartung–Knapp inference for at least three contributing units and normal inference for smaller sets. The separately generated Cochrane-compatible checks follow the source inference settings. All model choices and convergence exceptions are recorded in executable code.

Raw MD companions subtract the exported arm means and use SD_active²/N_active + SD_control²/N_control. These remain provisional until exact instrument versions, denominator definitions and adjusted-versus-unadjusted estimands are independently verified. In particular, ADAS-Cog versions must not be assumed interchangeable merely because they share a name. No SMD-to-MD back-conversion was performed. A future source extraction should prioritize trial-reported adjusted contrasts with SEs when compatible across studies.

Additional exploratory specifications independently vary biomarker and approval restrictions, PET reduction cutoffs (none, 5, 10, 20 or 30 CL), and an approximate PET time-matching screen. The time screen uses ±13 weeks around 18 or 24 months, and requires a PET measurement after 104 weeks for the >24-month category. It is an investigator-defined sensitivity rule and does not certify matching dose or population. Small trial-level PET regressions and leave-one-study-out regressions describe ecological associations; predictor uncertainty is not modelled and mediation is not established.

Extended models examine antibody identity, termination, target class, absolute safety, clinical-threshold compatibility, moderators and influence. Conditions overlap, so point-estimate differences are descriptive and do not constitute independent subgroup tests. No multiplicity adjustment was applied. Clinical benchmark lines contextualize individual-change thresholds from other populations and time horizons; they do not establish minimum important randomized between-group effects.

Reproduction includes fresh-output integrity checks, complete CSV snapshot comparison, exact website-registry comparison and a pinned R environment. Raw inputs, exclusions, PET pairing decisions, analysis inputs, all results and machine-readable provenance are included in the release.

## Results

The registry contains 17 study labels and 140 primary condition–outcome estimates. Contributing counts vary by endpoint and condition; the registry does not count repeated endpoint observations as additional participants. The class-wide and approved-agent ≥10-CL headline estimates are retained, while analyses using the quarantined Marguerite RoAD PET mapping change. Detailed changes are generated in the release difference ledger.

### Principal 18-month outcomes

| Outcome | Condition | Measure | k | Estimate | 95% CI | P |
|---|---|---|---:|---:|---|---:|
| ADAS-Cog scale at 18 months | Biomarker-confirmed | SMD | 8 | -0.127 | -0.186 to -0.068 | 0.001 |
| ADAS-Cog scale at 18 months | Cochrane class pool | SMD | 13 | -0.111 | -0.160 to -0.062 | 0.000 |
| ADAS-Cog scale at 18 months | Currently active agents: lecanemab + donanemab | SMD | 2 | -0.168 | -0.240 to -0.097 | 0.000 |
| ADAS-Cog scale at 18 months | Demonstrated clearance: >=10 CL | SMD | 5 | -0.148 | -0.223 to -0.073 | 0.005 |
| ADAS-Cog scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | SMD | 4 | -0.158 | -0.237 to -0.079 | 0.008 |
| CDR-SB scale at 18 months | Biomarker-confirmed | SMD | 8 | -0.137 | -0.279 to 0.006 | 0.057 |
| CDR-SB scale at 18 months | Cochrane class pool | SMD | 9 | -0.124 | -0.243 to -0.004 | 0.044 |
| CDR-SB scale at 18 months | Currently active agents: lecanemab + donanemab | SMD | 2 | -0.238 | -0.337 to -0.140 | 0.000 |
| CDR-SB scale at 18 months | Demonstrated clearance: >=10 CL | SMD | 5 | -0.141 | -0.323 to 0.041 | 0.098 |
| CDR-SB scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | SMD | 4 | -0.177 | -0.380 to 0.025 | 0.069 |

### Raw-scale companion results

These are direct reconstructions from exported arm summaries, subject to the measurement and estimand limitations above.

| Outcome | Condition | Measure | k | Estimate | 95% CI | P |
|---|---|---|---:|---:|---|---:|
| ADAS-Cog scale at 18 months | Biomarker-confirmed | MD | 8 | -1.260 | -1.605 to -0.916 | 0.000 |
| ADAS-Cog scale at 18 months | Cochrane class pool | MD | 13 | -1.086 | -1.514 to -0.657 | 0.000 |
| ADAS-Cog scale at 18 months | Currently active agents: lecanemab + donanemab | MD | 2 | -1.396 | -1.988 to -0.803 | 0.000 |
| ADAS-Cog scale at 18 months | Demonstrated clearance: >=10 CL | MD | 5 | -1.248 | -1.737 to -0.759 | 0.002 |
| ADAS-Cog scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | MD | 4 | -1.312 | -1.773 to -0.850 | 0.003 |
| CDR-SB scale at 18 months | Biomarker-confirmed | MD | 8 | -0.305 | -0.655 to 0.044 | 0.078 |
| CDR-SB scale at 18 months | Cochrane class pool | MD | 9 | -0.292 | -0.583 to -0.000 | 0.050 |
| CDR-SB scale at 18 months | Currently active agents: lecanemab + donanemab | MD | 2 | -0.564 | -0.808 to -0.320 | 0.000 |
| CDR-SB scale at 18 months | Demonstrated clearance: >=10 CL | MD | 5 | -0.314 | -0.729 to 0.101 | 0.104 |
| CDR-SB scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | MD | 4 | -0.385 | -0.861 to 0.091 | 0.082 |

### Complete primary results

| Outcome | Condition | Measure | k | Estimate | 95% CI | P |
|---|---|---|---:|---:|---|---:|
| ADAS-Cog scale at 18 months | Biomarker-confirmed | SMD | 8 | -0.127 | -0.186 to -0.068 | 0.001 |
| ADAS-Cog scale at 18 months | Cochrane class pool | SMD | 13 | -0.111 | -0.160 to -0.062 | 0.000 |
| ADAS-Cog scale at 18 months | Currently active agents: lecanemab + donanemab | SMD | 2 | -0.168 | -0.240 to -0.097 | 0.000 |
| ADAS-Cog scale at 18 months | Demonstrated clearance: >=10 CL | SMD | 5 | -0.148 | -0.223 to -0.073 | 0.005 |
| ADAS-Cog scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | SMD | 4 | -0.158 | -0.237 to -0.079 | 0.008 |
| ADAS-Cog scale at 24 months | Biomarker-confirmed | SMD | 2 | -0.213 | -0.810 to 0.383 | 0.483 |
| ADAS-Cog scale at 24 months | Cochrane class pool | SMD | 2 | -0.213 | -0.810 to 0.383 | 0.483 |
| ADAS-Cog scale above 24 months | Biomarker-confirmed | SMD | 2 | -0.118 | -0.206 to -0.029 | 0.009 |
| ADAS-Cog scale above 24 months | Cochrane class pool | SMD | 2 | -0.118 | -0.206 to -0.029 | 0.009 |
| ADAS-Cog scale above 24 months | Demonstrated clearance: >=10 CL | SMD | 2 | -0.118 | -0.206 to -0.029 | 0.009 |
| MMSE scale at 18 months | Biomarker-confirmed | SMD | 7 | 0.102 | 0.014 to 0.189 | 0.030 |
| MMSE scale at 18 months | Cochrane class pool | SMD | 8 | 0.115 | 0.041 to 0.188 | 0.008 |
| MMSE scale at 18 months | Currently active agents: lecanemab + donanemab | SMD | 1 | 0.146 | 0.036 to 0.256 | 0.009 |
| MMSE scale at 18 months | Demonstrated clearance: >=10 CL | SMD | 4 | 0.096 | -0.052 to 0.244 | 0.132 |
| MMSE scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | SMD | 3 | 0.103 | -0.159 to 0.365 | 0.234 |
| MMSE scale at 24 months | Biomarker-confirmed | SMD | 2 | -0.041 | -0.307 to 0.224 | 0.760 |
| MMSE scale at 24 months | Cochrane class pool | SMD | 2 | -0.041 | -0.307 to 0.224 | 0.760 |
| ADAS-Cog 24 months mean difference | Biomarker-confirmed | MD | 2 | -1.406 | -5.245 to 2.434 | 0.473 |
| ADAS-Cog 24 months mean difference | Cochrane class pool | MD | 2 | -1.406 | -5.245 to 2.434 | 0.473 |
| CDR-SB scale at 18 months | Biomarker-confirmed | SMD | 8 | -0.137 | -0.279 to 0.006 | 0.057 |
| CDR-SB scale at 18 months | Cochrane class pool | SMD | 9 | -0.124 | -0.243 to -0.004 | 0.044 |
| CDR-SB scale at 18 months | Currently active agents: lecanemab + donanemab | SMD | 2 | -0.238 | -0.337 to -0.140 | 0.000 |
| CDR-SB scale at 18 months | Demonstrated clearance: >=10 CL | SMD | 5 | -0.141 | -0.323 to 0.041 | 0.098 |
| CDR-SB scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | SMD | 4 | -0.177 | -0.380 to 0.025 | 0.069 |
| CDR-SB scale at 24 months | Biomarker-confirmed | SMD | 2 | 0.032 | -0.235 to 0.298 | 0.816 |
| CDR-SB scale at 24 months | Cochrane class pool | SMD | 2 | 0.032 | -0.235 to 0.298 | 0.816 |
| CDR-SB scale above 24 months | Biomarker-confirmed | SMD | 2 | -0.070 | -0.159 to 0.019 | 0.121 |
| CDR-SB scale above 24 months | Cochrane class pool | SMD | 2 | -0.070 | -0.159 to 0.019 | 0.121 |
| CDR-SB scale above 24 months | Demonstrated clearance: >=10 CL | SMD | 2 | -0.070 | -0.159 to 0.019 | 0.121 |
| CDR-SB 24 months mean difference | Biomarker-confirmed | MD | 2 | 0.032 | -0.643 to 0.706 | 0.926 |
| CDR-SB 24 months mean difference | Cochrane class pool | MD | 2 | 0.032 | -0.643 to 0.706 | 0.926 |
| DAD total score at 18 months | Cochrane class pool | SMD | 4 | 0.041 | -0.160 to 0.243 | 0.559 |
| ADCS-ADL score at 18 months | Biomarker-confirmed | SMD | 2 | 0.088 | 0.004 to 0.173 | 0.041 |
| ADCS-ADL score at 18 months | Cochrane class pool | SMD | 3 | 0.092 | 0.026 to 0.157 | 0.026 |
| ADCS-ADL score at 24 months | Biomarker-confirmed | SMD | 2 | 0.087 | -0.517 to 0.691 | 0.778 |
| ADCS-ADL score at 24 months | Cochrane class pool | SMD | 2 | 0.087 | -0.517 to 0.691 | 0.778 |
| ADCS-ADL score above 24 months | Biomarker-confirmed | SMD | 2 | 0.069 | -0.019 to 0.158 | 0.123 |
| ADCS-ADL score above 24 months | Cochrane class pool | SMD | 2 | 0.069 | -0.019 to 0.158 | 0.123 |
| ADCS-ADL score above 24 months | Demonstrated clearance: >=10 CL | SMD | 2 | 0.069 | -0.019 to 0.158 | 0.123 |
| ADCS-ADL-MCI score at 18 months | Biomarker-confirmed | SMD | 4 | 0.225 | 0.116 to 0.335 | 0.007 |
| ADCS-ADL-MCI score at 18 months | Cochrane class pool | SMD | 4 | 0.225 | 0.116 to 0.335 | 0.007 |
| ADCS-ADL-MCI score at 18 months | Currently active agents: lecanemab + donanemab | SMD | 1 | 0.247 | 0.148 to 0.346 | 0.000 |
| ADCS-ADL-MCI score at 18 months | Demonstrated clearance: >=10 CL | SMD | 3 | 0.224 | 0.052 to 0.396 | 0.030 |
| ADCS-ADL-MCI score at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | SMD | 3 | 0.224 | 0.052 to 0.396 | 0.030 |
| ADCS-iADL score at 18 months | Biomarker-confirmed | SMD | 1 | 0.209 | 0.097 to 0.320 | 0.000 |
| ADCS-iADL score at 18 months | Cochrane class pool | SMD | 1 | 0.209 | 0.097 to 0.320 | 0.000 |
| ADCS-iADL score at 18 months | Currently active agents: lecanemab + donanemab | SMD | 1 | 0.209 | 0.097 to 0.320 | 0.000 |
| ADCS-iADL score at 18 months | Demonstrated clearance: >=10 CL | SMD | 1 | 0.209 | 0.097 to 0.320 | 0.000 |
| ADCS-iADL score at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | SMD | 1 | 0.209 | 0.097 to 0.320 | 0.000 |
| ADCS-ADL 24 months mean difference | Biomarker-confirmed | MD | 2 | 0.648 | -4.920 to 6.215 | 0.820 |
| ADCS-ADL 24 months mean difference | Cochrane class pool | MD | 2 | 0.648 | -4.920 to 6.215 | 0.820 |
| ADCS-ADL-MCI 18 months mean difference | Biomarker-confirmed | MD | 4 | 1.896 | 1.402 to 2.390 | 0.001 |
| ADCS-ADL-MCI 18 months mean difference | Cochrane class pool | MD | 4 | 1.896 | 1.402 to 2.390 | 0.001 |
| ADCS-ADL-MCI 18 months mean difference | Currently active agents: lecanemab + donanemab | MD | 1 | 2.000 | 1.196 to 2.804 | 0.000 |
| ADCS-ADL-MCI 18 months mean difference | Demonstrated clearance: >=10 CL | MD | 3 | 1.879 | 1.391 to 2.366 | 0.004 |
| ADCS-ADL-MCI 18 months mean difference | Biomarker-confirmed, approved agents, ≥10 CL reduction | MD | 3 | 1.879 | 1.391 to 2.366 | 0.004 |
| Any ARIA at 18 months | Biomarker-confirmed | RR | 2 | 2.397 | 2.075 to 2.768 | 0.000 |
| Any ARIA at 18 months | Cochrane class pool | RR | 2 | 2.397 | 2.075 to 2.768 | 0.000 |
| Any ARIA at 18 months | Currently active agents: lecanemab + donanemab | RR | 2 | 2.397 | 2.075 to 2.768 | 0.000 |
| Any ARIA at 18 months | Demonstrated clearance: >=10 CL | RR | 2 | 2.397 | 2.075 to 2.768 | 0.000 |
| Any ARIA at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 2 | 2.397 | 2.075 to 2.768 | 0.000 |
| Symptomatic ARIA H at 18 months | Biomarker-confirmed | RR | 1 | 2.997 | 0.606 to 14.807 | 0.178 |
| Symptomatic ARIA H at 18 months | Cochrane class pool | RR | 1 | 2.997 | 0.606 to 14.807 | 0.178 |
| Symptomatic ARIA H at 18 months | Currently active agents: lecanemab + donanemab | RR | 1 | 2.997 | 0.606 to 14.807 | 0.178 |
| Symptomatic ARIA H at 18 months | Demonstrated clearance: >=10 CL | RR | 1 | 2.997 | 0.606 to 14.807 | 0.178 |
| Symptomatic ARIA H at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 1 | 2.997 | 0.606 to 14.807 | 0.178 |
| Any ARIA E at 18 months | Biomarker-confirmed | RR | 6 | 10.816 | 7.385 to 15.840 | 0.000 |
| Any ARIA E at 18 months | Cochrane class pool | RR | 11 | 10.022 | 6.529 to 15.383 | 0.000 |
| Any ARIA E at 18 months | Currently active agents: lecanemab + donanemab | RR | 2 | 9.534 | 6.211 to 14.636 | 0.000 |
| Any ARIA E at 18 months | Demonstrated clearance: >=10 CL | RR | 4 | 11.127 | 7.300 to 16.959 | 0.000 |
| Any ARIA E at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 4 | 11.127 | 7.300 to 16.959 | 0.000 |
| Any ARIA E at 24 months | Biomarker-confirmed | RR | 4 | 7.494 | 1.592 to 35.268 | 0.026 |
| Any ARIA E at 24 months | Cochrane class pool | RR | 4 | 7.494 | 1.592 to 35.268 | 0.026 |
| Any ARIA E at 24 months | Demonstrated clearance: >=10 CL | RR | 1 | 17.904 | 4.351 to 73.676 | 0.000 |
| Any ARIA E above 24 months | Biomarker-confirmed | RR | 2 | 9.350 | 4.515 to 19.362 | 0.000 |
| Any ARIA E above 24 months | Cochrane class pool | RR | 2 | 9.350 | 4.515 to 19.362 | 0.000 |
| Any ARIA E above 24 months | Demonstrated clearance: >=10 CL | RR | 2 | 9.350 | 4.515 to 19.362 | 0.000 |
| Symptomatic ARIA E at 18 months | Biomarker-confirmed | RR | 2 | 52.490 | 10.448 to 263.704 | 0.000 |
| Symptomatic ARIA E at 18 months | Cochrane class pool | RR | 2 | 52.490 | 10.448 to 263.704 | 0.000 |
| Symptomatic ARIA E at 18 months | Currently active agents: lecanemab + donanemab | RR | 2 | 52.490 | 10.448 to 263.704 | 0.000 |
| Symptomatic ARIA E at 18 months | Demonstrated clearance: >=10 CL | RR | 2 | 52.490 | 10.448 to 263.704 | 0.000 |
| Symptomatic ARIA E at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 2 | 52.490 | 10.448 to 263.704 | 0.000 |
| Symptomatic ARIA E above 24 months | Biomarker-confirmed | RR | 2 | 15.547 | 4.331 to 55.802 | 0.000 |
| Symptomatic ARIA E above 24 months | Cochrane class pool | RR | 2 | 15.547 | 4.331 to 55.802 | 0.000 |
| Symptomatic ARIA E above 24 months | Demonstrated clearance: >=10 CL | RR | 2 | 15.547 | 4.331 to 55.802 | 0.000 |
| Any ARIA H at 18 months | Biomarker-confirmed | RR | 3 | 1.648 | 0.472 to 5.750 | 0.228 |
| Any ARIA H at 18 months | Cochrane class pool | RR | 3 | 1.648 | 0.472 to 5.750 | 0.228 |
| Any ARIA H at 18 months | Currently active agents: lecanemab + donanemab | RR | 2 | 2.138 | 1.784 to 2.563 | 0.000 |
| Any ARIA H at 18 months | Demonstrated clearance: >=10 CL | RR | 2 | 2.138 | 1.784 to 2.563 | 0.000 |
| Any ARIA H at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 2 | 2.138 | 1.784 to 2.563 | 0.000 |
| Any ARIA H at 24 months | Biomarker-confirmed | RR | 4 | 1.275 | 1.077 to 1.510 | 0.020 |
| Any ARIA H at 24 months | Cochrane class pool | RR | 4 | 1.275 | 1.077 to 1.510 | 0.020 |
| Any ARIA H at 24 months | Demonstrated clearance: >=10 CL | RR | 1 | 1.228 | 0.811 to 1.859 | 0.332 |
| Any ARIA H above 24 months | Biomarker-confirmed | RR | 2 | 1.865 | 1.519 to 2.289 | 0.000 |
| Any ARIA H above 24 months | Cochrane class pool | RR | 2 | 1.865 | 1.519 to 2.289 | 0.000 |
| Any ARIA H above 24 months | Demonstrated clearance: >=10 CL | RR | 2 | 1.865 | 1.519 to 2.289 | 0.000 |
| SAE at 18 months | Biomarker-confirmed | RR | 6 | 0.996 | 0.841 to 1.178 | 0.949 |
| SAE at 18 months | Cochrane class pool | RR | 9 | 1.041 | 0.920 to 1.179 | 0.475 |
| SAE at 18 months | Currently active agents: lecanemab + donanemab | RR | 2 | 1.160 | 0.988 to 1.361 | 0.070 |
| SAE at 18 months | Demonstrated clearance: >=10 CL | RR | 4 | 1.081 | 0.883 to 1.324 | 0.308 |
| SAE at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 4 | 1.081 | 0.883 to 1.324 | 0.308 |
| SAE at 24 months | Biomarker-confirmed | RR | 4 | 1.031 | 0.792 to 1.342 | 0.737 |
| SAE at 24 months | Cochrane class pool | RR | 4 | 1.031 | 0.792 to 1.342 | 0.737 |
| SAE at 24 months | Demonstrated clearance: >=10 CL | RR | 1 | 0.856 | 0.602 to 1.217 | 0.386 |
| SAE above 24 months | Biomarker-confirmed | RR | 2 | 0.824 | 0.667 to 1.017 | 0.071 |
| SAE above 24 months | Cochrane class pool | RR | 2 | 0.824 | 0.667 to 1.017 | 0.071 |
| SAE above 24 months | Demonstrated clearance: >=10 CL | RR | 2 | 0.824 | 0.667 to 1.017 | 0.071 |
| Mortality at 18 months | Biomarker-confirmed | RR | 4 | 0.790 | 0.198 to 3.154 | 0.625 |
| Mortality at 18 months | Cochrane class pool | RR | 7 | 1.173 | 0.615 to 2.236 | 0.568 |
| Mortality at 18 months | Currently active agents: lecanemab + donanemab | RR | 2 | 1.312 | 0.695 to 2.479 | 0.402 |
| Mortality at 18 months | Demonstrated clearance: >=10 CL | RR | 2 | 1.312 | 0.695 to 2.479 | 0.402 |
| Mortality at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 2 | 1.312 | 0.695 to 2.479 | 0.402 |
| Mortality at 24 months | Biomarker-confirmed | RR | 4 | 1.055 | 0.291 to 3.816 | 0.904 |
| Mortality at 24 months | Cochrane class pool | RR | 4 | 1.055 | 0.291 to 3.816 | 0.904 |
| Mortality at 24 months | Demonstrated clearance: >=10 CL | RR | 1 | 0.341 | 0.069 to 1.674 | 0.185 |
| Mortality above 24 months | Biomarker-confirmed | RR | 2 | 0.697 | 0.125 to 3.884 | 0.681 |
| Mortality above 24 months | Cochrane class pool | RR | 2 | 0.697 | 0.125 to 3.884 | 0.681 |
| Mortality above 24 months | Demonstrated clearance: >=10 CL | RR | 2 | 0.697 | 0.125 to 3.884 | 0.681 |
| NPI-Q score at 12 months | Biomarker-confirmed | SMD | 1 | 0.086 | -0.183 to 0.356 | 0.532 |
| NPI-Q score at 12 months | Cochrane class pool | SMD | 1 | 0.086 | -0.183 to 0.356 | 0.532 |
| NPI-Q score at 18 months | Biomarker-confirmed | SMD | 2 | 0.119 | -0.175 to 0.413 | 0.427 |
| NPI-Q score at 18 months | Cochrane class pool | SMD | 2 | 0.119 | -0.175 to 0.413 | 0.427 |
| Infusion reaction at 18 months | Biomarker-confirmed | RR | 3 | 3.580 | 0.069 to 185.613 | 0.299 |
| Infusion reaction at 18 months | Cochrane class pool | RR | 3 | 3.580 | 0.069 to 185.613 | 0.299 |
| Infusion reaction at 18 months | Currently active agents: lecanemab + donanemab | RR | 2 | 7.663 | 1.509 to 38.921 | 0.014 |
| Infusion reaction at 18 months | Demonstrated clearance: >=10 CL | RR | 2 | 7.663 | 1.509 to 38.921 | 0.014 |
| Infusion reaction at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 2 | 7.663 | 1.509 to 38.921 | 0.014 |
| Infusion reaction at 24 months | Biomarker-confirmed | RR | 1 | 1.149 | 0.774 to 1.707 | 0.491 |
| Infusion reaction at 24 months | Cochrane class pool | RR | 1 | 1.149 | 0.774 to 1.707 | 0.491 |
| Study discontinuation at 18 months | Biomarker-confirmed | RR | 6 | 1.191 | 0.996 to 1.423 | 0.054 |
| Study discontinuation at 18 months | Cochrane class pool | RR | 11 | 1.121 | 1.021 to 1.231 | 0.022 |
| Study discontinuation at 18 months | Currently active agents: lecanemab + donanemab | RR | 2 | 1.293 | 1.133 to 1.476 | 0.000 |
| Study discontinuation at 18 months | Demonstrated clearance: >=10 CL | RR | 4 | 1.284 | 1.147 to 1.436 | 0.006 |
| Study discontinuation at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | RR | 4 | 1.284 | 1.147 to 1.436 | 0.006 |
| Study discontinuation at 24 months | Biomarker-confirmed | RR | 2 | 1.009 | 0.941 to 1.081 | 0.806 |
| Study discontinuation at 24 months | Cochrane class pool | RR | 2 | 1.009 | 0.941 to 1.081 | 0.806 |
| Study discontinuation at 24 months | Demonstrated clearance: >=10 CL | RR | 1 | 1.054 | 0.789 to 1.407 | 0.724 |
| Study discontinuation above 24 months | Biomarker-confirmed | RR | 2 | 1.355 | 1.109 to 1.655 | 0.003 |
| Study discontinuation above 24 months | Cochrane class pool | RR | 2 | 1.355 | 1.109 to 1.655 | 0.003 |
| Study discontinuation above 24 months | Demonstrated clearance: >=10 CL | RR | 2 | 1.355 | 1.109 to 1.655 | 0.003 |

### Complete raw mean differences

| Outcome | Condition | Measure | k | Estimate | 95% CI | P |
|---|---|---|---:|---:|---|---:|
| ADAS-Cog scale at 18 months | Biomarker-confirmed | MD | 8 | -1.260 | -1.605 to -0.916 | 0.000 |
| ADAS-Cog scale at 18 months | Cochrane class pool | MD | 13 | -1.086 | -1.514 to -0.657 | 0.000 |
| ADAS-Cog scale at 18 months | Currently active agents: lecanemab + donanemab | MD | 2 | -1.396 | -1.988 to -0.803 | 0.000 |
| ADAS-Cog scale at 18 months | Demonstrated clearance: >=10 CL | MD | 5 | -1.248 | -1.737 to -0.759 | 0.002 |
| ADAS-Cog scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | MD | 4 | -1.312 | -1.773 to -0.850 | 0.003 |
| ADAS-Cog scale above 24 months | Biomarker-confirmed | MD | 2 | -1.267 | -2.220 to -0.314 | 0.009 |
| ADAS-Cog scale above 24 months | Cochrane class pool | MD | 2 | -1.267 | -2.220 to -0.314 | 0.009 |
| ADAS-Cog scale above 24 months | Demonstrated clearance: >=10 CL | MD | 2 | -1.267 | -2.220 to -0.314 | 0.009 |
| MMSE scale at 18 months | Biomarker-confirmed | MD | 7 | 0.871 | -0.550 to 2.292 | 0.184 |
| MMSE scale at 18 months | Cochrane class pool | MD | 8 | 0.849 | -0.297 to 1.996 | 0.123 |
| MMSE scale at 18 months | Currently active agents: lecanemab + donanemab | MD | 1 | 0.570 | 0.140 to 1.000 | 0.009 |
| MMSE scale at 18 months | Demonstrated clearance: >=10 CL | MD | 4 | 0.357 | -0.188 to 0.903 | 0.129 |
| MMSE scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | MD | 3 | 0.376 | -0.580 to 1.333 | 0.233 |
| CDR-SB scale at 18 months | Biomarker-confirmed | MD | 8 | -0.305 | -0.655 to 0.044 | 0.078 |
| CDR-SB scale at 18 months | Cochrane class pool | MD | 9 | -0.292 | -0.583 to -0.000 | 0.050 |
| CDR-SB scale at 18 months | Currently active agents: lecanemab + donanemab | MD | 2 | -0.564 | -0.808 to -0.320 | 0.000 |
| CDR-SB scale at 18 months | Demonstrated clearance: >=10 CL | MD | 5 | -0.314 | -0.729 to 0.101 | 0.104 |
| CDR-SB scale at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | MD | 4 | -0.385 | -0.861 to 0.091 | 0.082 |
| CDR-SB scale above 24 months | Biomarker-confirmed | MD | 2 | -0.228 | -0.517 to 0.062 | 0.123 |
| CDR-SB scale above 24 months | Cochrane class pool | MD | 2 | -0.228 | -0.517 to 0.062 | 0.123 |
| CDR-SB scale above 24 months | Demonstrated clearance: >=10 CL | MD | 2 | -0.228 | -0.517 to 0.062 | 0.123 |
| DAD total score at 18 months | Cochrane class pool | MD | 4 | 0.742 | -3.011 to 4.496 | 0.574 |
| ADCS-ADL score at 18 months | Biomarker-confirmed | MD | 2 | 1.257 | 0.088 to 2.426 | 0.035 |
| ADCS-ADL score at 18 months | Cochrane class pool | MD | 3 | 1.315 | 0.620 to 2.011 | 0.015 |
| ADCS-ADL score above 24 months | Biomarker-confirmed | MD | 2 | 0.954 | -0.265 to 2.174 | 0.125 |
| ADCS-ADL score above 24 months | Cochrane class pool | MD | 2 | 0.954 | -0.265 to 2.174 | 0.125 |
| ADCS-ADL score above 24 months | Demonstrated clearance: >=10 CL | MD | 2 | 0.954 | -0.265 to 2.174 | 0.125 |
| ADCS-iADL score at 18 months | Biomarker-confirmed | MD | 1 | 1.750 | 0.821 to 2.679 | 0.000 |
| ADCS-iADL score at 18 months | Cochrane class pool | MD | 1 | 1.750 | 0.821 to 2.679 | 0.000 |
| ADCS-iADL score at 18 months | Currently active agents: lecanemab + donanemab | MD | 1 | 1.750 | 0.821 to 2.679 | 0.000 |
| ADCS-iADL score at 18 months | Demonstrated clearance: >=10 CL | MD | 1 | 1.750 | 0.821 to 2.679 | 0.000 |
| ADCS-iADL score at 18 months | Biomarker-confirmed, approved agents, ≥10 CL reduction | MD | 1 | 1.750 | 0.821 to 2.679 | 0.000 |
| NPI-Q score at 12 months | Biomarker-confirmed | MD | 1 | 0.760 | -1.600 to 3.120 | 0.528 |
| NPI-Q score at 12 months | Cochrane class pool | MD | 1 | 0.760 | -1.600 to 3.120 | 0.528 |
| NPI-Q score at 18 months | Biomarker-confirmed | MD | 2 | 0.568 | -0.967 to 2.102 | 0.468 |
| NPI-Q score at 18 months | Cochrane class pool | MD | 2 | 0.568 | -0.967 to 2.102 | 0.468 |

### Extended results

Every extended table is distributed in results/extended/tables. These include agent results, interaction tests, termination and target-class sensitivities, absolute safety, clinical-threshold compatibility, moderators, and influence analyses. Audit tables contain all independent-filter specifications, including empty sets, and the clearance influence results. These tables should be supplied as supplementary results without selecting only statistically significant findings.

## Interpretation for the Discussion

The analysis quantifies sensitivity to explicit evidence-selection choices. Selection by regulatory success or development outcome can itself favor successful agents and cannot validate a biological mechanism. Trial-level plaque reduction is not equivalent to individual-level mediation. Matching errors and missing PET estimates constrain clearance analyses. Within-person clinical-change thresholds cannot establish a universal minimum meaningful between-group treatment effect. The website should support examination of these uncertainties rather than adjudicate patient value from a P value or reference line.

## References

- Nonino et al. Cochrane review. https://doi.org/10.1002/14651858.CD016297
- Snyder et al. Perspective. https://doi.org/10.1002/alz.71696
- Neve et al. Marguerite RoAD. https://doi.org/10.3233/JAD-240221 (study design; PET extension and efficacy sections).
- Bateman et al. GRADUATE I/II. https://doi.org/10.1056/NEJMoa2304430
- Avgerinos et al. https://doi.org/10.1038/s41598-024-75204-8
- Lansdall et al. https://doi.org/10.14283/jpad.2022.102
