// End-to-end tests for Share, Save and Reserve: the confirmation toast, the
// saved (red, filled) heart, and the Photo Tour bar, whose buttons are inert.
// Every expectation here was observed on the live reference.
// Run with: BASE_URL=http://localhost:3000 node --test tests/listing-actions.e2e.mjs

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1192, height: 900 };
const BRAND = "rgb(255, 56, 92)";
const INK = "rgb(34, 34, 34)";

let browser;
let context;
let page;

before(async () => {
  browser = await chromium.launch();
  context = await browser.newContext({
    viewport: VIEWPORT,
    permissions: ["clipboard-read", "clipboard-write"],
  });
});
after(async () => {
  await browser?.close();
});

async function freshPage() {
  await page?.close();
  page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
}

const toast = () => page.locator("[data-toast]");
const titleShare = () =>
  page.getByRole("button", { name: "Share", exact: true }).first();
/** The title-row Save button; its label flips between "Save" and "Saved". */
const titleSave = () =>
  page.getByRole("button", { name: /^Save(d)?$/ }).first();
const heart = (button) => button.locator("svg");
const heartLook = (button) =>
  heart(button).evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, fill: el.getAttribute("fill") };
  });
const toastVisible = () =>
  page.waitForFunction(
    () => document.querySelector("[data-toast]").dataset.visible === "true",
  );

/** Resolves once the toast has finished fading out and left the top layer. */
const toastGone = () =>
  page.waitForFunction(
    () => !document.querySelector("[data-toast]").matches(":popover-open"),
    null,
    { timeout: 6000 },
  );

describe("share", () => {
  test("announces 'Share options' and copies nothing", async () => {
    await freshPage();
    await page.evaluate(() => navigator.clipboard.writeText("untouched"));
    await titleShare().click();
    await toastVisible();
    assert.equal((await toast().textContent()).trim(), "Share options");
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      "untouched",
      "Share does not write to the clipboard",
    );
    // Screen readers get it through the polite live region (the page has
    // other status regions, e.g. the carousel's page counter).
    await page
      .getByRole("status")
      .filter({ hasText: "Share options" })
      .waitFor({ state: "attached" });
  });

  test("looks like the reference toast and leaves after a moment", async () => {
    await freshPage();
    await titleShare().click();
    await toastVisible();
    await page.waitForTimeout(350); // let the slide/fade finish
    const look = await toast().evaluate((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        background: cs.backgroundColor,
        color: cs.color,
        padding: cs.padding,
        radius: cs.borderRadius,
        font: `${cs.fontSize}/${cs.fontWeight}`,
        opacity: cs.opacity,
        bottomGap: Math.round(window.innerHeight - r.bottom),
        centreX: Math.round(r.left + r.width / 2),
        viewportCentre: Math.round(window.innerWidth / 2),
      };
    });
    // Values read from the reference stylesheet.
    assert.equal(look.background, INK);
    assert.equal(look.color, "rgb(255, 255, 255)");
    assert.equal(look.padding, "14px 22px");
    assert.equal(look.radius, "8px");
    assert.equal(look.font, "14px/500");
    assert.equal(look.opacity, "1");
    assert.equal(look.bottomGap, 32);
    assert.ok(Math.abs(look.centreX - look.viewportCentre) <= 1, "centred");

    await toastGone();
  });
});

describe("save", () => {
  test("toggles the wishlist: filled red heart and 'Saved', then back, with a toast each time", async () => {
    await freshPage();
    const save = titleSave();
    assert.equal(await save.getAttribute("aria-pressed"), "false");
    assert.equal((await save.textContent()).trim(), "Save");
    assert.deepEqual(await heartLook(save), { color: INK, fill: "none" });

    await save.click();
    assert.equal(await save.getAttribute("aria-pressed"), "true");
    assert.equal((await save.textContent()).trim(), "Saved");
    assert.deepEqual(await heartLook(save), { color: BRAND, fill: "currentColor" });
    await toastVisible();
    assert.equal((await toast().textContent()).trim(), "Saved to wishlist");

    await save.click();
    assert.equal(await save.getAttribute("aria-pressed"), "false");
    assert.equal((await save.textContent()).trim(), "Save");
    assert.deepEqual(await heartLook(save), { color: INK, fill: "none" });
    assert.equal((await toast().textContent()).trim(), "Removed from wishlist");
  });

  test("is keyboard operable", async () => {
    await freshPage();
    const save = titleSave();
    await save.focus();
    await page.keyboard.press("Enter");
    assert.equal(await save.getAttribute("aria-pressed"), "true");
    await page.keyboard.press("Space");
    assert.equal(await save.getAttribute("aria-pressed"), "false");
  });
});

describe("reserve", () => {
  test("the booking card's Reserve says nothing is charged yet", async () => {
    await freshPage();
    await page
      .locator("#booking")
      .getByRole("button", { name: "Reserve" })
      .click();
    await toastVisible();
    assert.equal(
      (await toast().textContent()).trim(),
      "You won't be charged yet",
    );
  });

  test("the sticky bar's Reserve does the same", async () => {
    await freshPage();
    await page.mouse.wheel(0, 1200);
    const bar = page.getByRole("navigation", { name: "Listing sections" });
    await bar.waitFor({ state: "visible" });
    await page.waitForTimeout(400); // slide-in
    await page
      .getByRole("button", { name: "Reserve" })
      .first()
      .click();
    await toastVisible();
    assert.equal(
      (await toast().textContent()).trim(),
      "You won't be charged yet",
    );
  });
});

describe("in the Photo Tour", () => {
  test("the bar's Share and Save do nothing: no toast, no saved state", async () => {
    await freshPage();
    await page.getByRole("button", { name: "Show all photos" }).click();
    const tour = page.getByRole("dialog", { name: "Photo tour" });
    await tour.waitFor();

    await tour.getByRole("button", { name: "Save" }).click();
    await tour.getByRole("button", { name: "Share" }).click();
    await page.waitForTimeout(400);
    assert.equal(
      await toast().evaluate((el) => el.matches(":popover-open")),
      false,
      "no toast",
    );
    assert.equal(
      await tour.getByRole("button", { name: "Save" }).getAttribute("aria-pressed"),
      null,
      "no pressed state",
    );
    await page.keyboard.press("Escape");
    await tour.waitFor({ state: "detached" });
    assert.equal((await titleSave().textContent()).trim(), "Save");
  });
});
