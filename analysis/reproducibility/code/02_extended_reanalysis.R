#!/usr/bin/env Rscript

suppressPackageStartupMessages({
  library(metafor)
  library(dplyr)
  library(readr)
  library(tidyr)
  library(ggplot2)
})

root <- normalizePath(".")
in_dir <- file.path(root, "generated/primary")
out_dir <- file.path(root, "generated/extended")
fig_dir <- file.path(out_dir, "figures")
dir.create(fig_dir, recursive = TRUE, showWarnings = FALSE)

dat <- read_csv(file.path(in_dir, "cleaned_analysis_rows.csv"), show_col_types = FALSE,
                na = c("", "NA", "#N/A"), col_types = cols(analysis_id = col_character()))
base_raw <- read_csv(file.path(in_dir, "raw_mean_difference_results.csv"), show_col_types = FALSE,
                     na = c("", "NA", "#N/A"), col_types = cols(analysis_id = col_character()))
dat <- dat %>% mutate(analysis_id = as.character(analysis_id))
base_raw <- base_raw %>% mutate(analysis_id = as.character(analysis_id))
if (any(!grepl("^[0-9]+\\.[0-9]+$", dat$analysis_id)) || !"4.10" %in% dat$analysis_id) {
  stop("Analysis identifiers were altered during import; they must remain character strings (including 4.10).")
}

# Antibody identity is reconstructed from the Cochrane study label where the
# subgroup cell is blank in the exported analysis row.
trial_map <- tibble::tribble(
  ~Study, ~agent, ~target_class, ~target_detail, ~termination_status, ~termination_reason, ~biomarker_status, ~status_source,
  "EMERGE 2022", "Aducanumab", "Aggregated/fibrillar Aβ", "Aggregated soluble oligomers and insoluble fibrils", "Early terminated", "Futility", "Required", "Cochrane CD016297 refs 97/111 and study description",
  "ENGAGE 2022", "Aducanumab", "Aggregated/fibrillar Aβ", "Aggregated soluble oligomers and insoluble fibrils", "Early terminated", "Futility", "Required", "Cochrane CD016297 refs 97/111 and study description",
  "ENVISION", "Aducanumab", "Aggregated/fibrillar Aβ", "Aggregated soluble oligomers and insoluble fibrils", "Early terminated", "Reason not reported", "Required", "Cochrane CD016297 ref 99 and study description",
  "3000 Non Carriers 2016", "Bapineuzumab", "Aggregated/fibrillar Aβ", "N-terminal epitope; monomer and aggregated Aβ", "Early terminated", "Symptomatic ARIA-E", "Not required", "Cochrane CD016297 ref 107 and study description",
  "3001 Carriers 2016", "Bapineuzumab", "Aggregated/fibrillar Aβ", "N-terminal epitope; monomer and aggregated Aβ", "Early terminated", "Symptomatic ARIA-E", "Not required", "Cochrane CD016297 ref 108 and study description",
  "Bapineuzumab-301 2014", "Bapineuzumab", "Aggregated/fibrillar Aβ", "N-terminal epitope; monomer and aggregated Aβ", "Completed", "Completed", "Not required", "Cochrane CD016297 refs 103/134-136",
  "Bapineuzumab-302 2014", "Bapineuzumab", "Aggregated/fibrillar Aβ", "N-terminal epitope; monomer and aggregated Aβ", "Completed", "Completed", "Not required", "Cochrane CD016297 refs 109/137",
  "CREAD 2 2022", "Crenezumab", "Soluble aggregate-preferring", "Monomeric and oligomeric Aβ; higher affinity for oligomers", "Early terminated", "Futility", "Required", "Cochrane CD016297 ref 112",
  "CREAD 2022", "Crenezumab", "Soluble aggregate-preferring", "Monomeric and oligomeric Aβ; higher affinity for oligomers", "Early terminated", "Futility", "Required", "Cochrane CD016297 ref 101",
  "TRAILBLAZER-ALZ 2 2023", "Donanemab", "Pyroglutamate plaque Aβ", "N-terminal pyroglutamate-modified Aβ in deposited plaque", "Completed", "Completed", "Required", "Cochrane CD016297 ref 105",
  "SCarlet RoAD 2017", "Gantenerumab", "Aggregated/fibrillar Aβ", "Conformational epitope on aggregated fibrils and plaques", "Early terminated", "Futility", "Required", "Cochrane CD016297 ref 102",
  "Marguerite RoAD 2024", "Gantenerumab", "Aggregated/fibrillar Aβ", "Conformational epitope on aggregated fibrils and plaques", "Early terminated", "Futility", "Required", "Cochrane CD016297 ref 100 and study description",
  "GRADUATE I 2023", "Gantenerumab", "Aggregated/fibrillar Aβ", "Conformational epitope on aggregated fibrils and plaques", "Completed", "Completed", "Required", "Cochrane CD016297 refs 96/110 and study description",
  "GRADUATE II 2023", "Gantenerumab", "Aggregated/fibrillar Aβ", "Conformational epitope on aggregated fibrils and plaques", "Completed", "Completed", "Required", "Cochrane CD016297 refs 96/110 and study description",
  "CLARITY AD 2023", "Lecanemab", "Soluble aggregate-preferring", "High affinity for soluble protofibrils; also engages fibrils", "Completed", "Completed", "Required", "Cochrane CD016297 ref 106",
  "EXPEDITION - EXPEDITION 2 2016", "Solanezumab", "Soluble monomer Aβ", "Mid-domain epitope; predominantly soluble monomer", "Completed", "Completed", "Not required", "Cochrane CD016297 ref 104",
  "EXPEDITION 3 2018", "Solanezumab", "Soluble monomer Aβ", "Mid-domain epitope; predominantly soluble monomer", "Completed", "Completed", "Required", "Cochrane CD016297 ref 98"
)

