"""Side-by-side of reference vs ours rows for a y-range.
   python scripts/spec/side.py YMIN YMAX [--x XMIN XMAX] [--ours design/spec/chrome/ours-chrome.json] [--kinds t,i,b,c,s]
Shows every reference row in range next to our best key match (or the nearest same-kind row by position)."""
import json, sys
args = sys.argv[1:]
ymin, ymax = float(args[0]), float(args[1])
def opt(n, d, k=1):
    return args[args.index(n)+1:args.index(n)+1+k] if n in args else d
xmin, xmax = (float(v) for v in opt('--x', ['-1e9', '1e9'], 2))
ours_path = opt('--ours', ['design/spec/chrome/ours-chrome.json'])[0]
kinds = opt('--kinds', ['t,i,b,c,s'])[0].split(',')
def parse(l):
    p = l.split('|'); x, y, w, h, n = p[-5:]; return ['|'.join(p[:-5]), float(x), float(y), float(w), float(h), int(n)]
ref = [parse(l) for l in open('design/spec/reference-page.txt', encoding='utf-8').read().split('\n') if l]
ours = json.load(open(ours_path, encoding='utf-8'))['page']['rows']
okey = {r[0]: r for r in ours}
def near(r):
    best = None; bd = 1e9
    for o in ours:
        if o[0][:1] != r[0][:1]: continue
        if abs(o[3]-r[3]) > 8 or abs(o[4]-r[4]) > 8: continue
        d = abs(o[1]-r[1]) + abs(o[2]-r[2])
        if d < bd: bd, best = d, o
    return best if bd < 60 else None
print(f"{'key':52} {'ref x,y,w,h':>28} | {'ours x,y,w,h':>28}   dy")
for r in ref:
    if not (ymin <= r[2] < ymax and xmin <= r[1] < xmax and r[0][:1] in kinds): continue
    o = okey.get(r[0]) if not r[0].startswith(('s:#', 'i:img', 'b:button')) else near(r)
    rs = f"{r[1]:.1f},{r[2]:.1f},{r[3]:.1f},{r[4]:.1f}"
    if o: print(f"{r[0][:52]:52} {rs:>28} | {f'{o[1]:.1f},{o[2]:.1f},{o[3]:.1f},{o[4]:.1f}':>28}  {o[2]-r[2]:+.1f}")
    else: print(f"{r[0][:52]:52} {rs:>28} | {'-':>28}")
