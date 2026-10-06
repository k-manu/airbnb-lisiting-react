// End-to-end tests for the top of the listing page: skip link, description
// toggle, booking form semantics and the sticky booking column.
// Run with: BASE_URL=http://localhost:3200 node --test tests/top.e2e.mjs

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const STICKY_TOP = 100; // --booking-sticky-top: 33px under the 67px sticky bar

let browser;
let page;

before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1192, height: 700 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
});
after(async () => {
  await browser?.close();
});

describe("skip link", () => {
  test("is the first tab stop, appears on focus and targets the title", async () => {
    await page.keyboard.press("Tab");
    const link = page.getByRole("link", { name: "Skip to content" });
    await link.waitFor();
    assert.equal(
      await link.evaluate((el) => el === document.activeElement),
      true,
    );
    assert.ok((await link.boundingBox()).x >= 0, "visible once focused");
    await page.keyboard.press("Enter");
    assert.equal(new URL(page.url()).hash, "#listing-title");
    assert.equal(await page.locator("#listing-title").count(), 1);
  });
});

describe("description", () => {
  test("collapses behind Show more and toggles with aria-expanded", async () => {
    // Several sections have a "Show more"; this one belongs to the description.
    const about = page.getByRole("region", { name: "About this place" });
    const button = about.getByRole("button", { name: "Show more" });
    assert.equal(await button.getAttribute("aria-expanded"), "false");
    const text = page.locator(`#${await button.getAttribute("aria-controls")}`);
    const collapsed = (await text.boundingBox()).height;

    await button.click();
    const less = about.getByRole("button", { name: "Show less" });
    assert.equal(await less.getAttribute("aria-expanded"), "true");
    assert.ok((await text.boundingBox()).height > collapsed + 24, "grows");

    await less.click();
    await about.getByRole("button", { name: "Show more" }).waitFor();
    assert.equal((await text.boundingBox()).height, collapsed);
  });
});

describe("booking column", () => {
  // The reference's fields are plain text, not form controls (observed live).
  test("the stay fields are display-only: no form, input or select", async () => {
    const card = page.locator("#booking");
    const text = await card.innerText();
    for (const expected of ["CHECK-IN", "10/18/2026", "CHECKOUT", "10/23/2026", "GUESTS", "2 guests"]) {
      assert.ok(text.includes(expected), `shows ${expected}`);
    }
    assert.equal(await card.locator("form, input, select, textarea").count(), 0);
    await card.getByText("2 guests").click();
    assert.equal(await card.innerText(), text, "clicking a field changes nothing");
  });

  test("sticks below the viewport top while the page scrolls", async () => {
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.waitForTimeout(150);
    const top = await page
      .getByRole("region", { name: "Offer", exact: true })
      .evaluate((el) => el.getBoundingClientRect().top);
    assert.equal(Math.round(top), STICKY_TOP);
  });
});
