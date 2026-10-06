import { chromium } from "playwright";
const [url, widths] = [process.argv[2], (process.argv[3] ?? "1193,1440,1920").split(",").map(Number)];
const b = await chromium.launch();
for (const width of widths) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  await p.goto(url, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const f = (v) => Math.round(v * 10) / 10;
    const nav = document.querySelector('nav[aria-label="Listing sections"]');
    const reserve = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Reserve" && x.getBoundingClientRect().top < 0);
    let el = nav, chain = [];
    for (let i = 0; i < 3 && el; i++, el = el.parentElement) { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); chain.push(`${el.tagName.toLowerCase()}[x${f(r.left)} w${f(r.width)} maxw ${cs.maxWidth} pad ${cs.paddingLeft}/${cs.paddingRight}]`); }
    return `nav x${f(nav.getBoundingClientRect().left)} | reserve right edge ${reserve ? f(reserve.getBoundingClientRect().right) : "?"} | ${chain.join(" < ")}`;
  });
  console.log(`w${width}: ${r}`);
  await p.close();
}
await b.close();
