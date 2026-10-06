// Interaction-state diff: for every button, link and photo tile on the page, apply rest / hover /
// press / keyboard-focus in the reference snapshot and in ours (same engine) and compare what the
// element looks like (computed colours, shadow, transform, filter, opacity, decoration, outline,
// and the hover overlay / image inside it). Elements are matched by accessible name + occurrence.
//   node scripts/spec/state-diff.mjs [refUrl=:3300] [oursUrl=:3001] [--only "text"]
//   writes design/spec/state-diff.txt

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;
const urls = argv.filter((a, i) => !a.startsWith("--") && !(argv[i - 1] ?? "").startsWith("--"));
const [refUrl = "http://localhost:3300/", oursUrl = "http://localhost:3001/"] = urls;

// One element -> named fields, so reports can say exactly which property differs.
const SIG = String.raw`(el) => {
  const fix = (v) => v.replace(/oklab\(0 0 0 \/ ([\d.]+)\)/g, "rgba(0, 0, 0, $1)").replace(/rgba\(0, 0, 0, 0\) 0px 0px 0px 0px,? ?/g, "").replace(/, $/, "");
  const look = (e, pe) => { const c = getComputedStyle(e, pe || null); return {
    bg: fix(c.backgroundColor), bgimg: c.backgroundImage === "none" ? "" : fix(c.backgroundImage).slice(0, 90), color: c.color,
    shadow: c.boxShadow === "none" ? "" : fix(c.boxShadow), transform: c.transform !== "none" ? c.transform : (c.scale && c.scale !== "none" ? "matrix(" + c.scale.split(" ")[0] + ", 0, 0, " + (c.scale.split(" ")[1] || c.scale.split(" ")[0]) + ", 0, 0)" : ""), filter: c.filter === "none" ? "" : c.filter,
    opacity: c.opacity === "1" ? "" : c.opacity, decoration: c.textDecorationLine === "none" ? "" : c.textDecorationLine,
    outline: c.outlineStyle === "none" ? "" : c.outlineWidth + " " + c.outlineStyle + " " + c.outlineColor + " +" + c.outlineOffset,
    border: c.borderTopWidth === "0px" ? "" : c.borderTopWidth + " " + c.borderTopColor, cursor: c.cursor }; };
  const inner = el.querySelector("img");
  const r = { self: look(el), after: look(el, "::after") };
  if (inner) r.img = look(inner);
  return r;
}`;

async function collect(url) {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1193, height: 900 } });
  // Headless Chromium reports no hover-capable pointer, which switches off every Tailwind hover: style.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "hover", value: "hover" }, { name: "pointer", value: "fine" }, { name: "any-hover", value: "hover" }, { name: "any-pointer", value: "fine" }] });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const handles = await page.evaluateHandle(() => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const counts = new Map();
    const list = [];
    for (const el of document.body.querySelectorAll("button, a[href], [role=button]")) {
      if (el.closest("dialog,[role=dialog],[popover]")) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      // Visible text identifies a control; icon-only and image-only ones are matched by position
      // (ours have descriptive accessible names the reference lacks).
      const visible = norm([...el.childNodes].map((n) => (n.nodeType === 3 ? n.nodeValue : n.nodeType === 1 && !n.querySelector?.("svg,img") && n.tagName !== "IMG" && n.tagName !== "SVG" && !n.classList?.contains("sr-only") ? n.textContent : "")).join(" "));
      const name = (visible || (el.querySelector("img") ? "image tile" : "icon button")).slice(0, 32);
      const n = (counts.get(name) || 0) + 1;
      counts.set(name, n);
      el.dataset.probeKey = `${name}#${n}`;
      list.push(el);
    }
    return list;
  });
  const keys = await page.evaluate((els) => els.map((e) => e.dataset.probeKey), handles);
  const out = {};
  const props = await handles.getProperties();
  const els = [...props.values()];
  for (let i = 0; i < els.length; i++) {
    const key = keys[i];
    if (only && !key.includes(only)) continue;
    const el = els[i].asElement();
    await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
    const sig = async () => { await page.waitForTimeout(450); return el.evaluate(new Function("return " + SIG)()); };
    await page.mouse.move(2, 2);
    const rest = await sig();
    let hover, press;
    try {
      await el.hover({ force: true, timeout: 2000 });
      hover = await sig();
      await page.mouse.down();
      press = await sig();
      await page.mouse.move(2, 2); // release away from the control: pressing must not click it
      await page.mouse.up();
    } catch {
      hover = press = { self: {}, after: {} }; // off-screen (skip link): not hoverable
    }
    await page.mouse.move(2, 2);
    await el.evaluate((e) => e.focus({ focusVisible: true }));
    const focus = await sig();
    await el.evaluate((e) => e.blur());
    out[key] = { rest, hover, press, focus };
  }
  await b.close();
  return out;
}

const [ref, ours] = [await collect(refUrl), await collect(oursUrl)];
const lines = [];
let same = 0;
const fieldDiffs = new Map();
const only_ref = [];
for (const [key, r] of Object.entries(ref)) {
  const o = ours[key];
  if (!o) { only_ref.push(key); continue; }
  const found = [];
  for (const state of ["rest", "hover", "press", "focus"]) for (const part of ["self", "after", "img"]) {
    const rv = r[state][part], ov = o[state][part];
    if (!rv && !ov) continue;
    for (const f of Object.keys(rv ?? ov ?? {})) {
      const a = rv?.[f] ?? "", b = ov?.[f] ?? "";
      if (a !== b) { found.push(`${state}.${part}.${f}: ${a || "-"}  ->  ${b || "-"}`); const k = `${state}.${part}.${f}`; fieldDiffs.set(k, (fieldDiffs.get(k) ?? 0) + 1); }
    }
  }
  if (found.length) lines.push(`${key}\n   ${found.join("\n   ")}`); else same++;
}
const only_ours = Object.keys(ours).filter((k) => !(k in ref));
const text = [`controls: reference ${Object.keys(ref).length}, ours ${Object.keys(ours).length}; identical in all states ${same}; different ${lines.length}; only in ours ${only_ours.length}`,
  `most common differing fields: ${[...fieldDiffs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k} x${n}`).join(", ")}`, "", ...lines, "", `ONLY IN REFERENCE: ${only_ref.join(" | ")}`, `ONLY IN OURS: ${only_ours.join(" | ")}`].join("\n");
writeFileSync("design/spec/state-diff.txt", text);
console.log(text.split("\n").slice(0, Number(process.env.LINES ?? 60)).join("\n"));
