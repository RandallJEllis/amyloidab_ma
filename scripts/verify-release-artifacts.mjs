import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const packageRoot = resolve(root, "analysis/reproducibility");
const publicRoot = resolve(root, "public");
const release = JSON.parse(await readFile(resolve(packageRoot, "config/release.json"), "utf8"));
const evidence = JSON.parse(await readFile(resolve(publicRoot, "evidence.json"), "utf8"));
const siteEvidence = JSON.parse(await readFile(resolve(packageRoot, "site/evidence.json"), "utf8"));
if (JSON.stringify(evidence) !== JSON.stringify(siteEvidence)) throw new Error("public/evidence.json differs from package site/evidence.json");
if (evidence.evidenceVersion !== release.version || evidence.generated !== release.date) throw new Error("Evidence metadata differs from release config");

const inline = await readFile(resolve(publicRoot, "evidence-inline.js"), "utf8");
const prefix = "window.__EVIDENCE__ = ";
if (!inline.startsWith(prefix) || !inline.endsWith(";\n")) throw new Error("Unexpected evidence-inline.js wrapper");
const inlineEvidence = JSON.parse(inline.slice(prefix.length, -2));
if (JSON.stringify(inlineEvidence) !== JSON.stringify(evidence)) throw new Error("evidence-inline.js differs from evidence.json");

const readme = await readFile(resolve(packageRoot, "README.md"), "utf8");
const rootReadme = await readFile(resolve(root, "REPRODUCIBILITY_PACKAGE.md"), "utf8");
if (readme !== rootReadme) throw new Error("Root reproducibility README differs from packaged README");

const checksumPath = resolve(packageRoot, "manifest/SHA256SUMS.txt");
const checksumLines = (await readFile(checksumPath, "utf8")).trim().split(/\r?\n/).filter(Boolean);
const checksumEntries = [];
for (const line of checksumLines) {
  const match = line.match(/^([0-9a-f]{64})  (.+)$/);
  if (!match) throw new Error(`Malformed checksum line: ${line}`);
  const [, expected, relative] = match;
  checksumEntries.push({ expected, relative });
}
const provenancePath = resolve(packageRoot, "manifest/file-provenance.csv");
const provenanceLines = (await readFile(provenancePath, "utf8")).trim().split(/\r?\n/).filter(Boolean).slice(1);
const provenanceMembers = provenanceLines.map(line => {
  const match = line.match(/^"([^"]+)"/);
  if (!match) throw new Error(`Malformed provenance line: ${line}`);
  return match[1];
});
const checksumMembers = new Set(checksumEntries.map(entry => entry.relative));
const unchecksummedMembers = provenanceMembers.filter(member => member !== "manifest/integrity-audit.csv" && !checksumMembers.has(member));
if (unchecksummedMembers.length) throw new Error(`Provenance entries missing from checksum ledger: ${unchecksummedMembers.join(", ")}`);

const archive = resolve(publicRoot, "downloads/reproducibility-package.zip");
const unzipOptions = { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 };
const unzipBytes = relative => execFileSync("unzip", ["-p", archive, relative], { encoding: null, maxBuffer: 64 * 1024 * 1024 });
const packageInventory = new Set([
  ...provenanceMembers,
  "manifest/SHA256SUMS.txt",
  "manifest/file-provenance.csv",
]);
const archiveMembers = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  .trim().split(/\r?\n/).filter(member => member && !member.endsWith("/"));
const archiveInventory = new Set(archiveMembers);
const missingMembers = [...packageInventory].filter(member => !archiveInventory.has(member));
const extraMembers = [...archiveInventory].filter(member => !packageInventory.has(member));
if (missingMembers.length || extraMembers.length) {
  throw new Error(`ZIP inventory mismatch; missing: ${missingMembers.join(", ") || "none"}; extra: ${extraMembers.join(", ") || "none"}`);
}

for (const { expected, relative } of checksumEntries) {
  if (relative === "manifest/integrity-audit.csv") continue;
  const bytes = await readFile(resolve(packageRoot, relative));
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== expected) throw new Error(`Checksum mismatch: ${relative}`);
  const archived = unzipBytes(relative);
  const archivedHash = createHash("sha256").update(archived).digest("hex");
  if (archivedHash !== expected) throw new Error(`ZIP checksum mismatch: ${relative}`);
}

// The integrity audit is deliberately excluded from the checksum comparison:
// readr/R serialization can differ across supported platforms. It remains
// required in the ZIP inventory and is regenerated and validated by run_all.sh.
for (const relative of ["README.md", "manifest/SHA256SUMS.txt", "manifest/file-provenance.csv"]) {
  const packageBytes = await readFile(resolve(packageRoot, relative));
  const archivedHash = createHash("sha256").update(unzipBytes(relative)).digest("hex");
  const packageHash = createHash("sha256").update(packageBytes).digest("hex");
  if (archivedHash !== packageHash) throw new Error(`ZIP content mismatch: ${relative}`);
}
const zipEvidence = execFileSync("unzip", ["-p", archive, "site/evidence.json"], unzipOptions);
if (zipEvidence !== `${JSON.stringify(siteEvidence)}\n`) throw new Error("ZIP site/evidence.json differs from published registry");
const zipReadme = execFileSync("unzip", ["-p", archive, "README.md"], unzipOptions);
if (zipReadme !== readme) throw new Error("ZIP README differs from packaged README");
execFileSync("unzip", ["-tq", archive], { stdio: "pipe" });

console.log(`Validated synchronized release artifacts for evidence ${release.version}: registry, inline copy, ZIP, README, and ${checksumLines.length} checksums.`);
