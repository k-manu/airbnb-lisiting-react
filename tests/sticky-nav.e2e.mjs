// End-to-end tests for the sticky sub-nav, run against its sandbox page.
//   BASE_URL=http://localhost:3200/dev/sticky-nav node --test tests/sticky-nav.e2e.mjs
// The sandbox is a hero block (#photos) followed by tall #amenities, #reviews
// blocks and a deliberately short last block, #location.

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3200/dev/sticky-nav";
const BAR_HEIGHT = 67; // 66px row + 1px border

let browser;
let page;
let errors;

before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

async function freshPage(options = {}) {
  await page?.close();
  page = await browser.newPage({
    viewport: { width: 1192, height: 900 },
    ...options,
  });
  errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
}

// The confirmation toast also carries data-visible, so exclude it.
const bar = () => page.locator("[data-visible]:not([data-toast])");
const tab = (name) =>
  page.locator("nav[aria-label='Listing sections'] a", { hasText: name });
const scrollInstant = (y) =>
  page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
const pageTop = (id) =>
  page.evaluate(
    (i) => document.getElementById(i).getBoundingClientRect().top + scrollY,
    id,
  );
const heroBottom = () =>
  page.evaluate(() => {
    const r = document.getElementById("photos").getBoundingClientRect();
    return r.bottom + scrollY;
  });
const pastHero = async () => scrollInstant((await heroBottom()) + 5);
const activeTab = () =>
  page.evaluate(
    () =>
      document
        .querySelector("nav[aria-label='Listing sections'] [aria-current]")
        ?.textContent?.trim() ?? null,
  );
const settle = () => page.waitForTimeout(450); // bar transition is 250ms
const barTop = () => bar().evaluate((el) => el.getBoundingClientRect().top);

describe("visibility", () => {
  test("is hidden and unreachable at the top of the page", async () => {
    await freshPage();
    assert.equal(await bar().getAttribute("data-visible"), "false");
    assert.equal(await bar().evaluate((el) => el.inert), true);
    assert.equal(await barTop(), -BAR_HEIGHT);
    assert.equal(
      await bar().evaluate((el) => getComputedStyle(el).opacity),
      "0",
    );
    assert.equal(
      await bar().evaluate((el) => getComputedStyle(el).visibility),
      "hidden",
    );
    assert.equal(
      await page.getByRole("navigation", { name: "Listing sections" }).count(),
      0,
      "hidden nav is out of the accessibility tree",
    );
    assert.deepEqual(errors, []);
  });

  test("stays hidden while any of the hero is still on screen", async () => {
    await freshPage();
    await scrollInstant((await heroBottom()) - 40);
    await settle();
    assert.equal(await bar().getAttribute("data-visible"), "false");
  });

  test("slides in once the hero has scrolled out, and out again on the way back", async () => {
    await freshPage();
    await pastHero();
    await settle();
    assert.equal(await bar().getAttribute("data-visible"), "true");
    assert.equal(await barTop(), 0);
    assert.equal(
      await bar().evaluate((el) => getComputedStyle(el).opacity),
      "1",
    );
    assert.equal(await bar().evaluate((el) => el.offsetHeight), BAR_HEIGHT);
    assert.equal(
      await bar().evaluate((el) => getComputedStyle(el).position),
      "fixed",
    );
    await scrollInstant(0);
    await settle();
    assert.equal(await bar().getAttribute("data-visible"), "false");
  });

  test("slides with the reference's 0.25s ease and only leaves the a11y tree once it is gone", async () => {
    await freshPage();
    const timing = await bar().evaluate((el) => {
      const s = getComputedStyle(el);
      return [
        s.transitionProperty,
        s.transitionDuration,
        s.transitionTimingFunction,
      ];
    });
    assert.deepEqual(timing, [
      "translate, opacity, visibility",
      "0.25s",
      "ease",
    ]);
    await pastHero();
    await settle();
    await scrollInstant(0);
    await page.waitForTimeout(100);
    const mid = await bar().evaluate((el) => {
      const s = getComputedStyle(el);
      return { visibility: s.visibility, opacity: Number(s.opacity) };
    });
    assert.equal(
      mid.visibility,
      "visible",
      "still rendered while it slides out",
    );
    assert.ok(
      mid.opacity > 0 && mid.opacity < 1,
      `mid-transition opacity ${mid.opacity}`,
    );
    await settle();
    assert.equal(
      await bar().evaluate((el) => getComputedStyle(el).visibility),
      "hidden",
    );
  });

  test("content: price, rating, Reserve", async () => {
    await freshPage();
    await pastHero();
    await settle();
    const text = await bar().innerText();
    assert.match(text, /₹28,499 for 5 nights/);
    assert.match(text, /4\.95 · 19 reviews/);
    // A button (observed on the reference): it announces "You won't be
    // charged yet" instead of navigating.
    const reserve = page.getByRole("button", { name: "Reserve" });
    assert.equal(await reserve.evaluate((el) => el.offsetHeight), 40);
  });
});

