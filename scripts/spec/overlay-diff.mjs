// Overlay geometry: Photo Tour, Lightbox and the amenities modal, reference snapshot (forced into
// its open state) vs ours (really opened), both in one engine at the same width.
//   node scripts/spec/overlay-diff.mjs [tour|viewer|amenities|all]
// Writes design/spec/ov-<name>-{ref,ours}.json and prints the spec-diff summary for each.
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const which = process.argv[2] ?? "all";
const probe = readFileSync(new URL("./measure-page.js", import.meta.url), "utf8");
const REF = "http://localhost:3300/";
const OURS = "http://localhost:3001/";

const FORCE = {
  tour: `[role=dialog][aria-label="Photo tour"]{visibility:visible!important;opacity:1!important;transform:none!important}`,
  viewer: `[role=dialog][aria-label="Photo viewer"]{visibility:visible!important;opacity:1!important;transform:none!important}`,
  amenities: `[role=dialog][aria-label="What this place offers"]{visibility:visible!important;opacity:1!important;transform:none!important} *:has(> [role=dialog][aria-label="What this place offers"]){visibility:visible!important;opacity:1!important}`,
};
const REF_ROOT = {
  tour: `[role=dialog][aria-label="Photo tour"]`,
  viewer: `[role=dialog][aria-label="Photo viewer"]`,
  amenities: `[role=dialog][aria-label="What this place offers"]`,
};

async function measure(page, rootSelector, yMax) {
  await page.evaluate(probe);
  return page.evaluate(({ sel, yMax }) => window.__measure({ root: document.querySelector(sel), overlay: true, yMax }), { sel: rootSelector, yMax });
}

const b = await chromium.launch();
for (const name of which === "all" ? ["tour", "viewer", "amenities"] : [which]) {
  // reference: force open
  const rp = await b.newPage({ viewport: { width: 1193, height: 900 } });
  await rp.goto(REF, { waitUntil: "networkidle" });
  await rp.addStyleTag({ content: FORCE[name] });
  await rp.waitForTimeout(400);
  const ref = await measure(rp, REF_ROOT[name], Number(process.env.YMAX ?? 900));
  await rp.close();
  // ours: open for real
  const op = await b.newPage({ viewport: { width: 1193, height: 900 } });
  if (name === "tour") await op.goto(`${OURS}?modal=PHOTO_TOUR_SCROLLABLE`, { waitUntil: "networkidle" });
  else if (name === "viewer") await op.goto(`${OURS}?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000`, { waitUntil: "networkidle" });
  else { await op.goto(OURS, { waitUntil: "networkidle" }); await op.getByRole("button", { name: /Show all \d+ amenities/ }).click(); }
  await op.waitForTimeout(900);
  const ours = await measure(op, name === "viewer" ? `dialog[open]:last-of-type` : "dialog[open]", Number(process.env.YMAX ?? 900));
  await op.close();
  writeFileSync(`design/spec/ov-${name}-ref.json`, JSON.stringify({ page: ref }));
  writeFileSync(`design/spec/ov-${name}-ours.json`, JSON.stringify({ page: ours }));
  console.log(`\n##### ${name}: reference rows ${ref.rows.length}, ours ${ours.rows.length}`);
  const r = spawnSync("node", ["scripts/spec/spec-diff.mjs", "--ref", `design/spec/ov-${name}-ref.json`, "--ours", `design/spec/ov-${name}-ours.json`, "--out", `design/spec/ov-${name}-diff.txt`], { encoding: "utf8" });
  console.log(r.stdout.split("\n").slice(0, 8).join("\n"));
}
await b.close();
