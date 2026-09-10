#!/usr/bin/env python3
"""Generate Dreamscape's corpus-derived procedural world atlas textures.

The terrain is generated from stable territory anchors rather than from the legacy raster.
Outputs:
  - assets/world-atlas-4k.webp (4096x2048)
  - assets/world-atlas-8k.webp (8192x4096, 8K vector/micro-detail pass)
  - assets/world-atlas-metadata.json
"""
from __future__ import annotations

import argparse
import json
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from scipy.ndimage import distance_transform_edt, gaussian_filter, label

SEED = 20260908
TERRITORIES = [
    {"id":"hearthlands","name":"The Hearthlands","lon":0,"lat":25,"character":"warm domestic valleys, gardens, homes and soft lights"},
    {"id":"roadlands","name":"The Roadlands","lon":36,"lat":15,"character":"roads, passes, crossings and travelling landscapes"},
    {"id":"institutional","name":"Institutional Quarter","lon":68,"lat":58,"character":"ordered highlands and formal monumental geometry"},
    {"id":"littoral","name":"Littoral Coast","lon":119,"lat":-29,"character":"islands, coves, luminous coasts and sea routes"},
    {"id":"river","name":"River Country","lon":-79,"lat":15,"character":"branching waterways, wetlands and river valleys"},
]


def noise_field(w:int,h:int,seed:int,grid:tuple[int,int],blur:float)->np.ndarray:
    rng=np.random.default_rng(seed)
    gw,gh=grid
    a=rng.normal(size=(gh,gw)).astype(np.float32)
    a=gaussian_filter(a,sigma=blur,mode=("reflect","wrap"))
    a=(a-a.min())/(a.max()-a.min()+1e-6)
    im=Image.fromarray(np.uint8(a*255)).resize((w,h),Image.Resampling.BICUBIC)
    return np.asarray(im,dtype=np.float32)/255.0


