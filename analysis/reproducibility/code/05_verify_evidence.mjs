#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const expected = JSON.parse(await readFile(resolve(root, "site/evidence.json"), "utf8"));
const actual = JSON.parse(await readFile(resolve(root, "generated/site/evidence.json"), "utf8"));

const expectedText = JSON.stringify(expected);
const actualText = JSON.stringify(actual);
if (actualText !== expectedText) {
  throw new Error("Generated website evidence registry does not match site/evidence.json");
}
if (actual.conditionRegistry.length !== 149) throw new Error("Unexpected condition registry size");
if (actual.trialAnnotations.length !== 17) throw new Error("Unexpected trial annotation count");
if (actual.outcomeSensitivities.length !== 140) throw new Error("Unexpected sensitivity estimate count");

console.log("PASS generated/site/evidence.json");
