// End-to-end tests for the "Where you'll be" and "Meet your host" sections.
// Run against the sandbox route (both sections stacked):
//   BASE_URL=http://localhost:3200/dev/location-host node --test tests/location-host.e2e.mjs

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL =
  process.env.BASE_URL ?? "http://localhost:3200/dev/location-host";
const CO_HOST_COUNT = 8;

let browser;
let page;
let errors;

before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1192, height: 900 } });
  errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
});
after(async () => {
  await browser?.close();
});

const map = () => page.getByRole("group", { name: /^Map of / });
const zoomIn = () => page.getByRole("button", { name: "Zoom in" });
const zoomOut = () => page.getByRole("button", { name: "Zoom out" });
const search = () => page.getByRole("button", { name: "Search" });
const showMore = () => page.getByRole("button", { name: /^Show (more|less)$/ });

// What the map looks like, as text: its painted layers. Nothing may change when its controls are used.
const mapLook = () =>
  map().evaluate((el) =>
    [...el.querySelectorAll("div")].map((d) => getComputedStyle(d).backgroundImage).join("|"),
  );

describe("Where you'll be", () => {
  test("renders its landmarks, text and the drawn map", async () => {
    const section = page.getByRole("region", { name: "Where you’ll be" });
    await section.waitFor();
    assert.equal(await section.getAttribute("id"), "location");
    await page.getByText("Candolim, Goa, India").waitFor();
    await page
      .getByText("Exact location will be provided after booking.")
      .waitFor();
    await page
      .getByRole("heading", { name: "Neighbourhood highlights" })
      .waitFor();
    assert.equal(await map().count(), 1);
    assert.match(await mapLook(), /radial-gradient/, "the map is drawn with CSS gradients");
  });

  // Observed on the live reference: the map is a still picture and
  // "Show more" changes nothing (the blurb is one line already).
  test("Show more is offered but does nothing", async () => {
    const button = showMore();
    assert.equal(await button.textContent(), "Show more");
    const before = await page
      .getByRole("group", { name: "Neighbourhood highlights" })
      .innerText();
    await button.click();
    await button.focus();
    await page.keyboard.press("Enter");
    assert.equal(await button.textContent(), "Show more");
    assert.equal(
      await page
        .getByRole("group", { name: "Neighbourhood highlights" })
        .innerText(),
      before,
    );
  });

  test("the search and zoom buttons are there but the map does not move", async () => {
    const before = await mapLook();
    for (const control of [zoomIn(), zoomIn(), zoomOut(), zoomOut(), zoomOut(), search()]) {
      await control.click();
      assert.equal(await mapLook(), before);
    }
  });

  test("controls are reachable by keyboard in reading order", async () => {
    await search().focus();
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement?.ariaLabel),
      "Zoom in",
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement?.ariaLabel),
      "Zoom out",
    );
  });
});

describe("Meet your host", () => {
  test("shows the host card, facts and stats", async () => {
    const section = page.getByRole("region", { name: "Meet your host" });
    await section.waitFor();
    await section.getByText("Mirashya Homes").first().waitFor();
    await section.getByText("Verified host").waitFor();
    for (const text of [
      "1,463",
      "Reviews",
      "4.68",
      "Rating",
      "Years hosting",
    ]) {
      await section.getByText(text, { exact: true }).first().waitFor();
    }
    await section.getByText("Born in the 80s").waitFor();
    await section.getByText("Where I went to school: NICMAR GOA").waitFor();
  });

  test("lists every co-host, with photos where there are any", async () => {
    const items = page
      .getByRole("heading", { name: "Co-Hosts" })
      .locator("xpath=following-sibling::ul[1]/li");
    assert.equal(await items.count(), CO_HOST_COUNT);
    assert.equal(await items.locator("img").count(), CO_HOST_COUNT - 2);
    assert.equal(await items.getByText("Shruti").count(), 1);
  });

  test("shows host details and a focusable, inert Message host button", async () => {
    await page.getByText("Response rate: 100%").waitFor();
    await page.getByText("Responds within an hour").waitFor();
    await page
      .getByText("To help protect your payment", { exact: false })
      .waitFor();
    const button = page.getByRole("button", { name: "Message host" });
    await button.focus();
    assert.ok(await button.evaluate((el) => el === document.activeElement));
  });

  test("raised no console or page errors", () => {
    assert.deepEqual(errors, []);
  });
});