flag_audit <- dat %>%
  distinct(Study, biomarker_confirmed) %>%
  left_join(trial_map %>% select(Study, biomarker_status), by = "Study") %>%
  mutate(annotation_required = biomarker_status == "Required")
if (any(is.na(flag_audit$biomarker_status)) || any(flag_audit$biomarker_confirmed != flag_audit$annotation_required)) {
  stop("Primary biomarker flags disagree with the extended trial annotations.")
}

dat <- dat %>%
  select(-any_of(c("agent", "target_class", "target_detail", "termination_status",
                   "termination_reason", "biomarker_status", "status_source"))) %>%
  left_join(trial_map, by = "Study") %>%
  mutate(
    futility_terminated = termination_reason == "Futility",
    any_early_terminated = termination_status == "Early terminated",
    study_year = as.numeric(Study.year),
    year_per5 = (study_year - 2014) / 5
  )

fit_meta <- function(d, yi_col = "yi", vi_col = "vi", exponentiate = FALSE) {
  d <- d %>% filter(is.finite(.data[[yi_col]]), is.finite(.data[[vi_col]]), .data[[vi_col]] > 0)
  k <- nrow(d)
  if (!k) return(NULL)
  if (k == 1) {
    est <- d[[yi_col]][1]; se <- sqrt(d[[vi_col]][1]); crit <- qnorm(.975)
    ans <- tibble(k = 1, estimate = est, ci_low = est - crit * se,
                  ci_high = est + crit * se, p_value = 2 * pnorm(-abs(est / se)),
                  tau2 = 0, i2 = NA_real_, pi_low = NA_real_, pi_high = NA_real_)
  } else {
    fit <- tryCatch(
      rma.uni(yi = d[[yi_col]], vi = d[[vi_col]], method = "REML",
              test = ifelse(k >= 3, "knha", "z")),
      error = function(e) rma.uni(yi = d[[yi_col]], vi = d[[vi_col]], method = "DL",
                                  test = ifelse(k >= 3, "knha", "z"))
    )
    pred <- tryCatch(predict(fit), error = function(e) NULL)
    ans <- tibble(k = k, estimate = as.numeric(fit$b), ci_low = fit$ci.lb,
                  ci_high = fit$ci.ub, p_value = fit$pval, tau2 = fit$tau2,
                  i2 = fit$I2,
                  pi_low = ifelse(is.null(pred) || k < 3, NA_real_, pred$pi.lb),
                  pi_high = ifelse(is.null(pred) || k < 3, NA_real_, pred$pi.ub))
  }
  if (exponentiate) ans <- ans %>% mutate(across(c(estimate, ci_low, ci_high, pi_low, pi_high), exp))
  ans
}

