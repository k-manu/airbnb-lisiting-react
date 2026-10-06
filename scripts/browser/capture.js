// scripts/browser/capture.js
//
// PASTE THIS INTO THE DEVTOOLS CONSOLE of a page you have open (the reference
// listing, in your own browser). It defines two helpers:
//
//   __capture("label")   record the whole page as rendered right now and
//                        download it as <label>.json
//   __hover(4000)        then hover an element and hold still: after 4s it
//                        prints/downloads the computed styles of what you
//                        were hovering (for hover/active end-values)
//
// What it records (RENDERED OUTPUT ONLY): visible text, computed style values
// (colour, type, spacing, borders, radii, shadows, gradients, transitions),
// element boxes in CSS px, image URLs + sizes, and font families in use.
// It deliberately does NOT record markup, class names, ids, attributes or
// script — nothing to copy, only values to measure against.
//
// Typical session (window ~1192px wide so it matches our captures):
//   1. scroll the whole page once (so lazy content loads), scroll back to top
//   2. __capture("listing")
//   3. click "Show more" on the description  -> __capture("description-open")
//   4. click "Show all photos"               -> __capture("photo-tour")
//   5. click any photo                       -> __capture("lightbox")
//   6. also: the amenities modal, the reviews modal, the sticky sub-bar
//      (scroll past the photos), the date picker...
//   7. save the .json files into design/capture/ and tell Claude.

