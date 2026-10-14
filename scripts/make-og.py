#!/usr/bin/env python3
"""Builds public/assets/og-image.jpg (1200x630) from a gameplay screenshot.

    python3 scripts/make-og.py [path/to/screenshot.png]

Needs Pillow. Defaults to the herd screenshot in ~/Desktop/DinoRyde-AppStore.
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    "~/Desktop/DinoRyde-AppStore/iPhone/herd-2.png")
ICON = os.path.join(ROOT, "public/assets/icon.png")
OUT = os.path.join(ROOT, "public/assets/og-image.jpg")
W, H = 1200, 630

INK = (14, 18, 11)
BONE = (242, 233, 211)
FERN = (156, 203, 91)


def font(size, bold=True):
    for path in ("/System/Library/Fonts/HelveticaNeue.ttc",
                 "/System/Library/Fonts/Helvetica.ttc"):
        if os.path.exists(path):
            return ImageFont.truetype(path, size, index=1 if bold else 0)
    return ImageFont.load_default()


shot = Image.open(SRC).convert("RGB")
scale = H / shot.height
shot = shot.resize((round(shot.width * scale), H), Image.LANCZOS)
left = (shot.width - W) // 2 + 80
img = shot.crop((left, 0, left + W, H))

# Left-to-right ink fade so the type sits on a calm ground.
fade = Image.new("L", (W, 1))
for x in range(W):
    fade.putpixel((x, 0), max(0, min(255, int(255 * max(0.0, 1 - x / 900) ** 1.1))))
img.paste(Image.new("RGB", (W, H), INK), (0, 0), fade.resize((W, H)))

icon = Image.open(ICON).convert("RGBA").resize((120, 120), Image.LANCZOS)
mask = Image.new("L", icon.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, 119, 119), radius=27, fill=255)
img.paste(icon, (72, 150), mask)

d = ImageDraw.Draw(img)
d.text((72, 300), "DINORYDE", font=font(96), fill=BONE)
d.text((76, 412), "Ride dinosaurs through forests", font=font(36, False), fill=BONE)
d.text((76, 470), "iPhone  ·  iPad  ·  Mac", font=font(26), fill=FERN)

img.save(OUT, quality=86, optimize=True, progressive=True)
print("wrote", OUT, img.size)
