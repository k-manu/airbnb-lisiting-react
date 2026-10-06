// Prints every visible svg's box and its own computed size/overflow in the given pages, for a quick
// side-by-side of icon placement.  node scripts/spec/icon-boxes.mjs <url> [minY] [maxY]
import { chromium } from "playwright";
const [url, minY = "0", maxY = "99999"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1193, height: 900 } });
await p.goto(url, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
const rows = await p.evaluate(([a, z]) => [...document.querySelectorAll("svg")].filter((s) => !s.closest("dialog,[role=dialog]")).map((s) => { const r = s.getBoundingClientRect(); const cs = getComputedStyle(s); return { y: Math.round(r.top + scrollY), x: Math.round(r.left * 10) / 10, w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100, ov: cs.overflow, col: cs.color, par: s.parentElement.tagName + "." + (s.parentElement.className || "").toString().slice(0, 40) }; }).filter((r) => r.y >= a && r.y <= z), [Number(minY), Number(maxY)]);
for (const r of rows) console.log(JSON.stringify(r));
await b.close();
