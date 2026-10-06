// End-to-end tests for the gallery module, one describe block per layer.
// Run with: npm test   (builds must exist; scripts/with-server.mjs serves them)
//
// Layers are tested bottom-up so a failure points at the lowest broken layer:
//   1. Lightbox (opened from a Photo Tour photo: the hero grid opens the tour)
//   2. Photo Tour, and the Lightbox stacked on top of it
// Expectations were observed on the live reference.

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const PHOTO_COUNT = 43;
const ROOM_COUNT = 9;
const TOUR_URL = `${BASE_URL}/?modal=PHOTO_TOUR_SCROLLABLE`;

let browser;
let page;

before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

async function freshPage(url = BASE_URL) {
  await page?.close();
  page = await browser.newPage({ viewport: { width: 1192, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(url, { waitUntil: "networkidle" });
  return errors;
}

const openDialogs = () => page.locator("dialog[open]").count();
const dialog = (name) => page.getByRole("dialog", { name });
const gone = (name) => dialog(name).waitFor({ state: "detached" });
const gridPhotos = () => page.locator('section[aria-label="Photos"] > button');
const counter = (n) => page.getByText(`${n} of ${PHOTO_COUNT}`);
const itemParam = () => new URL(page.url()).searchParams.get("modalItem");
const historyLength = () => page.evaluate(() => history.length);
/** Opens the Photo Tour and then the Lightbox at the n-th photo (1-based), as a visitor does. */
async function openViewer(n) {
  await page.getByRole("button", { name: "Show all photos" }).click();
  const tour = dialog("Photo tour");
  await tour.waitFor();
  const photo = tour.locator("section[data-room] button").nth(n - 1);
  await photo.focus();
  await page.keyboard.press("Enter");
  await dialog("Photo viewer").waitFor();
  return { tour, photo };
}
const modalParam = () => new URL(page.url()).searchParams.get("modal");
const focusedLabel = () =>
  page.evaluate(
    () =>
      document.activeElement?.getAttribute("aria-label") ??
      document.activeElement?.textContent?.trim().slice(0, 40),
  );

describe("hero", () => {
  test("renders the title, the five-photo grid and no console errors", async () => {
    const errors = await freshPage();
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await gridPhotos().count(), 6); // 5 photos + "Show all photos"
    assert.deepEqual(errors, []);
  });

  test("a hero photo opens the Photo Tour at the start of its own room", async () => {
    await freshPage();
    await gridPhotos().first().click();
    const tour = dialog("Photo tour");
    await tour.waitFor();
    assert.equal(await openDialogs(), 1, "the tour, not the viewer");
    // The first hero photo belongs to "Living room 2".
    await page.waitForFunction(() => {
      const scroller = document.querySelector("dialog[open] .overflow-y-auto");
      const section = document.querySelector(
        'dialog[open] section[data-room="living-room-2"]',
      );
      return (
        Math.abs(
          section.getBoundingClientRect().top -
            scroller.getBoundingClientRect().top,
        ) < 30
      );
    });
  });
});

describe("layer 1 - lightbox", () => {
  test("opens at the photo's place in the full set, with room name, 'N of 43' and the URL id", async () => {
    await freshPage();
    await openViewer(7);
    assert.ok(await counter(7).isVisible());
    assert.ok(
      await dialog("Photo viewer").getByText("Living room 2").isVisible(),
      "shows the room name",
    );
    assert.equal(itemParam(), "1006", "photo ids run from 1000 in tour order");
    assert.equal(modalParam(), "PHOTO_TOUR_SCROLLABLE");
  });

  test("arrows and keys step through and stop at both ends, rewriting the URL id in place", async () => {
    await freshPage();
    await openViewer(1);
    const prev = page.getByRole("button", { name: "Previous photo" });
    const next = page.getByRole("button", { name: "Next photo" });
    assert.ok(await prev.isDisabled(), "Previous is disabled on the first photo");

    const before = await historyLength();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    assert.ok(await counter(3).isVisible());
    assert.equal(itemParam(), "1002");
    assert.equal(await historyLength(), before, "stepping does not add history entries");

    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowLeft");
    assert.ok(await counter(1).isVisible(), "stops on the first photo");
    assert.equal(itemParam(), "1000");

    for (let i = 0; i < PHOTO_COUNT + 5; i++)
      await page.keyboard.press("ArrowRight");
    assert.ok(await counter(PHOTO_COUNT).isVisible(), "stops on the last photo");
    assert.equal(itemParam(), "1042");
    assert.ok(await next.isDisabled(), "Next is disabled on the last photo");
    await prev.click();
    assert.ok(await counter(PHOTO_COUNT - 1).isVisible());
  });

  test("traps focus, closes on Escape back to the tour, and returns focus to the photo", async () => {
    await freshPage();
    const { photo } = await openViewer(4);
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      assert.ok(
        await page.evaluate(() => !!document.activeElement?.closest("dialog")),
        `focus left the dialog after ${i + 1} Tab presses`,
      );
    }
    await page.keyboard.press("Escape");
    await gone("Photo viewer");
    assert.equal(await openDialogs(), 1, "the tour stays open");
    assert.equal(itemParam(), null, "the photo id leaves the URL");
    assert.equal(modalParam(), "PHOTO_TOUR_SCROLLABLE");
    assert.ok(
      await photo.evaluate((e) => e === document.activeElement),
      "focus returned to the tour photo",
    );
  });

  test("the close button and the browser Back button close only the viewer", async () => {
    await freshPage();
    await openViewer(2);
    await dialog("Photo viewer").getByRole("button", { name: "Close" }).click();
    await gone("Photo viewer");
    assert.equal(await openDialogs(), 1);
    assert.equal(itemParam(), null);

    const photo = dialog("Photo tour").locator("section[data-room] button").nth(1);
    await photo.click();
    await dialog("Photo viewer").waitFor();
    await page.goBack();
    await gone("Photo viewer");
    assert.equal(await openDialogs(), 1, "Back peels only the viewer");
    assert.equal(itemParam(), null);
  });

  test("fades in: transparent at the first frame, opaque once open", async () => {
    await freshPage();
    await openViewer(1);
    await page.waitForFunction(
      () =>
        getComputedStyle(
          [...document.querySelectorAll("dialog[open]")].at(-1),
        ).opacity === "1",
    );
    assert.equal(await dialog("Photo viewer").getAttribute("data-open"), "true");
  });

  test("its grid button returns to the Photo Tour", async () => {
    await freshPage();
    await openViewer(5);
    await page.getByRole("button", { name: "Show all photos" }).last().click();
    await gone("Photo viewer");
    await dialog("Photo tour").waitFor();
    assert.equal(await openDialogs(), 1);
    assert.equal(itemParam(), null);
  });

  test("a photo id in the address deep-links straight into the viewer", async () => {
    await freshPage(`${TOUR_URL}&modalItem=1005`);
    await dialog("Photo viewer").waitFor();
    assert.ok(await counter(6).isVisible());
    assert.equal(await openDialogs(), 2, "the tour is open underneath");
    await page.keyboard.press("Escape");
    await gone("Photo viewer");
    await dialog("Photo tour").waitFor();
  });
});

describe("layer 2 - photo tour", () => {
  test("opens with a category per room, a section per room, and the URL flag", async () => {
    await freshPage();
    const showAll = page.getByRole("button", { name: "Show all photos" });
    await showAll.focus();
    await page.keyboard.press("Enter");
    const tour = dialog("Photo tour");
    await tour.waitFor();

    assert.equal(
      await tour.locator('nav[aria-label="Photo categories"] button').count(),
      ROOM_COUNT,
    );
    assert.equal(await tour.locator("section[data-room]").count(), ROOM_COUNT);
    assert.equal(
      await tour.locator("section[data-room] button").count(),
      PHOTO_COUNT,
    );
    assert.equal(modalParam(), "PHOTO_TOUR_SCROLLABLE");
    assert.ok(await tour.getByRole("button", { name: "Back" }).isVisible());

    await page.keyboard.press("Escape");
    await gone("Photo tour");
    assert.equal(modalParam(), null, "URL flag is removed on close");
    assert.ok(
      await showAll.evaluate((e) => e === document.activeElement),
      "focus returned to Show all photos",
    );
  });

  test("photos are laid out in the alternating one/two rows", async () => {
    await freshPage(TOUR_URL);
    const tour = dialog("Photo tour");
    await tour.waitFor();
    const rowsOf = (room) =>
      tour
        .locator(`section[data-room="${room}"] > div:last-child > div`)
        .evaluateAll((rows) => rows.map((r) => r.children.length));
    assert.deepEqual(await rowsOf("living-room-1"), [1, 2]);
    assert.deepEqual(await rowsOf("living-room-2"), [1, 2, 1, 2, 1]);
    assert.deepEqual(await rowsOf("full-kitchen"), [2]);
    assert.deepEqual(await rowsOf("gym"), [1, 2, 2]);
    assert.deepEqual(await rowsOf("additional-photos"), [1, 2, 1, 2, 1, 2, 1]);
  });

  test("a category button scrolls its room to the top", async () => {
    await freshPage(TOUR_URL);
    const tour = dialog("Photo tour");
    await tour.waitFor();
    await tour
      .locator('nav[aria-label="Photo categories"]')
      .getByRole("button", { name: "Additional photos" })
      .click();
    await page.waitForFunction(() => {
      const scroller = document.querySelector("dialog[open] .overflow-y-auto");
      const section = document.querySelector(
        'dialog[open] section[data-room="additional-photos"]',
      );
      return (
        Math.abs(
          section.getBoundingClientRect().top -
            scroller.getBoundingClientRect().top,
        ) < 30
      );
    });
  });

  test("the Back button and the browser Back button close the tour", async () => {
    await freshPage();
    await page.getByRole("button", { name: "Show all photos" }).click();
    await dialog("Photo tour").waitFor();
    await dialog("Photo tour").getByRole("button", { name: "Back" }).click();
    await gone("Photo tour");
    assert.equal(modalParam(), null);

    await page.getByRole("button", { name: "Show all photos" }).click();
    await dialog("Photo tour").waitFor();
    await page.goBack();
    await gone("Photo tour");
    assert.equal(modalParam(), null);
  });

  test("the URL flag deep-links straight into the tour", async () => {
    await freshPage(TOUR_URL);
    await dialog("Photo tour").waitFor();
    assert.equal(await openDialogs(), 1);
  });

  test("a tour photo opens the lightbox on top; Escape peels one layer at a time", async () => {
    await freshPage();
    await page.getByRole("button", { name: "Show all photos" }).click();
    const tour = dialog("Photo tour");
    await tour.waitFor();

    const photo = tour.locator("section[data-room] button").nth(3);
    await photo.focus();
    await page.keyboard.press("Enter");
    await dialog("Photo viewer").waitFor();
    assert.ok(await counter(4).isVisible());
    assert.equal(await openDialogs(), 2, "the lightbox stacks on the tour");

    await page.keyboard.press("Escape");
    await gone("Photo viewer");
    assert.equal(await openDialogs(), 1, "the tour is still open");
    assert.ok(
      await photo.evaluate((e) => e === document.activeElement),
      `focus returned to the tour photo (got: ${await focusedLabel()})`,
    );

    await page.keyboard.press("Escape");
    await gone("Photo tour");
    assert.equal(await openDialogs(), 0);
  });
});