def atlas_fields(w:int,h:int):
    yy,xx=np.mgrid[0:h,0:w]
    lon=xx/w*360.0-180.0
    lat=90.0-yy/h*180.0

    def dlon(lo0):
        d=np.abs(lon-lo0)
        return np.minimum(d,360.0-d)

    def g(lo0,la0,sx,sy,amp=1.0):
        return amp*np.exp(-((dlon(lo0)/sx)**2+((lat-la0)/sy)**2)*1.8)

    n1=noise_field(w,h,SEED,(256,128),3)
    n2=noise_field(w,h,SEED+1,(512,256),2)
    n3=noise_field(w,h,SEED+2,(1024,512),1)
    noise=.48*n1+.34*n2+.18*n3

    central=g(0,24,38,27,1.10)+g(40,12,33,24,.95)+g(63,48,27,25,.72)+g(24,35,45,20,.42)
    river=g(-82,12,34,30,1.05)+g(-103,6,22,19,.45)
    institution=g(74,67,18,12,.75)
    littoral=g(122,-30,34,28,1.0)+g(149,-23,18,18,.50)+g(101,-47,19,13,.40)
    field=np.maximum.reduce([
        central+(noise-.5)*.85,
        river+(noise-.5)*.82,
        institution+(noise-.5)*.55,
        littoral+(noise-.5)*.82,
    ])
    field-=(np.abs(lat)/90.0)**2*.25
    land=(field>.56)&(np.abs(lat)<76)
    component_labels,_=label(land)
    sizes=np.bincount(component_labels.ravel())
    keep=sizes>int((w*h)*.00045)
    keep[0]=False
    land=keep[component_labels]
    land=gaussian_filter(land.astype(np.float32),sigma=.8,mode=("reflect","wrap"))>.48

    dist=distance_transform_edt(land)
    waterdist=distance_transform_edt(~land)
    e1=noise_field(w,h,SEED+3,(512,256),2)
    e2=noise_field(w,h,SEED+4,(1024,512),1)
    ridges=g(50,52,32,11,.65)+g(6,48,48,10,.48)+g(-88,37,28,9,.36)+g(125,-7,27,8,.32)
    interior=np.clip(dist/(w/42.0),0,1)
    elev=np.clip(.18+.38*e1+.20*e2+.35*interior+.36*ridges,0,1)*land

    dy,dx=np.gradient(elev)
    norm=np.sqrt(dx*dx+dy*dy+.003)
    nx=-dx/norm; ny=-dy/norm; nz=np.sqrt(np.clip(1-nx*nx-ny*ny,0,1))
    hill=np.clip(nx*(-.55)+ny*(-.42)+nz*.72,0,1)
    hill=.66+.52*hill

    fields=np.stack([
        g(0,25,42,30),g(38,12,38,27),g(70,60,28,22),g(124,-30,42,30),g(-82,15,42,30)
    ])
    weights=fields/(fields.sum(0)+1e-6)
    palettes=np.array([
        [112,109,60], [132,89,68], [83,86,122], [46,125,134], [54,104,111]
    ],dtype=np.float32)
    base=np.tensordot(weights.transpose(1,2,0),palettes,axes=([2],[0]))
    maxw=fields.max(0)[...,None]
    base=base*maxw+np.array([67,73,75],dtype=np.float32)*(1-maxw)

    moisture=noise_field(w,h,SEED+5,(512,256),2)
    fine=noise_field(w,h,SEED+6,(1024,512),1)
    bloom=np.clip(g(-8,26,26,17)*(fine>.56),0,1)
    forest=np.clip((moisture-.52)*2.3,0,.55)*(1-np.clip((elev-.72)*3,0,1))*land
    alpine=np.clip((elev-.69)/.25,0,1)*land

    land_rgb=base.copy()*hill[...,None]*(.86+.28*fine[...,None])
    land_rgb=land_rgb*(1-forest[...,None])+np.array([24,47,43],dtype=np.float32)*forest[...,None]
    land_rgb=land_rgb*(1-alpine[...,None]*.70)+np.array([186,177,200],dtype=np.float32)*alpine[...,None]*.70
    land_rgb+=bloom[...,None]*np.array([48,15,35],dtype=np.float32)
    land_rgb+=g(0,25,24,16)[...,None]*np.array([34,19,5],dtype=np.float32)

    sea=noise_field(w,h,SEED+10,(512,256),3)
    sea2=noise_field(w,h,SEED+11,(1024,512),1)
    ocean=np.empty((h,w,3),dtype=np.float32)
    ocean[...,0]=12+22*sea+12*sea2
    ocean[...,1]=24+32*sea+18*sea2
    ocean[...,2]=68+52*sea+30*sea2
    polar=np.clip((np.abs(lat)-50)/35,0,1)[...,None]
    ocean=ocean*(1-polar*.20)+np.array([51,31,91],dtype=np.float32)*polar*.20
    shallow=np.clip((18-waterdist)/18,0,1)*(~land)
    ocean=ocean*(1-shallow[...,None]*.62)+np.array([48,153,171],dtype=np.float32)*shallow[...,None]*.62

    rgb=ocean.copy()
    rgb[land]=land_rgb[land]
    coast=land&(dist<1.8)
    rgb[coast]=np.clip(rgb[coast]*1.20+np.array([20,22,24]),0,255)
    return rgb,land,elev,moisture


def xy(w:int,h:int,lon:float,lat:float)->tuple[float,float]:
    return ((lon+180.0)/360.0*w,(90.0-lat)/180.0*h)


