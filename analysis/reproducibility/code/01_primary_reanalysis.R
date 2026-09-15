#!/usr/bin/env Rscript

suppressPackageStartupMessages({
  library(metafor)
  library(ggplot2)
  library(dplyr)
  library(readr)
})

root <- normalizePath(".")
data_path <- file.path(root, "data/raw/cochrane/CD016297-analysis-data/CD016297-data-rows.csv")
overall_path <- file.path(root, "data/raw/cochrane/CD016297-analysis-data/CD016297-overall-estimates-and-settings.csv")
study_info_path <- file.path(root, "data/raw/cochrane/CD016297-study-data/CD016297-study-information.csv")
out_dir <- file.path(root, "generated/primary")
fig_dir <- file.path(out_dir, "figures")
dir.create(fig_dir, recursive = TRUE, showWarnings = FALSE)

rows <- read_csv(data_path, show_col_types = FALSE, na = c("", "NA", "#N/A"))
overall <- read_csv(overall_path, show_col_types = FALSE, na = c("", "NA", "#N/A"))
study_info <- read_csv(study_info_path, show_col_types = FALSE, na = c("", "NA", "#N/A"))
names(rows) <- make.names(names(rows), unique = TRUE)
names(overall) <- make.names(names(overall), unique = TRUE)

cochrane_settings <- overall %>%
  filter(Analysis.group <= 9) %>%
  transmute(
    analysis_id = paste(Analysis.group, Analysis.number, sep = "."),
    cochrane_ci_method = CI.method,
    cochrane_p_value = Effect.P
  )
if (anyDuplicated(cochrane_settings$analysis_id) ||
    any(is.na(cochrane_settings$cochrane_ci_method)) ||
    any(!cochrane_settings$cochrane_ci_method %in% c("HKSJ", "Wald"))) {
  stop("Cochrane inference settings are missing, duplicated, or use an unsupported CI method.")
}

# Trial-level placebo-adjusted amyloid PET changes (Centiloids). Negative values
# indicate greater plaque reduction on antibody than placebo. The main source is
# Imbimbo et al., Brain 2024, Table 1; GRADUATE values are taken from the primary
# NEJM report because its direct Centiloid estimates supersede a discrepant value
# in the secondary compilation.
amyloid_map <- tibble::tribble(
  ~Study, ~amyloid_change_cl, ~amyloid_source, ~mapping_note,
  "EMERGE 2022", -48.74, "Imbimbo 2024 Table 1", "High-dose aducanumab, 78 weeks",
  "ENGAGE 2022", -42.24, "Imbimbo 2024 Table 1", "High-dose aducanumab, 78 weeks",
  "ENVISION", NA_real_, "Not available", "No matched trial-level Centiloid estimate",
  "3000 Non Carriers 2016", 6.52, "Imbimbo 2024 Table 1", "Highest-dose bapineuzumab arm",
  "3001 Carriers 2016", -9.60, "Imbimbo 2024 Table 1", "Bapineuzumab 0.5 mg/kg arm",
  "Bapineuzumab-301 2014", NA_real_, "Not available", "No unambiguous matched trial-level estimate",
  "Bapineuzumab-302 2014", NA_real_, "Not available", "No unambiguous matched trial-level estimate",
  "CREAD 2 2022", -3.79, "Imbimbo 2024 Table 1", "Crenezumab 60 mg/kg, 53 weeks",
  "CREAD 2022", -1.99, "Imbimbo 2024 Table 1", "Crenezumab 60 mg/kg, 105 weeks",
  "TRAILBLAZER-ALZ 2 2023", -86.33, "Imbimbo 2024 Table 1", "Donanemab, 76 weeks",
  "SCarlet RoAD 2017", -12.64, "Imbimbo 2024 Table 1", "Gantenerumab 225 mg every 4 weeks",
  "Marguerite RoAD 2024", NA_real_, "Neve 2024 doi:10.3233/JAD-240221", "Prior -59.65 CL mapping quarantined: high-dose extension PET cannot establish placebo-adjusted removal during the low-dose randomized phase; compatible PET estimate unknown",
  "CLARITY AD 2023", -59.12, "Imbimbo 2024 Table 1", "Lecanemab 10 mg/kg every 2 weeks",
  "EXPEDITION - EXPEDITION 2 2016", NA_real_, "Not available", "No plaque PET reduction estimate; soluble-Aβ target",
  "EXPEDITION 3 2018", NA_real_, "Not available", "No plaque PET reduction estimate; soluble-Aβ target",
  "GRADUATE I 2023", -66.44, "Bateman 2023 NEJM", "Adjusted active-placebo Centiloid difference, week 116",
  "GRADUATE II 2023", -56.46, "Bateman 2023 NEJM", "Adjusted active-placebo Centiloid difference, week 116"
)

