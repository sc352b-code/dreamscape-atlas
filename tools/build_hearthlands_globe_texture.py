#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets'/'hearthlands-flatmap.png'
OUT=ROOT/'assets'/'hearthlands-globe-4k.webp'
W,H=4096,2048

src=Image.open(SRC).convert('RGB')
src=ImageEnhance.Color(src).enhance(1.045)
src=ImageEnhance.Contrast(src).enhance(1.04)
src=src.filter(ImageFilter.UnsharpMask(radius=.65,percent=120,threshold=2))

# Hearthlands globe v3: one coherent planetary surface, never a tiled copy of the map.
# The canonical flatmap appears once as the visual DNA of the inhabited continent. The
# remaining sphere is ocean, broad painterly terrain and a few unique, non-repeated edge
# fragments so rotation reveals a world rather than duplicated houses/gardens.
stat=ImageStat.Stat(src.resize((64,64),Image.Resampling.BILINEAR))
avg=tuple(round(v) for v in stat.mean[:3])

# Deep teal/indigo ocean field with large, soft celestial washes. These are deliberately
# broad enough to read as planetary colour variation rather than texture noise.
base=Image.new('RGB',(W,H),(13,38,55))
washes=Image.new('RGBA',(W,H),(0,0,0,0))
draw=ImageDraw.Draw(washes,'RGBA')
draw.ellipse((160,-180,2200,1320),fill=(34,91,85,78))
draw.ellipse((1860,260,4300,2130),fill=(34,58,98,72))
draw.ellipse((760,900,3350,2400),fill=(71,52,90,42))
washes=washes.filter(ImageFilter.GaussianBlur(240))
base=Image.alpha_composite(base.convert('RGBA'),washes).convert('RGB')

# Build one main Hearthlands continent. The whole source painting is used exactly once,
# scaled down so houses/gardens become settlement-scale details when seen from orbit.
continent_w=1680
continent_h=round(continent_w*src.height/src.width)
continent=src.resize((continent_w,continent_h),Image.Resampling.LANCZOS)
continent=ImageEnhance.Color(continent).enhance(1.025)
continent=continent.filter(ImageFilter.UnsharpMask(radius=.55,percent=105,threshold=2))

mask=Image.new('L',(continent_w,continent_h),0)
md=ImageDraw.Draw(mask)
# Irregular coast, intentionally inset from the source rectangle so it never reads as a
# rectangular photograph pasted onto the sphere.
coast=[
    (96,338),(142,188),(286,88),(514,46),(748,78),(944,42),(1194,112),
    (1450,182),(1588,320),(1640,508),(1578,696),(1438,804),(1218,858),
    (1018,824),(812,884),(596,828),(392,802),(224,706),(118,558)
]
md.polygon(coast,fill=255)
# Soften only the coastline itself; the actual painted interior remains sharp.
mask=mask.filter(ImageFilter.GaussianBlur(18))

continent_x=1110
continent_y=555
base.paste(continent,(continent_x,continent_y),mask)

# Three small satellite islands use unique source crops exactly once each. None contains
# the central Family Home, preventing the repeated-house effect while keeping the same
# authored palette and brush language around the rest of the planet.
unique_crops=[
    (0,0,440,300,620,1020,360),
    (1190,0,1672,330,3020,760,330),
    (1100,590,1672,941,3260,1330,390),
]
for left,top,right,bottom,x,y,width in unique_crops:
    crop=src.crop((left,top,right,bottom))
    height=round(width*crop.height/crop.width)
    island=crop.resize((width,height),Image.Resampling.LANCZOS)
    imask=Image.new('L',(width,height),0)
    idraw=ImageDraw.Draw(imask)
    idraw.ellipse((16,10,width-16,height-10),fill=245)
    imask=imask.filter(ImageFilter.GaussianBlur(15))
    base.paste(island,(x,y),imask)

# Planet-scale warm inhabited glow: broad, low-opacity light only over the main landmass.
glow=Image.new('RGBA',(W,H),(0,0,0,0))
gd=ImageDraw.Draw(glow,'RGBA')
gd.ellipse((continent_x+180,continent_y+170,continent_x+continent_w-120,continent_y+continent_h-70),fill=(255,177,105,24))
glow=glow.filter(ImageFilter.GaussianBlur(110))
base=Image.alpha_composite(base.convert('RGBA'),glow).convert('RGB')

# Polar dusk and a restrained clarity pass. No global blur and no repeated image tiles.
polar=Image.new('RGBA',(W,H),(0,0,0,0))
pd=ImageDraw.Draw(polar,'RGBA')
pd.rectangle((0,0,W,310),fill=(20,22,56,42))
pd.rectangle((0,H-300,W,H),fill=(18,20,48,46))
polar=polar.filter(ImageFilter.GaussianBlur(90))
base=Image.alpha_composite(base.convert('RGBA'),polar).convert('RGB')
base=ImageEnhance.Color(base).enhance(1.045)
base=ImageEnhance.Contrast(base).enhance(1.045)
base=base.filter(ImageFilter.UnsharpMask(radius=.58,percent=110,threshold=2))

# Exact equirectangular seam. Because both edges are ocean, this adjustment is visually
# quiet and does not duplicate any Hearthlands scene content.
band=48
left=base.crop((0,0,band,H))
right=base.crop((W-band,0,W,H))
seam=Image.blend(left,right,.5)
base.paste(seam,(0,0))
base.paste(seam,(W-band,0))

OUT.parent.mkdir(parents=True,exist_ok=True)
base.save(OUT,'WEBP',quality=97,method=6)
print(OUT,Image.open(OUT).size)
