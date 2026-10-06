// Compares our layout probe against the reference's.
//   node scripts/spec/measure-ours.mjs http://localhost:3001/     (writes design/spec/ours-measure.json)
//   node scripts/spec/spec-diff.mjs [--tol 0.5] [--all] [--ref <file>] [--ours <file>] [--out <file>]
//   --ref / --ours take a rows .txt (reference-page.txt) or a measure .json; defaults: the live
//   capture vs design/spec/ours-measure.json. Compare the snapshot to the live capture
//   (--ref design/spec/reference-page.txt --ours design/spec/snapshot-measure.json) to see what the
//   browser engine alone changes.
//
// Rows are [key, x, y, w, h, lines]. Text/button/landmark rows match by key;
// unnamed icons and images (the reference gives them no names) match by the
// nearest same-size box. Output:
//   A  summary
//   B  drift steps: rows where our vertical offset from the reference changes.
//      A step of +N px between two neighbours means N px of extra space between
//      them in our layout, so this is where to look when the page is too tall.
//   C  rows whose x, width, height or line count differ (y aside)
//   D  reference rows we have no match for, E  ours the reference does not have

import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const tol = Number(args.includes("--tol") ? args[args.indexOf("--tol") + 1] : 0.5);
const showAll = args.includes("--all");
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);

// A key can itself contain "|" (a listing title), so split the five numbers off the right.
const parse = (line) => {
  const parts = line.split("|");
  const [x, y, w, h, lines] = parts.splice(-5);
  return { key: parts.join("|"), x: +x, y: +y, w: +w, h: +h, lines: +lines };
};
const load = (file) => {
  const raw = readFileSync(file, "utf8");
  if (file.endsWith(".json")) {
    const j = JSON.parse(raw);
    return { docH: j.page.meta.docH, rows: j.page.rows.map(([key, x, y, w, h, lines]) => ({ key, x, y, w, h, lines })) };
  }
  const rows = raw.split("\n").filter(Boolean).map(parse);
  return { docH: 6186, rows };
};
const refData = load(opt("--ref", "design/spec/reference-page.txt"));
const oursData = load(opt("--ours", "design/spec/ours-measure.json"));
const ref = refData.rows;
const ours = oursData.rows;

const kind = (r) => r.key.slice(0, 2);
// Ignore the fixed bar's parked position and the skip link: they are off-screen at rest.
const skip = (r) => r.y + r.h <= 0 || r.x < 0;
const refRows = ref.filter((r) => !skip(r));
const ourRows = ours.filter((r) => !skip(r));

