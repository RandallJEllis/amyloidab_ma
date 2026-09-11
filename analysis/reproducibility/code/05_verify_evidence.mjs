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
const numericTolerance = 1e-10;
function compare(expectedValue, actualValue, path = "$") {
  if (typeof expectedValue === "number" && typeof actualValue === "number") {
    if (!Number.isFinite(expectedValue) || !Number.isFinite(actualValue)) return expectedValue === actualValue;
    const scale = Math.max(1, Math.abs(expectedValue), Math.abs(actualValue));
    return Math.abs(expectedValue - actualValue) <= numericTolerance * scale;
  }
  if (expectedValue === null || actualValue === null || typeof expectedValue !== "object" || typeof actualValue !== "object") {
    return expectedValue === actualValue;
  }
  if (Array.isArray(expectedValue) !== Array.isArray(actualValue)) return false;
  const expectedKeys = Object.keys(expectedValue);
  const actualKeys = Object.keys(actualValue);
  if (expectedKeys.length !== actualKeys.length || expectedKeys.some(key => !Object.hasOwn(actualValue, key))) return false;
  return expectedKeys.every(key => compare(expectedValue[key], actualValue[key], `${path}.${key}`));
}
if (!compare(expected, actual)) {
  throw new Error("Generated website evidence registry differs from site/evidence.json beyond the numeric tolerance");
}
if (actual.conditionRegistry.length !== 149) throw new Error("Unexpected condition registry size");
if (actual.trialAnnotations.length !== 17) throw new Error("Unexpected trial annotation count");
if (actual.outcomeSensitivities.length !== 140) throw new Error("Unexpected sensitivity estimate count");

console.log("PASS generated/site/evidence.json");
