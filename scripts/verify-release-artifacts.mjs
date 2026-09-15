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
for (const line of checksumLines) {
  const match = line.match(/^([0-9a-f]{64})  (.+)$/);
  if (!match) throw new Error(`Malformed checksum line: ${line}`);
  const [, expected, relative] = match;
  if (["manifest/SHA256SUMS.txt", "manifest/integrity-audit.csv"].includes(relative)) continue;
  const bytes = await readFile(resolve(packageRoot, relative));
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== expected) throw new Error(`Checksum mismatch: ${relative}`);
}

const archive = resolve(publicRoot, "downloads/reproducibility-package.zip");
const unzipOptions = { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 };
const zipEvidence = execFileSync("unzip", ["-p", archive, "site/evidence.json"], unzipOptions);
if (zipEvidence !== `${JSON.stringify(siteEvidence)}\n`) throw new Error("ZIP site/evidence.json differs from published registry");
const zipReadme = execFileSync("unzip", ["-p", archive, "README.md"], unzipOptions);
if (zipReadme !== readme) throw new Error("ZIP README differs from packaged README");
execFileSync("unzip", ["-tq", archive], { stdio: "pipe" });

console.log(`Validated synchronized release artifacts for evidence ${release.version}: registry, inline copy, ZIP, README, and ${checksumLines.length} checksums.`);
