from __future__ import annotations

from pathlib import Path
from PIL import Image
import hashlib
import numpy as np

NAMES = ['hearthlands','roadlands','littoral','institutional','river']
ROOT = Path('assets/territory-planets')
MIN_SIZE = (1536, 768)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate_texture(name: str, path: Path) -> tuple[str, float, float]:
    if not path.exists():
        raise SystemExit(f'{name}: missing {path}')
    with Image.open(path) as image:
        image = image.convert('RGB')
        w, h = image.size
        if w < MIN_SIZE[0] or h < MIN_SIZE[1]:
            raise SystemExit(f'{name}: texture too small: {w}x{h}; need at least {MIN_SIZE[0]}x{MIN_SIZE[1]}')
        if abs((w / h) - 2.0) > 0.01:
            raise SystemExit(f'{name}: texture is not 2:1 equirectangular: {w}x{h}')
        arr = np.asarray(image, dtype=np.float32)

    # 360-degree coverage proxy: every 30-degree longitude sector must contain readable art.
    luminance = arr.mean(axis=2)
    sector_means = []
    for i in range(12):
        x0 = int(i * arr.shape[1] / 12)
        x1 = int((i + 1) * arr.shape[1] / 12)
        sector_means.append(float(luminance[:, x0:x1].mean()))
    darkest_sector = min(sector_means)
    if darkest_sector < 18:
        raise SystemExit(f'{name}: a longitude sector is effectively blank/dark ({darkest_sector:.1f})')

    # Seam check at the actual wrap edge. The two edges need not be pixel-identical,
    # but a large discontinuity is rejected before it reaches the sphere.
    edge_diff = float(np.abs(arr[:, 0, :] - arr[:, -1, :]).mean())
    if edge_diff > 22:
        raise SystemExit(f'{name}: left/right wrap seam too strong ({edge_diff:.1f})')

    # Keep a useful amount of tonal detail; near-flat images are not acceptable planet maps.
    tonal_std = float(luminance.std())
    if tonal_std < 18:
        raise SystemExit(f'{name}: texture lacks enough tonal detail ({tonal_std:.1f})')
    return sha256(path), edge_diff, darkest_sector


def main() -> None:
    hashes = {}
    for name in NAMES:
        digest, seam, darkest = validate_texture(name, ROOT / f'{name}.webp')
        hashes[name] = digest
        print(f'{name}: OK · seam {seam:.1f} · darkest longitude sector {darkest:.1f} · {digest[:12]}')
    if len(set(hashes.values())) != len(NAMES):
        raise SystemExit('Two or more territory planets share the same binary texture')
    print('Territory planet 360° asset checks: ALL PASSED')


if __name__ == '__main__':
    main()
