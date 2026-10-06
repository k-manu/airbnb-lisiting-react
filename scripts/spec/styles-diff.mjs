// Computed-style diff of every text-owning element, reference snapshot vs ours, in one browser
// engine (both local, so getComputedStyle works). Matches by own text + occurrence, like the
// layout probe. Prints only differences, grouped by property. Numbers only.
//   node scripts/spec/styles-diff.mjs [refUrl=http://localhost:3300/] [oursUrl=http://localhost:3001/] [--props fs,lh,fw,ls,color,mt,mb,pt,pb]
//   writes design/spec/styles-diff.txt

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const argv = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && !(all[i - 1] ?? "").startsWith("--"));
const refUrl = argv[0] ?? "http://localhost:3300/";
const oursUrl = argv[1] ?? "http://localhost:3001/";
const propsArg = process.argv.includes("--props") ? process.argv[process.argv.indexOf("--props") + 1] : "fs,lh,fw,ls,color,mt,mb,pt,pb,td,tt";
const props = propsArg.split(",");

async function collect(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1193, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const rows = await page.evaluate(() => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const px = (v) => (v === "normal" || v === "auto" ? v : String(Math.round(parseFloat(v) * 100) / 100));
    const counts = new Map();
    const out = [];
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("dialog,[role=dialog],[popover],svg,script,style")) continue;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3 && norm(n.nodeValue));
      if (!own.length) continue;
      const r = el.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) continue;
      const text = norm(own.map((n) => n.nodeValue).join("")).slice(0, 60);
      const n = (counts.get(text) || 0) + 1;
      counts.set(text, n);
      const cs = getComputedStyle(el);
      out.push({
        key: `${text}#${n}`,
        y: Math.round((r.top + scrollY) * 10) / 10,
        fs: px(cs.fontSize),
        lh: px(cs.lineHeight),
        fw: cs.fontWeight,
        ls: px(cs.letterSpacing),
        color: cs.color,
        mt: px(cs.marginTop),
        mb: px(cs.marginBottom),
        pt: px(cs.paddingTop),
        pb: px(cs.paddingBottom),
        td: cs.textDecorationLine,
        tt: cs.textTransform,
      });
    }
    return out;
  });
  await browser.close();
  return rows;
}

const [ref, ours] = [await collect(refUrl), await collect(oursUrl)];
const byKey = new Map(ours.map((o) => [o.key, o]));
const lines = [];
const counts = Object.fromEntries(props.map((p) => [p, 0]));
let matched = 0;
for (const r of ref) {
  const o = byKey.get(r.key);
  if (!o) continue;
  matched++;
  const diffs = props.filter((p) => r[p] !== o[p]);
  for (const p of diffs) counts[p]++;
  if (diffs.length) {
    lines.push(`y ${String(r.y).padStart(7)}  ${r.key.slice(0, 44).padEnd(44)}  ${diffs.map((p) => `${p} ${r[p]} -> ${o[p]}`).join(", ")}`);
  }
}
const head = [
  `matched ${matched} of ${ref.length} reference text elements (ours has ${ours.length})`,
  `differing elements: ${lines.length}; by property: ${props.map((p) => `${p} ${counts[p]}`).join(", ")}`,
  "",
];
const text = [...head, ...lines].join("\n");
writeFileSync("design/spec/styles-diff.txt", text);
console.log(text.split("\n").slice(0, 130).join("\n"));