def add_details(img:Image.Image,land:np.ndarray,elev:np.ndarray,moisture:np.ndarray,seed:int,detail_multiplier:float=1.0)->Image.Image:
    from PIL import ImageChops
    w,h=img.size
    scale=w/2048.0
    rr=random.Random(seed)
    def to_xy(lo,la): return xy(w,h,lo,la)
    fh,fw=land.shape
    def field_index(px,py):
        ix=int(np.clip(px/w*fw,0,fw-1)); iy=int(np.clip(py/h*fh,0,fh-1)); return ix,iy
    def is_land(px,py):
        ix,iy=field_index(px,py); return bool(land[iy,ix])

    # Celestial ocean currents and polar ribbons.
    ocean=Image.new("RGBA",(w,h),(0,0,0,0)); od=ImageDraw.Draw(ocean,"RGBA")
    for j,lat0 in enumerate([-65,-54,-43,37,48,60]):
        pts=[]
        for i in range(241):
            lo=-180+i*1.5
            la=lat0+2.8*math.sin(math.radians(lo*1.7+j*31))+math.sin(math.radians(lo*4.3-j*13))
            pts.append(to_xy(lo,la))
        od.line(pts,fill=(165,178,239,24),width=max(1,int(1.4*scale)))
    for lat0,col in [(72,(217,119,194,18)),(-70,(170,114,229,17))]:
        for k in range(4):
            pts=[]
            for i in range(181):
                lo=-180+i*2
                la=lat0+k*2+3*math.sin(math.radians(lo*1.35+k*51))
                pts.append(to_xy(lo,la))
            od.line(pts,fill=col,width=max(1,int((2+k)*scale)))
    img=Image.alpha_composite(img.convert("RGBA"),ocean).convert("RGB")

    # Major roads/rivers are drawn on an overlay and clipped to actual land.
    roads=[
        [(-8,28),(8,25),(25,19),(39,12),(55,9),(70,16)],
        [(12,25),(22,38),(36,46),(55,51)],
        [(25,19),(19,7),(13,-3)],[(39,12),(45,-2),(57,-12)],[(55,9),(70,1),(82,-7)]
    ]
    rivers=[
        [(-113,37),(-104,31),(-94,25),(-83,16),(-72,5),(-62,-7)],
        [(-98,38),(-91,28),(-83,16),(-78,3)],
        [(-83,16),(-93,8),(-105,0),(-114,-8)],
        [(-72,5),(-58,12),(-48,19),(-42,30)],[(-91,28),(-78,32),(-68,36)]
    ]
    layer=Image.new("RGBA",(w,h),(0,0,0,0)); ld=ImageDraw.Draw(layer,"RGBA")
    for p in roads:
        pts=[to_xy(*q) for q in p]
        ld.line(pts,fill=(235,154,88,76),width=max(2,int(5*scale)),joint="curve")
        ld.line(pts,fill=(255,224,161,155),width=max(1,int(1.35*scale)),joint="curve")
    for p in rivers:
        pts=[to_xy(*q) for q in p]
        ld.line(pts,fill=(49,175,198,100),width=max(3,int(7*scale)),joint="curve")
        ld.line(pts,fill=(176,236,241,205),width=max(1,int(2*scale)),joint="curve")
    mask=Image.fromarray(np.uint8(land)*255,"L")
    if mask.size != (w,h):
        mask=mask.resize((w,h),Image.Resampling.NEAREST)
    alpha=ImageChops.multiply(layer.getchannel("A"),mask)
    layer.putalpha(alpha)
    img=Image.alpha_composite(img.convert("RGBA"),layer).convert("RGB")

    d=ImageDraw.Draw(img,"RGBA")
    # Forest marks.
    count=int(3600*scale*detail_multiplier)
    for _ in range(count):
        x=rr.uniform(90,w-90); y=rr.uniform(90,h-90)
        if not is_land(x,y): continue
        ix,iy=field_index(x,y)
        if elev[iy,ix]>.78 or moisture[iy,ix]<.50: continue
        s=rr.uniform(1.2,3.2)*scale
        col=rr.choice([(14,32,31,110),(21,43,36,100),(34,47,37,90)])
        d.polygon([(x,y-s),(x-s*.75,y+s*.50),(x+s*.75,y+s*.50)],fill=col)
        d.line((x,y+s*.45,x,y+s),fill=(32,26,28,90),width=max(1,int(.6*scale)))

    # Mountain ridges.
    centers=[(58,52,38,17,1500),(4,48,45,18,950),(-90,38,30,14,580),(125,-6,28,13,440)]
    for lo0,la0,slo,sla,count in centers:
        for _ in range(int(count*scale*.55*detail_multiplier)):
            lo=rr.gauss(lo0,slo/2.2); la=rr.gauss(la0,sla/2.2)
            x,y=to_xy(lo,la)
            if not (0<x<w and 0<y<h and is_land(x,y)): continue
            s=rr.uniform(2.2,5.6)*scale
            d.line((x-s,y+s*.65,x,y-s,x+s,y+s*.65),fill=(222,212,230,92),width=max(1,int(.7*scale)))
            d.line((x-s*.35,y-s*.2,x,y-s,x+s*.32,y-s*.25),fill=(248,235,240,86),width=max(1,int(.55*scale)))

    # Hearthlands lights and garden-bloom constellations.
    for _ in range(int(920*scale*.72*detail_multiplier)):
        lo=rr.gauss(0,23); la=rr.gauss(25,15); x,y=to_xy(lo,la)
        if 0<x<w and 0<y<h and is_land(x,y):
            r=rr.uniform(.65,1.8)*scale
            d.ellipse((x-r,y-r,x+r,y+r),fill=(255,181,81,rr.randint(80,205)))
    for _ in range(int(280*scale*.72*detail_multiplier)):
        lo=rr.gauss(-5,18); la=rr.gauss(24,12); x,y=to_xy(lo,la)
        if 0<x<w and 0<y<h and is_land(x,y):
            r=rr.uniform(.7,2.1)*scale
            d.ellipse((x-r,y-r,x+r,y+r),fill=(236,105,168,rr.randint(45,125)))

    # Institutional geometry.
    cx,cy=to_xy(68,58)
    for rad,alpha in [(34,70),(23,110),(12,170),(4,230)]:
        rp=rad*scale
        pts=[]
        for a in range(6):
            ang=math.radians(a*60-30)
            pts.append((cx+rp*math.cos(ang),cy+rp*.75*math.sin(ang)))
        d.polygon(pts,outline=(224,207,218,alpha),width=max(1,int(1.1*scale)))
    for a in range(0,360,60):
        ex=cx+50*scale*math.cos(math.radians(a)); ey=cy+37*scale*math.sin(math.radians(a))
        d.line((cx,cy,ex,ey),fill=(215,202,222,72),width=max(1,int(scale)))

    # Littoral lantern/harbor points.
    for _ in range(int(300*scale*.62*detail_multiplier)):
        lo=rr.gauss(119,28); la=rr.gauss(-29,18); x,y=to_xy(lo,la)
        if 0<x<w and 0<y<h and is_land(x,y):
            r=rr.uniform(.6,1.5)*scale
            d.ellipse((x-r,y-r,x+r,y+r),fill=(255,209,156,rr.randint(45,135)))

    # Warm Hearthlands central bloom.
    cx,cy=to_xy(0,25)
    glow=Image.new("RGBA",(w,h),(0,0,0,0)); gd=ImageDraw.Draw(glow,"RGBA")
    for rad,a in [(38,14),(24,26),(14,52),(5,160)]:
        rp=rad*scale
        gd.ellipse((cx-rp,cy-rp,cx+rp,cy+rp),fill=(255,145,80,a))
    glow=glow.filter(ImageFilter.GaussianBlur(radius=max(2,7*scale)))
    img=Image.alpha_composite(img.convert("RGBA"),glow).convert("RGB")
    return img


