#!/usr/bin/env Rscript

suppressPackageStartupMessages({ library(readr); library(dplyr) })
root <- normalizePath(".")
rows <- read_csv(file.path(root, "data/raw/cochrane/CD016297-analysis-data/CD016297-data-rows.csv"), show_col_types = FALSE, na = c("", "NA", "#N/A"))
study_info <- read_csv(file.path(root, "data/raw/cochrane/CD016297-study-data/CD016297-study-information.csv"), show_col_types = FALSE)
clean <- read_csv(file.path(root, "generated/primary/cleaned_analysis_rows.csv"), show_col_types = FALSE, col_types = cols(analysis_id = col_character()))
repro <- read_csv(file.path(root, "generated/primary/reproduction_check.csv"), show_col_types = FALSE, col_types = cols(analysis_id = col_character()))
cochrane_repro <- read_csv(file.path(root, "generated/primary/cochrane_compatible_reproduction_check.csv"), show_col_types = FALSE, col_types = cols(analysis_id = col_character()))
annotations <- read_csv(file.path(root, "generated/extended/trial_annotations.csv"), show_col_types = FALSE)

source_biomarker <- study_info %>% transmute(Study, required = grepl("Inclusion criteria \\(PET/CSF\\):", `Char: Participants`))
coded_biomarker <- clean %>% distinct(Study, biomarker_confirmed)
biomarker_audit <- left_join(source_biomarker, coded_biomarker, by = "Study")
annotation_audit <- coded_biomarker %>% left_join(annotations %>% select(Study, biomarker_status), by = "Study")

checks <- tibble::tribble(
  ~check, ~value, ~expected, ~pass,
  "Duplicate study-outcome contrasts", sum(duplicated(paste(clean$Study, clean$analysis_id))), 0, !anyDuplicated(paste(clean$Study, clean$analysis_id)),
  "Missing study annotations", sum(is.na(annotation_audit$biomarker_status)), 0, !anyNA(annotation_audit$biomarker_status),
  "Distinct included studies", n_distinct(clean$Study), 17, n_distinct(clean$Study) == 17,
  "Biomarker-required studies", sum(biomarker_audit$required), 12, sum(biomarker_audit$required) == 12,
  "Source/coded biomarker disagreements", sum(biomarker_audit$required != biomarker_audit$biomarker_confirmed), 0, all(biomarker_audit$required == biomarker_audit$biomarker_confirmed),
  "Annotation/coded biomarker disagreements", sum((annotation_audit$biomarker_status == "Required") != annotation_audit$biomarker_confirmed), 0, all((annotation_audit$biomarker_status == "Required") == annotation_audit$biomarker_confirmed),
  "Analysis ID 4.10 preserved", sum(clean$analysis_id == "4.10"), 1, sum(clean$analysis_id == "4.10") == 1,
  "Malformed analysis identifiers", sum(!grepl("^[0-9]+\\.[0-9]+$", clean$analysis_id)), 0, all(grepl("^[0-9]+\\.[0-9]+$", clean$analysis_id)),
  "Invalid confidence-interval ordering", sum(clean$CI.start > clean$Mean | clean$Mean > clean$CI.end, na.rm = TRUE), 0, !any(clean$CI.start > clean$Mean | clean$Mean > clean$CI.end, na.rm = TRUE),
  "Nonpositive or nonfinite sampling variances", sum(!is.finite(clean$vi) | clean$vi <= 0), 0, all(is.finite(clean$vi) & clean$vi > 0),
  "Maximum Cochrane point-estimate reproduction error", max(repro$abs_difference, na.rm = TRUE), 0.00005, max(repro$abs_difference, na.rm = TRUE) < 0.00005,
  "Maximum Cochrane-compatible CI endpoint error", max(c(cochrane_repro$abs_ci_low_difference, cochrane_repro$abs_ci_high_difference), na.rm = TRUE), 0.001, max(c(cochrane_repro$abs_ci_low_difference, cochrane_repro$abs_ci_high_difference), na.rm = TRUE) < 0.001,
  "Maximum Cochrane-compatible p-value error", max(cochrane_repro$abs_p_value_difference, na.rm = TRUE), 0.0001, max(cochrane_repro$abs_p_value_difference, na.rm = TRUE) < 0.0001
)

write_csv(checks, file.path(root, "manifest/integrity-audit.csv"))
if (!all(checks$pass)) {
  print(checks %>% filter(!pass))
  stop("Integrity audit failed.")
}
cat("PASS: integrity audit (", nrow(checks), " checks).\n", sep = "")