biomarker_confirmed_studies <- c(
  "CLARITY AD 2023", "CREAD 2022", "CREAD 2 2022", "EMERGE 2022", "ENGAGE 2022",
  "ENVISION", "EXPEDITION 3 2018", "GRADUATE I 2023", "GRADUATE II 2023",
  "Marguerite RoAD 2024", "SCarlet RoAD 2017",
  "TRAILBLAZER-ALZ 2 2023"
)

source_biomarker_studies <- study_info$Study[
  grepl("Inclusion criteria \\(PET/CSF\\):", study_info[["Char: Participants"]])
]
if (!setequal(biomarker_confirmed_studies, source_biomarker_studies)) {
  stop("Biomarker-confirmed classification disagrees with the Cochrane study-characteristics source. Missing from code: ",
       paste(setdiff(source_biomarker_studies, biomarker_confirmed_studies), collapse = ", "),
       "; unsupported in code: ", paste(setdiff(biomarker_confirmed_studies, source_biomarker_studies), collapse = ", "))
}

if (anyDuplicated(amyloid_map$Study)) stop("Duplicate PET mapping keys")
if (any(!unique(rows$Study[rows$Analysis.group <= 9]) %in% amyloid_map$Study)) stop("Unmapped study in clinical data")

dat <- rows %>%
  filter(Analysis.group <= 9) %>%
  left_join(amyloid_map, by = "Study") %>%
  mutate(
    analysis_id = paste(Analysis.group, Analysis.number, sep = "."),
    is_rr = grepl("ARIA|SAE|Mortality|Infusion|discontinuation", Analysis.name, ignore.case = TRUE),
    is_md = grepl("mean difference", Analysis.name, ignore.case = TRUE),
    yi = Mean,
    sei = (CI.end - CI.start) / (2 * qnorm(0.975)),
    vi = sei^2,
    biomarker_confirmed = Study %in% biomarker_confirmed_studies,
    approved_generation = Subgroup %in% c("Aducanumab", "Donanemab", "Lecanemab") |
      Study %in% c("EMERGE 2022", "ENGAGE 2022", "ENVISION", "TRAILBLAZER-ALZ 2 2023", "CLARITY AD 2023"),
    active_2026 = Subgroup %in% c("Donanemab", "Lecanemab") |
      Study %in% c("TRAILBLAZER-ALZ 2 2023", "CLARITY AD 2023"),
    clearance_ge_2cl = !is.na(amyloid_change_cl) & amyloid_change_cl <= -2,
    clearance_ge_4cl = !is.na(amyloid_change_cl) & amyloid_change_cl <= -4,
    clearance_ge_6cl = !is.na(amyloid_change_cl) & amyloid_change_cl <= -6,
    clearance_ge_8cl = !is.na(amyloid_change_cl) & amyloid_change_cl <= -8,
    clearance_ge_10cl = !is.na(amyloid_change_cl) & amyloid_change_cl <= -10,
    clearance_ge_12cl = !is.na(amyloid_change_cl) & amyloid_change_cl <= -12,
    demonstrated_clearance = clearance_ge_10cl,
    response_primary = biomarker_confirmed & approved_generation & demonstrated_clearance
  ) %>%
  mutate(
    yi = replace(yi, is_rr, log(Mean[is_rr])),
    sei = replace(sei, is_rr,
                  (log(CI.end[is_rr]) - log(CI.start[is_rr])) / (2 * qnorm(0.975))),
    vi = sei^2
  )
excluded_rows <- dat %>% filter(!is.finite(yi) | !is.finite(vi) | vi <= 0) %>%
  mutate(exclusion_reason = "Nonfinite effect or nonpositive/nonfinite sampling variance")