measure_for <- function(d) ifelse(first(d$is_rr), "RR", ifelse(first(d$is_md), "MD", "SMD"))

# Individual-antibody meta-analyses for every outcome.
agent_results <- dat %>%
  group_by(analysis_id, Analysis.name, agent) %>%
  group_modify(~ {
    z <- fit_meta(.x, exponentiate = first(.x$is_rr))
    if (is.null(z)) return(tibble())
    mutate(z, measure = measure_for(.x))
  }) %>%
  ungroup() %>%
  rename(outcome = Analysis.name) %>%
  select(analysis_id, outcome, measure, agent, everything())

# Formal between-antibody omnibus tests. They are omitted when residual degrees
# of freedom are unavailable (for example, one study per antibody).
agent_interactions <- dat %>%
  group_by(analysis_id, Analysis.name) %>%
  group_modify(~ {
    d <- .x %>% filter(!is.na(agent))
    a <- n_distinct(d$agent); k <- nrow(d)
    if (a < 2 || k <= a) return(tibble())
    fit <- tryCatch(rma.uni(yi = yi, vi = vi, mods = ~ factor(agent), data = d,
                            method = "REML", test = "knha"), error = function(e) NULL)
    if (is.null(fit)) return(tibble())
    tibble(k = k, agents = a, measure = measure_for(d),
           omnibus_qm = fit$QM, omnibus_df = fit$m, omnibus_p = fit$QMp,
           residual_i2 = fit$I2, residual_tau2 = fit$tau2)
  }) %>% ungroup() %>% rename(outcome = Analysis.name)

# Response-requested exclusions based on the Cochrane review's own termination
# classifications.
termination_scenarios <- list(
  "Cochrane class pool" = function(x) rep(TRUE, nrow(x)),
  "Exclude futility-terminated trials" = function(x) !x$futility_terminated,
  "Exclude all early-terminated trials" = function(x) !x$any_early_terminated
)
termination_results <- list(); j <- 1
for (id in unique(dat$analysis_id)) {
  base <- dat %>% filter(analysis_id == id)
  for (nm in names(termination_scenarios)) {
    keep <- termination_scenarios[[nm]](base)
    z <- fit_meta(base[keep %in% TRUE, , drop = FALSE], exponentiate = first(base$is_rr))
    if (!is.null(z)) {
      termination_results[[j]] <- bind_cols(
        tibble(analysis_id = id, outcome = first(base$Analysis.name),
               measure = measure_for(base), scenario = nm), z)
      j <- j + 1
    }
  }
}
termination_results <- bind_rows(termination_results)

