import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../public");
const required = [
  "index.html",
  "styles.css",
  "app.js",
  "evidence.json",
  "evidence-inline.js",
  "favicon.png",
  "og.png",
  "downloads/primary-reanalysis-report.pdf",
  "downloads/extended-reanalysis-report.pdf",
  "downloads/outcome-sensitivities.csv",
  "downloads/extended-reanalysis-package.zip",
];

for (const relative of required) {
  const info = await stat(join(root, relative));
  if (!info.isFile() || info.size === 0) throw new Error(`Missing or empty: public/${relative}`);
}

const html = await readFile(join(root, "index.html"), "utf8");
const app = await readFile(join(root, "app.js"), "utf8");
const data = JSON.parse(await readFile(join(root, "evidence.json"), "utf8"));

if (!html.includes("Living Amyloid Evidence")) throw new Error("Site title is missing");
if (!html.includes("not individualized medical advice")) throw new Error("Medical disclaimer is missing");
if (!app.includes("renderExplorer")) throw new Error("Interactive explorer code is missing");
if (!app.includes("clinicalThresholds")) throw new Error("Clinical-threshold registry is missing");
if (!app.includes('value: -4, label: "4pt"')) throw new Error("ADAS-Cog dementia threshold is missing");
if (!app.includes('value: -2, label: "2pt"')) throw new Error("CDR-SB dementia threshold is missing");
if (!app.includes('value: 2, label: "2pt"')) throw new Error("MMSE threshold is missing");
if (!app.includes("rawMeanDifferences") || !app.includes("rawAgentResults")) throw new Error("Raw-scale threshold plotting is missing");
if (!app.includes("What the red dashed lines mean")) throw new Error("Threshold interpretation guardrail is missing");
if (!app.includes("no SMD back-conversion or cross-scale standardization is used")) throw new Error("Threshold scale explanation is missing");
if (!app.includes('class="threshold-tooltip"') || !app.includes('tabindex="0"')) throw new Error("Accessible threshold tooltips are missing");
if (data.evidenceVersion !== "0.1.0") throw new Error("Unexpected evidence version");
if (data.outcomeSensitivities.length < 20) throw new Error("Outcome registry is unexpectedly small");
if (data.trialAnnotations.length < 17) throw new Error("Trial ledger is unexpectedly small");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat();
}

const files = await walk(root);
if (files.length > 1000) throw new Error("Direct-upload file count exceeds the conservative limit");
for (const file of files) {
  const info = await stat(file);
  if (info.size > 25 * 1024 * 1024) throw new Error(`Asset exceeds 25 MiB: ${file}`);
  if ([".html", ".css", ".js", ".json", ".csv"].includes(extname(file))) {
    const text = await readFile(file, "utf8");
    if (text.includes("/Users/") || text.includes("file://")) throw new Error(`Local filesystem path leaked into ${file}`);
  }
}

console.log(`Validated evidence ${data.evidenceVersion}: ${data.trialAnnotations.length} trials, ${data.outcomeSensitivities.length} outcome specifications, ${files.length} public files.`);