(() => {
  const round = (n) => Math.round(n * 10) / 10;
  const MAX_NODES = 8000;

  const TEXT_PROPS = [
    "color",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "letterSpacing",
    "textDecorationLine",
    "textTransform",
    "textAlign",
    "fontStyle",
    "whiteSpace",
  ];
  const BOX_LAYOUT_PROPS = [
    "display",
    "position",
    "flexDirection",
    "flexWrap",
    "justifyContent",
    "alignItems",
    "gap",
    "gridTemplateColumns",
    "gridTemplateRows",
    "overflow",
  ];
  const SIDES = ["Top", "Right", "Bottom", "Left"];

  const isZero = (v) =>
    !v || v === "0px" || v === "none" || v === "normal" || v === "auto";

  function pageRect(el) {
    const r = el.getBoundingClientRect();
    // position:fixed is reported in viewport coords (and flagged). Sticky
    // elements are in normal flow, so they keep page coords + a flag.
    let mode = null;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const p = getComputedStyle(e).position;
      if (p === "fixed") {
        mode = "fixed";
        break;
      }
      if (p === "sticky") mode = "sticky";
    }
    const fixed = mode === "fixed";
    return {
      x: round(r.left + (fixed ? 0 : window.scrollX)),
      y: round(r.top + (fixed ? 0 : window.scrollY)),
      w: round(r.width),
      h: round(r.height),
      ...(mode ? { [mode]: true } : {}),
    };
  }

  function visible(cs, r) {
    return (
      cs.display !== "none" &&
      cs.visibility !== "hidden" &&
      parseFloat(cs.opacity) > 0 &&
      r.width > 0 &&
      r.height > 0
    );
  }

  function transitionOf(cs) {
    const durs = cs.transitionDuration.split(",").map((s) => s.trim());
    if (durs.every((d) => d === "0s")) return undefined;
    return {
      property: cs.transitionProperty,
      duration: cs.transitionDuration,
      timingFunction: cs.transitionTimingFunction,
      delay: cs.transitionDelay,
    };
  }

  // Split on top-level commas and drop the invisible reset layers some
  // frameworks stack in front of the real shadow.
  function realShadows(value) {
    if (!value || value === "none") return undefined;
    const layers = [];
    let depth = 0;
    let cur = "";
    for (const ch of value) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        layers.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    layers.push(cur.trim());
    const real = layers.filter((l) => l !== "rgba(0, 0, 0, 0) 0px 0px 0px 0px");
    return real.length ? real.join(", ") : undefined;
  }

  function boxOf(cs) {
    const box = {};
    if (cs.backgroundColor !== "rgba(0, 0, 0, 0)")
      box.backgroundColor = cs.backgroundColor;
    if (cs.backgroundImage !== "none") box.backgroundImage = cs.backgroundImage;
    const borders = {};
    SIDES.forEach((s) => {
      const w = cs[`border${s}Width`];
      if (w && w !== "0px" && cs[`border${s}Style`] !== "none") {
        borders[s.toLowerCase()] =
          `${w} ${cs[`border${s}Style`]} ${cs[`border${s}Color`]}`;
      }
    });
    if (Object.keys(borders).length) box.border = borders;
    if (!isZero(cs.borderRadius)) box.borderRadius = cs.borderRadius;
    const shadow = realShadows(cs.boxShadow);
    if (shadow) box.boxShadow = shadow;
    if (!isZero(cs.padding) && cs.padding !== "0px 0px 0px 0px")
      box.padding = cs.padding;
    if (cs.transform !== "none") box.transform = cs.transform;
    if (cs.filter !== "none") box.filter = cs.filter;
    if (cs.backdropFilter && cs.backdropFilter !== "none")
      box.backdropFilter = cs.backdropFilter;
    return box;
  }

  function layoutOf(cs) {
    const layout = {};
    BOX_LAYOUT_PROPS.forEach((p) => {
      const v = cs[p];
      if (
        !isZero(v) &&
        !(p === "display" && (v === "block" || v === "inline")) &&
        !(p === "position" && v === "static") &&
        !(p === "overflow" && v === "visible")
      ) {
        layout[p] = v;
      }
    });
    return layout;
  }

  function capture(label = "capture") {
    const nodes = [];
    const fonts = new Set();

    for (const el of document.body.querySelectorAll("*")) {
      if (nodes.length >= MAX_NODES) break;
      const tag = el.tagName.toLowerCase();
      if (
        [
          "script",
          "style",
          "noscript",
          "link",
          "meta",
          "head",
          "template",
        ].includes(tag)
      )
        continue;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (!visible(cs, rect)) continue;

      const base = pageRect(el);
      const transition = transitionOf(cs);

      if (tag === "img") {
        nodes.push({
          k: "img",
          ...base,
          src: el.currentSrc || el.src,
          alt: el.alt,
          naturalW: el.naturalWidth,
          naturalH: el.naturalHeight,
          objectFit: cs.objectFit,
          objectPosition: cs.objectPosition,
          ...(!isZero(cs.borderRadius)
            ? { borderRadius: cs.borderRadius }
            : {}),
          ...(transition ? { transition } : {}),
        });
        continue;
      }
      if (tag === "svg") {
        // Geometry + colour only: no path data (icons are assets, supplied separately).
        nodes.push({
          k: "svg",
          ...base,
          viewBox: el.getAttribute("viewBox"),
          color: cs.color,
          fill: cs.fill,
          stroke: cs.stroke,
          strokeWidth: cs.strokeWidth,
        });
        continue;
      }

      // Own text (not descendants').
      const own = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      const isControl = ["input", "select", "textarea", "button"].includes(tag);
      const node = {
        k: own ? "text" : "box",
        tag: isControl ? tag : undefined,
        ...base,
      };
      if (own) {
        node.text = own;
        fonts.add(cs.fontFamily);
        TEXT_PROPS.forEach((p) => {
          node[p] = cs[p];
        });
        node.fontFamily = cs.fontFamily.split(",")[0].trim();
        const lh = parseFloat(cs.lineHeight);
        const chrome =
          parseFloat(cs.paddingTop) +
          parseFloat(cs.paddingBottom) +
          parseFloat(cs.borderTopWidth) +
          parseFloat(cs.borderBottomWidth);
        if (lh > 0)
          node.lines = Math.max(1, Math.round((rect.height - chrome) / lh));
      }
      if (tag === "input" || tag === "select" || tag === "textarea") {
        node.value = el.value;
        node.placeholder = el.placeholder || undefined;
      }
      const box = boxOf(cs);
      const layout = layoutOf(cs);
      const hasVisualBox = Object.keys(box).length > 0;
      const hasLayout = Object.keys(layout).length > 0;
      if (
        !own &&
        !hasVisualBox &&
        !(hasLayout && (layout.display || "").match(/flex|grid/)) &&
        !isControl
      )
        continue;
      if (hasVisualBox) node.box = box;
      if (hasLayout) node.layout = layout;
      if (transition) node.transition = transition;
      if (cs.animationName !== "none")
        node.animation = `${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction}`;
      nodes.push(node);
    }

    nodes.sort((a, b) => a.y - b.y || a.x - b.x);

    const out = {
      meta: {
        label,
        url: location.href,
        title: document.title,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        devicePixelRatio: window.devicePixelRatio,
        pageHeight: document.documentElement.scrollHeight,
        bodyFontFamily: getComputedStyle(document.body).fontFamily,
        fontsLoaded: Array.from(document.fonts || [])
          .filter((f) => f.status === "loaded")
          .map((f) => `${f.family} ${f.weight} ${f.style}`),
        capturedAt: new Date().toISOString(),
        nodeCount: nodes.length,
        truncated: nodes.length >= MAX_NODES,
      },
      nodes,
    };
    download(`${label}.json`, JSON.stringify(out));
    console.log(
      `__capture: ${nodes.length} nodes -> ${label}.json (downloaded)`,
    );
    return out;
  }

  function download(filename, text) {
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([text], { type: "application/json" }),
      );
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.warn("download failed; use copy(JSON.stringify(result))", e);
    }
  }

  // Computed styles of whatever the pointer is over (plus 3 ancestors), taken
  // after a delay so you can move the mouse there and hold still.
  function hover(delayMs = 4000, label = "hover") {
    console.log(
      `__hover: hover the element now and hold still (${delayMs}ms)...`,
    );
    setTimeout(() => {
      const chain = Array.from(document.querySelectorAll(":hover"));
      const target = chain[chain.length - 1];
      if (!target) return console.warn("__hover: nothing hovered");
      const pick = (el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        return {
          text: own || undefined,
          rect: { w: round(r.width), h: round(r.height) },
          cursor: cs.cursor,
          color: cs.color,
          ...boxOf(cs),
          textDecorationLine: cs.textDecorationLine,
          opacity: cs.opacity,
          transition: transitionOf(cs),
        };
      };
      const result = [];
      let el = target;
      for (let i = 0; el && i < 4; i++, el = el.parentElement)
        result.push(pick(el));
      download(`${label}.json`, JSON.stringify(result));
      console.log("__hover result", result);
    }, delayMs);
  }

  window.__capture = capture;
  window.__hover = hover;
  console.log(
    'capture helpers ready: __capture("label"), __hover(4000, "label")',
  );
})();