write_csv(excluded_rows, file.path(out_dir, "excluded_analysis_rows.csv"))
dat <- dat %>% filter(is.finite(yi), is.finite(vi), vi > 0)
if (anyDuplicated(paste(dat$Study, dat$analysis_id))) stop("Duplicate study-outcome contrast")

fit_meta <- function(d, ci_method = NULL, p_method = c("current", "cochrane")) {
  p_method <- match.arg(p_method)
  k <- nrow(d)
  if (k == 0) return(NULL)
  if (k == 1) {
    est <- d$yi[1]; se <- sqrt(d$vi[1]); crit <- qnorm(0.975)
    return(tibble(k = 1, estimate = est, ci_low = est - crit * se,
                  ci_high = est + crit * se, p_value = 2 * pnorm(-abs(est / se)),
                  tau2 = 0, i2 = NA_real_))
  }
  if (!is.null(ci_method) && !ci_method %in% c("HKSJ", "Wald")) {
    stop("Unsupported CI method: ", ci_method)
  }
  ci_test_type <- if (is.null(ci_method)) {
    if (k >= 3) "knha" else "z"
  } else if (ci_method == "HKSJ") {
    "knha"
  } else {
    "z"
  }
  fit <- rma.uni(yi = d$yi, vi = d$vi, method = "REML", test = ci_test_type)
  p_value <- if (p_method == "cochrane") {
    # The Cochrane export records HKSJ confidence intervals but its Effect P
    # values correspond closely to the unadjusted normal/Wald calculation.
    wald_fit <- rma.uni(yi = d$yi, vi = d$vi, method = "REML", test = "z")
    wald_fit$pval
  } else {
    fit$pval
  }
  tibble(k = k, estimate = as.numeric(fit$b), ci_low = fit$ci.lb,
         ci_high = fit$ci.ub, p_value = p_value, tau2 = fit$tau2, i2 = fit$I2)
}

scenarios <- list(
  "Cochrane class pool" = function(x) rep(TRUE, nrow(x)),
  "Biomarker-confirmed" = function(x) x$biomarker_confirmed,
  "Demonstrated clearance: >=2 CL" = function(x) x$clearance_ge_2cl,
  "Demonstrated clearance: >=4 CL" = function(x) x$clearance_ge_4cl,
  "Demonstrated clearance: >=6 CL" = function(x) x$clearance_ge_6cl,
  "Demonstrated clearance: >=8 CL" = function(x) x$clearance_ge_8cl,
  "Demonstrated clearance: >=10 CL" = function(x) x$clearance_ge_10cl,
  "Demonstrated clearance: >=12 CL" = function(x) x$clearance_ge_12cl,
  "Response primary: clearing approved-generation trials" = function(x) x$response_primary,
  "Currently active agents: lecanemab + donanemab" = function(x) x$active_2026
)

analysis_keys <- dat %>%
  distinct(analysis_id, Analysis.name, is_rr, is_md) %>%
  left_join(cochrane_settings %>% select(analysis_id, cochrane_ci_method), by = "analysis_id")
if (any(is.na(analysis_keys$cochrane_ci_method))) {
  stop("At least one primary analysis lacks a Cochrane CI method setting.")
}
summary_rows <- list()
idx <- 1
for (i in seq_len(nrow(analysis_keys))) {
  key <- analysis_keys[i, ]
  base <- dat %>% filter(analysis_id == key$analysis_id)
  for (scenario_name in names(scenarios)) {
    keep <- scenarios[[scenario_name]](base)
    fit <- fit_meta(base[keep %in% TRUE, , drop = FALSE])
    if (!is.null(fit)) {
      if (key$is_rr) {
        fit <- fit %>% mutate(estimate = exp(estimate), ci_low = exp(ci_low), ci_high = exp(ci_high))
      }
      summary_rows[[idx]] <- bind_cols(
        tibble(analysis_id = key$analysis_id, outcome = key$Analysis.name,
               measure = ifelse(key$is_rr, "RR", ifelse(key$is_md, "MD", "SMD")), scenario = scenario_name), fit
      )
      idx <- idx + 1
    }
  }
}
summary_tbl <- bind_rows(summary_rows) %>% arrange(analysis_id, scenario)

