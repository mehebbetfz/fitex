"""Generate Fitex app icon + splash assets from source art."""
from __future__ import annotations

import os
import sys

from PIL import Image
import numpy as np

SRC1 = sys.argv[1]  # full branded icon → app logo / icon
SRC2 = sys.argv[2]  # helmet only → splash
OUT = sys.argv[3]


def cover_square(im: Image.Image, size: int) -> Image.Image:
	w, h = im.size
	scale = max(size / w, size / h)
	nw, nh = int(w * scale + 0.5), int(h * scale + 0.5)
	resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
	left = (nw - size) // 2
	top = (nh - size) // 2
	return resized.crop((left, top, left + size, top + size))


def fit_square(im: Image.Image, size: int, bg=(0, 0, 0, 0)) -> Image.Image:
	canvas = Image.new("RGBA", (size, size), bg)
	im2 = im.copy()
	im2.thumbnail((size, size), Image.Resampling.LANCZOS)
	x = (size - im2.width) // 2
	y = (size - im2.height) // 2
	canvas.paste(im2, (x, y), im2)
	return canvas


def white_silhouette(im: Image.Image) -> Image.Image:
	arr = np.array(im.convert("RGBA"))
	rgb = arr[:, :, :3].astype(np.float32)
	alpha = arr[:, :, 3].astype(np.float32)
	bright = rgb.mean(axis=2)
	mask = (alpha > 20) & (bright > 35)
	out_a = np.zeros_like(alpha)
	out_a[mask] = np.clip(np.maximum(alpha[mask], bright[mask] * 1.1), 0, 255)
	out = np.zeros_like(arr)
	out[:, :, 0] = 255
	out[:, :, 1] = 255
	out[:, :, 2] = 255
	out[:, :, 3] = out_a.astype(np.uint8)
	return Image.fromarray(out, "RGBA")


def clean_splash_helmet(im: Image.Image) -> Image.Image:
	arr = np.array(im.convert("RGBA"))
	rgb = arr[:, :, :3].astype(np.float32)
	a = arr[:, :, 3].astype(np.float32)
	bright = rgb.mean(axis=2)
	near_black = (bright < 25) & (a < 250)
	arr[near_black, 3] = 0
	logo_px = (bright >= 25) & (a > 20)
	arr[logo_px, 0] = 255
	arr[logo_px, 1] = 255
	arr[logo_px, 2] = 255
	arr[logo_px, 3] = np.clip(np.maximum(a[logo_px], bright[logo_px] * 1.05), 0, 255).astype(
		np.uint8
	)
	return Image.fromarray(arr, "RGBA")


def crop_to_content(im: Image.Image, pad: int = 8) -> Image.Image:
	arr = np.array(im.convert("RGBA"))
	mask = arr[:, :, 3] > 10
	ys, xs = np.where(mask)
	if len(xs) == 0:
		return im
	left = max(0, int(xs.min()) - pad)
	top = max(0, int(ys.min()) - pad)
	right = min(im.width, int(xs.max()) + 1 + pad)
	bottom = min(im.height, int(ys.max()) + 1 + pad)
	return im.crop((left, top, right, bottom))


def padded_square(im: Image.Image, size: int, fill_ratio: float = 0.72) -> Image.Image:
	"""Center content in a transparent square at ~fill_ratio of canvas."""
	canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
	target = int(size * fill_ratio)
	im2 = im.copy()
	im2.thumbnail((target, target), Image.Resampling.LANCZOS)
	canvas.paste(im2, ((size - im2.width) // 2, (size - im2.height) // 2), im2)
	return canvas


def main() -> None:
	os.makedirs(OUT, exist_ok=True)
	logo_src = Image.open(SRC1).convert("RGBA")
	splash_src = Image.open(SRC2).convert("RGBA")
	print("logo_src", logo_src.size, logo_src.mode)
	print("splash_src", splash_src.size, splash_src.mode)

	# App icon 1024 from first image
	icon = cover_square(logo_src, 1024)
	icon_flat = Image.new("RGBA", (1024, 1024), (18, 18, 18, 255))
	icon_flat.alpha_composite(icon)
	icon_flat.convert("RGB").save(os.path.join(OUT, "icon.png"), "PNG", optimize=True)
	print("wrote icon.png")

	# Android adaptive foreground — first image, padded for safe zone
	fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
	inner = cover_square(logo_src, int(1024 * 0.72))
	fg.paste(inner, ((1024 - inner.width) // 2, (1024 - inner.height) // 2), inner)
	fg.save(os.path.join(OUT, "android-icon-foreground.png"), "PNG", optimize=True)
	print("wrote android-icon-foreground.png")

	# Favicon
	fit_square(logo_src, 48, (18, 18, 18, 255)).convert("RGB").save(
		os.path.join(OUT, "favicon.png"), "PNG", optimize=True
	)
	print("wrote favicon.png")

	# Splash / in-app logo — second image, cropped then padded
	splash_clean = clean_splash_helmet(splash_src)
	splash_cropped = crop_to_content(splash_clean)
	padded = padded_square(splash_cropped, 1024, fill_ratio=0.72)
	padded.save(os.path.join(OUT, "logo.png"), "PNG", optimize=True)
	padded.save(os.path.join(OUT, "splash-icon.png"), "PNG", optimize=True)
	print("wrote logo.png / splash-icon.png", "content", splash_cropped.size)

	# Dark variant for places that used logo_dark
	dark = Image.new("RGBA", (1024, 1024), (18, 18, 18, 255))
	dark.alpha_composite(padded)
	dark.convert("RGB").save(os.path.join(OUT, "logo_dark.png"), "PNG", optimize=True)
	print("wrote logo_dark.png")

	# Monochrome adaptive icon from cropped helmet
	mono = padded_square(white_silhouette(splash_cropped), 1024, fill_ratio=0.78)
	mono.save(os.path.join(OUT, "android-icon-monochrome.png"), "PNG", optimize=True)
	print("wrote android-icon-monochrome.png")

	for f in [
		"icon.png",
		"logo.png",
		"logo_dark.png",
		"android-icon-foreground.png",
		"android-icon-monochrome.png",
		"favicon.png",
		"splash-icon.png",
	]:
		p = os.path.join(OUT, f)
		im = Image.open(p)
		print(f, im.size, im.mode, os.path.getsize(p))


if __name__ == "__main__":
	main()