def build(output_dir:Path):
    output_dir.mkdir(parents=True,exist_ok=True)
    # Memory-conscious design: terrain fields are generated procedurally at 2048x1024.
    # 4K and 8K textures receive independent native vector/micro-detail passes, so fine
    # geography is not inherited from the legacy raster or merely enlarged pixels.
    fw,fh=2048,1024
    rgb,land,elev,moisture=atlas_fields(fw,fh)
    base=Image.fromarray(np.uint8(np.clip(rgb,0,255)),"RGB")
    base=add_details(base,land,elev,moisture,SEED+100,1.0)
    base=base.filter(ImageFilter.UnsharpMask(radius=1.0,percent=125,threshold=2))

    atlas4=base.resize((4096,2048),Image.Resampling.LANCZOS)
    atlas4=add_details(atlas4,land,elev,moisture,SEED+500,0.62)
    atlas4=atlas4.filter(ImageFilter.UnsharpMask(radius=1.25,percent=130,threshold=2))
    atlas4=ImageEnhance.Contrast(atlas4).enhance(1.05)
    atlas4=ImageEnhance.Color(atlas4).enhance(1.08)
    path4=output_dir/"world-atlas-4k.webp"
    atlas4.save(path4,"WEBP",quality=95,method=6)

    atlas8=atlas4.resize((8192,4096),Image.Resampling.LANCZOS)
    atlas8=add_details(atlas8,land,elev,moisture,SEED+900,0.38)
    atlas8=atlas8.filter(ImageFilter.UnsharpMask(radius=1.35,percent=115,threshold=2))
    path8=output_dir/"world-atlas-8k.webp"
    atlas8.save(path8,"WEBP",quality=93,method=5)

    metadata={
        "generator":"tools/generate_world_atlas.py",
        "seed":SEED,
        "sourcePolicy":"Generated from stable dream-corpus territory anchors; does not upscale or reuse the legacy world raster.",
        "terrainField":"2048x1024 procedural field with independent 4K and 8K vector/micro-detail passes",
        "outputs":{"4k":{"path":str(path4),"width":4096,"height":2048,"microDetail":"native 4K pass"},"8k":{"path":str(path8),"width":8192,"height":4096,"microDetail":"native 8K pass"}},
        "territories":TERRITORIES,
    }
    (output_dir/"world-atlas-metadata.json").write_text(json.dumps(metadata,indent=2)+"\n",encoding="utf-8")
    print("built",path4,path8)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output-dir",default="assets")
    args=parser.parse_args()
    build(Path(args.output_dir))

if __name__=="__main__":
    main()