raw_termination_results <- list(); j <- 1
for (id in unique(raw_trial_id <- dat$analysis_id)) {
  base <- dat %>% filter(analysis_id == id, !is_rr, !is.na(Experimental.mean),
                         !is.na(Control.mean), !is.na(Experimental.SD),
                         !is.na(Control.SD), !is.na(Experimental.N), !is.na(Control.N)) %>%
    mutate(yi_raw = Experimental.mean - Control.mean,
           vi_raw = Experimental.SD^2 / Experimental.N + Control.SD^2 / Control.N)
  if (!nrow(base)) next
  for (nm in names(termination_scenarios)) {
    keep <- termination_scenarios[[nm]](base)
    z <- fit_meta(base[keep %in% TRUE, , drop = FALSE], yi_col = "yi_raw", vi_col = "vi_raw")
    if (!is.null(z)) {
      raw_termination_results[[j]] <- bind_cols(
        tibble(analysis_id = id, outcome = first(base$Analysis.name),
               measure = "MD", scenario = nm), z)
      j <- j + 1
    }
  }
}
raw_termination_results <- bind_rows(raw_termination_results)

# Biological target-class analyses for the core clinical and safety outcomes.
priority_ids <- c("1.1", "1.4", "2.1", "3.2", "3.5", "3.6", "4.2", "4.7", "5.1", "6.1", "9.1")
target_class_results <- dat %>% filter(analysis_id %in% priority_ids) %>%
  group_by(analysis_id, Analysis.name, target_class) %>%
  group_modify(~ {
    z <- fit_meta(.x, exponentiate = first(.x$is_rr))
    if (is.null(z)) return(tibble())
    mutate(z, measure = measure_for(.x))
  }) %>% ungroup() %>% rename(outcome = Analysis.name) %>%
  select(analysis_id, outcome, measure, target_class, everything())

# Leave-one-antibody-out influence analyses for central outcomes.
influence_ids <- c("1.1", "2.1", "3.5", "4.2", "4.7", "5.1", "6.1", "9.1")
influence_results <- list(); j <- 1
for (id in influence_ids) {
  base <- dat %>% filter(analysis_id == id)
  for (a in sort(unique(base$agent))) {
    z <- fit_meta(base %>% filter(agent != a), exponentiate = first(base$is_rr))
    if (!is.null(z)) {
      influence_results[[j]] <- bind_cols(
        tibble(analysis_id = id, outcome = first(base$Analysis.name),
               measure = measure_for(base), omitted_agent = a), z)
      j <- j + 1
    }
  }
}
influence_results <- bind_rows(influence_results)

# Raw same-scale trial effects and percentage slowing relative to placebo-group
# decline. Percentage slowing is descriptive because control trajectories and
# estimands differ across trials.
raw_trial <- dat %>%
  filter(!is_rr, !is.na(Experimental.mean), !is.na(Control.mean),
         !is.na(Experimental.SD), !is.na(Control.SD),
         !is.na(Experimental.N), !is.na(Control.N)) %>%
  mutate(
    yi_raw = Experimental.mean - Control.mean,
    vi_raw = Experimental.SD^2 / Experimental.N + Control.SD^2 / Control.N,
    benefit_sign = case_when(
      grepl("ADAS|CDR-SB|NPI", Analysis.name) ~ -1,
      TRUE ~ 1
    ),
    benefit_points = benefit_sign * yi_raw,
    percent_slowing = ifelse(abs(Control.mean) >= 0.25,
                             100 * benefit_points / abs(Control.mean), NA_real_)
  )

raw_agent_results <- raw_trial %>%
  group_by(analysis_id, Analysis.name, agent) %>%
  group_modify(~ {
    z <- fit_meta(.x, yi_col = "yi_raw", vi_col = "vi_raw")
    if (is.null(z)) return(tibble())
    mutate(z, measure = "MD")
  }) %>% ungroup() %>% rename(outcome = Analysis.name) %>%
  select(analysis_id, outcome, measure, agent, everything())

# Absolute safety effects. RD is active minus placebo. Positive values indicate
# harm. Number needed to harm/benefit is shown only when its CI does not cross 0.
safety <- dat %>%
  filter(is_rr, !is.na(Experimental.cases), !is.na(Control.cases),
         !is.na(Experimental.N), !is.na(Control.N)) %>%
  mutate(
    p_active = Experimental.cases / Experimental.N,
    p_control = Control.cases / Control.N,
    rd = p_active - p_control,
    vi_rd = p_active * (1 - p_active) / Experimental.N +
      p_control * (1 - p_control) / Control.N
  ) %>% filter(is.finite(vi_rd), vi_rd > 0)

