// End-to-end tests for "What this place offers" and its full-list dialog.
// Run against the sandbox route:
//   BASE_URL=http://localhost:3200/dev/amenities node --test tests/amenities.e2e.mjs

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const TOTAL = 50;
const HIGHLIGHT_COUNT = 10;
// The reference dialog lists 44 items although its button says 50; we mirror it.
const LISTED_COUNT = 44;
const GROUPS = [
  "Bathroom",
  "Bedroom and laundry",
  "Entertainment",
  "Family",
  "Heating and cooling",
  "Home safety",
  "Internet and office",
  "Kitchen and dining",
  "Location features",
  "Outdoor",
  "Parking and facilities",
  "Services",
];
const UNAVAILABLE = ["Carbon monoxide alarm", "Smoke alarm"];

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

const opener = () =>
  page.getByRole("button", { name: `Show all ${TOTAL} amenities` });
const dialog = () =>
  page.getByRole("dialog", { name: "What this place offers" });
const closed = () => dialog().waitFor({ state: "detached" });
const inDialog = () =>
  page.evaluate(() => !!document.activeElement?.closest("dialog"));

async function openDialog() {
  await opener().focus();
  await page.keyboard.press("Enter");
  await dialog().waitFor();
}

describe("page list", () => {
  test("shows the ten highlights, the struck-through ones flagged, no console errors", async () => {
    const errors = await freshPage();
    const list = page
      .getByRole("region", { name: "What this place offers" })
      .getByRole("listitem");
    assert.equal(await list.count(), HIGHLIGHT_COUNT);
    for (const label of UNAVAILABLE) {
      const row = list.filter({ hasText: label });
      assert.match(await row.textContent(), /Unavailable:/);
      assert.equal(
        await row.locator("span.line-through").count(),
        1,
        `${label} is struck through`,
      );
    }
    assert.deepEqual(errors, []);
  });

  test("the sleeping cards are not interactive", async () => {
    await freshPage();
    const sleeping = page.getByRole("region", { name: "Where you'll sleep" });
    assert.equal(await sleeping.getByRole("listitem").count(), 2);
    assert.equal(await sleeping.locator("button, a, [tabindex]").count(), 0);
  });
});

describe("full list dialog", () => {
  test("opens from the button and moves focus inside", async () => {
    await freshPage();
    assert.equal(await page.locator("dialog[open]").count(), 0);
    await opener().click();
    await dialog().waitFor();
    assert.ok(await inDialog(), "focus is inside the dialog");
    assert.equal(
      await dialog().getByRole("heading", { level: 2 }).textContent(),
      "What this place offers",
    );
  });

  test("lists every group and every captured item", async () => {
    await freshPage();
    await openDialog();
    const headings = await dialog()
      .getByRole("heading", { level: 3 })
      .allTextContents();
    assert.deepEqual(headings, GROUPS);
    assert.equal(await dialog().getByRole("listitem").count(), LISTED_COUNT);
    for (const label of UNAVAILABLE) {
      assert.match(
        await dialog()
          .getByRole("listitem")
          .filter({ hasText: label })
          .textContent(),
        /Unavailable:/,
      );
    }
  });

  test("Escape closes it and focus returns to the button", async () => {
    await freshPage();
    await openDialog();
    await page.keyboard.press("Escape");
    await closed();
    assert.ok(await opener().evaluate((el) => el === document.activeElement));
  });

  test("the close button closes it and returns focus", async () => {
    await freshPage();
    await opener().click();
    await dialog().waitFor();
    await dialog().getByRole("button", { name: "Close" }).click();
    await closed();
    assert.ok(await opener().evaluate((el) => el === document.activeElement));
  });

  test("clicking the dim area outside the panel closes it", async () => {
    await freshPage();
    await openDialog();
    await page.mouse.click(10, 10);
    await closed();
  });

  test("Tab and Shift+Tab never leave the dialog", async () => {
    await freshPage();
    await openDialog();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      assert.ok(await inDialog(), `left the dialog after ${i + 1} Tab presses`);
    }
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Shift+Tab");
      assert.ok(await inDialog(), `left the dialog after Shift+Tab ${i + 1}`);
    }
  });

  test("the page behind does not scroll while it is open, and can again after", async () => {
    await freshPage();
    await openDialog();
    assert.equal(
      await page.evaluate(() => document.body.style.overflow),
      "hidden",
    );
    await page.keyboard.press("Escape");
    await closed();
    assert.notEqual(
      await page.evaluate(() => document.body.style.overflow),
      "hidden",
    );
  });
});
