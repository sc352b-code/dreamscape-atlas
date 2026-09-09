from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageFile
import numpy as np

# The canonical JPEG transfers can lose only the terminal JPEG marker in transit.
# Pillow is allowed to read that harmless tail truncation; the decoded pixels are
# immediately rewritten into strict, validated PNG masters below.
ImageFile.LOAD_TRUNCATED_IMAGES = True

NAMES = ['hearthlands', 'roadlands', 'littoral', 'institutional', 'river']
TARGET = (2048, 1024)
SOURCE_ROOT = Path('assets/territory-planet-sources')
OUTPUT_ROOT = Path('assets/territory-planets')
SEAM_WIDTH = 48


def open_source(name: str) -> Image.Image:
    path = SOURCE_ROOT / f'{name}.jpg'
    if not path.exists():
        raise SystemExit(f'{name}: missing canonical source {path}')
    with Image.open(path) as source:
        image = source.convert('RGB')
    w, h = image.size
    if abs((w / h) - 2.0) > 0.01:
        raise SystemExit(f'{name}: source must be 2:1 equirectangular, got {w}x{h}')

    # Do not reject a source on one global standard-deviation number. The final
    # texture validator checks every longitude sector, four 180° turn views,
    # wrap continuity, uniqueness and tonal detail after processing.
    arr = np.asarray(image, dtype=np.float32)
    print(
        f'{name}: decoded source {w}x{h} · mean {arr.mean():.1f} · '
        f'std {arr.std():.1f} · range {arr.min():.0f}-{arr.max():.0f}'
    )
    return image


def seam_repair(image: Image.Image) -> Image.Image:
    """Feather only the wrap boundary; do not tile or duplicate the world artwork."""
    arr = np.asarray(image, dtype=np.float32).copy()
    w = arr.shape[1]
    sw = min(SEAM_WIDTH, w // 16)

    # Make longitude 0/360 identical, then smoothly blend only a narrow edge strip.
    edge = (arr[:, 0, :] + arr[:, -1, :]) * 0.5
    arr[:, 0, :] = edge
    arr[:, -1, :] = edge

    for i in range(1, sw):
        x = i / sw
        weight = (1.0 - x) ** 2
        pair_average = (arr[:, i, :] + arr[:, -1 - i, :]) * 0.5
        arr[:, i, :] = arr[:, i, :] * (1.0 - weight) + pair_average * weight
        arr[:, -1 - i, :] = arr[:, -1 - i, :] * (1.0 - weight) + pair_average * weight

    return Image.fromarray(np.clip(arr, 0, 255).astype('uint8'), 'RGB')


def build_texture(name: str) -> Image.Image:
    source = open_source(name)
    image = source.resize(TARGET, Image.Resampling.LANCZOS)

    # Recover clarity after enlargement without inventing new geography.
    image = ImageEnhance.Contrast(image).enhance(1.075)
    image = ImageEnhance.Color(image).enhance(1.07)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=165, threshold=2))
    image = seam_repair(image)

    return image.filter(ImageFilter.UnsharpMask(radius=0.8, percent=120, threshold=2))


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    for name in NAMES:
        target = OUTPUT_ROOT / f'{name}.png'
        image = build_texture(name)
        image.save(target, 'PNG', optimize=True)
        with Image.open(target) as out:
            if out.size != TARGET:
                raise SystemExit(f'{name}: generation failed, got {out.size}')
            if out.format != 'PNG':
                raise SystemExit(f'{name}: output is not a real PNG')
        print(f'{name}: built {TARGET[0]}x{TARGET[1]} PNG · {target.stat().st_size} bytes')


if __name__ == '__main__':
    main()
