#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets'/'hearthlands-flatmap.png'
OUT=ROOT/'assets'/'hearthlands-globe-4k.webp'
W,H=4096,2048

src=Image.open(SRC).convert('RGB')

# Build a low-frequency, exactly seamless planetary ground from mirrored copies.
# The left/right outer pixels are the same source edge, so RepeatWrapping has no hard join.
tile_w=W//2
scale=tile_w/src.width
base_tile=src.resize((tile_w,round(src.height*scale)),Image.Resampling.LANCZOS)
if base_tile.height < H:
    scale=H/base_tile.height
    base_tile=base_tile.resize((round(base_tile.width*scale),H),Image.Resampling.LANCZOS)
    left=(base_tile.width-tile_w)//2
    base_tile=base_tile.crop((left,0,left+tile_w,H))
else:
    top=(base_tile.height-H)//2
    base_tile=base_tile.crop((0,top,tile_w,top+H))
mirror=base_tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
base=Image.new('RGB',(W,H))
base.paste(base_tile,(0,0)); base.paste(mirror,(tile_w,0))
base=base.filter(ImageFilter.GaussianBlur(18))
base=ImageEnhance.Color(base).enhance(.82)
base=ImageEnhance.Contrast(base).enhance(.94)

# Place one sharper, smaller copy of the canonical territory art in the middle of the world.
# This keeps the Family Home legible as a regional feature rather than a continent-sized house.
focal_w=2360
focal_h=round(focal_w*src.height/src.width)
focal=src.resize((focal_w,focal_h),Image.Resampling.LANCZOS)
focal=ImageEnhance.Color(focal).enhance(1.03)
focal=ImageEnhance.Contrast(focal).enhance(1.025)
focal=focal.filter(ImageFilter.UnsharpMask(radius=.9,percent=115,threshold=2))

mask=Image.new('L',(focal_w,focal_h),255)
fade=220
# Feather all four sides into the seamless terrain field.
pix=mask.load()
for y in range(focal_h):
    dy=min(y,focal_h-1-y)
    ay=min(1.0,dy/fade)
    for x in range(focal_w):
        dx=min(x,focal_w-1-x)
        ax=min(1.0,dx/fade)
        pix[x,y]=round(255*min(ax,ay))
mask=mask.filter(ImageFilter.GaussianBlur(42))

x=(W-focal_w)//2
y=(H-focal_h)//2+24
base.paste(focal,(x,y),mask)

# Gentle global polish; no grain/noise is added.
base=ImageEnhance.Color(base).enhance(1.06)
base=ImageEnhance.Contrast(base).enhance(1.035)
base=base.filter(ImageFilter.UnsharpMask(radius=.75,percent=90,threshold=3))

# Re-impose an exact wrap band after all processing.
band=96
left=base.crop((0,0,band,H))
right=base.crop((W-band,0,W,H))
# Both sides get the same averaged seam content.
seam=Image.blend(left,right.transpose(Image.Transpose.FLIP_LEFT_RIGHT),.5)
base.paste(seam,(0,0))
base.paste(seam.transpose(Image.Transpose.FLIP_LEFT_RIGHT),(W-band,0))

OUT.parent.mkdir(parents=True,exist_ok=True)
base.save(OUT,'WEBP',quality=96,method=6)
print(OUT,Image.open(OUT).size)
