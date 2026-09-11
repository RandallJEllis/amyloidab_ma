#!/usr/bin/env Rscript

root <- normalizePath(".")
tolerance <- 1e-8

compare_csv <- function(expected_path, actual_path) {
  if (!file.exists(actual_path)) stop("Missing generated file: ", actual_path)
  expected <- read.csv(expected_path, check.names = FALSE, stringsAsFactors = FALSE,
                       colClasses = "character", na.strings = NULL)
  actual <- read.csv(actual_path, check.names = FALSE, stringsAsFactors = FALSE,
                     colClasses = "character", na.strings = NULL)
  if (!identical(names(expected), names(actual))) stop("Column mismatch: ", actual_path)
  if (!identical(dim(expected), dim(actual))) stop("Dimension mismatch: ", actual_path)

  for (name in names(expected)) {
    x <- expected[[name]]
    y <- actual[[name]]
    x_missing <- is.na(x) | x == "" | x == "NA"
    y_missing <- is.na(y) | y == "" | y == "NA"
    if (!identical(x_missing, y_missing)) stop("Missing-value mismatch in ", actual_path, " column ", name)
    populated <- !x_missing
    if (!any(populated)) next
    xn <- suppressWarnings(as.numeric(x[populated]))
    yn <- suppressWarnings(as.numeric(y[populated]))
    numeric_column <- all(is.finite(xn)) && all(is.finite(yn))
    if (numeric_column) {
      scale <- pmax(1, abs(xn), abs(yn))
      if (any(abs(xn - yn) > tolerance * scale)) stop("Numeric mismatch in ", actual_path, " column ", name)
    } else if (!identical(x[populated], y[populated])) {
      stop("Text mismatch in ", actual_path, " column ", name)
    }
  }
  message("PASS ", actual_path)
}

compare_directory <- function(reference_dir, generated_dir) {
  reference_files <- sort(list.files(reference_dir, pattern = "\\.csv$", full.names = TRUE))
  if (!length(reference_files)) stop("No reference CSV files in ", reference_dir)
  for (reference_path in reference_files) {
    compare_csv(reference_path, file.path(generated_dir, basename(reference_path)))
  }
}

compare_directory(file.path(root, "results/primary/tables"), file.path(root, "generated/primary"))
compare_directory(file.path(root, "results/extended/tables"), file.path(root, "generated/extended"))
compare_directory(file.path(root, "results/audit/tables"), file.path(root, "generated/audit"))

message("PASS: all published CSV tables reproduced within tolerance ", tolerance)
