// How key containers resize with the viewport, reference snapshot vs ours (one engine).
//   node scripts/spec/responsive.mjs <url> [widths=1000,1100,1193,1280,1440,1680,1920]
// Prints, per width: main container, hero grid (width + columns), content grid (columns + gap),
// header inner width, and the page height.
import { chromium } from "playwright";
const url = process.argv[2];
const widths = (process.argv[3] ?? "1000,1100,1193,1280,1440,1680,1920").split(",").map(Number);
const b = await chromium.launch();
for (const width of widths) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => {
    const f = (v) => Math.round(v * 10) / 10;
    const box = (el) => { const r = el.getBoundingClientRect(); return `${f(r.left)}+${f(r.width)}`; };
    const grids = [...document.querySelectorAll("div,section,ul,main")].filter((el) => getComputedStyle(el).display === "grid" && el.getBoundingClientRect().width > 300 && el.getBoundingClientRect().top + scrollY < 2700 && !el.closest("dialog"));
    const hero = grids.find((g) => getComputedStyle(g).gridTemplateColumns.split(" ").length === 3 && g.getBoundingClientRect().top + scrollY < 400);
    const content = grids.find((g) => getComputedStyle(g).gridTemplateColumns.split(" ").length === 2 && g.getBoundingClientRect().height > 1500);
    const main = document.querySelector("main");
    const first = main.firstElementChild;
    const cs = (el, p) => getComputedStyle(el)[p];
    return {
      main: box(main), mainInner: first ? `${box(first)} pad[${cs(first, "paddingLeft")} ${cs(first, "paddingRight")}] maxw[${cs(first, "maxWidth")}]` : "",
      hero: hero ? `${box(hero)} cols[${cs(hero, "gridTemplateColumns")}] h${f(hero.getBoundingClientRect().height)}` : "none",
      content: content ? `${box(content)} cols[${cs(content, "gridTemplateColumns")}] gap[${cs(content, "columnGap")}]` : "none",
      docH: f(document.documentElement.scrollHeight),
    };
  });
  console.log(`w${width}: main ${r.main} inner ${r.mainInner}\n       hero ${r.hero}\n       content ${r.content}\n       docH ${r.docH}`);
  await p.close();
}
await b.close();