// ---- matching ---------------------------------------------------------------
const oursByKey = new Map(ourRows.map((r) => [r.key, r]));
const pairs = [];
const usedOurs = new Set();
const unmatchedRef = [];
for (const r of refRows) {
  const o = oursByKey.get(r.key);
  const geometric = /^(s:#|i:img|b:button|s:button)/.test(r.key);
  if (o && !geometric) {
    pairs.push([r, o]);
    usedOurs.add(o);
  } else unmatchedRef.push(r);
}
// Geometric pass for unnamed icons / images: nearest free box of the same kind and size.
const stillRef = [];
for (const r of unmatchedRef) {
  if (!/^(s:|i:|b:button)/.test(r.key)) {
    stillRef.push(r);
    continue;
  }
  let best = null;
  let bestD = Infinity;
  for (const o of ourRows) {
    if (usedOurs.has(o) || kind(o) !== kind(r)) continue;
    if (Math.abs(o.w - r.w) > 6 || Math.abs(o.h - r.h) > 6) continue;
    const d = Math.hypot(o.x - r.x, o.y - r.y);
    if (d < bestD) {
      bestD = d;
      best = o;
    }
  }
  if (best && bestD < 90) {
    pairs.push([r, best]);
    usedOurs.add(best);
  } else stillRef.push(r);
}
pairs.sort((a, b) => a[0].y - b[0].y || a[0].x - b[0].x);

// ---- report ----------------------------------------------------------------
const f = (n) => (Math.round(n * 10) / 10).toString();
const sign = (n) => (n > 0 ? "+" : "") + f(n);
const out = [];
const log = (s = "") => out.push(s);

const dyOf = ([r, o]) => o.y - r.y;
const maxAbsDy = Math.max(0, ...pairs.map((p) => Math.abs(dyOf(p))));
log("A  SUMMARY");
log(`   reference rows ${refRows.length}, ours ${ourRows.length}, matched ${pairs.length}`);
log(`   page height: reference ${refData.docH}, ours ${oursData.docH}`);
log(`   unmatched: reference ${stillRef.length}, ours ${ourRows.length - usedOurs.size}`);
log(`   rows with |dy| > ${tol}: ${pairs.filter((p) => Math.abs(dyOf(p)) > tol).length} (max ${f(maxAbsDy)})`);
log();

log(`B  DRIFT STEPS (our y minus reference y; a step = space we add or lose between neighbours)`);
let prev = 0;
let steps = 0;
for (const p of pairs) {
  if (!/^(t:|c:|i:)/.test(p[0].key)) continue;
  const d = dyOf(p);
  if (Math.abs(d - prev) > tol) {
    steps++;
    log(`   ref y ${f(p[0].y).padStart(7)}  delta ${sign(d).padStart(6)}  (step ${sign(d - prev).padStart(6)})  ${p[0].key.slice(0, 64)}`);
    prev = d;
  }
}
if (!steps) log("   none");
log();

// Left column, booking column and full-width sections drift independently, so read each on its
// own. A step is where the vertical offset changes between two neighbouring rows: the gap between
// them differs, and the size of the step is how much.
const columnOf = (r) => (r.y >= 2670 || r.y < 175 ? "full" : r.x >= 738 ? "right" : "left");
for (const col of ["full", "left", "right"]) {
  log(`B2 ${col.toUpperCase()} COLUMN STEPS (rows matched by key; step = change of offset from the row above)`);
  let last = null;
  let n = 0;
  for (const p of pairs) {
    if (!/^(t:|i:|c:section)/.test(p[0].key) || columnOf(p[0]) !== col) continue;
    if (Math.abs(dyOf(p) - dyOf(p)) > 0) continue;
    const d = dyOf(p);
    if (last === null) {
      last = { d, key: p[0].key };
      if (Math.abs(d) > tol) log(`   ref y ${f(p[0].y).padStart(7)}  offset ${sign(d).padStart(6)}  first row: ${p[0].key.slice(0, 50)}`);
      continue;
    }
    if (Math.abs(d - last.d) > 0.35) {
      n++;
      log(`   ref y ${f(p[0].y).padStart(7)}  offset ${sign(d).padStart(6)}  step ${sign(d - last.d).padStart(5)}  ${p[0].key.slice(0, 44)}  (after ${last.key.slice(0, 30)})`);
    }
    last = { d, key: p[0].key };
  }
  if (!n) log("   none");
  log();
}

log(`C  SIZE / X / LINE-COUNT DIFFERENCES (tolerance ${tol}px; y ignored)`);
let cCount = 0;
for (const [r, o] of pairs) {
  const diffs = [];
  if (Math.abs(o.x - r.x) > tol) diffs.push(`x ${f(r.x)} -> ${f(o.x)}`);
  if (Math.abs(o.w - r.w) > tol) diffs.push(`w ${f(r.w)} -> ${f(o.w)}`);
  if (Math.abs(o.h - r.h) > tol) diffs.push(`h ${f(r.h)} -> ${f(o.h)}`);
  if (o.lines !== r.lines) diffs.push(`lines ${r.lines} -> ${o.lines}`);
  if (diffs.length && (showAll || cCount < 120)) {
    log(`   y ${f(r.y).padStart(7)}  ${r.key.slice(0, 48).padEnd(48)}  ${diffs.join(", ")}`);
  }
  if (diffs.length) cCount++;
}
log(`   ${cCount} rows differ${!showAll && cCount > 120 ? " (first 120 shown; --all for the rest)" : ""}`);
log();

log("D  IN THE REFERENCE, NOT MATCHED IN OURS");
for (const r of stillRef) log(`   y ${f(r.y).padStart(7)}  ${r.key.slice(0, 70)}  [${f(r.x)}, ${f(r.w)}x${f(r.h)}]`);
if (!stillRef.length) log("   none");
log();

log("E  IN OURS, NOT IN THE REFERENCE (text only)");
let e = 0;
for (const o of ourRows) {
  if (usedOurs.has(o) || !o.key.startsWith("t:")) continue;
  if (!refRows.some((r) => r.key === o.key)) {
    e++;
    if (e <= 60) log(`   y ${f(o.y).padStart(7)}  ${o.key.slice(0, 70)}`);
  }
}
log(`   ${e} text rows`);

const text = out.join("\n");
writeFileSync(opt("--out", "design/spec/last-diff.txt"), text);
console.log(text);