absolute_safety <- safety %>%
  group_by(analysis_id, Analysis.name, agent) %>%
  group_modify(~ {
    z <- fit_meta(.x, yi_col = "rd", vi_col = "vi_rd")
    if (is.null(z)) return(tibble())
    totals <- summarise(.x,
      active_events = sum(Experimental.cases), active_n = sum(Experimental.N),
      control_events = sum(Control.cases), control_n = sum(Control.N))
    bind_cols(z, totals)
  }) %>% ungroup() %>% rename(outcome = Analysis.name) %>%
  mutate(
    measure = "RD",
    rd_per_1000 = estimate * 1000,
    rd_ci_low_per_1000 = ci_low * 1000,
    rd_ci_high_per_1000 = ci_high * 1000,
    active_risk = active_events / active_n,
    control_risk = control_events / control_n,
    nn_type = case_when(
      ci_low <= 0 & ci_high >= 0 ~ "Indeterminate (CI crosses 0)",
      estimate > 0 ~ "NNH", estimate < 0 ~ "NNTB", TRUE ~ "None"),
    number_needed = ifelse(ci_low <= 0 & ci_high >= 0, NA_real_,
                           ifelse(estimate == 0, NA_real_, 1 / abs(estimate))),
    nn_ci_low = case_when(
      ci_low > 0 & ci_high > 0 ~ 1 / ci_high,
      ci_low < 0 & ci_high < 0 ~ 1 / abs(ci_low),
      TRUE ~ NA_real_),
    nn_ci_high = case_when(
      ci_low > 0 & ci_high > 0 ~ 1 / ci_low,
      ci_low < 0 & ci_high < 0 ~ 1 / abs(ci_high),
      TRUE ~ NA_real_)
  ) %>% select(analysis_id, outcome, measure, agent, everything())

absolute_safety_scenarios <- list(); j <- 1
abs_scenarios <- list(
  "Cochrane class pool" = function(x) rep(TRUE, nrow(x)),
  "Response primary" = function(x) x$response_primary,
  "Currently active: lecanemab + donanemab" = function(x) x$active_2026
)
for (id in unique(safety$analysis_id)) {
  base <- safety %>% filter(analysis_id == id)
  for (nm in names(abs_scenarios)) {
    keep <- abs_scenarios[[nm]](base)
    d <- base[keep %in% TRUE, , drop = FALSE]
    z <- fit_meta(d, yi_col = "rd", vi_col = "vi_rd")
    if (!is.null(z)) {
      absolute_safety_scenarios[[j]] <- bind_cols(
        tibble(analysis_id = id, outcome = first(base$Analysis.name),
               scenario = nm, measure = "RD"), z) %>%
        mutate(rd_per_1000 = estimate * 1000,
               rd_ci_low_per_1000 = ci_low * 1000,
               rd_ci_high_per_1000 = ci_high * 1000)
      j <- j + 1
    }
  }
}
absolute_safety_scenarios <- bind_rows(absolute_safety_scenarios)

