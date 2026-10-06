// End-to-end tests for the availability calendar section.
// Run against the sandbox route:
//   BASE_URL=http://localhost:3200/dev/calendar node --test tests/calendar.e2e.mjs
//
// The reference calendar is display-only (observed live): 18 - 23 Oct 2026 is
// shown as the stay, 18-24 and 29-30 November are struck through, and clicking
// days, "Clear dates" or the month arrows changes nothing.

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

let browser;
let page;

before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

async function freshPage() {
  await page?.close();
  page = await browser.newPage({ viewport: { width: 1192, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  return errors;
}

const cells = () => page.locator('[role="cell"][aria-label]');
const cellByLabel = (label) => page.locator(`[role="cell"][aria-label="${label}"]`);
const heading = () => page.getByRole("heading", { level: 2 });
const subtitle = () => page.locator("h2 + p");
const monthTitles = () =>
  page
    .locator('[role="table"]')
    .evaluateAll((tables) =>
      tables.map(
        (table) =>
          document.getElementById(table.getAttribute("aria-labelledby"))
            .textContent,
      ),
    );
/** Everything a click could plausibly change, in one comparable value. */
const snapshot = () =>
  page.evaluate(() => document.querySelector("section").innerText);

describe("content", () => {
  test("shows the stay from the listing data and no console errors", async () => {
    const errors = await freshPage();
    assert.equal(await heading().textContent(), "5 nights in Candolim");
    assert.equal(await subtitle().textContent(), "18 Oct 2026 - 23 Oct 2026");
    assert.deepEqual(await monthTitles(), ["October 2026", "November 2026"]);
    assert.equal(await cells().count(), 61);
    assert.deepEqual(errors, []);
  });

  test("months are tables with weekday headers and spoken dates", async () => {
    await freshPage();
    assert.equal(await page.getByRole("table").count(), 2);
    assert.equal(await page.getByRole("columnheader").count(), 14);
    await cellByLabel("Sunday, 18 October 2026, selected check-in date").waitFor();
    await cellByLabel("Friday, 23 October 2026, selected check-out date").waitFor();
  });

  test("the range ends are filled circles and the days between are banded", async () => {
    await freshPage();
    const info = await page.evaluate(() => {
      const cell = (d) =>
        [...document.querySelectorAll('[role="cell"][aria-label]')].find((c) =>
          c.getAttribute("aria-label").startsWith(d),
        );
      const fill = (c) =>
        getComputedStyle(c.lastElementChild).backgroundColor;
      const band = (c) => c.querySelector("span[aria-hidden]") !== null;
      return {
        edgeIn: fill(cell("Sunday, 18 October")),
        edgeOut: fill(cell("Friday, 23 October")),
        between: [band(cell("Monday, 19 October")), band(cell("Thursday, 22 October"))],
        outside: [band(cell("Saturday, 17 October")), band(cell("Saturday, 24 October"))],
        plain: fill(cell("Monday, 19 October")),
      };
    });
    assert.equal(info.edgeIn, info.edgeOut);
    assert.notEqual(info.edgeIn, info.plain);
    assert.deepEqual(info.between, [true, true]);
    assert.deepEqual(info.outside, [false, false]);
  });

  test("unavailable days are announced and struck through", async () => {
    await freshPage();
    const blocked = page.locator('[role="cell"][aria-label$="unavailable"]');
    // 18-24 November (7 days) and 29-30 November (2 days).
    assert.equal(await blocked.count(), 9);
    assert.equal(
      await blocked.first().evaluate((c) => getComputedStyle(c.lastElementChild).textDecorationLine),
      "line-through",
    );
    assert.equal(await cellByLabel("Saturday, 17 October 2026").count(), 1);
  });
});

describe("display-only", () => {
  test("clicking a day changes nothing", async () => {
    await freshPage();
    const before = await snapshot();
    await cellByLabel("Sunday, 25 October 2026").click();
    await cellByLabel("Wednesday, 28 October 2026").click();
    await cellByLabel("Sunday, 18 October 2026, selected check-in date").click();
    assert.equal(await snapshot(), before);
    assert.equal(await heading().textContent(), "5 nights in Candolim");
    await cellByLabel("Friday, 23 October 2026, selected check-out date").waitFor();
  });

  test("Clear dates changes nothing", async () => {
    await freshPage();
    await page.getByRole("button", { name: "Clear dates" }).click();
    assert.equal(await heading().textContent(), "5 nights in Candolim");
    assert.equal(await subtitle().textContent(), "18 Oct 2026 - 23 Oct 2026");
    await cellByLabel("Sunday, 18 October 2026, selected check-in date").waitFor();
  });

  test("the month arrows are present but do not page", async () => {
    await freshPage();
    await page.getByRole("button", { name: "Next month" }).click();
    await page.getByRole("button", { name: "Previous month" }).click({ force: true });
    assert.deepEqual(await monthTitles(), ["October 2026", "November 2026"]);
  });

  test("the keyboard glyph is decoration: no button, no dialog", async () => {
    await freshPage();
    assert.equal(
      await page.getByRole("button", { name: /keyboard/i }).count(),
      0,
    );
    assert.equal(await page.getByRole("dialog").count(), 0);
  });

  test("keyboard reaches only the arrows and Clear dates, never the days", async () => {
    await freshPage();
    const stops = await page.evaluate(() =>
      [...document.querySelectorAll("section button, section [tabindex]")].map(
        (el) => el.getAttribute("aria-label") ?? el.textContent.trim(),
      ),
    );
    assert.deepEqual(stops, ["Previous month", "Next month", "Clear dates"]);
  });
});
