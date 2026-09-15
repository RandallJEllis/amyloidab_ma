# Website evidence registry

`evidence.json` is the exact machine-readable evidence registry published with the current release of Living Amyloid Evidence. It is generated from the primary and extended JSON/CSV results by `code/03_build_evidence_registry.mjs`. The registry includes the investigator-defined ≥2, ≥4, ≥6, ≥8, ≥10, and ≥12 Centiloid clearance conditions; the ≥10-CL response condition remains unchanged. Its `amyloidMapping` collection supplies the quantitative active-minus-placebo Centiloid values displayed in the website's trial-level mapping table.

The browser does not perform a new meta-analysis. It filters and displays estimates already present in this registry. `manifest/website-field-provenance.csv` maps each top-level registry collection to its statistical source.
