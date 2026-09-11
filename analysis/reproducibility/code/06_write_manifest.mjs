import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || ["work", "generated", "library", "staging", "renv-cache"].includes(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    else paths.push(path);
  }
  return paths;
}

const describe = path => {
  if (path.startsWith("results/audit/")) return ["published audit result", "code/08_traceability.R", "PET pairings, calculation inputs and exploratory sensitivities"];
  if (path.startsWith("manuscript/")) return ["generated manuscript", "code/09_manuscript.mjs", "Methods, Results and numerical supplement generated from release outputs"];
  if (path === "renv.lock") return ["environment lock", "renv snapshot", "Pinned R and dependency versions"];
  if (path.startsWith("data/raw/cochrane/")) return ["raw input", "Cochrane CD016297 data package", "Unmodified source file supplied with the review data package"];
  if (path.startsWith("results/primary/")) return ["published primary result", "code/01_primary_reanalysis.R", "Versioned primary analysis snapshot"];
  if (path.startsWith("results/extended/")) return ["published extended result", "code/02_extended_reanalysis.R", "Versioned extended analysis snapshot"];
  if (path.startsWith("results/reports/")) return ["presentation artifact", "original project report/workbook builders", "Human-readable report or workbook; not an analysis input"];
  if (path === "site/evidence.json") return ["website registry", "code/03_build_evidence_registry.mjs", "Exact machine-readable evidence registry used by the website"];
  if (path.startsWith("code/")) return ["analysis code", "authored source", "Executable pipeline or verification source"];
  if (path.startsWith("environment/")) return ["environment metadata", "published analysis environment", "Dependency installation or version record"];
  if (path.startsWith("manifest/")) return ["provenance metadata", "package assembly", "File-level or field-level provenance record"];
  return ["documentation", "package authors", "Package documentation or citation metadata"];
};

const csv = value => `"${String(value).replaceAll('"', '""')}"`;
const checksumPath = "manifest/SHA256SUMS.txt";
const provenancePath = "manifest/file-provenance.csv";
const files = (await walk(root)).map(path => ({ absolute: path, path: relative(root, path) }))
  .filter(file => file.path !== checksumPath && file.path !== provenancePath)
  .sort((a, b) => a.path.localeCompare(b.path));
const checksums = [];
const rows = ["path,category,generated_by,description"];
for (const file of files) {
  const bytes = await readFile(file.absolute);
  checksums.push(`${createHash("sha256").update(bytes).digest("hex")}  ${file.path}`);
  rows.push([file.path, ...describe(file.path)].map(csv).join(","));
}
await writeFile(resolve(root, checksumPath), `${checksums.join("\n")}\n`);
await writeFile(resolve(root, provenancePath), `${rows.join("\n")}\n`);
console.log(`Indexed ${files.length} distributed files.`);