# MID/MCID compatibility. These are the short-horizon benchmarks cited in the
# Cochrane discussion, not newly endorsed thresholds. A threshold is "excluded"
# when the upper bound of benefit is below it and "compatible" when the CI spans it.
mid_map <- tibble::tribble(
  ~analysis_id, ~threshold_points, ~threshold_context,
  "1.1", 2, "ADAS-Cog: lower end of 2-3 point MCI benchmark cited by Cochrane",
  "1.1", 3, "ADAS-Cog: upper end of 2-3 point MCI benchmark cited by Cochrane",
  "1.1", 4, "ADAS-Cog: dementia benchmark cited by Cochrane",
  "1.3", 2, "ADAS-Cog: lower end of 2-3 point MCI benchmark cited by Cochrane; not horizon-validated",
  "1.3", 3, "ADAS-Cog: upper end of 2-3 point MCI benchmark cited by Cochrane; not horizon-validated",
  "1.3", 4, "ADAS-Cog: dementia benchmark cited by Cochrane; not horizon-validated",
  "2.1", 1, "CDR-SB: MCI benchmark cited by Cochrane",
  "2.1", 2, "CDR-SB: dementia benchmark cited by Cochrane",
  "2.3", 1, "CDR-SB: MCI benchmark cited by Cochrane; not horizon-validated",
  "2.3", 2, "CDR-SB: dementia benchmark cited by Cochrane; not horizon-validated"
)

mid_scenarios <- c("Cochrane class pool", "Response primary: clearing approved-generation trials",
                   "Currently active agents: lecanemab + donanemab")
mid_compatibility <- base_raw %>%
  filter(scenario %in% mid_scenarios, analysis_id %in% mid_map$analysis_id) %>%
  left_join(mid_map, by = "analysis_id", relationship = "many-to-many") %>%
  mutate(
    benefit_estimate = ifelse(grepl("ADAS|CDR-SB", outcome), -estimate, estimate),
    benefit_ci_low = ifelse(grepl("ADAS|CDR-SB", outcome), -ci_high, ci_low),
    benefit_ci_high = ifelse(grepl("ADAS|CDR-SB", outcome), -ci_low, ci_high),
    threshold_result = case_when(
      benefit_ci_low >= threshold_points ~ "CI entirely at/above threshold",
      benefit_ci_high < threshold_points ~ "Threshold excluded by 95% CI",
      TRUE ~ "95% CI compatible with threshold"
    ),
    horizon_warning = ifelse(grepl("above 24", outcome, ignore.case = TRUE),
                             "Threshold originated from shorter follow-up", "18-month use still exceeds cited 6-12 month derivation")
  ) %>% select(analysis_id, outcome, scenario, k, benefit_estimate, benefit_ci_low,
               benefit_ci_high, threshold_points, threshold_context,
               threshold_result, horizon_warning)

# Trial-level ARIA-E excess risk as an indirect functional-unblinding proxy.
aria_proxy <- safety %>% filter(analysis_id == "4.2") %>%
  select(Study, aria_e_rd = rd)

fit_moderator <- function(d, mod_col, label, raw = FALSE) {
  yi_name <- ifelse(raw, "yi_raw", "yi")
  vi_name <- ifelse(raw, "vi_raw", "vi")
  d <- d %>% filter(is.finite(.data[[yi_name]]), is.finite(.data[[vi_name]]),
                    is.finite(.data[[mod_col]]))
  if (nrow(d) < 4 || n_distinct(d[[mod_col]]) < 2) return(NULL)
  fit <- tryCatch(rma.uni(yi = d[[yi_name]], vi = d[[vi_name]],
                          mods = as.formula(paste("~", mod_col)), data = d,
                          method = "REML", test = "knha"), error = function(e) NULL)
  if (is.null(fit)) return(NULL)
  tibble(k = nrow(d), moderator = label, moderator_variable = mod_col,
         intercept = coef(fit)[1], slope = coef(fit)[2],
         slope_ci_low = fit$ci.lb[2], slope_ci_high = fit$ci.ub[2],
         slope_p = fit$pval[2], tau2 = fit$tau2, i2 = fit$I2)
}

