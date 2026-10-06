"""Per-section spacing steps: offsets are measured from each section's own top, so drift from
earlier sections does not hide the local differences.
   python scripts/spec/sections.py [--ours design/spec/chrome/ours-chrome.json] [--tol 0.35]"""
import json, sys, re
args = sys.argv[1:]
ours_path = args[args.index('--ours')+1] if '--ours' in args else 'design/spec/chrome/ours-chrome.json'
tol = float(args[args.index('--tol')+1]) if '--tol' in args else 0.35
def parse(l):
    p = l.split('|'); x, y, w, h, n = p[-5:]; return {'k': '|'.join(p[:-5]), 'x': float(x), 'y': float(y), 'w': float(w), 'h': float(h)}
ref = [parse(l) for l in open('design/spec/reference-page.txt', encoding='utf-8').read().split('\n') if l]
ours = [dict(k=r[0], x=r[1], y=r[2], w=r[3], h=r[4]) for r in json.load(open(ours_path, encoding='utf-8'))['page']['rows']]
okey = {}
for r in ours: okey.setdefault(r['k'], r)
# (name, ref top, ref bottom, ours top, x range, kinds)
def ours_top(key_prefix, fallback):
    for r in ours:
        if r['k'].startswith(key_prefix): return r['y']
    return fallback
sections = [
  ('TITLE+PHOTOS', 88.9, 629.0, 88.9, (0, 1e9)),
  ('LEFT COL (summary..calendar)', 677.6, 2662.0, 677.7, (0, 738)),
  ('BOOKING COL', 676.8, 2662.0, ours_top('c:section:Offer', 677.9), (738, 1e9)),
  ('REVIEWS', 2662.5, 4012.5, ours_top('c:section:Rated 4.95', 2669), (0, 1e9)),
  ('LOCATION', 4012.5, 4863.9, ours_top('c:section:Where you’ll', 4025), (0, 1e9)),
  ('HOST', 4863.9, 5425.7, ours_top('c:section:Meet your host', 4882), (0, 1e9)),
  ('THINGS TO KNOW', 5425.7, 5771.5, ours_top('c:section:Things to know', 5447), (0, 1e9)),
  ('NEARBY', 5771.5, 6186.0, ours_top('c:section:More stays nearby', 5795), (0, 1e9)),
]
for name, rtop, rbot, otop, (xa, xb) in sections:
    print(f"== {name}: ref top {rtop:.1f}, ours top {otop:.1f} (top offset {otop-rtop:+.1f})")
    prev = None
    rows = [r for r in ref if rtop <= r['y'] < rbot and xa <= r['x'] < xb and r['k'][:2] in ('t:', 'i:') and r['k'] in okey and not r['k'].startswith('i:img')]
    rows.sort(key=lambda r: (r['y'], r['x']))
    n = 0
    for r in rows:
        o = okey[r['k']]
        rel = (o['y'] - otop) - (r['y'] - rtop)
        if prev is None or abs(rel - prev) > tol:
            n += 1
            print(f"   ref +{r['y']-rtop:7.1f}  local offset {rel:+5.1f}  step {rel-(prev or 0):+5.1f}  {r['k'][:48]}")
            prev = rel
    if n == 0: print("   (no matched rows)")
