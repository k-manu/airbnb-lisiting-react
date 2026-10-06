// Accessibility audit: axe-core on the listing page and on each overlay (Photo Tour, Lightbox,
// amenities dialog). Every audit must report zero violations.

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");

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
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.addScriptTag({ path: axePath });
}

/** Runs axe and formats each violation as "rule: target" so a failure names what to fix. */
async function violations() {
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => globalThis.axe.run(document));
  return result.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(" | ")}`);
}

describe("axe-core", () => {
  test("the listing page has no violations", async () => {
    await freshPage();
    assert.deepEqual(await violations(), []);
  });

  test("the Photo Tour has no violations", async () => {
    await freshPage();
    await page.getByRole("button", { name: "Show all photos" }).click();
    await page.getByRole("dialog", { name: "Photo tour" }).waitFor();
    await page.waitForTimeout(400);
    assert.deepEqual(await violations(), []);
  });

  test("the Lightbox has no violations", async () => {
    await freshPage();
    await page.getByRole("button", { name: "Show all photos" }).click();
    const tour = page.getByRole("dialog", { name: "Photo tour" });
    await tour.waitFor();
    await tour.locator("section[data-room] button").first().click();
    await page.getByRole("dialog", { name: "Photo viewer" }).waitFor();
    await page.waitForTimeout(400);
    assert.deepEqual(await violations(), []);
  });

  test("the amenities dialog has no violations", async () => {
    await freshPage();
    await page.getByRole("button", { name: /Show all \d+ amenities/ }).click();
    await page.getByRole("dialog", { name: "What this place offers" }).waitFor();
    await page.waitForTimeout(400);
    assert.deepEqual(await violations(), []);
  });
});