moderator_results <- list(); j <- 1
for (id in c("1.1", "1.4", "2.1", "3.5")) {
  d <- dat %>% filter(analysis_id == id)
  mods <- list(
    c("biomarker_confirmed", "Biomarker-confirmed enrollment (binary)"),
    c("futility_terminated", "Futility termination (binary)"),
    c("year_per5", "Trial publication year per 5 years")
  )
  for (m in mods) {
    z <- fit_moderator(d, m[1], m[2])
    if (!is.null(z)) {
      moderator_results[[j]] <- bind_cols(tibble(analysis_id = id,
        outcome = first(d$Analysis.name), measure = measure_for(d)), z); j <- j + 1
    }
  }
  d2 <- d %>% left_join(aria_proxy, by = "Study") %>% mutate(aria_e_rd_10pct = aria_e_rd / .10)
  z <- fit_moderator(d2, "aria_e_rd_10pct", "ARIA-E risk difference per 10 percentage points")
  if (!is.null(z)) {
    moderator_results[[j]] <- bind_cols(tibble(analysis_id = id,
      outcome = first(d$Analysis.name), measure = measure_for(d)), z); j <- j + 1
  }
}
moderator_results <- bind_rows(moderator_results)

# Benefit-harm matrix for approved-generation antibodies. Clinical estimates are
# kept separate from harms; no composite utility is imposed.
get_agent_raw <- function(id, a) raw_agent_results %>% filter(analysis_id == id, agent == a) %>% slice(1)
get_abs <- function(id, a) absolute_safety %>% filter(analysis_id == id, agent == a) %>% slice(1)
benefit_harm <- bind_rows(lapply(c("Aducanumab", "Lecanemab", "Donanemab"), function(a) {
  adas <- get_agent_raw("1.1", a); cdr <- get_agent_raw("2.1", a)
  aria <- get_abs("4.2", a); disc <- get_abs("9.1", a)
  tibble(
    agent = a,
    adas_md = ifelse(nrow(adas), adas$estimate, NA_real_),
    adas_ci_low = ifelse(nrow(adas), adas$ci_low, NA_real_),
    adas_ci_high = ifelse(nrow(adas), adas$ci_high, NA_real_),
    cdr_sb_md = ifelse(nrow(cdr), cdr$estimate, NA_real_),
    cdr_ci_low = ifelse(nrow(cdr), cdr$ci_low, NA_real_),
    cdr_ci_high = ifelse(nrow(cdr), cdr$ci_high, NA_real_),
    aria_e_excess_per_1000 = ifelse(nrow(aria), aria$rd_per_1000, NA_real_),
    aria_e_ci_low_per_1000 = ifelse(nrow(aria), aria$rd_ci_low_per_1000, NA_real_),
    aria_e_ci_high_per_1000 = ifelse(nrow(aria), aria$rd_ci_high_per_1000, NA_real_),
    discontinuation_excess_per_1000 = ifelse(nrow(disc), disc$rd_per_1000, NA_real_),
    discontinuation_ci_low_per_1000 = ifelse(nrow(disc), disc$rd_ci_low_per_1000, NA_real_),
    discontinuation_ci_high_per_1000 = ifelse(nrow(disc), disc$rd_ci_high_per_1000, NA_real_)
  )
}))

# Quality-control counts.
qc <- tibble::tribble(
  ~check, ~value,
  "Distinct Cochrane studies", n_distinct(dat$Study),
  "Distinct antibodies", n_distinct(dat$agent),
  "Trials coded futility-terminated", n_distinct(dat$Study[dat$futility_terminated]),
  "Trials coded any early termination", n_distinct(dat$Study[dat$any_early_terminated]),
  "Cochrane-reported futility terminations", 6,
  "Cochrane-reported total terminations", 9,
  "Rows missing agent classification", sum(is.na(dat$agent)),
  "Rows missing termination classification", sum(is.na(dat$termination_status))
)

outputs <- list(
  trial_annotations = trial_map,
  agent_results = agent_results,
  raw_agent_results = raw_agent_results,
  agent_interactions = agent_interactions,
  termination_sensitivities = termination_results,
  raw_termination_sensitivities = raw_termination_results,
  target_class_results = target_class_results,
  leave_one_agent_out = influence_results,
  absolute_safety = absolute_safety,
  absolute_safety_scenarios = absolute_safety_scenarios,
  mid_compatibility = mid_compatibility,
  moderator_results = moderator_results,
  benefit_harm = benefit_harm,
  percent_slowing = raw_trial %>% select(analysis_id, Analysis.name, Study, agent,
                                         Experimental.mean, Control.mean, yi_raw,
                                         benefit_points, percent_slowing),
  quality_control = qc,
  annotated_rows = dat
)

