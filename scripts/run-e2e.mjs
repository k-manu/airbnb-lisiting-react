// scripts/run-e2e.mjs
//
// Runs every tests/*.e2e.mjs file, each against the URL it expects:
//   - section tests run on their dev-only sandbox route (/dev/<section>), which
//     renders that section alone (see HANDOFF.md);
//   - gallery and top tests run on the real page.
//
// It starts `next dev` on a spare port and stops it afterwards. Set
// E2E_ORIGIN (e.g. http://localhost:3200) to reuse a server that is already
// running. Pass file names to run a subset: node scripts/run-e2e.mjs reviews
//
// Exit code is non-zero when any file fails.

import { spawn, spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";

/** Test file (without `.e2e.mjs`) -> path it runs against. Anything else runs on "/". */
const ROUTES = {
  amenities: "/dev/amenities",
  calendar: "/dev/calendar",
  reviews: "/dev/reviews",
  "know-nearby": "/dev/know-nearby",
  "location-host": "/dev/location-host",
  "sticky-nav": "/dev/sticky-nav",
};

const PORT = process.env.TEST_PORT ?? "3110";
const externalOrigin = process.env.E2E_ORIGIN;
const origin = externalOrigin ?? `http://localhost:${PORT}`;

const wanted = process.argv.slice(2);
const files = readdirSync("tests")
  .filter((f) => f.endsWith(".e2e.mjs"))
  .filter((f) => wanted.length === 0 || wanted.some((w) => f.includes(w)))
  .sort();
const routeFor = (file) => ROUTES[file.replace(".e2e.mjs", "")] ?? "";

let server;
function stopServer() {
  if (!server || server.exitCode !== null) return;
  if (process.platform === "win32") {
    // `next dev` forks workers; take the whole tree down.
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    server.kill("SIGTERM");
  }
}

async function waitUntilUp(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`server did not answer at ${url} within ${timeoutMs}ms`);
}

let failed = [];
try {
  if (!externalOrigin) {
    const nextBin = createRequire(import.meta.url).resolve(
      "next/dist/bin/next",
    );
    server = spawn(process.execPath, [nextBin, "dev", "-p", PORT], {
      stdio: ["ignore", "ignore", "inherit"],
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    });
  }
  await waitUntilUp(origin);
  // Compile every page once up front so no test pays the first-load cost.
  for (const route of new Set(files.map(routeFor)))
    await waitUntilUp(origin + route);

  for (const file of files) {
    console.log(`\n=== ${file} (${origin}${routeFor(file) || "/"})`);
    const run = spawnSync(process.execPath, ["--test", `tests/${file}`], {
      stdio: "inherit",
      env: { ...process.env, BASE_URL: origin + routeFor(file) },
    });
    if (run.status !== 0) failed.push(file);
  }
} catch (err) {
  console.error(err.message);
  failed = ["(runner error)"];
} finally {
  stopServer();
}

console.log(
  failed.length === 0
    ? `\nAll ${files.length} e2e files passed.`
    : `\nFAILED: ${failed.join(", ")}`,
);
process.exit(failed.length === 0 ? 0 : 1);
