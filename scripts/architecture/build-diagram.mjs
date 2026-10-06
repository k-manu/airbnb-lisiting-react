// Builds the production-architecture diagram from one spec: an editable Excalidraw file, an SVG and a PNG.
// Run: node scripts/architecture/build-diagram.mjs            (writes architecture/: large text, bold headings)
//      node scripts/architecture/build-diagram.mjs --compact  (original smaller text, for comparison; pair with --out=<dir>)
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LARGE = !process.argv.includes("--compact");
const outArg = process.argv.find((a) => a.startsWith("--out="));
const OUT = outArg
  ? path.resolve(outArg.slice(6))
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../architecture");
const W = 2560;
const H = 1930;
const FONT = 2; // Excalidraw "Helvetica"
const INK = "#1e1e1e";
const MUTE = "#495057";
const SYNC = "#343a40";
const ASYNC = "#0c8599";
const HOT = "#e03131";
const FONT_BOLD = 7; // Excalidraw "Lilita One": the heaviest face Excalidraw offers (it has no bold weight), used for headings in --large
const S = LARGE
  ? { body: 14, title: 19, sub: 15, zone: 20, zoneCh: 12, callTitle: 16, callBody: 13, tag: 13, legend: 14, headSub: 17 }
  : { body: 12, title: 16, sub: 13, zone: 18, zoneCh: 12.5, callTitle: 14, callBody: 12, tag: 12, legend: 13, headSub: 16 };
const CX = LARGE ? 2130 : 2140; // scaling-strategy callout column
const CW = LARGE ? 380 : 360;
const PAL = {
  edge: { s: "#1971c2", b: "#e7f5ff" },
  front: { s: "#9c36b5", b: "#f8f0fc" },
  back: { s: "#2f9e44", b: "#ebfbee" },
  store: { s: "#e8590c", b: "#fff4e6" },
  events: { s: "#0c8599", b: "#e3fafc" },
  search: { s: "#c2255c", b: "#fff0f6" },
  deploy: { s: "#495057", b: "#f1f3f5" },
};

const prims = [];
let counter = 0;
const nid = (p) => `${p}${++counter}`;
const estW = (s, size) => Math.max(...String(s).split("\n").map((l) => l.length)) * size * 0.54;

const rect = (x, y, w, h, o = {}) => {
  const id = nid("r");
  prims.push({ k: "rect", id, x, y, w, h, stroke: o.stroke ?? INK, fill: o.fill ?? "transparent", dash: !!o.dash, sw: o.sw ?? 2, group: o.group });
  return { id, x, y, w, h };
};
const text = (x, y, str, o = {}) => {
  const size = o.size ?? 12;
  prims.push({ k: "text", id: nid("t"), x, y, str, size, color: o.color ?? INK, align: o.align ?? "left", w: o.w ?? estW(str, size), group: o.group, bold: LARGE && !!o.bold });
};
const ellipse = (x, y, d, fill, group) => prims.push({ k: "ellipse", id: nid("e"), x, y, w: d, h: d, fill, group });
const arrow = (pts, o = {}) => prims.push({ k: "arrow", id: nid("a"), pts, from: o.from?.id, to: o.to?.id, dashed: !!o.dashed });

const zone = (x, y, w, h, title, sub, pal) => {
  rect(x, y, w, h, { stroke: pal.s, fill: pal.b });
  text(x + 20, y + 10, title, { size: S.zone, color: pal.s, bold: true });
  if (sub) text(x + 20 + title.length * S.zoneCh + 14, y + 14, sub, { size: S.sub, color: MUTE });
};

const box = (x, y, w, h, title, lines, pal) => {
  const g = nid("g");
  const r = rect(x, y, w, h, { stroke: pal.s, fill: "#ffffff", group: g });
  const titleH = S.title * 1.25;
  const total = titleH + 4 + lines.length * S.body * 1.25;
  const y0 = y + (h - total) / 2;
  text(x + 8, y0, title, { size: S.title, color: INK, align: "center", w: w - 16, group: g, bold: true });
  text(x + 8, y0 + titleH + 4, lines.join("\n"), { size: S.body, color: MUTE, align: "center", w: w - 16, group: g });
  return r;
};

