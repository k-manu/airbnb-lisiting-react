// A local file drop for measurements taken in the browser extension's Chrome.
// Our app, opened in that Chrome, runs the layout probe and POSTs the rows here, so
// they never pass through a chat message (no hand-copying, no transcription risk).
//   node scripts/spec/collector.mjs [port]        (default 3400)
//   in the page:  fetch("http://localhost:3400/save/<name>", { method: "POST", body: text })
// Files land in design/spec/chrome/<name>.json. Only localhost pages of ours send to it.

import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const port = Number(process.argv[2] ?? 3400);
const dir = join(process.cwd(), "design", "spec", "chrome");
mkdirSync(dir, { recursive: true });

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "*",
  // Chrome's Private Network Access check for requests to localhost.
  "access-control-allow-private-network": "true",
};

// GET /probe.js: the layout probe plus window.__save(name, options), which measures the current
// page and posts the result back here. Load it from any page of ours with
//   const s = document.createElement("script"); s.src = "http://localhost:3400/probe.js"; document.head.append(s);
const probeJs = () =>
  readFileSync(join(process.cwd(), "scripts", "spec", "measure-page.js"), "utf8") +
  `
window.__save = async (name, options) => {
  const result = window.__measure(options || {});
  const r = await fetch("http://localhost:${port}/save/" + name, {
    method: "POST",
    body: JSON.stringify({ page: result }),
  });
  return { status: r.status, rows: result.rows.length, docH: result.meta.docH, cw: result.meta.cw };
};
`;

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/probe.js") {
    res.writeHead(200, { "content-type": "text/javascript", ...cors });
    return res.end(probeJs());
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    return res.end();
  }
  const m = /^\/save\/([\w.-]+)$/.exec(req.url ?? "");
  if (req.method !== "POST" || !m) {
    res.writeHead(404, cors);
    return res.end();
  }
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks).toString("utf8");
    writeFileSync(join(dir, `${m[1]}.json`), body);
    console.log(`saved ${m[1]}.json (${body.length} bytes)`);
    res.writeHead(200, cors);
    res.end("ok");
  });
}).listen(port, () => console.log(`collector on http://localhost:${port}/save/<name> -> ${dir}`));
