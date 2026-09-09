from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
import base64, json, math, zlib
import numpy as np

NAMES = ['hearthlands','roadlands','littoral','institutional','river']
TARGET = (1536, 768)
ROOT = Path('assets/territory-planets')
GRID_ROOT = ROOT / 'reference-grid-parts'

PALETTES = {
    'hearthlands': ((28, 78, 58), (111, 139, 72), (56, 135, 148), (232, 151, 92)),
    'roadlands': ((83, 50, 38), (167, 108, 53), (46, 101, 128), (235, 171, 76)),
    'littoral': ((13, 58, 103), (34, 117, 132), (68, 184, 188), (210, 191, 128)),
    'institutional': ((45, 56, 77), (103, 116, 128), (49, 101, 134), (220, 193, 135)),
    'river': ((30, 83, 69), (82, 139, 84), (54, 144, 158), (217, 164, 83)),
}


def periodic_noise(h: int, w: int, seed: int, octaves: int = 5) -> np.ndarray:
    rng = np.random.default_rng(seed)
    y = np.linspace(0, 1, h, endpoint=False)[:, None]
    x = np.linspace(0, 2 * np.pi, w, endpoint=False)[None, :]
    field = np.zeros((h, w), np.float32)
    amp = 1.0
    for octave in range(octaves):
        fx = 1 + octave * 2
        fy = 1 + octave
        phase = rng.uniform(0, 2 * np.pi, 4)
        field += amp * (
            np.sin(fx * x + phase[0]) * np.cos((fy * np.pi) * y + phase[1]) +
            0.55 * np.cos((fx + 1) * x + phase[2]) * np.sin(((fy + 1) * np.pi) * y + phase[3])
        )
        amp *= 0.52
    field -= field.min()
    field /= max(field.max(), 1e-6)
    return field


def load_reference_grid(name: str) -> Image.Image | None:
    # Preferred source: one small raw-RGB base64 file per territory. These compact grids
    # preserve the broad palette/geography of the image-generation references without
    # relying on fragile binary uploads.
    path = GRID_ROOT / f'{name}.b64'
    try:
        raw = base64.b64decode(path.read_text().strip(), validate=True)
        if len(raw) != 48 * 24 * 3:
            return None
        return Image.frombytes('RGB', (48, 24), raw)
    except Exception:
        return None


def fallback_reference(name: str) -> Image.Image:
    # Deterministic full-world seed if a compact reference grid is unavailable. It preserves
    # the agreed territory identities and always covers the complete 2:1 surface.
    w, h = 384, 192
    terrain, secondary, water, glow = PALETTES[name]
    n = periodic_noise(h, w, 100 + NAMES.index(name) * 37, 6)
    m = periodic_noise(h, w, 300 + NAMES.index(name) * 53, 4)
    lat = np.linspace(-1, 1, h)[:, None]
    if name == 'littoral': land = (n + 0.20 * m) > 0.63
    elif name == 'river': land = (n + 0.15 * m - 0.06 * np.abs(lat)) > 0.45
    elif name == 'institutional': land = (n + 0.10 * m) > 0.47
    elif name == 'roadlands': land = (n + 0.08 * m) > 0.43
    else: land = (n + 0.12 * m) > 0.44
    arr = np.zeros((h, w, 3), np.float32)
    water_variation = 0.72 + 0.28 * m[..., None]
    arr[:] = np.array(water, np.float32) * water_variation
    land_mix = (0.58 + 0.42 * n)[..., None]
    arr[land] = (np.array(terrain) * land_mix + np.array(secondary) * (1 - land_mix))[land]
    # Warm inhabited pinpricks, kept tiny enough to read as settlements from orbit.
    rng = np.random.default_rng(900 + NAMES.index(name) * 61)
    img = Image.fromarray(np.clip(arr, 0, 255).astype('uint8'), 'RGB')
    draw = ImageDraw.Draw(img, 'RGBA')
    for _ in range(260 if name == 'hearthlands' else 180):
        x, y = int(rng.integers(0, w)), int(rng.integers(10, h - 10))
        if land[y, x]: draw.ellipse((x-1, y-1, x+1, y+1), fill=(*glow, 135))
    if name == 'roadlands':
        for offset in (0.18, 0.42, 0.70):
            pts=[]
            for x in range(w):
                yy=int(h*(offset + 0.08*math.sin((x/w)*2*math.pi*(1+offset*2))))
                pts.append((x, yy))
            draw.line(pts, fill=(*glow, 155), width=1)
    elif name == 'institutional':
        for cx,cy in ((96,75),(205,103),(315,65)):
            for r in (8,14,21): draw.ellipse((cx-r,cy-r,cx+r,cy+r), outline=(*glow,120), width=1)
            draw.line((cx-28,cy,cx+28,cy), fill=(*glow,110), width=1);draw.line((cx,cy-28,cx,cy+28), fill=(*glow,110), width=1)
    elif name == 'river':
        for phase in (0.0,1.7,3.4):
            pts=[]
            for x in range(w):
                yy=int(h*(0.38 + 0.11*math.sin((x/w)*2*math.pi*2+phase)))
                pts.append((x,yy))
            draw.line(pts, fill=(*water,210), width=2)
    return img


def make_texture(name: str) -> Image.Image:
    reference = load_reference_grid(name) or fallback_reference(name)
    image = reference.resize(TARGET, Image.Resampling.LANCZOS)
    # Add fine, periodic detail at output resolution so the globe does not look like a
    # blurred enlargement while still respecting the reference's broad geography.
    arr = np.asarray(image.convert('RGB'), dtype=np.float32)
    detail = periodic_noise(TARGET[1], TARGET[0], 1200 + NAMES.index(name) * 97, 7)
    detail = (detail - 0.5)[..., None]
    arr = np.clip(arr * (1.0 + 0.16 * detail) + 8.0 * detail, 0, 255)
    image = Image.fromarray(arr.astype('uint8'), 'RGB')
    image = ImageEnhance.Contrast(image).enhance(1.10)
    image = ImageEnhance.Color(image).enhance(1.08)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.1, percent=145, threshold=2))
    # Exact wrap treatment: make the first and last columns equal, then feather 36px inward.
    a = np.asarray(image, dtype=np.float32).copy(); w = a.shape[1]; sw = 36
    seam = (a[:,0,:] + a[:,-1,:]) * 0.5
    a[:,0,:] = seam; a[:,-1,:] = seam
    for i in range(1, sw):
        t=i/sw; weight=(1-t)**2; avg=(a[:,i,:]+a[:,-1-i,:])*0.5
        a[:,i,:]=a[:,i,:]*(1-weight)+avg*weight
        a[:,-1-i,:]=a[:,-1-i,:]*(1-weight)+avg*weight
    return Image.fromarray(np.clip(a,0,255).astype('uint8'),'RGB')


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    for name in NAMES:
        path = ROOT / f'{name}.webp'
        image = make_texture(name)
        image.save(path, 'WEBP', quality=88, method=6)
        with Image.open(path) as out:
            if out.size != TARGET: raise SystemExit(f'{name}: generation failed, got {out.size}')
        print(f'{name}: generated {TARGET[0]}x{TARGET[1]} · {path.stat().st_size} bytes')

if __name__ == '__main__':
    main()
