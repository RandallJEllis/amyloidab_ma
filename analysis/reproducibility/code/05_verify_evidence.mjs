#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const expected = JSON.parse(await readFile(resolve(root, "site/evidence.json"), "utf8"));
const actual = JSON.parse(await readFile(resolve(root, "generated/site/evidence.json"), "utf8"));

// JSON number serialization can differ by platform even when the underlying
// estimates agree. Compare the registry structurally and allow only a small
// relative tolerance for finite numeric values; strings, keys and array order
// remain exact. This keeps the registry check meaningful on macOS and Linux.
// Keep this aligned with the published CSV verification tolerance. The
// registry is assembled from R-generated JSON, and BLAS/JSON formatting can
// produce harmless sub-1e-8 differences between macOS and Linux runners.
const numericTolerance = 1e-8;
function compare(expectedValue, actualValue, path = "$") {
  if (typeof expectedValue === "number" && typeof actualValue === "number") {
    if (!Number.isFinite(expectedValue) || !Number.isFinite(actualValue)) return expectedValue === actualValue;
    const scale = Math.max(1, Math.abs(expectedValue), Math.abs(actualValue));
    return Math.abs(expectedValue - actualValue) <= numericTolerance * scale || {
      path,
      expected: expectedValue,
      actual: actualValue,
      reason: "numeric difference"
    };
  }
  if (expectedValue === null || actualValue === null || typeof expectedValue !== "object" || typeof actualValue !== "object") {
    return expectedValue === actualValue || { path, expected: expectedValue, actual: actualValue, reason: "value difference" };
  }
  if (Array.isArray(expectedValue) !== Array.isArray(actualValue)) return { path, reason: "array/object mismatch" };
  const expectedKeys = Object.keys(expectedValue);
  const actualKeys = Object.keys(actualValue);
  if (expectedKeys.length !== actualKeys.length || expectedKeys.some(key => !Object.hasOwn(actualValue, key))) {
    return { path, expectedKeys, actualKeys, reason: "key mismatch" };
  }
  for (const key of expectedKeys) {
    const result = compare(expectedValue[key], actualValue[key], `${path}.${key}`);
    if (result !== true) return result;
  }
  return true;
}
const comparison = compare(expected, actual);
if (comparison !== true) {
  throw new Error(`Generated website evidence registry differs from site/evidence.json beyond the numeric tolerance at ${comparison.path}: ${JSON.stringify(comparison)}`);
}
if (actual.conditionRegistry.length !== 149) throw new Error("Unexpected condition registry size");
if (actual.trialAnnotations.length !== 17) throw new Error("Unexpected trial annotation count");
const requiredScenarios = ["Cochrane class pool", "Biomarker-confirmed", "Demonstrated clearance: >=2 CL", "Demonstrated clearance: >=4 CL", "Demonstrated clearance: >=6 CL", "Demonstrated clearance: >=8 CL", "Demonstrated clearance: >=10 CL", "Demonstrated clearance: >=12 CL", "Response primary: clearing approved-generation trials", "Currently active agents: lecanemab + donanemab"];
for (const scenario of requiredScenarios) if (!actual.outcomeSensitivities.some(row => row.scenario === scenario)) throw new Error(`Missing sensitivity scenario: ${scenario}`);

console.log("PASS generated/site/evidence.json");
