from pathlib import Path
from PIL import Image
import numpy as np
import os

assets = Path(r"C:\Users\user\.cursor\projects\c-Users-user-Documents-GitHub-sprachclub\assets")
src = next(assets.glob("*07_29_01_PM-Photoroom*.png"))
src_long = r"\\?\\" + str(src)
print("src", src_long, "exists", os.path.exists(src_long))

out_dir = Path(
	r"c:\Users\user\Documents\GitHub\sprachclub\fitex\fitex-mobile\fitex\assets\avatars"
)
out_dir.mkdir(parents=True, exist_ok=True)

im = Image.open(src_long).convert("RGBA")
w, h = im.size
print("image", w, h)
arr = np.asarray(im)
rgb = arr[:, :, :3]
mask = rgb.max(axis=2) > 20
ys, xs = np.where(mask)
x0, x1 = int(xs.min()), int(xs.max())
y0, y1 = int(ys.min()), int(ys.max())
print("bbox", x0, y0, x1, y1)

crop = im.crop((x0, y0, x1 + 1, y1 + 1))
cw, ch = crop.size
print("crop", cw, ch)
cols, rows = 5, 5
cell_w, cell_h = cw / cols, ch / rows

for r in range(rows):
	for c in range(cols):
		left = int(round(c * cell_w))
		top = int(round(r * cell_h))
		right = int(round((c + 1) * cell_w))
		bottom = int(round((r + 1) * cell_h))
		cell = crop.crop((left, top, right, bottom))
		ca = np.asarray(cell)
		cm = ca[:, :, :3].max(axis=2) > 20
		if cm.any():
			cy, cx = np.where(cm)
			cell = cell.crop(
				(int(cx.min()), int(cy.min()), int(cx.max()) + 1, int(cy.max()) + 1)
			)
		side = max(cell.size)
		canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
		ox = (side - cell.size[0]) // 2
		oy = (side - cell.size[1]) // 2
		canvas.paste(cell, (ox, oy), cell)
		canvas = canvas.resize((512, 512), Image.Resampling.LANCZOS)
		idx = r * cols + c + 1
		aid = f"animal-{idx:02d}"
		path = out_dir / f"{aid}.png"
		canvas.save(path, "PNG")
		print("saved", path.name, canvas.size)

print("DONE")
