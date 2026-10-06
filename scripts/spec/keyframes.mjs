// Lists @keyframes and the rules that use `animation` in a page's stylesheets (values only).
//   node scripts/spec/keyframes.mjs <url>
import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1193, height: 900 } });
await p.goto(process.argv[2], { waitUntil: "networkidle" });
const out = await p.evaluate(() => {
  const res = [];
  const walk = (rules) => { for (const r of rules) {
    if (r.type === CSSRule.KEYFRAMES_RULE) res.push(`@keyframes ${r.name} { ${[...r.cssRules].map((k) => `${k.keyText} { ${k.style.cssText} }`).join(" ")} }`);
    else if (r.cssRules) walk(r.cssRules);
    else if (r.style && r.style.animationName && r.style.animationName !== "none" && r.style.animationName !== "") res.push(`use: ${r.selectorText ? "(rule)" : ""} animation: ${r.style.animation || r.style.animationName}`);
  } };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch {} }
  return res;
});
console.log(out.join("\n")); await b.close();
