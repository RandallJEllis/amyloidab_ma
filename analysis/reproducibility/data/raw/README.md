# Raw input data

`cochrane/` is the complete Cochrane Review Data Package supplied with CD016297, not a table created by this reanalysis. Its own provenance page is `cochrane/CD016297-data-package-info.html`.

The statistical pipeline directly reads two files:

- `cochrane/CD016297-analysis-data/CD016297-data-rows.csv`: every study row used in each Cochrane meta-analysis.
- `cochrane/CD016297-analysis-data/CD016297-overall-estimates-and-settings.csv`: the Cochrane overall estimates and settings used for the reproduction check.

The remaining analysis, study, risk-of-bias, reference, ongoing, awaiting-classification, and excluded-study files are retained so the input is complete and auditable. They are not silently modified by the scripts.

See `manifest/SHA256SUMS.txt` for file checksums and the package `README.md` for the full data flow.
