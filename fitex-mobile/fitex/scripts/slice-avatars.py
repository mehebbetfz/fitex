"""Re-slice the 5x5 avatar sheet by detecting each circle blob.

Crop exactly to each blob bbox (no neighbor bleed), pad to square, export PNG.
"""
from pathlib import Path
import os
from collections import deque
import numpy as np
from PIL import Image

assets = Path(r"C:\Users\user\.cursor\projects\c-Users-user-Documents-GitHub-sprachclub\assets")
src = next(assets.glob("*07_29_01_PM-Photoroom*.png"))
src_long = r"\\?\\" + str(src)
assert os.path.exists(src_long), src_long

out_dir = Path(
	r"c:\Users\user\Documents\GitHub\sprachclub\fitex\fitex-mobile\fitex\assets\avatars"
)
out_dir.mkdir(parents=True, exist_ok=True)

im = Image.open(src_long).convert("RGBA")
arr = np.asarray(im)
rgb = arr[:, :, :3]
mask = rgb.max(axis=2) > 12
h, w = mask.shape
print("image", w, h)

visited = np.zeros_like(mask, dtype=bool)
blobs = []
ys, xs = np.where(mask)

for y, x in zip(ys, xs):
	if visited[y, x]:
		continue
	q = deque([(y, x)])
	visited[y, x] = True
	minx = maxx = x
	miny = maxy = y
	area = 0
	sx = sy = 0
	while q:
		cy, cx = q.popleft()
		area += 1
		sx += cx
		sy += cy
		minx = min(minx, cx)
		maxx = max(maxx, cx)
		miny = min(miny, cy)
		maxy = max(maxy, cy)
		for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
			if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not visited[ny, nx]:
				visited[ny, nx] = True
				q.append((ny, nx))
	if area < 500:
		continue
	blobs.append(
		{
			"minx": minx,
			"miny": miny,
			"maxx": maxx,
			"maxy": maxy,
			"area": area,
			"cx": sx / area,
			"cy": sy / area,
		}
	)

blobs = sorted(blobs, key=lambda b: b["area"], reverse=True)[:25]
if len(blobs) != 25:
	raise SystemExit(f"expected 25 blobs, got {len(blobs)}")

blobs_by_cy = sorted(blobs, key=lambda b: b["cy"])
rows: list[list] = []
current = [blobs_by_cy[0]]
for b in blobs_by_cy[1:]:
	row_cy = float(np.mean([x["cy"] for x in current]))
	if b["cy"] - row_cy > 40:
		rows.append(current)
		current = [b]
	else:
		current.append(b)
rows.append(current)
if len(rows) != 5:
	rows = [blobs_by_cy[i * 5 : (i + 1) * 5] for i in range(5)]

ordered = []
for row in rows:
	row.sort(key=lambda b: b["cx"])
	if len(row) != 5:
		raise SystemExit(f"row size {len(row)}")
	ordered.extend(row)

# Gaps between neighbors are ~2–4px — pad by 1 only, never expand into next blob.
PAD = 1
# Source circles are ~190–200px; mild 256 export beats soft 512 upscale.
EXPORT = 256
BLACK = 8

for i, b in enumerate(ordered, start=1):
	left = max(0, b["minx"] - PAD)
	top = max(0, b["miny"] - PAD)
	right = min(w, b["maxx"] + 1 + PAD)
	bottom = min(h, b["maxy"] + 1 + PAD)

	cell = im.crop((left, top, right, bottom))
	ca = np.asarray(cell).copy()
	# Transparent sheet background only (keep circle fill + AA fringe)
	near_black = ca[:, :, :3].max(axis=2) <= BLACK
	ca[near_black, 3] = 0
	out = Image.fromarray(ca, "RGBA")

	sw, sh = out.size
	side = max(sw, sh)
	sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
	sq.paste(out, ((side - sw) // 2, (side - sh) // 2), out)
	# Upscale once with high-quality filter (source circles are ~190px)
	sq = sq.resize((EXPORT, EXPORT), Image.Resampling.LANCZOS)

	path = out_dir / f"animal-{i:02d}.png"
	sq.save(path, "PNG")
	print(f"saved {path.name} crop=({left},{top},{right},{bottom}) src={sw}x{sh}")

print("DONE")
