#!/usr/bin/env Rscript
# Precomputed exploratory models for the continuous-clearance explorer.
# No source adjudications are changed; the timing screen is not source validation.
suppressPackageStartupMessages({library(readr); library(dplyr); library(metafor); library(jsonlite)})
dir.create("generated/audit", recursive = TRUE, showWarnings = FALSE)
d <- read_csv("generated/primary/cleaned_analysis_rows.csv", show_col_types = FALSE,
              col_types = cols(analysis_id = col_character()))
pairings <- read_csv("generated/audit/pet_clinical_pairings.csv", show_col_types = FALSE,
                    col_types = cols(analysis_id = col_character()))
d <- left_join(d, pairings %>% select(Study, analysis_id, pet_week, pairing_status),
               by = c("Study", "analysis_id"))
stopifnot(!anyDuplicated(paste(d$Study, d$analysis_id)), !anyNA(d$pairing_status))

fit_model <- function(x, with_curve = FALSE) {
  result <- list(status = "not_estimable", k = nrow(x), agents = n_distinct(x$agent),
                 reason = "At least four trials and two distinct PET values are required; this minimum does not establish reliable inference.",
                 intercept = NA_real_, slope_per_10cl = NA_real_, ci_low = NA_real_,
                 ci_high = NA_real_, p_value = NA_real_, tau2 = NA_real_, df = NA_real_)
  if (nrow(x) < 4 || n_distinct(x$reduction_cl) < 2) return(result)
  m <- rma.uni(yi = effect, vi = variance, mods = ~ I(reduction_cl / 10),
               data = x, method = "REML", test = "knha")
  result <- modifyList(result, list(status = "estimated", reason = "", intercept = unname(coef(m)[1]),
    slope_per_10cl = unname(coef(m)[2]), ci_low = m$ci.lb[2], ci_high = m$ci.ub[2],
    p_value = m$pval[2], tau2 = m$tau2, df = m$k - m$p))
  if (with_curve) {
    grid <- seq(min(x$reduction_cl), max(x$reduction_cl), length.out = 81)
    prediction <- predict(m, newmods = grid / 10)
    result$curve <- data.frame(reduction_cl = grid, estimate = prediction$pred,
                              ci_low = prediction$ci.lb, ci_high = prediction$ci.ub)
    result$weights <- data.frame(study = x$study, weight_percent = as.numeric(weights(m)))
  }
  result
}

models <- list(); summaries <- list(); influence <- list(); inputs <- list()
for (id in c("1.1", "2.1", "1.4")) {
  all_rows <- d %>% filter(analysis_id == id) %>% transmute(
    study = Study, agent = Subgroup, effect = yi, variance = vi,
    ci_low = CI.start, ci_high = CI.end, reduction_cl = -amyloid_change_cl,
    pet_week, pairing_status, amyloid_source, mapping_note)
  outcome <- unique(d$Analysis.name[d$analysis_id == id])
  for (scope in c("all_pet", "time_screen")) {
    rows <- all_rows %>% mutate(
      included = is.finite(reduction_cl) & is.finite(effect) & is.finite(variance) & variance > 0 &
        (scope == "all_pet" | startsWith(pairing_status, "Time-compatible")),
      reason = case_when(!is.finite(reduction_cl) ~ "PET value unknown or quarantined",
        !is.finite(effect) | !is.finite(variance) | variance <= 0 ~ "Clinical effect or variance unavailable",
        scope == "time_screen" & !startsWith(pairing_status, "Time-compatible") ~ pairing_status,
        TRUE ~ "Included: measured PET; no minimum clearance or approval restriction"))
    x <- rows %>% filter(included)
    model <- fit_model(x, with_curve = TRUE)
    # The all-PET models must reproduce the existing release's SMD slopes.
    if (scope == "all_pet") {
      reference <- read_csv("generated/primary/continuous_clearance_meta_regression.csv", show_col_types = FALSE) %>%
        filter(.data$outcome == .env$outcome, measure == "SMD")
      stopifnot(nrow(reference) == 1, model$k == reference$k,
                abs(model$slope_per_10cl - reference$slope_per_10cl) < 1e-8)
    }
    sensitivity <- list()
    for (unit in c("trial", "drug")) {
      values <- if (unit == "trial") x$study else unique(x$agent)
      for (omitted in values) {
        remaining <- if (unit == "trial") filter(x, study != omitted) else filter(x, agent != omitted)
        fitted <- fit_model(remaining)
        row <- c(list(unit = unit, omitted = omitted), fitted)
        sensitivity[[length(sensitivity) + 1]] <- row
        influence[[length(influence) + 1]] <- as_tibble(c(list(analysis_id = id, outcome = outcome, scope = scope), row))
      }
    }
    rows$weight_percent <- if (model$status == "estimated") model$weights$weight_percent[match(rows$study, model$weights$study)] else NA_real_
    model$weights <- NULL
    models[[length(models) + 1]] <- c(list(analysis_id = id, outcome = outcome, measure = "SMD", scope = scope),
                                     model, list(trials = rows, sensitivity = sensitivity))
    summaries[[length(summaries) + 1]] <- as_tibble(c(list(analysis_id = id, outcome = outcome, scope = scope, measure = "SMD"), model[names(model) != "curve"]))
    inputs[[length(inputs) + 1]] <- bind_cols(tibble(analysis_id = id, outcome = outcome, scope = scope), rows)
  }
}
write_json(models, "generated/audit/continuous_clearance_explorer.json", auto_unbox = TRUE, digits = NA, na = "null")
write_csv(bind_rows(summaries), "generated/audit/continuous_clearance_models.csv")
write_csv(bind_rows(influence), "generated/audit/continuous_clearance_sensitivity.csv")
write_csv(bind_rows(inputs), "generated/audit/continuous_clearance_inputs.csv")
cat("Generated six continuous-clearance models, pointwise confidence bands and trial/drug omission sensitivities.\n")