# Cochrane-compatible class-pool reproduction. The main sensitivity tables
# retain the internally consistent REML/HKSJ convention above; this separate
# output applies the CI method recorded for each Cochrane analysis and uses the
# Cochrane-compatible normal/Wald convention for Effect P.
cochrane_summary_rows <- list()
idx <- 1
for (i in seq_len(nrow(analysis_keys))) {
  key <- analysis_keys[i, ]
  base <- dat %>% filter(analysis_id == key$analysis_id)
  fit <- fit_meta(base, ci_method = key$cochrane_ci_method, p_method = "cochrane")
  if (!is.null(fit)) {
    if (key$is_rr) {
      fit <- fit %>% mutate(estimate = exp(estimate), ci_low = exp(ci_low), ci_high = exp(ci_high))
    }
    cochrane_summary_rows[[idx]] <- bind_cols(
      tibble(analysis_id = key$analysis_id, outcome = key$Analysis.name,
             measure = ifelse(key$is_rr, "RR", ifelse(key$is_md, "MD", "SMD")),
             scenario = "Cochrane class pool",
             ci_method = key$cochrane_ci_method,
             p_method = "Wald/z"),
      fit
    )
    idx <- idx + 1
  }
}
cochrane_summary_tbl <- bind_rows(cochrane_summary_rows) %>% arrange(analysis_id)

# Recalculate unstandardized mean differences for same-scale continuous outcomes.
raw_dat <- dat %>%
  filter(!is_rr, !is.na(Experimental.mean), !is.na(Control.mean),
         !is.na(Experimental.SD), !is.na(Control.SD),
         !is.na(Experimental.N), !is.na(Control.N)) %>%
  mutate(
    yi_raw = Experimental.mean - Control.mean,
    vi_raw = Experimental.SD^2 / Experimental.N + Control.SD^2 / Control.N
  )

raw_summary_rows <- list(); idx <- 1
raw_keys <- raw_dat %>% distinct(analysis_id, Analysis.name)
for (i in seq_len(nrow(raw_keys))) {
  key <- raw_keys[i, ]
  base <- raw_dat %>% filter(analysis_id == key$analysis_id) %>% mutate(yi = yi_raw, vi = vi_raw)
  for (scenario_name in names(scenarios)) {
    keep <- scenarios[[scenario_name]](base)
    fit <- fit_meta(base[keep %in% TRUE, , drop = FALSE])
    if (!is.null(fit)) {
      raw_summary_rows[[idx]] <- bind_cols(
        tibble(analysis_id = key$analysis_id, outcome = key$Analysis.name,
               measure = "MD", scenario = scenario_name), fit
      )
      idx <- idx + 1
    }
  }
}
raw_summary_tbl <- bind_rows(raw_summary_rows) %>% arrange(analysis_id, scenario)

# Trial-level random-effects meta-regression. The predictor is plaque reduction
# in 10-Centiloid units, coded positive for more clearance.
fit_meta_reg <- function(d, raw = FALSE) {
  if (raw) d <- d %>% mutate(yi = yi_raw, vi = vi_raw)
  d <- d %>% filter(!is.na(amyloid_change_cl)) %>% mutate(clearance_10cl = -amyloid_change_cl / 10)
  if (nrow(d) < 4) return(NULL)
  fit <- rma.uni(yi = yi, vi = vi, mods = ~ clearance_10cl, data = d,
                 method = "REML", test = "knha")
  ci <- confint(fit)
  tibble(
    outcome = unique(d$Analysis.name), measure = ifelse(raw, "MD", "SMD"),
    k = nrow(d), intercept = coef(fit)[1], slope_per_10cl = coef(fit)[2],
    slope_ci_low = fit$ci.lb[2], slope_ci_high = fit$ci.ub[2],
    slope_p = fit$pval[2], tau2 = fit$tau2, i2 = fit$I2
  )
}

reg_targets <- c("1.1", "1.4", "2.1", "3.1", "3.2")
reg_results <- bind_rows(lapply(reg_targets, function(id) {
  d <- dat %>% filter(analysis_id == id)
  fit_meta_reg(d, raw = FALSE)
}))
raw_reg_results <- bind_rows(lapply(c("1.1", "1.4", "2.1", "3.1", "3.2"), function(id) {
  d <- raw_dat %>% filter(analysis_id == id)
  fit_meta_reg(d, raw = TRUE)
}))
reg_results <- bind_rows(reg_results, raw_reg_results)

