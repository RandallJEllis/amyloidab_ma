#!/bin/sh
set -eu

PACKAGE_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$PACKAGE_ROOT"

mkdir -p generated
Rscript code/04_verify_outputs.R
node code/05_verify_evidence.mjs
printf '%s\n' 'PASS: primary tables, extended tables, and website evidence registry match the published package.' | tee generated/verification-report.txt
