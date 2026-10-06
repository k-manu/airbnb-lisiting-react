// scripts/pixel-diff.mjs
//
// Compares a region of the local dev build against the same region of the
// saved reference screenshot (design/reference/full-page.jpg) and writes a
// diff image plus a mismatch percentage.
//
// Why a saved screenshot: the live reference site sits behind a Vercel
// security checkpoint that answers headless browsers with HTTP 429, so it
// cannot be screenshotted by a script. We diff against the user's own
// full-page capture instead (rendered output only — see CLAUDE.md rule 6).
//
// The capture is 3441px wide and was taken at a ~1192 css px viewport, i.e. a
// device scale of 3441 / 1192. The local page is rendered at exactly that
// viewport and scale so a css-pixel region maps 1:1 onto both images.
//
// Setup:  npm i -D playwright pixelmatch pngjs && npx playwright install chromium
// Usage:  node scripts/pixel-diff.mjs <name> [localUrl] [region]
//   name      short label, e.g. "listing-hero"
//   localUrl  defaults to http://localhost:3000
//   region    "x,y,width,height" in css px (default "0,0,1192,720" — the hero).
//             Use the same region for both images; keep it to one section.
//
// Note: the reference was captured on a different OS, so text anti-aliasing
// never matches exactly. Judge by where the diff is concentrated (edges,
// blocks, missing elements), not by reaching 0%.

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs';

const REFERENCE_IMAGE = 'design/reference/full-page.jpg';
const REFERENCE_PX_WIDTH = 3441;
const VIEWPORT_WIDTH = 1192;
const SCALE = REFERENCE_PX_WIDTH / VIEWPORT_WIDTH;

const [, , name = 'listing', localUrl = 'http://localhost:3000', regionArg = '0,0,1192,720'] =
  process.argv;
const [rx, ry, rw, rh] = regionArg.split(',').map(Number);
if ([rx, ry, rw, rh].some((n) => !Number.isFinite(n))) {
  console.error('region must be "x,y,width,height" in css px');
  process.exit(1);
}

async function shootLocal(browser, outPath) {
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: 900 },
    deviceScaleFactor: SCALE,
  });
  const page = await context.newPage();
  await page.goto(localUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Scroll the whole page once so lazy images below the fold load, then wait for them.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
    // Images that can never enter the viewport by scrolling down (e.g. a
    // horizontally scrolled carousel) would wait forever, so cap the wait.
    const settled = Promise.all(
      [...document.images].map((img) =>
        img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)),
      ),
    );
    await Promise.race([settled, new Promise((r) => setTimeout(r, 4000))]);
  });
  await page.screenshot({
    path: outPath,
    fullPage: true,
    clip: { x: rx, y: ry, width: rw, height: rh },
  });
  await context.close();
}

// Chromium decodes the (61-megapixel) JPEG and crops it, so we need no image
// library for JPEG and never hold the whole page as a raw pixel buffer in Node.
async function cropReference(browser, outWidth, outHeight, outPath) {
  const page = await browser.newPage();
  const base64 = fs.readFileSync(REFERENCE_IMAGE).toString('base64');
  const dataUrl = await page.evaluate(
    async ({ base64, sx, sy, sw, sh, outWidth, outHeight }) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, outWidth, outHeight);
      return canvas.toDataURL('image/png');
    },
    { base64, sx: rx * SCALE, sy: ry * SCALE, sw: rw * SCALE, sh: rh * SCALE, outWidth, outHeight },
  );
  fs.writeFileSync(outPath, Buffer.from(dataUrl.split(',')[1], 'base64'));
  await page.close();
}

async function main() {
  fs.mkdirSync('diffs', { recursive: true });
  const refPath = `diffs/${name}-reference.png`;
  const localPath = `diffs/${name}-local.png`;
  const diffPath = `diffs/${name}-diff.png`;

  const browser = await chromium.launch();
  await shootLocal(browser, localPath);
  const local = PNG.sync.read(fs.readFileSync(localPath));
  await cropReference(browser, local.width, local.height, refPath);
  await browser.close();

  const reference = PNG.sync.read(fs.readFileSync(refPath));
  const { width, height } = local;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(reference.data, local.data, diff.data, width, height, {
    threshold: 0.1,
  });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const pct = ((mismatched / (width * height)) * 100).toFixed(2);
  console.log(`[${name}] region ${regionArg} css px -> ${width}x${height} px`);
  console.log(`[${name}] mismatched pixels: ${mismatched} / ${width * height} (${pct}%)`);
  console.log(`Reference: ${refPath}\nLocal:     ${localPath}\nDiff:      ${diffPath}`);
}

main();
