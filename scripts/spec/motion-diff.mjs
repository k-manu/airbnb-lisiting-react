// Transition / animation diff: every element that animates in the reference snapshot vs ours.
// Elements are identified by what a person sees (aria-label, own text, alt) plus occurrence,
// never by class or markup. Values only: properties, durations, easings, delays, keyframe names.
//   node scripts/spec/motion-diff.mjs [refUrl=:3300] [oursUrl=:3001]
//   writes design/spec/motion-diff.txt

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const [refUrl = "http://localhost:3300/", oursUrl = "http://localhost:3001/"] = process.argv.slice(2);

async function collect(url, prepare) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1193, height: 900 } });
  await p.goto(url, { waitUntil: "networkidle" });
  if (prepare) await prepare(p);
  const rows = await p.evaluate(() => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const counts = new Map();
    const split = (v) => v.split(/,(?![^(]*\))/).map((x) => x.trim());
    const zero = (d) => split(d).every((x) => parseFloat(x) === 0);
    const out = [];
    const ctx = (el) => (el.closest("dialog,[role=dialog]") ? "overlay:" : "");
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
      const cs = getComputedStyle(el);
      const anims = !zero(cs.animationDuration) && cs.animationName !== "none";
      const trans = !zero(cs.transitionDuration);
      // Pseudo-elements carry hover overlays in some designs.
      const pseudo = ["::before", "::after"].map((pe) => ({ pe, s: getComputedStyle(el, pe) })).filter(({ s }) => s.content !== "none" && !zero(s.transitionDuration));
      if (!anims && !trans && !pseudo.length) continue;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3 && norm(n.nodeValue)).map((n) => n.nodeValue).join(" ");
      const props = split(cs.transitionProperty).filter((x) => x !== "all").sort().join("+");
      const label = norm(el.getAttribute("aria-label") || own || el.getAttribute("alt") || "").slice(0, 30) || `${cs.position}[${props}]`;
      const base = `${ctx(el)}${el.tagName.toLowerCase()}:${label}`;
      const n = (counts.get(base) || 0) + 1;
      counts.set(base, n);
      const t = trans ? split(cs.transitionProperty).map((prop, i) => `${prop} ${split(cs.transitionDuration)[i % split(cs.transitionDuration).length]} ${split(cs.transitionTimingFunction)[i % split(cs.transitionTimingFunction).length]}${parseFloat(split(cs.transitionDelay)[i % split(cs.transitionDelay).length]) ? " delay " + split(cs.transitionDelay)[i % split(cs.transitionDelay).length] : ""}`) : [];
      out.push({
        key: `${base}#${n}`,
        transition: t.join("; ") || "-",
        animation: anims ? `${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction} x${cs.animationIterationCount}` : "-",
        pseudo: pseudo.map(({ pe, s }) => `${pe}: ${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}`).join("; ") || "-",
      });
    }
    return out;
  });
  await b.close();
  return rows;
}

// Our overlays mount when opened, so open each before collecting and merge.
const merged = new Map();
for (const prepare of [
  null,
  async (p) => { await p.goto(`${oursUrl}?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000`, { waitUntil: "networkidle" }); },
  async (p) => { await p.getByRole("button", { name: /Show all \d+ amenities/ }).click(); await p.waitForTimeout(600); },
]) for (const r of await collect(oursUrl, prepare)) if (!merged.has(r.key)) merged.set(r.key, r);
const ref = await collect(refUrl);
const ours = [...merged.values()];
const byKey = new Map(ours.map((o) => [o.key, o]));
const lines = [];
const missing = [];
let same = 0;
const eq = (a, b) => a.replace(/cubic-bezier\(0\.4, 0, 0\.2, 1\)/g, "cb").replace(/\s+/g, " ") === b.replace(/cubic-bezier\(0\.4, 0, 0\.2, 1\)/g, "cb").replace(/\s+/g, " ");
for (const r of ref) {
  const o = byKey.get(r.key);
  if (!o) { missing.push(r); continue; }
  byKey.delete(r.key);
  const diffs = ["transition", "animation", "pseudo"].filter((k) => !eq(r[k], o[k]));
  if (diffs.length) lines.push(`${r.key}\n     ref : ${diffs.map((k) => `${k} ${r[k]}`).join(" | ")}\n     ours: ${diffs.map((k) => `${k} ${o[k]}`).join(" | ")}`);
  else same++;
}
const extra = [...byKey.values()];
const group = (rows) => {
  const g = new Map();
  for (const r of rows) { const v = `${r.transition} | anim ${r.animation} | pseudo ${r.pseudo}`; g.set(v, [...(g.get(v) ?? []), r.key.replace(/#\d+$/, "")]); }
  return [...g.entries()].map(([v, keys]) => `${v} ${String.fromCharCode(10)}     x${keys.length}: ${[...new Set(keys)].slice(0, 6).join(", ")}${new Set(keys).size > 6 ? ", ..." : ""}`);
};
const text = [
  `animated elements: reference ${ref.length}, ours ${ours.length}; identical ${same}; different ${lines.length}; only in reference ${missing.length}; only in ours ${extra.length}`,
  "", "DIFFERENT", ...lines,
  "", "ONLY IN THE REFERENCE (grouped)", ...group(missing),
  "", "ONLY IN OURS (grouped)", ...group(extra),
].join("\n");
writeFileSync("design/spec/motion-diff.txt", text);
console.log(text.split(String.fromCharCode(10)).slice(0, Number(process.env.LINES ?? 80)).join(String.fromCharCode(10)));
