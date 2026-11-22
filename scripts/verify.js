#!/usr/bin/env node
"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const route = opt("route") || opt("routes");
const width = opt("width") || opt("widths");
const engine = opt("engine");
const cached = hasFlag("cached");
const refresh = hasFlag("refresh");
const visual = hasFlag("visual");
const full = hasFlag("full");

function run(label, command, commandArgs) {
  const started = Date.now();
  const res = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: "utf8",
  });
  const elapsed = ((Date.now() - started) / 1000).toFixed(2);
  const ok = res.status === 0;
  const output = `${res.stdout || ""}${res.stderr || ""}`.trim();
  return { label, ok, elapsed, output };
}

const steps = [];

steps.push(run("test", "node", ["--test"]));
if (steps[0].ok) {
  steps.push(run("build", "node", ["scripts/build-userscript.js"]));
}

if (steps.every((s) => s.ok)) {
  const layoutArgs = ["scripts/check-layout.js"];
  if (route) layoutArgs.push("--route", route);
  if (width) layoutArgs.push("--width", width);
  if (cached) layoutArgs.push("--cached");
  if (refresh) layoutArgs.push("--refresh");
  steps.push(run("layout", "node", layoutArgs));
}

if (visual && steps.every((s) => s.ok)) {
  const reviewArgs = ["scripts/visual-review.js", "--use-baseline"];
  if (route) reviewArgs.push("--route", route);
  else reviewArgs.push("--all");
  if (engine) reviewArgs.push("--engine", engine);
  if (cached) reviewArgs.push("--cached");
  if (refresh) reviewArgs.push("--refresh");
  if (full) reviewArgs.push("--full");
  steps.push(run("visual", "node", reviewArgs));
}

let failed = false;
for (const step of steps) {
  const status = step.ok ? "PASS" : "FAIL";
  console.log(`${status.padEnd(5)} ${step.label} (${step.elapsed}s)`);
  if (!step.ok) failed = true;
  if (!step.ok || step.label === "layout" || step.label === "visual") {
    const lines = step.output
      .split("\n")
      .filter((line) => !line.startsWith("Skipping host requirements validation"))
      .filter(Boolean);
    for (const line of lines) console.log(`  ${line}`);
  }
}

if (failed) process.exitCode = 1;
