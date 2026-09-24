#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageStat, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets'/'hearthlands-flatmap.png'
OUT=ROOT/'assets'/'hearthlands-globe-4k.webp'
W,H=4096,2048

src=Image.open(SRC).convert('RGB')
src=ImageEnhance.Color(src).enhance(1.045)
src=ImageEnhance.Contrast(src).enhance(1.04)
src=src.filter(ImageFilter.UnsharpMask(radius=.65,percent=120,threshold=2))

# Hearthlands globe v4: one large coherent inhabited world surface.
# The canonical Hearthlands flatmap is composited exactly once. It is never tiled,
# mirrored or repeated elsewhere on the planet. Surrounding terrain is painted from
# broad palette washes rather than copied houses/gardens, so rotation reveals one world.
stat=ImageStat.Stat(src.resize((64,64),Image.Resampling.BILINEAR))
avg=tuple(round(v) for v in stat.mean[:3])

# Deep teal/indigo planetary ocean.
base=Image.new('RGB',(W,H),(12,34,52))
ocean=Image.new('RGBA',(W,H),(0,0,0,0))
od=ImageDraw.Draw(ocean,'RGBA')
od.ellipse((-300,-260,2200,1420),fill=(30,85,91,66))
od.ellipse((1800,120,4550,2140),fill=(35,53,98,68))
od.ellipse((650,1050,3450,2420),fill=(71,48,88,38))
ocean=ocean.filter(ImageFilter.GaussianBlur(250))
base=Image.alpha_composite(base.convert('RGBA'),ocean).convert('RGB')

# One broad continent underlay gives the sphere a convincing land/sea balance before
# the authored painting is laid into its inhabited heart. This underlay contains no
# copied scene imagery: only large painterly palette fields clipped to an irregular coast.
land_mask=Image.new('L',(W,H),0)
md=ImageDraw.Draw(land_mask)
coast=[
    (470,930),(540,590),(710,350),(980,205),(1320,250),(1580,155),
    (1930,245),(2210,185),(2580,300),(2900,270),(3260,510),(3480,830),
    (3425,1160),(3260,1430),(2960,1610),(2580,1690),(2260,1810),
    (1870,1730),(1540,1815),(1200,1700),(880,1580),(620,1320)
]
md.polygon(coast,fill=255)
land_mask=land_mask.filter(ImageFilter.GaussianBlur(24))

land=Image.new('RGBA',(W,H),(88,87,60,0))
ld=ImageDraw.Draw(land,'RGBA')
ld.rectangle((0,0,W,H),fill=(75,82,60,255))
ld.ellipse((520,250,2100,1450),fill=(80,115,68,235))
ld.ellipse((1500,180,3300,1350),fill=(93,82,72,225))
ld.ellipse((900,880,2800,1950),fill=(118,76,84,215))
ld.ellipse((2180,700,3600,1800),fill=(66,103,95,210))
land=land.filter(ImageFilter.GaussianBlur(180))
base=Image.composite(land.convert('RGB'),base,land_mask)

# The canonical painting appears once, large enough to read as the inhabited central
# landscape but still zoomed out enough that individual houses do not become continents.
continent_w=2350
continent_h=round(continent_w*src.height/src.width)
continent=src.resize((continent_w,continent_h),Image.Resampling.LANCZOS)
continent=ImageEnhance.Color(continent).enhance(1.02)
continent=continent.filter(ImageFilter.UnsharpMask(radius=.55,percent=108,threshold=2))

scene_mask=Image.new('L',(continent_w,continent_h),0)
sd=ImageDraw.Draw(scene_mask)
scene_coast=[
    (45,660),(90,365),(260,170),(520,85),(790,135),(1035,55),
    (1330,140),(1590,70),(1900,180),(2160,330),(2305,590),(2280,850),
    (2150,1080),(1900,1225),(1600,1285),(1350,1260),(1090,1320),
    (830,1265),(580,1230),(330,1090),(150,900)
]
sd.polygon(scene_coast,fill=255)
scene_mask=scene_mask.filter(ImageFilter.GaussianBlur(28))
continent_x=850
continent_y=360
base.paste(continent,(continent_x,continent_y),scene_mask)

# A restrained warm inhabited glow helps the world read at small on-screen sizes.
glow=Image.new('RGBA',(W,H),(0,0,0,0))
gd=ImageDraw.Draw(glow,'RGBA')
gd.ellipse((920,470,3230,1710),fill=(255,169,104,22))
glow=glow.filter(ImageFilter.GaussianBlur(125))
base=Image.alpha_composite(base.convert('RGBA'),glow).convert('RGB')

# Polar dusk and clarity. No global blur/noise and no repeated scene fragments.
polar=Image.new('RGBA',(W,H),(0,0,0,0))
pd=ImageDraw.Draw(polar,'RGBA')
pd.rectangle((0,0,W,260),fill=(20,22,56,38))
pd.rectangle((0,H-260,W,H),fill=(18,20,48,42))
polar=polar.filter(ImageFilter.GaussianBlur(90))
base=Image.alpha_composite(base.convert('RGBA'),polar).convert('RGB')
base=ImageEnhance.Color(base).enhance(1.05)
base=ImageEnhance.Contrast(base).enhance(1.045)
base=base.filter(ImageFilter.UnsharpMask(radius=.58,percent=112,threshold=2))

# Exact equirectangular seam. Both edges remain ocean, so no Hearthlands scene content
# is duplicated across the join.
band=56
left=base.crop((0,0,band,H))
right=base.crop((W-band,0,W,H))
seam=Image.blend(left,right,.5)
base.paste(seam,(0,0))
base.paste(seam,(W-band,0))

OUT.parent.mkdir(parents=True,exist_ok=True)
base.save(OUT,'WEBP',quality=97,method=6)
print(OUT,Image.open(OUT).size)
