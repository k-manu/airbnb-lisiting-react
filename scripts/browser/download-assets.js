// scripts/browser/download-assets.js  (paths come from design/capture/page-extract.json)
//
// PASTE INTO THE DEVTOOLS CONSOLE of the reference page in your own browser.
// It fetches each image listed below from the page's own origin (your browser
// session, so the site's checks don't get in the way), bundles them into ONE
// zip and downloads it as assets.zip.
//
// Then unzip it into this project's public/ folder so the files end up at
//   public/assets/images/...      (same relative paths the page uses)
//
// These are image ASSETS only (photos, avatars, small icons). No code.

(async () => {
  const PATHS = [
  "/assets/images/ui/searchbar-house.png",
  "/assets/images/2367476f-11c4-4a14-a7c6-267be62c1d59.jpeg",
  "/assets/images/090d8b0b-b539-42c0-84f8-e1fb0cdf9a93.jpeg",
  "/assets/images/9be71047-fc52-438a-9270-75cb470f6752.jpeg",
  "/assets/images/67c61c6f-6260-4809-9510-0360e58a345d.jpeg",
  "/assets/images/c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d.jpeg",
  "/assets/images/avatars/host.jpeg",
  "/assets/images/a9831aeb-f441-44f5-a38f-4cf54e3f0fcf.jpeg",
  "/assets/images/ui/discount.svg",
  "/assets/images/ui/laurel-left.png",
  "/assets/images/ui/laurel-right.png",
  "/assets/images/chips/comfort.png",
  "/assets/images/chips/accuracy.png",
  "/assets/images/chips/hot-tub.png",
  "/assets/images/chips/condition.png",
  "/assets/images/chips/hospitality.png",
  "/assets/images/chips/cleanliness.png",
  "/assets/images/chips/amenities.png",
  "/assets/images/chips/decor.png",
  "/assets/images/chips/indoor-spaces.png",
  "/assets/images/chips/location.png",
  "/assets/images/avatars/rev1.jpeg",
  "/assets/images/avatars/rev2.jpeg",
  "/assets/images/avatars/rev3.jpeg",
  "/assets/images/avatars/rev4.jpeg",
  "/assets/images/avatars/co1.jpg",
  "/assets/images/avatars/co2.jpg",
  "/assets/images/avatars/co3.jpg",
  "/assets/images/avatars/rev5.jpeg",
  "/assets/images/similar/s1.jpeg",
  "/assets/images/similar/s2.jpeg",
  "/assets/images/similar/s3.jpeg",
  "/assets/images/similar/s4.jpeg",
  "/assets/images/similar/s5.jpeg",
  "/assets/images/similar/s6.jpeg",
  "/assets/images/56c44812-52c0-4481-90d8-101ec1f34c7a.jpeg",
  "/assets/images/97c78f8a-5090-4663-aebc-ba4e13b47092.jpeg",
  "/assets/images/9aa8e65f-94ac-4ba0-9a10-9ec91e536d22.jpeg",
  "/assets/images/23ea6621-6f74-4baa-acea-2fd03e312b41.jpeg",
  "/assets/images/fc02f48f-a937-42c5-895d-f9cc3113d6ca.jpeg",
  "/assets/images/70325367-cbae-4993-b560-18cd3f6edd53.jpeg",
  "/assets/images/a45feaa2-b607-4092-83ac-5fd4b2894959.jpeg",
  "/assets/images/f1da1c3d-0d10-481e-9b63-c71f9073f30b.jpeg",
  "/assets/images/f6de1663-4e9c-4414-b63b-29a154a92ee1.jpeg",
  "/assets/images/34529829-a971-44d3-ac2f-90ea3678a34d.jpeg",
  "/assets/images/153aa732-4935-48b8-a6fe-b469b6af5efc.jpeg",
  "/assets/images/3c6e6809-1bb1-47a6-8e24-aff593e1c28f.jpeg",
  "/assets/images/ddc853d7-e658-405c-bedc-8f31106c447e.jpeg",
  "/assets/images/1c827136-4a85-4fe0-8e69-3fd8ea19bb17.jpeg",
  "/assets/images/0622ab42-b851-4d55-9d9f-df3143bc5909.jpeg",
  "/assets/images/a74e3c0b-3188-4442-9146-1cd4d6ea45df.jpeg",
  "/assets/images/48a8ffbc-fbf7-4f84-bc29-ee400da3f08b.jpeg",
  "/assets/images/3cf31697-f3f3-4c60-82c4-029acb119ae4.jpeg",
  "/assets/images/246bd88d-4dd6-4117-a401-02a36ebfcf16.jpeg",
  "/assets/images/4fede77d-7a71-446f-89e3-263af937f3fa.jpeg",
  "/assets/images/79f59adb-5a5f-4d6c-8109-1f01f4ca0d03.jpeg",
  "/assets/images/f19d8c0a-1d88-42a4-9218-686d4f0db7e4.jpeg",
  "/assets/images/5adfdf3e-d497-4efc-ab8c-fc559dab311e.jpeg",
  "/assets/images/608748cd-6ee7-4a71-88a2-ba79d3ddba5a.jpeg",
  "/assets/images/5b856fde-a393-41bf-b373-c9d02e64221f.jpeg",
  "/assets/images/42befad7-fb29-473d-91db-b03e7a544d1d.jpeg",
  "/assets/images/929545d3-e241-46c0-8a70-c24531ce7b54.jpeg",
  "/assets/images/8eb65a8b-e795-4870-b141-6f63b1be24ae.jpeg",
  "/assets/images/cc7a56bd-242c-498a-9aef-0cffac619e54.jpeg",
  "/assets/images/30ad93b2-293f-494d-b645-626303c6cb93.jpeg",
  "/assets/images/9642a60d-e9de-4e1a-89c2-9ebd230f4a74.jpeg",
  "/assets/images/b6599f26-d65c-4df0-baf2-ef18c82a86a3.jpeg",
  "/assets/images/dc01fd46-b119-48d3-a43b-f6c093e26eca.jpeg",
  "/assets/images/fe37b80e-da8a-4225-b27b-dfbb5d763c01.jpeg",
  "/assets/images/3c90338e-86b4-423f-aae1-279e0ccc3a18.jpeg",
  "/assets/images/862d936c-0f34-4e50-af87-b519e2781d19.jpeg",
  "/assets/images/79addceb-8c2d-419b-80ff-e29af426a94c.jpeg"
];

  // ---- tiny zip writer (store method, no compression) ----
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (bytes) => {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const enc = new TextEncoder();
  const u16 = (v) => new Uint8Array([v & 255, (v >> 8) & 255]);
  const u32 = (v) => new Uint8Array([v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255]);
  const cat = (parts) => {
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of parts) {
      out.set(p, o);
      o += p.length;
    }
    return out;
  };

  const files = [];
  const failed = [];
  let done = 0;
  const queue = [...PATHS];
  const worker = async () => {
    while (queue.length) {
      const path = queue.shift();
      try {
        const res = await fetch(new URL(path, location.origin), { credentials: "same-origin" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        files.push({ name: path.replace(/^\//, ""), data: new Uint8Array(await res.arrayBuffer()) });
      } catch (e) {
        failed.push(`${path} (${e.message})`);
      }
      done++;
      if (done % 10 === 0 || done === PATHS.length) console.log(`assets: ${done}/${PATHS.length}`);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.data);
    const header = cat([
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21),
      u32(crc), u32(f.data.length), u32(f.data.length), u16(name.length), u16(0), name,
    ]);
    locals.push(header, f.data);
    centrals.push(
      cat([
        u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21),
        u32(crc), u32(f.data.length), u32(f.data.length), u16(name.length),
        u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name,
      ]),
    );
    offset += header.length + f.data.length;
  }
  const central = cat(centrals);
  const end = cat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(central.length), u32(offset), u16(0),
  ]);
  const zip = new Blob([cat([...locals, central, end])], { type: "application/zip" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(zip);
  a.download = "assets.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();

  console.log(`assets.zip: ${files.length} files (${Math.round(zip.size / 1024)} KB)`);
  if (failed.length) console.warn(`${failed.length} failed:`, failed);
})();