# Reproduction check against the supplied overall-estimate file.
cochrane_reported <- overall %>%
  filter(Analysis.group <= 9) %>%
  transmute(analysis_id = paste(Analysis.group, Analysis.number, sep = "."),
            cochrane_estimate = Mean, cochrane_ci_low = CI.start,
            cochrane_ci_high = CI.end)
cochrane_reported_full <- overall %>%
  filter(Analysis.group <= 9) %>%
  transmute(analysis_id = paste(Analysis.group, Analysis.number, sep = "."),
            cochrane_estimate = Mean, cochrane_ci_low = CI.start,
            cochrane_ci_high = CI.end, cochrane_p_value = Effect.P,
            cochrane_ci_method = CI.method)
repro <- summary_tbl %>%
  filter(scenario == "Cochrane class pool") %>%
  left_join(cochrane_reported, by = "analysis_id") %>%
  mutate(abs_difference = abs(estimate - cochrane_estimate))

cochrane_repro <- cochrane_summary_tbl %>%
  left_join(cochrane_reported_full, by = "analysis_id") %>%
  mutate(
    abs_estimate_difference = abs(estimate - cochrane_estimate),
    abs_ci_low_difference = abs(ci_low - cochrane_ci_low),
    abs_ci_high_difference = abs(ci_high - cochrane_ci_high),
    abs_p_value_difference = abs(p_value - cochrane_p_value)
  )

write_csv(dat, file.path(out_dir, "cleaned_analysis_rows.csv"))
write_csv(amyloid_map, file.path(out_dir, "amyloid_clearance_mapping.csv"))
write_csv(summary_tbl, file.path(out_dir, "all_outcome_sensitivity_results.csv"))
write_csv(raw_summary_tbl, file.path(out_dir, "raw_mean_difference_results.csv"))
write_csv(reg_results, file.path(out_dir, "continuous_clearance_meta_regression.csv"))
write_csv(repro, file.path(out_dir, "reproduction_check.csv"))
write_csv(cochrane_summary_tbl, file.path(out_dir, "cochrane_compatible_class_pool_results.csv"))
write_csv(cochrane_repro, file.path(out_dir, "cochrane_compatible_reproduction_check.csv"))
if (requireNamespace("jsonlite", quietly = TRUE)) {
  jsonlite::write_json(
    list(
      amyloid_mapping = amyloid_map,
      outcome_sensitivities = summary_tbl,
      raw_mean_differences = raw_summary_tbl,
      meta_regressions = reg_results,
      reproduction = repro,
      cochrane_compatible_class_pool = cochrane_summary_tbl,
      cochrane_compatible_reproduction = cochrane_repro,
      cleaned_rows = dat
    ),
    file.path(out_dir, "analysis_results.json"),
    dataframe = "rows", na = "null", auto_unbox = TRUE, digits = 15, pretty = TRUE
  )
}

# Priority endpoint comparison plot.
priority_ids <- c("1.1", "2.1", "3.5", "3.6", "4.2", "4.7", "5.1", "6.1", "9.1")
priority <- summary_tbl %>%
  filter(analysis_id %in% priority_ids,
         scenario %in% c("Cochrane class pool", "Response primary: clearing approved-generation trials",
                         "Demonstrated clearance: >=10 CL", "Currently active agents: lecanemab + donanemab")) %>%
  mutate(outcome_label = paste0(analysis_id, " ", outcome),
         scenario = factor(scenario, levels = c("Cochrane class pool", "Response primary: clearing approved-generation trials",
                                               "Demonstrated clearance: >=10 CL", "Currently active agents: lecanemab + donanemab")))

p <- ggplot(priority, aes(x = estimate, y = scenario, xmin = ci_low, xmax = ci_high, color = scenario)) +
  geom_vline(data = priority %>% distinct(outcome_label, measure),
             aes(xintercept = ifelse(measure == "RR", 1, 0)), color = "grey70", linewidth = 0.35) +
  geom_errorbarh(height = 0.18, linewidth = 0.45) + geom_point(size = 1.8) +
  facet_wrap(~ outcome_label, scales = "free_x", ncol = 2) +
  scale_color_manual(values = c("#5B6573", "#5C7AEA", "#00A087", "#D95F02", "#7B2CBF"), drop = FALSE) +
  labs(x = "Effect estimate (SMD or risk ratio; see panel)", y = NULL,
       title = "Cochrane class pooling versus response-conforming sensitivity analyses") +
  theme_minimal(base_size = 9) + theme(legend.position = "none", panel.grid.minor = element_blank(),
                                       strip.text = element_text(face = "bold", size = 8))
