"""Tile preview/*.png into a labelled contact sheet: python sheet.py out.jpg [glob]"""
import glob, sys
from PIL import Image, ImageDraw
files = sorted(glob.glob(sys.argv[2] if len(sys.argv) > 2 else 'preview/*.png'))
cols, tw = 4, 480; th = tw * 9 // 16
sheet = Image.new('RGB', (cols * tw, ((len(files) + cols - 1) // cols) * (th + 20)), 'black')
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th))
    x, y = (i % cols) * tw, (i // cols) * (th + 20)
    sheet.paste(im, (x, y + 20)); d.text((x + 4, y + 4), f.split('/')[-1], fill='white')
sheet.save(sys.argv[1], quality=88)
