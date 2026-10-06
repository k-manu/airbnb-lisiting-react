// Finer responsive probe: hero grid (found through its biggest image), header grid, content
// grid, breakpoints. node scripts/spec/responsive2.mjs <url> <w1,w2,...>
import { chromium } from "playwright";
const url = process.argv[2];
const widths = process.argv[3].split(",").map(Number);
const b = await chromium.launch();
for (const width of widths) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  await p.goto(url, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const f = (v) => Math.round(v * 10) / 10;
    const box = (el) => { const r = el.getBoundingClientRect(); return `x${f(r.left)} w${f(r.width)} h${f(r.height)}`; };
    const img = [...document.querySelectorAll("img")].filter((i) => !i.closest("dialog")).sort((a, c) => c.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    let hero = img; while (hero && getComputedStyle(hero).display !== "grid") hero = hero.parentElement;
    const header = document.querySelector("header");
    const hg = header && [...header.querySelectorAll("*")].find((e) => getComputedStyle(e).display === "grid");
    const grids = [...document.querySelectorAll("*")].filter((el) => getComputedStyle(el).display === "grid" && el.getBoundingClientRect().height > 1500 && !el.closest("dialog"));
    const content = grids[0];
    return [
      `hero ${hero ? box(hero) + " cols[" + getComputedStyle(hero).gridTemplateColumns + "]" : "none"}`,
      `header ${header ? box(header) : ""} grid ${hg ? box(hg) + " cols[" + getComputedStyle(hg).gridTemplateColumns + "]" : "none"}`,
      `content ${content ? box(content) + " cols[" + getComputedStyle(content).gridTemplateColumns + "] gap[" + getComputedStyle(content).columnGap + "]" : "none"}`,
      `docH ${f(document.documentElement.scrollHeight)}`,
    ].join("\n       ");
  });
  console.log(`w${width}: ${r}`);
  await p.close();
}
await b.close();
