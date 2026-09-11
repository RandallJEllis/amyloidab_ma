#!/usr/bin/env Rscript
# Installs the pinned bootstrap and restores every statistical dependency.
dir.create("environment/library",recursive=TRUE,showWarnings=FALSE)
Sys.setenv(RENV_PATHS_ROOT=file.path(normalizePath("environment"),"renv-cache"))
.libPaths(c(normalizePath("environment/library"),.libPaths()))
if(!requireNamespace("renv",quietly=TRUE) || as.character(packageVersion("renv")) != "1.1.8") install.packages(
 "https://cran.r-project.org/src/contrib/Archive/renv/renv_1.1.8.tar.gz",
 repos=NULL,type="source",lib=.libPaths()[1])
renv::restore(lockfile="renv.lock",library=.libPaths()[1],prompt=FALSE)
