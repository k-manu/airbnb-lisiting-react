// Extracts the reference's icon ARTWORK (viewBox, paint attributes and shape geometry of each <svg>)
// with a human context label, so it can be stored as assets in our own icon registry.
//   node scripts/spec/extract-icons.mjs        (needs the snapshot server on :3300)
//   writes design/spec/icons.json
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1193, height: 900 } });
await p.goto("http://localhost:3300/", { waitUntil: "networkidle" });
const icons = await p.evaluate(() => {
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  const keep = ["d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "width", "height", "points", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-rule", "clip-rule", "opacity", "transform", "fill-opacity", "stroke-opacity", "stroke-miterlimit", "offset", "stop-color", "stop-opacity", "gradientUnits", "gradientTransform", "id", "clip-path", "mask", "href", "xlink:href", "vector-effect"];
  // Paint comes from CSS in the reference; bake the computed values into explicit attributes, with the
  // element's own colour written as currentColor so the icon follows the text colour.
  const PAINT = [["fill", "fill"], ["stroke", "stroke"], ["stroke-width", "strokeWidth"], ["stroke-linecap", "strokeLinecap"], ["stroke-linejoin", "strokeLinejoin"], ["fill-rule", "fillRule"], ["stroke-miterlimit", "strokeMiterlimit"], ["opacity", "opacity"]];
  const colour = (v, ink) => (v === ink ? "currentColor" : v);
  const paintOf = (el, ink) => { const c = getComputedStyle(el); const o = {}; for (const [a, k] of PAINT) { let v = c[k]; if (a === "fill" || a === "stroke") v = colour(v, ink); if (a === "stroke-width") v = String(parseFloat(v)); o[a] = v; } return o; };
  const clean = (el, parentPaint, ink) => {
    const tag = el.tagName.toLowerCase();
    const paint = paintOf(el, ink);
    const own = [...el.attributes].filter((a) => keep.includes(a.name) && !PAINT.some(([n]) => n === a.name)).map((a) => `${a.name}="${a.value}"`);
    const diff = PAINT.filter(([n]) => paint[n] !== parentPaint[n]).map(([n]) => `${n}="${paint[n]}"`);
    const kids = [...el.children].map((k) => clean(k, paint, ink)).join("");
    const attrs = [...own, ...diff].join(" ");
    return `<${tag}${attrs ? " " + attrs : ""}>${kids}</${tag}>`;
  };
  const out = [];
  document.querySelectorAll("svg").forEach((s, i) => {
    if (s.closest("svg") !== s) return;
    const r = s.getBoundingClientRect();
    const dlg = s.closest("[role=dialog],dialog");
    // context: text next to the icon, else the control's name
    const sib = [s.nextElementSibling, s.previousElementSibling, s.parentElement?.nextElementSibling].map((e) => norm(e?.textContent)).find((t) => t && t.length < 60);
    const btn = s.closest("button,a");
    const label = norm(btn?.getAttribute("aria-label")) || sib || norm(s.parentElement?.textContent).slice(0, 40) || "";
    out.push({
      i, overlay: dlg ? (dlg.getAttribute("aria-label") || "dialog") : "",
      y: Math.round(r.top + scrollY), x: Math.round(r.left), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
      label: label.slice(0, 40),
      viewBox: s.getAttribute("viewBox") || "",
      w_attr: s.getAttribute("width") || "", h_attr: s.getAttribute("height") || "",
      ...(() => { const ink = getComputedStyle(s).color; const rp = paintOf(s, ink); return { paint: PAINT.map(([n]) => `${n}="${rp[n]}"`).join(" "), inner: [...s.children].map((k) => clean(k, rp, ink)).join("") }; })(),
    });
  });
  return out;
});
await b.close();
writeFileSync("design/spec/icons.json", JSON.stringify(icons, null, 1));
const uniq = new Map();
for (const ic of icons) { const k = ic.viewBox + "|" + ic.paint + "|" + ic.inner; uniq.set(k, [...(uniq.get(k) ?? []), ic.label || `(y${ic.y})`]); }
console.log(`svgs ${icons.length}, unique artworks ${uniq.size}, in overlays ${icons.filter((i) => i.overlay).length}`);
const kinds = new Map(); for (const ic of icons) kinds.set(ic.viewBox || "(none)", (kinds.get(ic.viewBox || "(none)") ?? 0) + 1);
console.log("viewBoxes:", [...kinds.entries()].map(([k, n]) => `${k} x${n}`).join(" ; "));
console.log("uses <use>:", icons.filter((i) => i.inner.includes("<use")).length, " uses gradients/clip:", icons.filter((i) => /clip|mask|Gradient/i.test(i.inner)).length);