const wrap = (s, max) => {
  const out = [];
  let line = "";
  for (const word of s.split(" ")) {
    if ((line + " " + word).trim().length > max) {
      out.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  return [...out, line];
};

const callout = (x, y, w, h, title, bullets) => {
  const g = nid("g");
  rect(x, y, w, h, { stroke: "#f59f00", fill: "#fff9db", group: g });
  text(x + 12, y + 8, title, { size: S.callTitle, color: "#e67700", group: g, bold: true });
  const max = Math.floor((w - 24) / (S.callBody * 0.525));
  const body = bullets.map((b) => wrap("• " + b, max).map((l, i) => (i ? "  " + l : l)).join("\n")).join("\n");
  const lines = body.split("\n").length;
  const top = LARGE ? 32 : 28;
  const need = top + lines * S.callBody * 1.25 + 6;
  if (need > h) console.warn(`callout "${title}" overflows: needs ${need}, has ${h}`);
  text(x + 12, y + top, body, { size: S.callBody, color: INK, group: g });
};

const tag = (cx, cy, str, size = S.tag) => {
  const g = nid("g");
  const w = estW(str, size) + 12;
  const h = size + 6;
  rect(cx - w / 2, cy - h / 2, w, h, { stroke: "transparent", fill: "#ffffff", group: g });
  text(cx - w / 2, cy - size * 0.62, str, { size, color: MUTE, align: "center", w, group: g });
};
const tagRight = (x, y, str) => tag(x + 14 + estW(str, S.tag) / 2 + 6, y, str);

const badge = (cx, cy, n) => {
  const g = nid("g");
  ellipse(cx - 13, cy - 13, 26, HOT, g);
  text(cx - 13, cy - 8, String(n), { size: 15, color: "#ffffff", align: "center", w: 26, group: g, bold: true });
};

// ---------- header ----------
const lg = (S.legend - 13) * 0.5;
text(40, 26, "Vacation-Rental Marketplace: Production Architecture", { size: 34, bold: true });
text(40, 76, "High-level scaling strategy across frontend, backend, storage, search and deployment (Airbnb-scale)", { size: S.headSub, color: MUTE });
rect(1000, 20, 690, 110, { stroke: "#adb5bd", fill: "#ffffff" });
text(1016, 28, "Design point (assumptions)", { size: S.callTitle, color: MUTE, bold: true });
text(1016, LARGE ? 54 : 50, "100M MAU · 5M listings · 100M photos · read : write ≈ 500 : 1\n10k search QPS · 150 bookings/s at peak · 3 regions\nSLO: search p95 < 300 ms · listing TTFB < 200 ms · 99.95 % available", { size: S.legend });
rect(1720, 20, 800, 110, { stroke: "#adb5bd", fill: "#ffffff" });
arrow([[1740, 46], [1800, 46]]);
text(1810, 39 - lg, "synchronous request", { size: S.legend });
arrow([[1990, 46], [2050, 46]], { dashed: true });
text(2060, 39 - lg, "async event / CDC", { size: S.legend });
rect(2230, 37, 18, 18, { stroke: "#f59f00", fill: "#fff9db" });
text(2256, 39 - lg, "scaling strategy", { size: S.legend });
text(1740, 66, "Numbered request flows", { size: S.legend, color: MUTE, bold: true });
let lx = 1740;
["Search", "View listing", "Book & pay", "Index via CDC", "Media pipeline"].forEach((label, i) => {
  badge(lx + 13, 106, i + 1);
  text(lx + 32, 99 - lg, label, { size: S.legend });
  lx += 32 + estW(label, S.legend) + 22;
});

// ---------- 1 · clients & edge ----------
zone(40, 150, 2480, 185, "1 · CLIENTS & EDGE", "serve reads from the nearest edge", PAL.edge);
const clients = box(60, 195, 460, 105, "Clients", ["Web (Next.js) · iOS · Android", "Partner / channel-manager API"], PAL.edge);
const dns = box(580, 195, 460, 105, "DNS + global traffic manager", ["Latency-based routing", "Health-check failover across regions"], PAL.edge);
const cdn = box(1100, 195, 460, 105, "CDN + WAF + DDoS shield", ["Static assets · images · ISR HTML · edge functions", "Edge hit-ratio target ≥ 95 %"], PAL.edge);
const shield = box(1620, 195, 460, 105, "Origin shield (tiered cache)", ["Collapses cache misses into one origin fetch", "Protects Next.js and the image service"], PAL.edge);
callout(CX, 172, CW, 150, "Edge scaling strategy", [
  "Anycast DNS: latency routing to the nearest region",
  "Edge-cached HTML (ISR) and images: ≥ 95 % hit, origin sees < 5 %",
  "Origin shield stops thundering herds on a miss",
  "WAF + rate limits absorb bots before the origin",
]);

// ---------- 2 · frontend ----------
zone(40, 365, 2480, 185, "2 · FRONTEND", LARGE ? "stateless scale-out" : "fast first paint, stateless scale-out", PAL.front);
const islands = box(60, 410, 460, 105, "Client islands (React)", ["Gallery · Lightbox · booking widget", "Only the interactive parts hydrate"], PAL.front);
const rum = box(580, 410, 460, 105, "Web-vitals RUM", ["LCP · INP · CLS budgets", "Gate releases in CI and in production"], PAL.front);
const next = box(1180, 410, 380, 105, "Next.js App Router (RSC)", ["SSR · ISR · streaming", "Revalidate on write · stateless"], PAL.front);
const img = box(1620, 410, 460, 105, "Image optimisation service", ["AVIF / WebP · responsive srcset", "Priority LCP image · lazy below the fold"], PAL.front);
callout(CX, 387, CW, LARGE ? 160 : 150, "Frontend scaling strategy", [
  "Stateless SSR containers scale out on RPS / CPU",
  "ISR + revalidate-on-write: cached pages stay fresh in seconds",
  "Islands: minimal JS, hydrate only what is interactive",
  "AVIF / WebP + srcset cut image bytes by more than half",
]);

// ---------- 3 · backend ----------
zone(40, 580, 2480, 355, "3 · BACKEND", "domain services behind one gateway, events for everything async", PAL.back);
const gw = box(60, 630, 2050, 75, "API gateway / BFF", ["authN/Z (OIDC · JWT) · rate limits · request routing · GraphQL + REST"], PAL.back);
const ctr = rect(60, 750, 2050, 165, { stroke: PAL.back.s, dash: true });
text(76, 758, "Domain services: stateless, each autoscaled independently (HPA on RPS / CPU)", { size: S.sub, color: PAL.back.s });
[
  ["Listing", ["Catalog · pricing · photo metadata", "Read-heavy, cache-first"]],
  ["Booking & availability", ["Hold → pay → confirm state machine", "Write hot path, sharded"]],
  ["Payments", ["Idempotency keys · PSP adapters", "PCI scope isolated"]],
  ["Users & auth", ["Profiles · OIDC · KYC", "Sessions in Redis"]],
  ["Reviews & messaging", ["Reviews · chat · notifications", "Async fan-out via events"]],
  ["Search API", ["Query planning · filters", "Reads OpenSearch, not the database"]],
].forEach(([t, l], i) => box(70 + 342 * i, 790, 320, 105, t, l, PAL.back));
callout(CX, 610, CW, 300, "Backend scaling strategy", [
  "Split by bounded context; each service scales on its own signal",
  "Booking is the write hot path: shard by listing_id / region",
  "No double-booking: Redis lock + DB optimistic concurrency + idempotent payment",
  "Outbox pattern: state change and event commit atomically",
  "Backpressure everywhere: queues, bulkheads, circuit breakers, timeouts",
  "Reads come from cache, replicas and search, not the primary",
]);

// ---------- 4 · storage ----------
zone(40, 975, 1060, 450, "4 · STORAGE", null, PAL.store);
const replicas = box(60, 1030, 320, 100, "Read replicas × N", ["Per region · lag < 1 s", "Listing and review reads"], PAL.store);
const redis = box(410, 1030, 320, 100, "Redis cluster", ["Cache-aside · sessions", "Availability locks (Redlock)"], PAL.store);
const primary = box(760, 1030, 320, 100, "PostgreSQL (Aurora) primary", ["Sharded by region / listing_id", "Optimistic concurrency on availability"], PAL.store);
box(60, 1155, 320, 120, "Wide-column store", ["DynamoDB / Cassandra", "Messages · events · audit", "Linear write scaling"], PAL.store);
callout(410, 1155, 670, 120, "Storage scaling strategy", [
  "Postgres: shard by region / listing_id; replicas × N per region",
  "Redis cluster absorbs most reads; locks guard availability",
  "S3 + CDN serve all media; lifecycle moves cold photos to infrequent access",
  "Wide-column store takes chat / event writes: scale by adding nodes",
]);
box(60, 1300, 670, 100, "Backups & disaster recovery", ["PITR + cross-region snapshots", "Quarterly restore drills"], PAL.store);
const obj = box(760, 1300, 320, 100, "Object storage (S3)", ["Photo originals + renditions", "11×9s durability · lifecycle tiers"], PAL.store);

// ---------- 3b · events & workers ----------
zone(1140, 975, 620, 450, "3b · EVENTS & WORKERS", null, PAL.events);
const kafka = box(1160, 1030, 580, 245, "Event bus (Kafka)", ["Partitioned by listing_id", "Transactional outbox · idempotent consumers · DLQ", "7-day retention: replay to rebuild the search index", "CDC (Debezium) tails the Postgres write-ahead log"], PAL.events);
const workers = box(1160, 1300, 580, 100, "Async workers", ["Media resize · notifications · payouts · fraud", "Autoscale on queue lag (KEDA)"], PAL.events);

// ---------- 5 · search ----------
zone(1780, 975, 740, 450, "5 · SEARCH & DISCOVERY", null, PAL.search);
const os = box(1800, 1030, 340, 100, "OpenSearch cluster", ["Geo (H3) + availability + facets", "Shards by geo cell · replicas × 2"], PAL.search);
box(2160, 1030, 340, 100, "Ranking & personalisation", ["Feature store + learning-to-rank", "Re-ranks top-K off the hot path"], PAL.search);
const idx = box(1800, 1155, 340, 120, "Indexer (CDC consumer)", ["Debezium → Kafka → bulk upserts", "Near-real-time: < 2 s behind Postgres", "Blue/green reindex from Kafka"], PAL.search);
box(2160, 1155, 340, 120, "Data lake + warehouse", ["S3 / Parquet → BigQuery / Snowflake", "Analytics · pricing · ML training", "Fed by a Kafka S3 sink"], PAL.search);
callout(1800, 1300, 700, LARGE ? 110 : 100, "Search scaling strategy", [
  "Shard by geo cell (H3); replicas × 2; hot / warm tiers for quiet regions",
  "CDC keeps the index < 2 s behind Postgres; reindex blue/green",
  "Availability and price filtered in-index; hot-query cache by (cell, dates, filters)",
  "Degrades gracefully: stale results are fine, booking re-validates on the primary",
]);

// ---------- 6 · deployment ----------
zone(40, 1465, 2480, 425, "6 · DEPLOYMENT & OPERATIONS", "ship continuously, fail over automatically", PAL.deploy);
const chain = [
  ["Trunk-based Git + PRs", ["Small PRs · preview environment per PR"]],
  ["CI gates", ["Lint · typecheck · unit · e2e", "axe accessibility · Lighthouse budgets"]],
  ["Build & infrastructure as code", ["Container image + SBOM", "Terraform plan, reviewed"]],
  ["Progressive delivery", ["Canary 1 → 10 → 100 %", "Feature flags · auto-rollback"]],
  ["Wave rollout", ["One region at a time", "Bake time + SLO guard"]],
].map(([t, l], i) => box(60 + 419 * i, 1515, 372, 100, t, l, PAL.deploy));
chain.slice(1).forEach((b, i) => arrow([[chain[i].x + chain[i].w, 1565], [b.x, 1565]], { from: chain[i], to: b }));
const frame = rect(840, 1660, 1270, 190, { stroke: PAL.deploy.s, dash: true });
text(856, 1668, "Active-active regions: every region is a full-stack cell (Kubernetes · Aurora · Redis · Kafka · OpenSearch)", { size: S.sub, color: MUTE });
[
  ["Region A · us-east-1", "Serves the Americas"],
  ["Region B · eu-west-1", "Serves EMEA · GDPR data residency"],
  ["Region C · ap-south-1", "Serves APAC"],
].forEach(([t, s], i) => box(855 + 420 * i, 1700, 400, 130, t, ["Kubernetes + HPA / KEDA autoscaling", "Aurora writer for its own shards", s], PAL.deploy));
box(60, 1700, 360, 130, "Security & compliance", ["WAF · Vault / KMS · least-privilege IAM", "PCI-scoped payments", "Audit logs · secrets rotation"], PAL.deploy);
const obs = box(450, 1700, 360, 130, "Observability", ["OpenTelemetry → Prometheus · Loki · Tempo", "SLO burn-rate alerts · Sentry · RUM", "Traces follow a booking end to end"], PAL.deploy);
callout(CX, 1515, CW, 335, "Deployment scaling strategy", [
  "Autoscale: HPA on RPS, KEDA on queue lag, cluster autoscaler",
  "Active-active regions; the traffic manager fails over on health checks",
  "Targets: RTO < 5 min, RPO < 1 min (sync replica + PITR)",
  "Cell-based isolation keeps a bad deploy or noisy tenant local",
  "Terraform gives identical regions and reproducible DR",
  "Canary + auto-rollback on SLO burn keeps releases safe at scale",
]);

// ---------- arrows and flow badges ----------
arrow([[470, 300], [470, 410]], { from: clients, to: islands });
tagRight(470, 355, "hydrate");
arrow([[520, 247], [580, 247]], { from: clients, to: dns });
arrow([[1040, 247], [1100, 247]], { from: dns, to: cdn });
arrow([[1560, 247], [1620, 247]], { from: cdn, to: shield });
arrow([[520, 462], [580, 462]], { from: islands, to: rum, dashed: true });
arrow([[1110, 300], [1110, 630]], { from: cdn, to: gw });
badge(1110, 350, 1);
tagRight(1110, 350, "search + booking API calls");
arrow([[1400, 300], [1400, 410]], { from: cdn, to: next });
badge(1400, 350, 2);
tagRight(1400, 350, "cache miss / ISR revalidate");
arrow([[1850, 300], [1850, 410]], { from: shield, to: img });
tagRight(1850, 355, "origin fetch");
arrow([[1400, 515], [1400, 630]], { from: next, to: gw });
tagRight(1400, 565, "SSR data fetch");
arrow([[1085, 705], [1085, 750]], { from: gw, to: ctr });
tagRight(1085, 728, "gRPC · mTLS · retries · circuit breakers");

arrow([[300, 915], [300, 1030]], { from: ctr, to: replicas });
tagRight(300, 945, "reads: listings, reviews");
arrow([[570, 915], [570, 1030]], { from: ctr, to: redis });
tagRight(570, 945, "cache-aside · locks");
arrow([[920, 915], [920, 1030]], { from: ctr, to: primary });
badge(920, 945, 3);
tagRight(920, 945, "writes · OCC · idempotent");
arrow([[1450, 915], [1450, 1030]], { from: ctr, to: kafka, dashed: true });
tagRight(1450, 945, "outbox events");
arrow([[2080, 915], [2080, 1030]], { from: ctr, to: os });
badge(2080, 945, 1);
tagRight(2080, 945, "geo + date + filter queries");

arrow([[1080, 1080], [1160, 1080]], { from: primary, to: kafka, dashed: true });
badge(1120, 1056, 4);
arrow([[1740, 1215], [1800, 1215]], { from: kafka, to: idx, dashed: true });
badge(1770, 1190, 4);
arrow([[1970, 1155], [1970, 1130]], { from: idx, to: os });
arrow([[1450, 1275], [1450, 1300]], { from: kafka, to: workers, dashed: true });
arrow([[1160, 1350], [1080, 1350]], { from: workers, to: obj, dashed: true });
badge(1120, 1326, 5);
arrow([[840, 1765], [810, 1765]], { from: frame, to: obs, dashed: true });
arrow([[chain[4].x + chain[4].w / 2, 1615], [chain[4].x + chain[4].w / 2, 1660]], { from: chain[4], to: frame });

// ---------- Excalidraw ----------
let seed = 1;
const rnd = () => (seed = (seed * 16807) % 2147483647);
const bound = new Map();
prims.filter((p) => p.k === "arrow").forEach((a) => [a.from, a.to].filter(Boolean).forEach((id) => bound.set(id, [...(bound.get(id) ?? []), { id: a.id, type: "arrow" }])));
const common = (p) => ({
  angle: 0, fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid", roughness: 0, opacity: 100,
  groupIds: p.group ? [p.group] : [], frameId: null, roundness: null, seed: rnd(), version: 1, versionNonce: rnd(),
  isDeleted: false, boundElements: bound.get(p.id) ?? null, updated: 1, link: null, locked: false,
});
const elements = prims.map((p) => {
  if (p.k === "rect") {
    return { ...common(p), id: p.id, type: "rectangle", x: p.x, y: p.y, width: p.w, height: p.h, strokeColor: p.stroke, backgroundColor: p.fill,
      strokeWidth: p.sw, strokeStyle: p.dash ? "dashed" : "solid", roundness: { type: 3 } };
  }
  if (p.k === "ellipse") {
    return { ...common(p), id: p.id, type: "ellipse", x: p.x, y: p.y, width: p.w, height: p.h, strokeColor: p.fill, backgroundColor: p.fill, roundness: { type: 2 } };
  }
  if (p.k === "text") {
    return { ...common(p), id: p.id, type: "text", x: p.x, y: p.y, width: p.w, height: p.str.split("\n").length * p.size * 1.25,
      strokeColor: p.color, backgroundColor: "transparent", text: p.str, originalText: p.str, fontSize: p.size, fontFamily: p.bold ? FONT_BOLD : FONT,
      textAlign: p.align, verticalAlign: "top", containerId: null, autoResize: true, lineHeight: 1.25 };
  }
  const [x0, y0] = p.pts[0];
  const xs = p.pts.map((q) => q[0]);
  const ys = p.pts.map((q) => q[1]);
  const link = (id) => (id ? { elementId: id, focus: 0, gap: 1 } : null);
  return { ...common(p), id: p.id, type: "arrow", x: x0, y: y0, width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys),
    strokeColor: p.dashed ? ASYNC : SYNC, backgroundColor: "transparent", strokeStyle: p.dashed ? "dashed" : "solid",
    points: p.pts.map(([x, y]) => [x - x0, y - y0]), lastCommittedPoint: null, startBinding: link(p.from), endBinding: link(p.to),
    startArrowhead: null, endArrowhead: "arrow", elbowed: false };
});

// ---------- SVG ----------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svgBody = prims.map((p) => {
  if (p.k === "rect") {
    const rx = Math.min(32, Math.min(p.w, p.h) * 0.25);
    return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.sw}"${p.dash ? ' stroke-dasharray="8 6"' : ""}/>`;
  }
  if (p.k === "ellipse") return `<circle cx="${p.x + p.w / 2}" cy="${p.y + p.h / 2}" r="${p.w / 2}" fill="${p.fill}"/>`;
  if (p.k === "text") {
    const ax = p.align === "center" ? p.x + p.w / 2 : p.x;
    const lines = p.str.split("\n").map((l, i) => `<tspan x="${ax}" y="${p.y + p.size * 0.95 + i * p.size * 1.25}">${esc(l).replace(/ {2}/g, "&#160;&#160;")}</tspan>`).join("");
    return `<text${p.bold ? " font-family=\"'Lilita One', Helvetica, Arial, sans-serif\"" : ""} font-size="${p.size}" fill="${p.color}" text-anchor="${p.align === "center" ? "middle" : "start"}">${lines}</text>`;
  }
  return `<polyline points="${p.pts.map((q) => q.join(",")).join(" ")}" fill="none" stroke="${p.dashed ? ASYNC : SYNC}" stroke-width="2"${p.dashed ? ' stroke-dasharray="8 6"' : ""} marker-end="url(#${p.dashed ? "ha" : "hs"})"/>`;
}).join("\n");
const head = (id, c) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${c}" stroke-width="1.6"/></marker>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Helvetica, Arial, sans-serif"><defs>${LARGE ? "<style>@import url('https://fonts.googleapis.com/css2?family=Lilita+One&amp;display=swap');</style>" : ""}${head("hs", SYNC)}${head("ha", ASYNC)}</defs><rect width="${W}" height="${H}" fill="#ffffff"/>\n${svgBody}\n</svg>\n`;

mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, "architecture-diagram.excalidraw"), JSON.stringify({ type: "excalidraw", version: 2, source: "https://excalidraw.com", elements, appState: { gridSize: null, viewBackgroundColor: "#ffffff" }, files: {} }, null, 1));
writeFileSync(path.join(OUT, "architecture-diagram.svg"), svg);

try {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.setContent(`<body style="margin:0">${svg}</body>`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "architecture-diagram.png"), clip: { x: 0, y: 0, width: W, height: H } });
  await browser.close();
} catch (e) {
  console.warn("PNG skipped:", e.message);
}
console.log(`wrote ${elements.length} elements to ${OUT}`);
