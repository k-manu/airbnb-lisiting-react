// End-to-end tests for "Things to know" and "More stays nearby" (sandbox route).
// Run: BASE_URL=http://localhost:3200/dev/know-nearby node --test tests/know-nearby.e2e.mjs

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL =
  process.env.BASE_URL ?? "http://localhost:3200/dev/know-nearby";
const CARDS_PER_PAGE = 5;
const CARD_COUNT = 8;

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

const carousel = () => page.getByRole("group", { name: "Nearby stays" });
const track = () => carousel().getByRole("list");
const prev = () => carousel().getByRole("button", { name: "Previous stays" });
const next = () => carousel().getByRole("button", { name: "Next stays" });
const pager = (text) => carousel().getByText(text, { exact: true });
const settled = () =>
  track().evaluate(
    (el) =>
      new Promise((resolve) => {
        let last = -1;
        const tick = () => {
          if (el.scrollLeft === last) return resolve(el.scrollLeft);
          last = el.scrollLeft;
          setTimeout(tick, 120);
        };
        tick();
      }),
  );
const maxScroll = () =>
  track().evaluate((el) => el.scrollWidth - el.clientWidth);
const focusedName = () =>
  page.evaluate(() => document.activeElement?.getAttribute("aria-label"));

describe("things to know", () => {
  test("three labelled groups with their own learn-more links", async () => {
    await freshPage();
    const region = page.getByRole("region", { name: "Things to know" });
    assert.equal(await region.count(), 1);
    for (const name of [
      "Cancellation policy",
      "House rules",
      "Safety & property",
    ]) {
      const group = region.getByRole("group", { name });
      assert.equal(await group.count(), 1, name);
      assert.equal(await group.getByRole("heading", { level: 3 }).count(), 1);
      assert.equal(await group.getByRole("link").count(), 1);
    }
    const linkNames = await region
      .getByRole("link")
      .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
    assert.equal(
      new Set(linkNames).size,
      3,
      "the three identical links have distinct names",
    );
    assert.deepEqual(errors, []);
  });

  test("columns sit side by side on the desktop grid", async () => {
    await freshPage();
    const xs = await page
      .getByRole("region", { name: "Things to know" })
      .getByRole("group")
      .evaluateAll((els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().x)),
      );
    assert.deepEqual(xs, [80, 435, 789]);
  });
});

describe("more stays nearby - initial state", () => {
  test("shows five of eight cards, pager 1 / 2, previous disabled", async () => {
    await freshPage();
    assert.equal(
      await page.getByRole("region", { name: "More stays nearby" }).count(),
      1,
    );
    assert.equal(await track().getByRole("listitem").count(), CARD_COUNT);
    await pager("1 / 2").waitFor();
    assert.equal(await prev().isDisabled(), true);
    assert.equal(await next().isDisabled(), false);
    const inView = await track().evaluate((el) => {
      const box = el.getBoundingClientRect();
      return [...el.children].filter((c) => {
        const r = c.getBoundingClientRect();
        return r.left >= box.left - 1 && r.right <= box.right + 1;
      }).length;
    });
    assert.equal(inView, CARDS_PER_PAGE);
  });

  test("cards show title, rupee price with Indian grouping and rating", async () => {
    await freshPage();
    const card = track().getByRole("listitem").nth(2);
    assert.equal(await card.getByRole("link").count(), 0, "cards are display-only");
    const text = await card.innerText();
    assert.match(text, /Greentique Luxury Flat/);
    assert.match(text, /₹44,506/);
    assert.match(text, /4\.94/);
    assert.deepEqual(errors, []);
  });
});

describe("more stays nearby - paging", () => {
  test("Next moves to page 2 and flips the disabled states", async () => {
    await freshPage();
    await next().click();
    await pager("2 / 2").waitFor();
    assert.equal(await settled(), await maxScroll());
    assert.equal(await next().isDisabled(), true);
    assert.equal(await prev().isDisabled(), false);
    // Page 2 ends flush with the last card.
    const lastFlush = await track().evaluate((el) => {
      const last = el.lastElementChild.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(el).paddingRight);
      return Math.abs(last.right - (el.getBoundingClientRect().right - pad));
    });
    assert.ok(lastFlush < 1.5, `last card flush (${lastFlush}px off)`);
  });

  test("Previous returns to page 1", async () => {
    await freshPage();
    await next().click();
    await pager("2 / 2").waitFor();
    await prev().click();
    await pager("1 / 2").waitFor();
    assert.equal(await settled(), 0);
    assert.equal(await prev().isDisabled(), true);
  });

  test("scrolling the track by hand updates the pager", async () => {
    await freshPage();
    await track().evaluate((el) =>
      el.scrollTo({ left: el.scrollWidth, behavior: "instant" }),
    );
    await pager("2 / 2").waitFor();
    assert.equal(await next().isDisabled(), true);
  });

  test("the live region announces the page", async () => {
    await freshPage();
    await next().click();
    await carousel()
      .getByRole("status")
      .filter({ hasText: "Page 2 of 2" })
      .waitFor({ state: "attached" });
  });
});

describe("more stays nearby - keyboard", () => {
  test("Enter and Space on the pager buttons page the carousel", async () => {
    await freshPage();
    await next().focus();
    await page.keyboard.press("Enter");
    await pager("2 / 2").waitFor();
    // The pressed button is now disabled, so focus must move to its partner.
    assert.equal(await focusedName(), "Previous stays");
    await page.keyboard.press("Space");
    await pager("1 / 2").waitFor();
    assert.equal(await focusedName(), "Next stays");
  });

  test("Tab skips the disabled Previous, goes to Next, then past the cards", async () => {
    await freshPage();
    await prev().evaluate((el) => el.blur());
    await page.locator("#nearby-heading").evaluate((el) => {
      el.tabIndex = -1;
      el.focus();
    });
    await page.keyboard.press("Tab");
    assert.equal(await focusedName(), "Next stays"); // previous is disabled
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement?.closest("li") !== null),
      false,
      "no card is a tab stop",
    );
  });

  test("every card shows its photo, including the two that reuse the second and fourth", async () => {
    await freshPage();
    await track().evaluate((ul) => ul.querySelectorAll("img").forEach((i) => i.scrollIntoView({ inline: "center" })));
    await page.waitForTimeout(600);
    const loaded = await track().evaluate((ul) =>
      [...ul.querySelectorAll("img")].map((i) => [i.getAttribute("src"), i.complete && i.naturalWidth > 0]),
    );
    assert.equal(loaded.length, CARD_COUNT);
    assert.deepEqual(loaded.filter(([, ok]) => !ok), []);
    assert.deepEqual(
      loaded.map(([src]) => src.match(/s(\d)\.jpeg/)[1]),
      ["1", "2", "3", "4", "5", "6", "2", "4"],
    );
  });

  test("clicking a card does nothing: no scroll, no address change, no outline", async () => {
    await freshPage();
    const card = track().getByRole("listitem").nth(1);
    await card.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => [scrollY, location.href, history.length]);
    await card.click();
    await page.waitForTimeout(500);
    assert.deepEqual(await page.evaluate(() => [scrollY, location.href, history.length]), before);
    assert.equal(await card.evaluate((el) => getComputedStyle(el.firstElementChild).outlineStyle), "none");
    assert.equal(await card.evaluate((el) => getComputedStyle(el).cursor), "auto");
  });

});