ggsave(file.path(fig_dir, "priority_endpoint_comparison.png"), p, width = 11, height = 12, dpi = 220)

# Raw-scale efficacy plot at the comparable 18-month time point.
raw_priority <- raw_summary_tbl %>%
  filter(analysis_id %in% c("1.1", "1.4", "2.1", "3.1", "3.2"),
         scenario %in% c("Cochrane class pool", "Response primary: clearing approved-generation trials",
                         "Demonstrated clearance: >=10 CL", "Currently active agents: lecanemab + donanemab")) %>%
  mutate(outcome_label = paste0(analysis_id, " ", outcome),
         scenario = factor(scenario, levels = c("Cochrane class pool", "Response primary: clearing approved-generation trials",
                                               "Demonstrated clearance: >=10 CL", "Currently active agents: lecanemab + donanemab")))
p2 <- ggplot(raw_priority, aes(x = estimate, y = scenario, xmin = ci_low, xmax = ci_high, color = scenario)) +
  geom_vline(xintercept = 0, color = "grey70", linewidth = 0.35) +
  geom_errorbarh(height = 0.18, linewidth = 0.45) + geom_point(size = 1.8) +
  facet_wrap(~ outcome_label, scales = "free_x", ncol = 2) +
  scale_color_manual(values = c("#5B6573", "#5C7AEA", "#00A087", "#D95F02", "#7B2CBF"), drop = FALSE) +
  labs(x = "Raw mean difference (active minus placebo)", y = NULL,
       title = "Unstandardized efficacy effects at approximately 18 months") +
  theme_minimal(base_size = 9) + theme(legend.position = "none", panel.grid.minor = element_blank(),
                                       strip.text = element_text(face = "bold", size = 8))
ggsave(file.path(fig_dir, "raw_mean_difference_comparison.png"), p2, width = 11, height = 8, dpi = 220)

# Scatterplots for the two central clinical outcomes.
for (id in c("1.1", "2.1")) {
  d <- dat %>% filter(analysis_id == id, !is.na(amyloid_change_cl)) %>%
    mutate(clearance = -amyloid_change_cl, label = gsub(" [0-9]{4}$", "", Study))
  fit <- rma.uni(yi = yi, vi = vi, mods = ~ I(clearance / 10), data = d,
                 method = "REML", test = "knha")
  grid <- data.frame(clearance = seq(min(d$clearance), max(d$clearance), length.out = 100))
  pred <- predict(fit, newmods = grid$clearance / 10)
  grid$pred <- pred$pred; grid$lo <- pred$ci.lb; grid$hi <- pred$ci.ub
  p3 <- ggplot(d, aes(clearance, yi)) +
    geom_ribbon(data = grid, aes(x = clearance, ymin = lo, ymax = hi), fill = "#5C7AEA", alpha = 0.15, inherit.aes = FALSE) +
    geom_line(data = grid, aes(x = clearance, y = pred), color = "#3558C7", linewidth = 0.8, inherit.aes = FALSE) +
    geom_point(aes(size = 1 / vi, color = Subgroup), alpha = 0.85) +
    geom_text(aes(label = label), nudge_y = 0.025, size = 2.4, check_overlap = TRUE) +
    geom_hline(yintercept = 0, color = "grey65", linewidth = 0.35) +
    scale_size_continuous(range = c(2, 6), guide = "none") +
    labs(x = "Placebo-adjusted amyloid plaque reduction (Centiloids)", y = "Standardized mean difference",
         title = unique(d$Analysis.name), subtitle = "Random-effects meta-regression; bubble area reflects precision") +
    theme_minimal(base_size = 9) + theme(panel.grid.minor = element_blank(), legend.position = "bottom")
  ggsave(file.path(fig_dir, paste0("clearance_meta_regression_", gsub("\\.", "_", id), ".png")),
         p3, width = 8.5, height = 5.5, dpi = 220)
}

cat("Wrote", nrow(summary_tbl), "sensitivity estimates and", nrow(reg_results), "meta-regressions\n")
cat("Maximum absolute reproduction difference:", max(repro$abs_difference, na.rm = TRUE), "\n")
