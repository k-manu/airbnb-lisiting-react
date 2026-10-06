// Layout probe: run it on any page (ours via Playwright, the reference via the
// browser extension) and compare the numbers. It reads only geometry and
// visible text (no class names, no markup, no computed styles: those are
// unavailable on the reference and unnecessary for layout).
//
//   window.__measure({ yMin, yMax, occlusion }) -> { meta, rows }
//
// rows are [key, x, y, w, h, lines] in document css px (rounded to 0.1):
//   t:<own text>   text an element owns directly (its text nodes, joined); one
//                  box for all of it, `lines` = how many lines it wraps to
//   i:<alt>        images
//   s:<context>    svg icons, keyed by the text around them
//   b:<name>       buttons, links and form fields, keyed by accessible name
//   c:<tag>:<name> landmarks (sections, aside, nav, header, main, hr)
// Every key ends in #n, the n-th time it occurs, so equal texts stay distinct.
//
// options:
//   yMin / yMax  only rows whose top lies in this document range (for chunking)
//   occlusion    drop rows that another element covers at their centre (used to
//                read a fixed bar that sits over scrolling content)
(function () {
  const round = (n) => Math.round(n * 10) / 10;
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  const skipTag = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "TITLE", "HEAD"]);
  // Overlays exist in the DOM even when closed; only what is on the page counts.
  const inOverlay = (el) => !!el.closest("dialog, [role=dialog], [popover]");

  window.__measure = function (options = {}) {
    // root: measure only inside this element; overlay: include dialog content (normally skipped).
    const { yMin = -Infinity, yMax = Infinity, occlusion = false, root = document.body, overlay = false } = options;
    // Fixed overlays are read in viewport coordinates, whatever the page underneath has scrolled to.
    const sx = overlay ? 0 : window.scrollX;
    const sy = overlay ? 0 : window.scrollY;
    const rows = [];
    const counts = new Map();
    const push = (base, rect, lines, el) => {
      if (!(rect.width > 0 && rect.height > 0)) return;
      // Number first, filter after: chunked runs must give the same keys as a whole-page run.
      const n = (counts.get(base) || 0) + 1;
      counts.set(base, n);
      const y = rect.top + sy;
      if (y < yMin || y >= yMax) return;
      if (occlusion) {
        const hit = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        if (!hit || !(el.contains(hit) || hit.contains(el))) return;
      }
      rows.push([`${base}#${n}`, round(rect.left + sx), round(y), round(rect.width), round(rect.height), lines]);
    };

    const nameOf = (el) =>
      norm(el.getAttribute("aria-label")) ||
      norm(el.getAttribute("alt")) ||
      norm(el.textContent).slice(0, 40) ||
      el.tagName.toLowerCase();

    const all = [root, ...root.querySelectorAll("*")];
    for (const el of all) {
      if (skipTag.has(el.tagName) || (!overlay && inOverlay(el))) continue;
      if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
      const tag = el.tagName.toLowerCase();

      // Text the element owns itself.
      const owned = [...el.childNodes].filter(
        (n) => n.nodeType === 3 && norm(n.nodeValue),
      );
      if (owned.length && tag !== "svg") {
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        const tops = new Set();
        for (const node of owned) {
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of range.getClientRects()) {
            if (!(r.width > 0 && r.height > 0)) continue;
            left = Math.min(left, r.left);
            top = Math.min(top, r.top);
            right = Math.max(right, r.right);
            bottom = Math.max(bottom, r.bottom);
            tops.add(Math.round(r.top));
          }
        }
        if (right > left) {
          const text = norm(owned.map((n) => n.nodeValue).join(""));
          push(
            `t:${text.slice(0, 60)}`,
            { left, top, width: right - left, height: bottom - top },
            tops.size,
            el,
          );
        }
      }

      if (tag === "img") push(`i:${nameOf(el)}`.slice(0, 60), el.getBoundingClientRect(), 0, el);
      else if (tag === "svg") {
        const ctx = norm(el.parentElement && el.parentElement.textContent).slice(0, 30);
        push(`s:${ctx || (el.closest("button,a") ? nameOf(el.closest("button,a")) : "")}`, el.getBoundingClientRect(), 0, el);
      } else if (/^(button|a|input|select|textarea)$/.test(tag) || el.getAttribute("role") === "button") {
        push(`b:${nameOf(el)}`, el.getBoundingClientRect(), 0, el);
      } else if (/^(section|aside|nav|header|main|footer|hr)$/.test(tag)) {
        push(`c:${tag}:${nameOf(el).slice(0, 30)}`, el.getBoundingClientRect(), 0, el);
      }
    }

    rows.sort((a, b) => a[2] - b[2] || a[1] - b[1]);
    return {
      meta: {
        iw: window.innerWidth,
        cw: document.documentElement.clientWidth,
        ih: window.innerHeight,
        docH: document.documentElement.scrollHeight,
        scrollY: sy,
        count: rows.length,
      },
      rows,
    };
  };
})();
