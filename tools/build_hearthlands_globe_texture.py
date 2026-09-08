#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets'/'hearthlands-flatmap.png'
OUT=ROOT/'assets'/'hearthlands-globe-4k.webp'
W,H=4096,2048

src=Image.open(SRC).convert('RGB')
src=ImageEnhance.Color(src).enhance(1.04)
src=ImageEnhance.Contrast(src).enhance(1.035)
src=src.filter(ImageFilter.UnsharpMask(radius=.7,percent=125,threshold=2))

# Build a sphere-specific Hearthlands surface from many smaller, sharp pieces of the
# canonical territory painting. This keeps houses, bridges and gardens at landscape scale
# instead of blowing one house up to continent scale, and avoids the blurred filler that
# appeared in the previous globe texture.
stat=ImageStat.Stat(src.resize((64,64),Image.Resampling.BILINEAR))
avg=tuple(round(v) for v in stat.mean[:3])
base=Image.new('RGB',(W,H),tuple(max(12,min(210,int(v*.72))) for v in avg))

# Small staggered tiles: repeated domestic motifs read as settlements/terrain from orbit,
# while the original painting remains the visual source. Narrow feathering hides joins but
# leaves almost all painted detail sharp.
tile_w=900
tile_h=round(tile_w*src.height/src.width)
variants=[]
for i in range(8):
    crop=src
    if i%4==1:
        crop=ImageOps.mirror(crop)
    elif i%4==2:
        crop=ImageOps.flip(crop)
    elif i%4==3:
        crop=ImageOps.mirror(ImageOps.flip(crop))
    tile=crop.resize((tile_w,tile_h),Image.Resampling.LANCZOS)
    if i in (1,5): tile=ImageEnhance.Brightness(tile).enhance(.95)
    if i in (2,6): tile=ImageEnhance.Color(tile).enhance(.93)
    if i in (3,7): tile=ImageEnhance.Contrast(tile).enhance(1.04)
    variants.append(tile)

fade=34
mask=Image.new('L',(tile_w,tile_h),255)
mp=mask.load()
for y in range(tile_h):
    dy=min(y,tile_h-1-y)
    ay=min(1.0,dy/fade)
    for x in range(tile_w):
        dx=min(x,tile_w-1-x)
        ax=min(1.0,dx/fade)
        mp[x,y]=round(255*min(ax,ay))
mask=mask.filter(ImageFilter.GaussianBlur(6))

step_x=tile_w-86
step_y=tile_h-58
rows=5
cols=6
for row in range(rows):
    y=-180+row*step_y
    stagger=-(step_x//2) if row%2 else -120
    for col in range(cols):
        x=stagger+col*step_x
        tile=variants[(row*3+col)%len(variants)]
        base.paste(tile,(x,y),mask)

# A very restrained equatorial glow and polar dusk make the surface read as a planet,
# without smearing the source imagery.
overlay=Image.new('RGBA',(W,H),(0,0,0,0))
op=overlay.load()
for y in range(H):
    lat=abs((y/(H-1))*2-1)
    dusk=max(0.0,(lat-.62)/.38)
    warm=max(0.0,1-abs(y-H*.53)/(H*.36))
    for x in range(W):
        if dusk>0:
            a=round(42*dusk)
            op[x,y]=(22,19,48,a)
        elif warm>.72:
            a=round(7*(warm-.72)/.28)
            op[x,y]=(255,182,100,a)
base=Image.alpha_composite(base.convert('RGBA'),overlay).convert('RGB')

# Final clarity pass; deliberately no global blur/noise.
base=ImageEnhance.Color(base).enhance(1.055)
base=ImageEnhance.Contrast(base).enhance(1.05)
base=base.filter(ImageFilter.UnsharpMask(radius=.65,percent=115,threshold=2))

# Make the equirectangular left/right join exact, but only across a narrow band so the
# visible terrain stays sharp all the way around the sphere.
band=28
left=base.crop((0,0,band,H))
right=base.crop((W-band,0,W,H))
seam=Image.blend(left,right,.5)
base.paste(seam,(0,0))
base.paste(seam,(W-band,0))

OUT.parent.mkdir(parents=True,exist_ok=True)
base.save(OUT,'WEBP',quality=97,method=6)
print(OUT,Image.open(OUT).size)
