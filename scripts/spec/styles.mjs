// Prints the computed spacing/type values of the element that owns a piece of text, and of its
// ancestors, on any page (the reference snapshot on :3300, or ours). Numbers only: tag names and
// computed values, never class names or markup.
//   node scripts/spec/styles.mjs <url> "<own text>" [depth=5] [--nth n]
// Compare the two outputs and change ours to the measured numbers.

import { chromium } from "playwright";

const [url, text, depthArg] = process.argv.slice(2);
const depth = Number(depthArg && !depthArg.startsWith("--") ? depthArg : 5);
const nth = process.argv.includes("--nth") ? Number(process.argv[process.argv.indexOf("--nth") + 1]) : 1;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1193, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const rows = await page.evaluate(
  ({ text, depth, nth }) => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const owners = [...document.body.querySelectorAll("*")].filter((el) =>
      [...el.childNodes].some((n) => n.nodeType === 3 && norm(n.nodeValue) && norm(el.textContent).startsWith(text)) &&
      !el.closest("dialog,[role=dialog]"),
    );
    const el = owners[nth - 1];
    if (!el) return null;
    const px = (v) => (v === "auto" || v === "normal" ? v : String(Math.round(parseFloat(v) * 100) / 100));
    const box = (cs, p) => [cs[`${p}Top`], cs[`${p}Right`], cs[`${p}Bottom`], cs[`${p}Left`]].map(px).join(" ");
    const out = [];
    let cur = el;
    for (let i = 0; i <= depth && cur && cur !== document.documentElement; i++, cur = cur.parentElement) {
      const cs = getComputedStyle(cur);
      const r = cur.getBoundingClientRect();
      out.push({
        tag: cur.tagName.toLowerCase(),
        rect: [r.left, r.top + scrollY, r.width, r.height].map((v) => Math.round(v * 10) / 10).join(" "),
        display: cs.display + (cs.position !== "static" ? ` / ${cs.position}` : ""),
        margin: box(cs, "margin"),
        padding: box(cs, "padding"),
        font: `${px(cs.fontSize)}px/${px(cs.lineHeight)} w${cs.fontWeight}${cs.letterSpacing !== "normal" ? ` ls${px(cs.letterSpacing)}` : ""}`,
        gap: cs.display.includes("flex") || cs.display.includes("grid") ? `${px(cs.rowGap)} ${px(cs.columnGap)}` : "",
        align: cs.display.includes("flex") ? `${cs.flexDirection} ${cs.alignItems} ${cs.justifyContent}` : "",
        cols: cs.display.includes("grid") ? cs.gridTemplateColumns : "",
        border: `${px(cs.borderTopWidth)} ${px(cs.borderBottomWidth)}`,
        color: cs.color,
      });
    }
    return out;
  },
  { text, depth, nth },
);
await browser.close();
if (!rows) {
  console.log(`no element owns "${text}" (nth ${nth})`);
  process.exit(1);
}
for (const [i, r] of rows.entries()) {
  console.log(
    `${"  ".repeat(i)}${r.tag}  rect[${r.rect}]  ${r.display}  m[${r.margin}] p[${r.padding}]  ${r.font}` +
      `${r.gap ? `  gap[${r.gap}]` : ""}${r.align ? ` ${r.align}` : ""}${r.cols ? ` cols[${r.cols}]` : ""}` +
      `${r.border !== "0 0" ? `  border[${r.border}]` : ""}`,
  );
}