for (nm in names(outputs)) write_csv(outputs[[nm]], file.path(out_dir, paste0(nm, ".csv")))
if (requireNamespace("jsonlite", quietly = TRUE)) {
  jsonlite::write_json(outputs, file.path(out_dir, "extended_results.json"),
                       dataframe = "rows", na = "null", auto_unbox = TRUE,
                       digits = 15, pretty = TRUE)
}

# Figure 1: individual-antibody effects for the two central efficacy outcomes.
agent_plot <- agent_results %>% filter(analysis_id %in% c("1.1", "2.1")) %>%
  mutate(endpoint = ifelse(analysis_id == "1.1", "ADAS-Cog at 18 months (SMD)",
                           "CDR-SB at 18 months (SMD)"))
p1 <- ggplot(agent_plot, aes(x = estimate, y = reorder(agent, estimate),
                             xmin = ci_low, xmax = ci_high, color = agent)) +
  geom_vline(xintercept = 0, color = "grey65", linewidth = .4) +
  geom_errorbarh(height = .18, linewidth = .6) + geom_point(size = 2.3) +
  facet_wrap(~endpoint, scales = "free_y", ncol = 2) +
  labs(x = "Standardized mean difference (negative favors antibody)", y = NULL,
       title = "Clinical effects differ across individual antibodies") +
  theme_minimal(base_size = 10) + theme(legend.position = "none", panel.grid.minor = element_blank(),
                                        strip.text = element_text(face = "bold"))
ggsave(file.path(fig_dir, "individual_antibody_efficacy.png"), p1, width = 10.5, height = 5.8, dpi = 240)

# Figure 2: absolute ARIA-E excess risk by antibody.
aria_plot <- absolute_safety %>% filter(analysis_id == "4.2")
p2 <- ggplot(aria_plot, aes(x = rd_per_1000, y = reorder(agent, rd_per_1000),
                            xmin = rd_ci_low_per_1000, xmax = rd_ci_high_per_1000)) +
  geom_vline(xintercept = 0, color = "grey65", linewidth = .4) +
  geom_errorbarh(height = .18, color = "#B64545", linewidth = .65) +
  geom_point(color = "#B64545", size = 2.4) +
  labs(x = "Additional ARIA-E events per 1,000 treated (95% CI)", y = NULL,
       title = "Absolute ARIA-E risk is concentrated among plaque-clearing antibodies") +
  theme_minimal(base_size = 10) + theme(panel.grid.minor = element_blank())
ggsave(file.path(fig_dir, "absolute_aria_e_by_antibody.png"), p2, width = 8.5, height = 5.2, dpi = 240)

# Figure 3: efficacy and harm shown jointly without a composite value judgment.
p3 <- ggplot(benefit_harm, aes(x = -adas_md, y = aria_e_excess_per_1000, label = agent)) +
  geom_point(size = 4, color = "#2E5D8A") + geom_text(nudge_y = 12, size = 3.4) +
  labs(x = "ADAS-Cog benefit at 18 months (points; positive favors antibody)",
       y = "Additional ARIA-E events per 1,000 treated",
       title = "Agent-specific benefit and harm remain separate dimensions",
       subtitle = "No preference weights or composite net-benefit threshold imposed") +
  theme_minimal(base_size = 10) + theme(panel.grid.minor = element_blank())
ggsave(file.path(fig_dir, "benefit_harm_matrix.png"), p3, width = 8.2, height = 5.5, dpi = 240)

cat("Extended analysis complete\n")
print(qc)
