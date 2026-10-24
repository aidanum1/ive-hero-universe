# Dev QA helper: tile rendered frames into one labelled contact sheet.
# usage: python3 scripts/contact-sheet.py <dir> <out.png> [cols] [thumb_width]
import sys, os
from PIL import Image, ImageDraw

d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 7
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 220
files = sorted(f for f in os.listdir(d) if f.endswith((".png", ".jpg", ".jpeg")))
ims = [Image.open(os.path.join(d, f)).convert("RGB") for f in files]
th = int(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + 8) + 8, rows * (th + 28) + 8), (40, 40, 40))
draw = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x = 8 + (i % cols) * (tw + 8)
    y = 8 + (i // cols) * (th + 28)
    sheet.paste(im.resize((tw, th)), (x, y))
    draw.text((x + 2, y + th + 4), f, fill=(255, 255, 255))
sheet.save(out)
print(out, sheet.size)
