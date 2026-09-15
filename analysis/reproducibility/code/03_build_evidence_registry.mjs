import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const release = JSON.parse(await readFile(resolve(projectRoot, "config/release.json"), "utf8"));
const analysis = JSON.parse(
  await readFile(resolve(projectRoot, "generated/primary/analysis_results.json"), "utf8"),
);
const extended = JSON.parse(
  await readFile(
    resolve(projectRoot, "generated/extended/extended_results.json"),
    "utf8",
  ),
);

function parseCsv(text) {
  const records = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); records.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); records.push(row); }
  const [headers, ...values] = records;
  return values.filter(record => record.some(Boolean)).map(record => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

const cleanedRows = parseCsv(
  await readFile(resolve(projectRoot, "generated/primary/cleaned_analysis_rows.csv"), "utf8"),
);
const numberOrNull = value => value && value !== "NA" ? Number(value) : null;
const numericColumns = columns => row => Object.fromEntries(
  Object.entries(row).map(([key, value]) => [
    key,
    columns.includes(key) ? numberOrNull(value) : value,
  ]),
);
const bool = value => value === "TRUE";
const annotationByStudy = new Map(extended.trial_annotations.map(row => [row.Study, row]));
const conditionRegistry = cleanedRows.map(row => ({
  analysis_id: row.analysis_id,
  outcome: row["Analysis.name"],
  study: row.Study,
  agent: row.Subgroup && row.Subgroup !== "NA" ? row.Subgroup : annotationByStudy.get(row.Study)?.agent || "Not annotated",
  participants: (numberOrNull(row["Experimental.N"]) || 0) + (numberOrNull(row["Control.N"]) || 0) || null,
  biomarker_confirmed: bool(row.biomarker_confirmed),
  approved_generation: bool(row.approved_generation),
  active_2026: bool(row.active_2026),
  clearance_ge_2cl: bool(row.clearance_ge_2cl),
  clearance_ge_4cl: bool(row.clearance_ge_4cl),
  clearance_ge_6cl: bool(row.clearance_ge_6cl),
  clearance_ge_8cl: bool(row.clearance_ge_8cl),
  clearance_ge_10cl: bool(row.clearance_ge_10cl),
  clearance_ge_12cl: bool(row.clearance_ge_12cl),
  demonstrated_clearance: bool(row.demonstrated_clearance),
  response_primary: bool(row.response_primary),
  amyloid_change_cl: numberOrNull(row.amyloid_change_cl),
  amyloid_source: row.amyloid_source || null,
  mapping_note: row.mapping_note || null,
  effect: numberOrNull(row.Mean),
  ci_low: numberOrNull(row["CI.start"]),
  ci_high: numberOrNull(row["CI.end"]),
  variance: numberOrNull(row.vi),
  experimental_n: numberOrNull(row["Experimental.N"]),
  control_n: numberOrNull(row["Control.N"]),
  source: "CD016297-data-rows.csv; Study + Analysis.group + Analysis.number",
  pet_status: numberOrNull(row.amyloid_change_cl) === null ? "Unknown / quarantined" : "Available; see pairing audit",
}));

const evidence = {
  generated: release.date,
  evidenceVersion: release.version,
  searchThrough: release.searchThrough,
  release,
  outcomeSensitivities: analysis.outcome_sensitivities,
  rawMeanDifferences: analysis.raw_mean_differences,
  metaRegressions: analysis.meta_regressions,
  amyloidMapping: analysis.amyloid_mapping,
  agentResults: extended.agent_results,
  rawAgentResults: extended.raw_agent_results,
  agentInteractions: extended.agent_interactions,
  terminationSensitivities: extended.termination_sensitivities,
  targetClassResults: extended.target_class_results,
  absoluteSafety: extended.absolute_safety,
  midCompatibility: extended.mid_compatibility,
  trialAnnotations: extended.trial_annotations,
  conditionRegistry,
  pairingAudit: parseCsv(await readFile(resolve(projectRoot, "generated/audit/pet_clinical_pairings.csv"), "utf8")).map(numericColumns(["pet_week", "amyloid_change_cl"])),
  calculationInputs: parseCsv(await readFile(resolve(projectRoot, "generated/audit/calculation_inputs.csv"), "utf8")).map(numericColumns([
    "experimental_n", "control_n", "experimental_mean", "control_mean", "experimental_sd", "control_sd",
    "effect", "ci_low", "ci_high", "variance", "raw_md", "raw_variance", "amyloid_change_cl",
  ])),
  filterSensitivities: parseCsv(await readFile(resolve(projectRoot, "generated/audit/independent_filter_sensitivities.csv"), "utf8")).map(row => Object.fromEntries(Object.entries(row).map(([key,value]) => [key, ["k","estimate","ci_low","ci_high","p_value","tau2","cutoff_cl"].includes(key) ? numberOrNull(value) : value]))),
};

const dataPath = resolve(projectRoot, "generated/site/evidence.json");
await mkdir(dirname(dataPath), { recursive: true });
await writeFile(dataPath, `${JSON.stringify(evidence)}\n`);
console.log(`Wrote ${dataPath}`);