describe("active tab (scroll spy)", () => {
  test("follows the scroll position, including a short last section", async () => {
    await freshPage();
    await pastHero();
    await settle();
    assert.equal(await activeTab(), "Photos");

    await scrollInstant((await pageTop("amenities")) - 100);
    await settle();
    assert.equal(await activeTab(), "Amenities");

    await scrollInstant((await pageTop("reviews")) - 100);
    await settle();
    assert.equal(await activeTab(), "Reviews");

    await scrollInstant(
      await page.evaluate(() => document.documentElement.scrollHeight),
    );
    await settle();
    // #location is 320px: its top can never reach the reading line here.
    assert.equal(await activeTab(), "Location");

    await scrollInstant((await pageTop("amenities")) + 10);
    await settle();
    assert.equal(await activeTab(), "Amenities");
  });

  test("the active tab carries a 2px #222 underline; hover turns the label black", async () => {
    await freshPage();
    await scrollInstant((await pageTop("amenities")) + 10);
    await settle();
    const underline = tab("Amenities").locator("span[aria-hidden]");
    assert.equal(await underline.count(), 1);
    const css = await underline.evaluate((el) => {
      const s = getComputedStyle(el);
      return { h: s.height, bg: s.backgroundColor };
    });
    assert.deepEqual(css, { h: "2px", bg: "rgb(34, 34, 34)" });
    assert.equal(await tab("Reviews").locator("span[aria-hidden]").count(), 0);
    await tab("Reviews").hover();
    assert.equal(
      await tab("Reviews").evaluate((el) => getComputedStyle(el).color),
      "rgb(0, 0, 0)",
    );
  });
});

// Observed on the live reference: a tab click is intercepted (the address never changes) and
// smooth-scrolls until the section's top edge is 80px below the top of the viewport.
/** Resolves once the scroll position has stopped moving. */
const scrollSettled = async () => {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const now = await page.evaluate(() => scrollY);
    if (Math.abs(now - last) < 0.5) return now;
    last = now;
    await page.waitForTimeout(150);
  }
  return last;
};

describe("tab click", () => {
  for (const [name, id] of [
    ["Photos", "photos"],
    ["Amenities", "amenities"],
    ["Reviews", "reviews"],
    ["Location", "location"],
  ]) {
    test(`clicking "${name}" smooth-scrolls to that section, 80px from the top, address untouched`, async () => {
      await freshPage();
      await scrollInstant(name === "Location" ? await pageTop("amenities") : (await pageTop("location")) + 200);
      await settle();
      const before = await page.evaluate(() => scrollY);
      const historyBefore = await page.evaluate(() => history.length);
      await tab(name).click();
      // Smooth: the first frames must not have jumped all the way.
      await page.waitForTimeout(60);
      const wanted = (await pageTop(id)) - 80;
      const early = await page.evaluate(() => scrollY);
      if (Math.abs(wanted - before) > 400) {
        assert.ok(Math.abs(early - wanted) > 10, "scroll animates rather than jumping");
      }
      const settled = await scrollSettled();
      assert.ok(Math.abs(settled - Math.min(wanted, await page.evaluate(() => document.documentElement.scrollHeight - innerHeight))) <= 1.5, `landed at ${settled}, wanted ${wanted}`);
      assert.equal(new URL(page.url()).hash, "", "no hash navigation");
      assert.equal(await page.evaluate(() => history.length), historyBefore);
    });
  }

  test("Enter on a tab scrolls the same way and focus stays on it", async () => {
    await freshPage();
    await pastHero();
    await settle();
    await tab("Amenities").focus();
    await page.keyboard.press("Enter");
    const settled = await scrollSettled();
    assert.ok(Math.abs(settled - ((await pageTop("amenities")) - 80)) <= 1.5);
    assert.equal(new URL(page.url()).hash, "");
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent?.trim()),
      "Amenities",
    );
  });

  test("the scrolled-to section's tab becomes the active one", async () => {
    await freshPage();
    await pastHero();
    await settle();
    await tab("Reviews").click();
    await scrollSettled();
    await page.waitForTimeout(200);
    assert.equal(await activeTab(), "Reviews");
  });
});

describe("keyboard", () => {
  test("the hidden bar is skipped by Tab", async () => {
    await freshPage();
    await page.keyboard.press("Tab");
    const inBar = await page.evaluate(
      () => !!document.activeElement?.closest("[data-visible]"),
    );
    assert.equal(inBar, false);
  });

  test("Tab walks the tabs, then Reserve", async () => {
    await freshPage();
    await pastHero();
    await settle();
    await tab("Photos").focus();
    const order = [];
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      order.push(
        await page.evaluate(() => document.activeElement?.textContent?.trim()),
      );
    }
    assert.deepEqual(order, ["Amenities", "Reviews", "Location", "Reserve"]);
  });

  test("the focused tab shows a visible focus ring", async () => {
    await freshPage();
    await pastHero();
    await settle();
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(
      () => getComputedStyle(document.activeElement).outlineStyle,
    );
    assert.equal(outline, "solid");
  });
});
