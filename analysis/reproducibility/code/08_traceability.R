#!/usr/bin/env Rscript
# Exploratory audit outputs. Does not alter the Cochrane class-pool estimand.
suppressPackageStartupMessages({library(readr); library(dplyr); library(metafor)})
dir.create("generated/audit", recursive = TRUE, showWarnings = FALSE)
d <- read_csv("generated/primary/cleaned_analysis_rows.csv", show_col_types = FALSE,
              col_types = cols(analysis_id = col_character()))
pet_weeks <- c("EMERGE 2022"=78, "ENGAGE 2022"=78, "CREAD 2 2022"=53,
 "CREAD 2022"=105, "TRAILBLAZER-ALZ 2 2023"=76, "CLARITY AD 2023"=78,
 "SCarlet RoAD 2017"=104, "GRADUATE I 2023"=116, "GRADUATE II 2023"=116)
d <- d %>% mutate(
 clinical_window = case_when(grepl("above 24", Analysis.name) ~ ">24 months", grepl("24 months", Analysis.name) ~ "24 months", TRUE ~ "18 months"),
 pet_week = unname(pet_weeks[Study]),
 pairing_status = case_when(is.na(amyloid_change_cl) ~ "Unknown / quarantined",
  is.na(pet_week) ~ "PET time requires verification",
  clinical_window == "18 months" & abs(pet_week - 78) > 13 ~ "Time mismatch",
  clinical_window == "24 months" & abs(pet_week - 104) > 13 ~ "Time mismatch",
  clinical_window == ">24 months" & pet_week <= 104 ~ "Time mismatch",
  TRUE ~ "Time-compatible; dose and population require source verification"),
 instrument_status = if_else(grepl("ADAS", Analysis.name), "Exact ADAS-Cog version requires trial-level verification; MD provisional", "Verify version, change score and analysis population in source"),
 source_locator = paste("CD016297-data-rows.csv", Study, analysis_id, sep=" | "),
 source_review_status = "Single-reviewer audit; independent extraction verification pending")
write_csv(d %>% select(Study, analysis_id, Analysis.name, clinical_window, pet_week,
 amyloid_change_cl, amyloid_source, mapping_note, pairing_status, instrument_status,
 source_locator, source_review_status), "generated/audit/pet_clinical_pairings.csv")

# Metadata used in the website's calculation inspector, including raw-MD inputs.
write_csv(d %>% transmute(study=Study, analysis_id, outcome=Analysis.name,
 experimental_n=Experimental.N, control_n=Control.N,
 experimental_mean=Experimental.mean, control_mean=Control.mean,
 experimental_sd=Experimental.SD, control_sd=Control.SD,
 effect=Mean, ci_low=CI.start, ci_high=CI.end, variance=vi,
 raw_md=Experimental.mean-Control.mean,
 raw_variance=Experimental.SD^2/Experimental.N+Control.SD^2/Control.N,
 amyloid_change_cl, pairing_status, instrument_status, source_locator),
 "generated/audit/calculation_inputs.csv")

invalid_n <- d %>% filter((!is.na(Experimental.N) & Experimental.N <= 0) | (!is.na(Control.N) & Control.N <= 0))
write_csv(invalid_n, "generated/audit/invalid_denominators.csv")
if(nrow(invalid_n)) stop("Nonpositive denominators found")
bad_events <- d %>% filter(is_rr & ((!is.na(Experimental.cases) & (Experimental.cases > Experimental.N | Experimental.cases < 0)) | (!is.na(Control.cases) & (Control.cases > Control.N | Control.cases < 0))))
write_csv(bad_events, "generated/audit/invalid_event_counts.csv")
if(nrow(bad_events)) stop("Events exceed denominator")

fit <- function(x) {
 if(!nrow(x)) return(tibble(k=0L, estimate=NA_real_,ci_low=NA_real_,ci_high=NA_real_,p_value=NA_real_,tau2=NA_real_))
 if(nrow(x)==1) return(tibble(k=1L,estimate=x$yi,ci_low=x$yi-1.96*sqrt(x$vi),ci_high=x$yi+1.96*sqrt(x$vi),p_value=2*pnorm(-abs(x$yi/sqrt(x$vi))),tau2=0))
 m <- rma.uni(yi=x$yi,vi=x$vi,method="REML",test=if(nrow(x)>=3) "knha" else "z")
 tibble(k=nrow(x),estimate=as.numeric(m$b),ci_low=m$ci.lb,ci_high=m$ci.ub,p_value=m$pval,tau2=m$tau2)
}
out <- list(); index <- 1L
for(id in unique(d$analysis_id)) for(biomarker in c(FALSE,TRUE)) for(approved in c(FALSE,TRUE)) for(cutoff in c(NA,5,10,20,30)) for(time_match in c(FALSE,TRUE)) {
 x <- d %>% filter(analysis_id==id)
 if(biomarker) x <- x %>% filter(biomarker_confirmed)
 if(approved) x <- x %>% filter(approved_generation)
 if(!is.na(cutoff)) x <- x %>% filter(!is.na(amyloid_change_cl), -amyloid_change_cl >= cutoff)
 if(time_match) x <- x %>% filter(grepl("^Time-compatible",pairing_status))
 z <- fit(x)
 is_rr <- d$is_rr[match(id,d$analysis_id)]
 if(is_rr) z <- z %>% mutate(across(c(estimate,ci_low,ci_high),exp))
 out[[index]] <- bind_cols(tibble(analysis_id=id,outcome=d$Analysis.name[match(id,d$analysis_id)],
 measure=if(is_rr) "RR" else if(d$is_md[match(id,d$analysis_id)]) "MD" else "SMD",
 biomarker,approved,cutoff_cl=cutoff,time_match,studies=paste(x$Study,collapse="; ")),z)
 index <- index+1L
}
write_csv(bind_rows(out),"generated/audit/independent_filter_sensitivities.csv")

# Leave-one-study-out regressions expose leverage in small ecological analyses.
reg <- list(); index <- 1L
for(id in c("1.1","1.4","2.1")) {
 x <- d %>% filter(analysis_id==id,!is.na(amyloid_change_cl)) %>% mutate(clearance=-amyloid_change_cl/10)
 for(omit in c("None",x$Study)) {
  y <- x %>% filter(Study!=omit)
  if(nrow(y)<4 || length(unique(y$clearance))<2) next
  m <- rma.uni(yi=yi,vi=vi,mods=~clearance,data=y,method="REML",test="knha")
  reg[[index]] <- tibble(analysis_id=id,omitted=omit,k=nrow(y),slope_per_10cl=as.numeric(m$b[2]),ci_low=m$ci.lb[2],ci_high=m$ci.ub[2],p_value=m$pval[2],interpretation="Exploratory ecological association; PET uncertainty not modelled")
  index <- index+1L
 }
}
write_csv(bind_rows(reg),"generated/audit/clearance_influence.csv")
cat("Generated pairing, input, filter and regression influence audit tables.\n")
