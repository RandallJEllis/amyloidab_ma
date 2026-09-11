#!/bin/sh
set -eu

PACKAGE_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$PACKAGE_ROOT"
node code/10_verify_raw.mjs
if [ -d "$PACKAGE_ROOT/environment/library" ]; then
  export R_LIBS_USER="$PACKAGE_ROOT/environment/library"
fi

Rscript -e 'needed <- c("metafor", "dplyr", "readr", "tidyr", "ggplot2", "jsonlite"); missing <- needed[!vapply(needed, requireNamespace, logical(1), quietly = TRUE)]; if (length(missing)) stop("Missing R packages: ", paste(missing, collapse = ", "), ". Run: Rscript environment/install_dependencies.R")'

printf '%s\n' '1/5 Running primary reanalysis from the Cochrane data package...'
Rscript code/01_primary_reanalysis.R

printf '%s\n' '2/5 Running extended analyses from the generated primary tables...'
Rscript code/02_extended_reanalysis.R

printf '%s\n' 'Auditing source pairings and computing exploratory filter sensitivities...'
Rscript code/08_traceability.R

printf '%s\n' '3/5 Building the exact evidence registry consumed by the website...'
node code/03_build_evidence_registry.mjs

printf '%s\n' '4/5 Comparing generated results with the published snapshots...'
./verify.sh

printf '%s\n' '5/5 Running source, identifier, variance, and reproduction integrity checks...'
Rscript code/07_integrity_audit.R

node code/09_manuscript.mjs

printf '%s\n' 'Complete. Recreated files are in generated/.'
