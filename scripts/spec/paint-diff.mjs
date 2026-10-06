// Paint diff: every box that draws something (background, border, shadow, radius) in the
// reference snapshot vs ours, matched by geometry (same size within 2px, centre within 6px).
// Both pages run in the same engine with the same font, so differences are real CSS
// differences. Numbers and colours only.
//   node scripts/spec/paint-diff.mjs [refUrl=:3300] [oursUrl=:3001] [--width 1193]
//   writes design/spec/paint-diff.txt

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && !(all[i - 1] ?? "").startsWith("--"));
const refUrl = args[0] ?? "http://localhost:3300/";
const oursUrl = args[1] ?? "http://localhost:3001/";
const overlay = process.argv.includes("--overlay") ? process.argv[process.argv.indexOf("--overlay") + 1] : null;
const FORCE = {
  tour: `[role=dialog][aria-label="Photo tour"]{visibility:visible!important;opacity:1!important;transform:none!important}`,
  viewer: `[role=dialog][aria-label="Photo viewer"]{visibility:visible!important;opacity:1!important;transform:none!important}`,
  amenities: `[role=dialog][aria-label="What this place offers"]{visibility:visible!important;opacity:1!important;transform:none!important} *:has(> [role=dialog][aria-label="What this place offers"]){visibility:visible!important;opacity:1!important}`,
};
const REFROOT = { tour: `[role=dialog][aria-label="Photo tour"]`, viewer: `[role=dialog][aria-label="Photo viewer"]`, amenities: `[role=dialog][aria-label="What this place offers"]` };
const width = process.argv.includes("--width") ? Number(process.argv[process.argv.indexOf("--width") + 1]) : 1193;

async function collect(url, isRef) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width, height: 900 } });
  if (overlay && !isRef) { const u = overlay === "tour" ? `${url}?modal=PHOTO_TOUR_SCROLLABLE` : overlay === "viewer" ? `${url}?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000` : url; await p.goto(u, { waitUntil: "networkidle" }); if (overlay === "amenities") await p.getByRole("button", { name: /Show all \d+ amenities/ }).click(); }
  else { await p.goto(url, { waitUntil: "networkidle" }); if (overlay) await p.addStyleTag({ content: FORCE[overlay] }); }
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(900);
  const rows = await p.evaluate((ov) => {
    const f = (v) => Math.round(v * 10) / 10;
    const out = [];
    const scope = ov ? (document.querySelector(ov.sel) ?? [...document.querySelectorAll(ov.oursSel)].at(-1)) : document.body;
    const sy = ov ? 0 : scrollY; // fixed overlays are read in viewport coordinates
    const rootBox = ov && scope ? [scope, ...scope.querySelectorAll("*")] : [...document.body.querySelectorAll("*")];
    for (const el of rootBox) {
      if ((!ov && el.closest("dialog,[role=dialog],[popover]")) || el.closest("svg,script,style")) continue;
      const r = el.getBoundingClientRect();
      if (!(r.width > 0.5 && r.height > 0.5)) continue;
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const hasBg = bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
      const sides = ["Top", "Right", "Bottom", "Left"];
      const bw = sides.map((s) => (cs[`border${s}Style`] === "none" ? 0 : parseFloat(cs[`border${s}Width`]) || 0));
      const hasBorder = bw.some((w) => w > 0);
      // Real shadow layers only: browsers list transparent placeholder layers too.
      const layers = cs.boxShadow === "none" ? [] : cs.boxShadow.split(/,(?![^(]*\))/).map((l) => l.trim()).filter((l) => !/^rgba\(0, 0, 0, 0\)/.test(l));
      const shadow = layers.length > 0;
      const rad = parseFloat(cs.borderTopLeftRadius) || 0;
      const isPill = cs.borderTopLeftRadius.endsWith("%") ? parseFloat(cs.borderTopLeftRadius) >= 50 : rad >= Math.min(r.width, r.height) / 2;
      const radius = rad > 0;
      const bgImage = cs.backgroundImage !== "none";
      if (!(hasBg || hasBorder || shadow || bgImage || (radius && el.tagName === "IMG"))) continue;
      out.push({
        tag: el.tagName.toLowerCase(),
        x: f(r.left), y: f(r.top + sy), w: f(r.width), h: f(r.height),
        bg: hasBg ? bg : "-",
        bgImage: bgImage ? cs.backgroundImage.replace(/\s+/g, " ").slice(0, 60) : "-",
        border: hasBorder ? sides.map((s, i) => (bw[i] > 0 ? `${s[0]}${bw[i]} ${cs[`border${s}Color`]}` : "")).filter(Boolean).join(", ") : "-",
        radius: !radius ? "0" : isPill ? "pill" : cs.borderTopLeftRadius,
        shadow: shadow ? layers.join(", ").replace(/\s+/g, " ") : "-",
        opacity: cs.opacity,
      });
    }
    if (ov && scope) { const cs = getComputedStyle(scope.tagName === "DIALOG" ? scope : scope.parentElement, "::backdrop"); out.push({ tag: "::backdrop", x: 0, y: 0, w: 0, h: 0, bg: cs.backgroundColor, bgImage: "-", border: "-", radius: "0", shadow: "-", opacity: "1" }); }
    return out;
  }, overlay ? { sel: REFROOT[overlay], oursSel: "dialog[open]" } : null);
  await b.close();
  return rows;
}

const [ref, ours] = [await collect(refUrl, true), await collect(oursUrl, false)];
const used = new Set();
const lines = [];
let matched = 0;
const props = ["bg", "bgImage", "border", "radius", "shadow", "opacity"];
const missing = [];
for (const r of ref.sort((a, b) => a.y - b.y)) {
  let best = null;
  let bd = Infinity;
  for (const o of ours) {
    if (used.has(o)) continue;
    if (Math.abs(o.w - r.w) > 2.5 || Math.abs(o.h - r.h) > 2.5) continue;
    const d = Math.hypot(o.x - r.x, o.y - r.y);
    if (d < bd) { bd = d; best = o; }
  }
  if (!best || bd > 8) { missing.push(r); continue; }
  used.add(best);
  matched++;
  const diffs = props.filter((p) => r[p] !== best[p]);
  if (diffs.length) lines.push(`y ${String(r.y).padStart(7)} x ${String(r.x).padStart(7)} ${r.w}x${r.h} <${r.tag}>  ${diffs.map((p) => `${p}: ${r[p]} -> ${best[p]}`).join(" | ")}`);
}
const extra = ours.filter((o) => !used.has(o));
const text = [
  `painted boxes: reference ${ref.length}, ours ${ours.length}; matched ${matched}; differing ${lines.length}`,
  "", "DIFFERENT PAINT (reference -> ours)", ...lines,
  "", `IN THE REFERENCE, NO MATCH IN OURS (${missing.length})`,
  ...missing.map((r) => `y ${String(r.y).padStart(7)} x ${String(r.x).padStart(7)} ${r.w}x${r.h} <${r.tag}> bg ${r.bg} border ${r.border} radius ${r.radius} shadow ${r.shadow}`),
  "", `IN OURS, NO MATCH IN THE REFERENCE (${extra.length})`,
  ...extra.map((o) => `y ${String(o.y).padStart(7)} x ${String(o.x).padStart(7)} ${o.w}x${o.h} <${o.tag}> bg ${o.bg} border ${o.border} radius ${o.radius} shadow ${o.shadow}`),
].join("\n");
writeFileSync(overlay ? `design/spec/paint-diff-${overlay}.txt` : "design/spec/paint-diff.txt", text);
console.log(text.split("\n").slice(0, 90).join("\n"));
