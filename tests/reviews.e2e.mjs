// End-to-end tests for the reviews section (sandbox route, desktop viewport).
// Run: BASE_URL=http://localhost:3200/dev/reviews node --test tests/reviews.e2e.mjs

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3200/dev/reviews";
const REVIEW_COUNT = 6;
const TAG_COUNT = 10;
const CATEGORY_COUNT = 6;

let browser;
let page;
let errors;

before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

async function freshPage() {
  await page?.close();
  page = await browser.newPage({ viewport: { width: 1192, height: 900 } });
  errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
}

const section = () => page.locator("section#reviews");
const chipRow = () =>
  section().getByRole("list", { name: "Topics guests mention" });
// Vedant's review is long enough to be cut off at four lines.
const clampedCard = () => section().locator("article", { hasText: "Vedant" });
const isClamped = (locator) =>
  locator.evaluate((el) => el.scrollHeight > el.clientHeight + 1);

describe("structure", () => {
  test("is a labelled region with one heading and no console errors", async () => {
    await freshPage();
    const region = page.getByRole("region", { name: "Guest favourite" });
    assert.equal(await region.count(), 1);
    assert.equal(await section().getByRole("heading", { level: 2 }).count(), 1);
    assert.deepEqual(errors, []);
  });

  test("exposes the score, breakdown categories and six review cards", async () => {
    await freshPage();
    await section()
      .getByText("Rated 4.95 out of 5")
      .waitFor({ state: "attached" });
    // "Overall rating" plus the six category columns.
    assert.equal(
      await section()
        .getByRole("heading", { level: 3 })
        .filter({
          hasText:
            /rating|Cleanliness|Accuracy|Check-in|Communication|Location|Value/,
        })
        .count(),
      CATEGORY_COUNT + 1,
    );
    assert.equal(await section().locator("article").count(), REVIEW_COUNT);
    assert.equal(
      await section()
        .getByRole("button", { name: "Show all 19 reviews" })
        .count(),
      1,
    );
  });
});

describe("show more / show less", () => {
  test("long reviews offer a collapsed toggle and are cut off at four lines", async () => {
    await freshPage();
    const toggles = section().getByRole("button", { name: "Show more" });
    assert.equal(await toggles.count(), 2);
    for (const toggle of await toggles.all()) {
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    }
    const body = clampedCard().locator("p").last();
    assert.ok(await isClamped(body), "review text is clamped");
    const lineHeight = await body.evaluate((el) =>
      parseFloat(getComputedStyle(el).lineHeight),
    );
    assert.ok((await body.boundingBox()).height <= 4 * lineHeight + 1);
  });

  test("short reviews have no toggle", async () => {
    await freshPage();
    const shortCard = section().locator("article", {
      hasText: "Great place. Exactly as described",
    });
    assert.equal(await shortCard.getByRole("button").count(), 0);
  });

  test("Show more expands, Show less clamps again, and only that card changes", async () => {
    await freshPage();
    const card = clampedCard();
    const toggle = card.getByRole("button", { name: "Show more" });
    const body = card.locator("p").last();
    const before = await card.boundingBox();

    await toggle.click();
    const less = card.getByRole("button", { name: "Show less" });
    assert.equal(await less.getAttribute("aria-expanded"), "true");
    assert.equal(await isClamped(body), false);
    assert.ok((await card.boundingBox()).height > before.height);
    assert.equal(
      await section().getByRole("button", { name: "Show more" }).count(),
      1,
    );

    await less.click();
    assert.ok(await isClamped(body));
    assert.equal(
      await section().getByRole("button", { name: "Show more" }).count(),
      2,
    );
  });

  test("the toggle works from the keyboard and keeps focus", async () => {
    await freshPage();
    const toggle = clampedCard().getByRole("button", { name: "Show more" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    const less = clampedCard().getByRole("button", { name: "Show less" });
    assert.ok(await less.evaluate((el) => el === document.activeElement));
    await page.keyboard.press("Space");
    assert.equal(
      await clampedCard()
        .getByRole("button", { name: "Show more" })
        .getAttribute("aria-expanded"),
      "false",
    );
  });
});

describe("topic chips", () => {
  test("ten chips with accessible names in a horizontally scrolling row", async () => {
    await freshPage();
    const chips = chipRow().getByRole("button");
    assert.equal(await chips.count(), TAG_COUNT);
    assert.match(
      await chips.first().getAttribute("aria-label"),
      /^Comfort, mentioned in 6 reviews$/,
    );
    const { overflowing, scrollbarWidth } = await chipRow().evaluate((el) => ({
      overflowing: el.scrollWidth > el.clientWidth,
      scrollbarWidth: el.offsetHeight - el.clientHeight,
    }));
    assert.ok(overflowing, "row overflows sideways");
    assert.equal(scrollbarWidth, 0, "scrollbar is hidden");
  });

  test("tabbing to an off-screen chip scrolls it into view", async () => {
    await freshPage();
    const last = chipRow().getByRole("button").last();
    await last.focus();
    const visible = await last.evaluate((el) => {
      const chip = el.getBoundingClientRect();
      const row = el.closest("ul").getBoundingClientRect();
      return chip.left >= row.left - 1 && chip.right <= row.right + 1;
    });
    assert.ok(visible, "focused chip is fully inside the row");
    assert.ok(await chipRow().evaluate((el) => el.scrollLeft > 0));
  });

  test("scrolling the row does not scroll the page sideways", async () => {
    await freshPage();
    await chipRow().evaluate((el) => (el.scrollLeft = 400));
    assert.equal(await page.evaluate(() => scrollX), 0);
  });
});
