// Compares two screenshots (any format Chromium decodes), pixel by pixel.
//   node scripts/spec/img-diff.mjs <a> <b> [out.png] [--crop WxH] [--tol 32] [--grid 8]
// Crops both to the smaller common size (or --crop), counts pixels whose channels differ by more
// than --tol (JPEG noise stays below ~24), writes a diff image (differences in red over a faded
// copy of a) and lists the worst grid cells so you know where to look.

import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const files = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] ?? "").startsWith("--"));
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const [a, b, out = "design/spec/diff.png"] = files;
const tol = Number(opt("--tol", 32));
const grid = Number(opt("--grid", 8));
const crop = opt("--crop", "");
const mime = (f) => (f.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
const uri = (f) => `data:${mime(f)};base64,${readFileSync(f).toString("base64")}`;

const browser = await chromium.launch();
const page = await browser.newPage();
const result = await page.evaluate(
  async ({ ua, ub, tol, grid, crop }) => {
    const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
    const [ia, ib] = await Promise.all([load(ua), load(ub)]);
    let w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    if (crop) { const [cw, ch] = crop.split("x").map(Number); w = Math.min(w, cw); h = Math.min(h, ch); }
    const px = (img) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h).data; };
    const da = px(ia), db = px(ib);
    const out = document.createElement("canvas"); out.width = w; out.height = h;
    const og = out.getContext("2d"); const od = og.createImageData(w, h);
    let diff = 0; const cells = new Map();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      if (d > tol) { diff++; od.data[i] = 255; od.data[i + 1] = 0; od.data[i + 2] = 0; od.data[i + 3] = 255;
        const key = `${Math.floor(x / (w / grid))},${Math.floor(y / (h / grid))}`; cells.set(key, (cells.get(key) || 0) + 1); }
      else { const g = 255 - (255 - da[i]) * 0.25; od.data[i] = od.data[i + 1] = od.data[i + 2] = g; od.data[i + 3] = 255; }
    }
    og.putImageData(od, 0, 0);
    const worst = [...cells.entries()].sort((p, q) => q[1] - p[1]).slice(0, 5).map(([k, n]) => ({ cell: k, pct: Math.round((n / ((w / grid) * (h / grid))) * 1000) / 10 }));
    return { w, h, diff, pct: Math.round((diff / (w * h)) * 10000) / 100, worst, png: out.toDataURL("image/png") };
  },
  { ua: uri(a), ub: uri(b), tol, grid, crop },
);
await browser.close();
writeFileSync(out, Buffer.from(result.png.split(",")[1], "base64"));
console.log(`${result.w}x${result.h}: ${result.pct}% of pixels differ by > ${tol} (${result.diff} px). worst ${grid}x${grid} cells (col,row): ${result.worst.map((c) => `${c.cell} ${c.pct}%`).join(", ")}\nwrote ${out}`);
