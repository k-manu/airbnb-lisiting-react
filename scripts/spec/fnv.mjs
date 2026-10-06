// FNV-1a over a slice file's rows joined by \n: same hash the live page reports, to prove a copy is exact.
//   node scripts/spec/fnv.mjs design/spec/reference-measure/slice-0.txt
import { readFileSync } from "node:fs";
const rows = readFileSync(process.argv[2], "utf8").replace(/\r/g, "").replace(/\n$/, "");
let h = 0x811c9dc5;
for (let i = 0; i < rows.length; i++) { h ^= rows.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
console.log(h.toString(16), rows.split("\n").length, "rows");
