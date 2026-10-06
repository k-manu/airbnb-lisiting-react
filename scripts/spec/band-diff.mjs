// Section-by-section pixel diff of the whole page: reference snapshot vs ours, same engine, same font.
// Both pages are screenshotted in full, cut into bands between named anchors (headings) so that a
// few px of height difference in one section cannot shift the comparison of the next, and each
// band pair is diffed. Prints mismatch % per band and writes red-on-grey diff images.
//   node scripts/spec/band-diff.mjs [refUrl=:3300] [oursUrl=:3001] [--dpr 1] [--tol 24]
//   output: design/spec/bands/<nn>-<name>.png (diff) and a table on stdout

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const urls = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] ?? "").startsWith("--"));
const [refUrl = "http://localhost:3300/", oursUrl = "http://localhost:3001/"] = urls;
const dpr = Number(opt("--dpr", 1));
const tol = Number(opt("--tol", 24));
mkdirSync("design/spec/bands", { recursive: true });

// Anchors: [label, own text, occurrence]. Each band runs from one anchor's top to the next one's.
const ANCHORS = [
  ["header+title", "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10", 1],
  ["summary+banner", "Entire serviced apartment in Candolim, India", 1],
  ["host+highlights+about", "Hosted by Mirashya Homes", 1],
  ["sleeping", "Where you'll sleep", 1],
  ["amenities", "What this place offers", 1],
  ["calendar", "5 nights in Candolim", 1],
  ["reviews-header", "Overall rating", 1],
  ["review-cards", "Amit", 1],
  ["location", "Where you’ll be", 1],
  ["host", "Meet your host", 1],
  ["things-to-know", "Things to know", 1],
  ["nearby", "More stays nearby", 1],
];

async function shoot(url) {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1193, height: 900 }, deviceScaleFactor: dpr });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Load lazy images, then come back to the top.
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
  const tops = await page.evaluate((anchors) => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    return anchors.map(([, text, nth]) => {
      const hits = [...document.body.querySelectorAll("*")].filter((e) => !e.closest("dialog,[role=dialog]") && norm([...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join("")) === text && e.getBoundingClientRect().height > 0);
      const el = hits[nth - 1];
      return el ? Math.round(el.getBoundingClientRect().top + scrollY) : null;
    });
  }, ANCHORS);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const png = await page.screenshot({ fullPage: true, animations: "disabled" });
  await b.close();
  return { tops, height, png };
}

const [ref, ours] = [await shoot(refUrl), await shoot(oursUrl)];
console.log(`anchors ref ${ref.tops.join(",")} | ours ${ours.tops.join(",")}`);
if ([...ref.tops, ...ours.tops].includes(null)) { console.log("an anchor was not found: " + ANCHORS.filter((_, i) => ref.tops[i] === null || ours.tops[i] === null).map((a) => a[1]).join(" | ")); process.exit(1); }

// Diff inside a browser page (canvas), one band at a time.
const b = await chromium.launch();
const page = await b.newPage();
const rows = [];
const cut = (a, i) => ({ y0: i === 0 ? 0 : a.tops[i] - 24, y1: i === ANCHORS.length - 1 ? a.height : a.tops[i + 1] - 24 });
for (let i = 0; i < ANCHORS.length; i++) {
  const r = cut(ref, i), o = cut(ours, i);
  const h = Math.min(r.y1 - r.y0, o.y1 - o.y0);
  const res = await page.evaluate(async ({ a, b, r0, o0, h, w, tol, dpr }) => {
    const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
    const [ia, ib] = await Promise.all([load("data:image/png;base64," + a), load("data:image/png;base64," + b)]);
    const W = w * dpr, H = h * dpr;
    const grab = (img, y0) => { const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"); g.drawImage(img, 0, y0 * dpr, W, H, 0, 0, W, H); return g.getImageData(0, 0, W, H).data; };
    const da = grab(ia, r0), db = grab(ib, o0);
    const out = document.createElement("canvas"); out.width = W; out.height = H; const og = out.getContext("2d"); const od = og.createImageData(W, H);
    let diff = 0; const cells = new Map();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      if (d > tol) { diff++; od.data[i] = 255; od.data[i + 3] = 255; const k = Math.floor(x / (W / 6)) + "," + Math.floor(y / (H / 6)); cells.set(k, (cells.get(k) || 0) + 1); }
      else { const g = 255 - (255 - da[i]) * 0.3; od.data[i] = od.data[i + 1] = od.data[i + 2] = g; od.data[i + 3] = 255; } }
    og.putImageData(od, 0, 0);
    const worst = [...cells.entries()].sort((p, q) => q[1] - p[1]).slice(0, 2).map(([k, n]) => `${k}:${Math.round((n / ((W / 6) * (H / 6))) * 100)}%`);
    return { pct: Math.round((diff / (W * H)) * 10000) / 100, worst, png: out.toDataURL("image/png") };
  }, { a: ref.png.toString("base64"), b: ours.png.toString("base64"), r0: r.y0, o0: o.y0, h, w: 1193, tol, dpr });
  const name = `${String(i).padStart(2, "0")}-${ANCHORS[i][0]}`;
  writeFileSync(`design/spec/bands/${name}.png`, Buffer.from(res.png.split(",")[1], "base64"));
  rows.push(`${name.padEnd(28)} ref y ${String(r.y0).padStart(5)} ours y ${String(o.y0).padStart(5)} h ${String(h).padStart(5)}  mismatch ${String(res.pct).padStart(6)}%  worst(col,row of 6x6) ${res.worst.join(" ")}`);
}
await b.close();
console.log(`page height: reference ${ref.height}, ours ${ours.height}; anchors ref ${ref.tops.join(",")} | ours ${ours.tops.join(",")}`);
console.log(rows.join("\n"));
