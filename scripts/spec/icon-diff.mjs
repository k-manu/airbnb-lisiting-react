// Icon-by-icon comparison: every <svg> on the page in the reference snapshot vs the nearest
// same-size svg in ours, both rendered in one engine at high DPR. Reports the mismatch per icon and
// writes a contact sheet (reference | ours | difference) of the worst ones.
//   node scripts/spec/icon-diff.mjs [refUrl=:3300] [oursUrl=:3001] [--dpr 4] [--top 18]
//   output: design/spec/icons/sheet.png + a table on stdout

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const urls = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] ?? "").startsWith("--"));
const [refUrl = "http://localhost:3300/", oursUrl = "http://localhost:3001/"] = urls;
const dpr = Number(opt("--dpr", 4));
const top = Number(opt("--top", 18));
mkdirSync("design/spec/icons", { recursive: true });

async function collect(url) {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1193, height: 900 }, deviceScaleFactor: dpr });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(500);
  const boxes = await page.evaluate(() => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    return [...document.querySelectorAll("svg")].filter((s) => !s.closest("dialog,[role=dialog]") && s.getBoundingClientRect().width >= 8 && s.getBoundingClientRect().top + scrollY >= 2 && s.getBoundingClientRect().left >= 2 && s.getBoundingClientRect().right <= 1189).map((s) => {
      const r = s.getBoundingClientRect();
      return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height, label: norm(s.closest("button,a")?.getAttribute("aria-label") || s.parentElement?.textContent || "").slice(0, 26) };
    });
  });
  const shots = [];
  for (const bx of boxes) {
    const pad = 2;
    const clip = { x: Math.max(0, bx.x - pad), y: Math.max(0, bx.y - pad), width: bx.w + pad * 2, height: bx.h + pad * 2 };
    shots.push((await page.screenshot({ clip, fullPage: true, animations: "disabled" })).toString("base64"));
  }
  await b.close();
  return { boxes, shots };
}

const [ref, ours] = [await collect(refUrl), await collect(oursUrl)];
// pair by nearest same-size box
const used = new Set();
const pairs = [];
for (const [i, r] of ref.boxes.entries()) {
  let best = -1, bd = 1e9;
  for (const [j, o] of ours.boxes.entries()) {
    if (used.has(j) || Math.abs(o.w - r.w) > 4 || Math.abs(o.h - r.h) > 4) continue;
    const d = Math.hypot(o.x - r.x, o.y - r.y);
    if (d < bd) { bd = d; best = j; }
  }
  if (best >= 0 && bd < 40) { used.add(best); pairs.push([i, best]); }
}

const b = await chromium.launch();
const pg = await b.newPage();
const result = await pg.evaluate(async ({ pairs, refShots, oursShots, refBoxes, top }) => {
  const load = (b64) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = "data:image/png;base64," + b64; });
  const rows = [];
  for (const [i, j] of pairs) {
    const [a, b] = await Promise.all([load(refShots[i]), load(oursShots[j])]);
    const W = Math.min(a.width, b.width), H = Math.min(a.height, b.height);
    const px = (img) => { const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, W, H).data; };
    const da = px(a), db = px(b);
    let diff = 0, ink = 0;
    for (let k = 0; k < da.length; k += 4) { const d = Math.max(Math.abs(da[k] - db[k]), Math.abs(da[k + 1] - db[k + 1]), Math.abs(da[k + 2] - db[k + 2])); if (d > 40) diff++; if (da[k] < 200 || db[k] < 200) ink++; }
    rows.push({ i, j, w: W, h: H, pct: Math.round((diff / Math.max(ink, 1)) * 1000) / 10, label: refBoxes[i].label, y: Math.round(refBoxes[i].y) });
  }
  rows.sort((p, q) => q.pct - p.pct);
  // contact sheet of the worst
  const worst = rows.slice(0, top);
  const cell = 132, cols = 3;
  const sheet = document.createElement("canvas"); sheet.width = cell * cols * 2 + 20; sheet.height = Math.ceil(worst.length / 2) * (cell + 22);
  const g = sheet.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, sheet.width, sheet.height); g.font = "11px sans-serif";
  for (const [n, r] of worst.entries()) {
    const [a, b] = await Promise.all([load(refShots[r.i]), load(oursShots[r.j])]);
    const ox = (n % 2) * (cell * cols + 20), oy = Math.floor(n / 2) * (cell + 22);
    const sc = Math.min(cell / a.width, cell / a.height);
    for (const [k, img] of [a, b].entries()) g.drawImage(img, ox + k * cell, oy + 14, a.width * sc, a.height * sc);
    // difference layer
    const c = document.createElement("canvas"); c.width = r.w; c.height = r.h; const cg = c.getContext("2d");
    cg.drawImage(a, 0, 0); const A = cg.getImageData(0, 0, r.w, r.h); cg.clearRect(0, 0, r.w, r.h); cg.drawImage(b, 0, 0); const B = cg.getImageData(0, 0, r.w, r.h);
    for (let k = 0; k < A.data.length; k += 4) { const d = Math.max(Math.abs(A.data[k] - B.data[k]), Math.abs(A.data[k + 1] - B.data[k + 1]), Math.abs(A.data[k + 2] - B.data[k + 2])); const v = d > 40 ? [255, 0, 0] : [255 - (255 - A.data[k]) * 0.3, 255 - (255 - A.data[k]) * 0.3, 255 - (255 - A.data[k]) * 0.3]; A.data[k] = v[0]; A.data[k + 1] = v[1]; A.data[k + 2] = v[2]; A.data[k + 3] = 255; }
    cg.putImageData(A, 0, 0); g.drawImage(c, ox + 2 * cell, oy + 14, r.w * sc, r.h * sc);
    g.fillStyle = "#000"; g.fillText(`${n + 1}. ${r.label} y${r.y} ${r.pct}%`, ox, oy + 10);
  }
  return { rows, sheet: sheet.toDataURL("image/png") };
}, { pairs, refShots: ref.shots, oursShots: ours.shots, refBoxes: ref.boxes, top, dpr });
await b.close();
writeFileSync("design/spec/icons/sheet.png", Buffer.from(result.sheet.split(",")[1], "base64"));
console.log(`icons: reference ${ref.boxes.length}, ours ${ours.boxes.length}, paired ${pairs.length} (dpr ${dpr})`);
console.log("mismatch % of inked pixels, worst first:");
for (const r of result.rows.slice(0, 40)) console.log(`  ${String(r.pct).padStart(5)}%  y ${String(r.y).padStart(5)}  ${r.w / dpr}x${r.h / dpr}  ${r.label}`);
const bins = [0, 0, 0, 0];
for (const r of result.rows) bins[r.pct < 5 ? 0 : r.pct < 15 ? 1 : r.pct < 40 ? 2 : 3]++;
console.log(`distribution: <5% ${bins[0]}, 5-15% ${bins[1]}, 15-40% ${bins[2]}, >40% ${bins[3]}`);
