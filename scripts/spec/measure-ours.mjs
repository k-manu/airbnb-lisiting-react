// Runs the layout probe on our app and writes the rows to a JSON file.
//   node scripts/spec/measure-ours.mjs [url] [out.json]
// Defaults: http://localhost:3000/ -> design/spec/ours-measure.json
// Viewport 1193 wide: the reference's layout width once its 15px scrollbar is taken off 1208.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000/";
const out = process.argv[3] ?? "design/spec/ours-measure.json";
// The reference was captured in a browser running at devicePixelRatio 3.18. Font metrics are rounded
// to device pixels, so line boxes that use `line-height: normal` come out a fraction of a pixel
// different at another ratio; measure at the same one to compare like with like.
const dpr = Number(process.env.DPR ?? 3.18);
const probe = readFileSync(new URL("./measure-page.js", import.meta.url), "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1193, height: 536 }, deviceScaleFactor: dpr });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(probe);

const at = async (scrollTo, options) => {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollTo);
  await page.waitForTimeout(500);
  return page.evaluate((o) => window.__measure(o), options);
};

const result = {
  url,
  page: await at(0, {}),
  // The fixed bar as seen at scroll 1000, in viewport coordinates (scroll offset added back).
  bar: await at(1000, { occlusion: true, yMax: 1000 + 90 }),
  // The sticky booking column at two scroll positions.
  sticky1200: await at(1200, { occlusion: true, yMin: 1200, yMax: 1200 + 536 }),
  sticky2000: await at(2000, { occlusion: true, yMin: 2000, yMax: 2000 + 536 }),
};
await browser.close();

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result));
console.log(
  `dpr ${dpr}; wrote ${out}: page ${result.page.meta.count} rows, docH ${result.page.meta.docH}, bar ${result.bar.meta.count}, sticky ${result.sticky1200.meta.count}/${result.sticky2000.meta.count}`,
);
