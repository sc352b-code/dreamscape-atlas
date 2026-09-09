from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

NAMES = ['hearthlands','roadlands','littoral','institutional','river']
TARGET = (1536, 768)
ROOT = Path('assets/territory-planets')


def periodicize(image: Image.Image, seam_width: int = 42) -> Image.Image:
    arr = np.asarray(image.convert('RGB'), dtype=np.float32).copy()
    h, w, _ = arr.shape
    seam_width = min(seam_width, w // 8)
    for i in range(seam_width):
        t = (i + 1) / (seam_width + 1)
        # Pair corresponding pixels from the two wrap edges and converge gently toward
        # their average only at the actual seam; interior detail stays untouched.
        a = arr[:, i, :].copy()
        b = arr[:, w - 1 - i, :].copy()
        avg = (a + b) * 0.5
        edge_weight = (1.0 - t) ** 2
        arr[:, i, :] = a * (1 - edge_weight) + avg * edge_weight
        arr[:, w - 1 - i, :] = b * (1 - edge_weight) + avg * edge_weight
    return Image.fromarray(np.clip(arr, 0, 255).astype('uint8'), 'RGB')


def upgrade(path: Path) -> None:
    with Image.open(path) as source:
        image = source.convert('RGB')
    image = image.resize(TARGET, Image.Resampling.LANCZOS)
    # Increase local readability at small globe sizes without introducing crunchy halos.
    image = ImageEnhance.Contrast(image).enhance(1.075)
    image = ImageEnhance.Color(image).enhance(1.06)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.25, percent=155, threshold=2))
    image = periodicize(image)
    image.save(path, 'WEBP', quality=88, method=6)


def main() -> None:
    for name in NAMES:
        path = ROOT / f'{name}.webp'
        if not path.exists():
            raise SystemExit(f'Missing texture: {path}')
        upgrade(path)
        with Image.open(path) as out:
            if out.size != TARGET:
                raise SystemExit(f'{name}: upgrade failed, got {out.size}')
        print(f'{name}: {TARGET[0]}x{TARGET[1]} · {path.stat().st_size} bytes')


if __name__ == '__main__':
    main()
