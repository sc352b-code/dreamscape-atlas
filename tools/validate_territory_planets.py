from __future__ import annotations

from pathlib import Path
from PIL import Image
import hashlib
import numpy as np

NAMES = ['hearthlands', 'roadlands', 'littoral', 'institutional', 'river']
ROOT = Path('assets/territory-planets')
EXPECTED_SIZE = (2048, 1024)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def circular_window(arr: np.ndarray, center: int, width: int) -> np.ndarray:
    half = width // 2
    indices = np.arange(center - half, center + half) % arr.shape[1]
    return arr[:, indices]


def validate_texture(name: str, path: Path) -> tuple[str, float, float, list[float]]:
    if not path.exists():
        raise SystemExit(f'{name}: missing {path}')

    with Image.open(path) as image:
        if image.format != 'PNG':
            raise SystemExit(f'{name}: expected real PNG data, got {image.format}')
        if image.size != EXPECTED_SIZE:
            raise SystemExit(f'{name}: expected {EXPECTED_SIZE[0]}x{EXPECTED_SIZE[1]}, got {image.size[0]}x{image.size[1]}')
        if image.mode == 'RGBA':
            alpha = np.asarray(image.getchannel('A'), dtype=np.uint8)
            if alpha.min() != 255:
                raise SystemExit(f'{name}: texture contains transparent/blank pixels')
        image = image.convert('RGB')
        arr = np.asarray(image, dtype=np.float32)

    if abs((arr.shape[1] / arr.shape[0]) - 2.0) > 0.001:
        raise SystemExit(f'{name}: texture is not 2:1 equirectangular')

    luminance = arr.mean(axis=2)

    # Full-surface proxy: no 15-degree longitude sector may collapse into a blank/dark strip.
    sector_means = []
    for i in range(24):
        x0 = int(i * arr.shape[1] / 24)
        x1 = int((i + 1) * arr.shape[1] / 24)
        sector_means.append(float(luminance[:, x0:x1].mean()))
    darkest_sector = min(sector_means)
    if darkest_sector < 45:
        raise SystemExit(f'{name}: a longitude sector is effectively blank/dark ({darkest_sector:.1f})')

    # 360-degree view proxy: inspect the half-world visible at 0/90/180/270 degree yaw.
    quarter = arr.shape[1] // 4
    hemisphere_means = []
    for center in (0, quarter, quarter * 2, quarter * 3):
        visible = circular_window(luminance, center, arr.shape[1] // 2)
        hemisphere_means.append(float(visible.mean()))
        if float(visible.mean()) < 55:
            raise SystemExit(f'{name}: a rendered hemisphere proxy becomes too dark ({float(visible.mean()):.1f})')
        if float(visible.std()) < 15:
            raise SystemExit(f'{name}: a rendered hemisphere proxy lacks readable map detail ({float(visible.std()):.1f})')

    # The longitude wrap itself must be visually continuous.
    edge_diff = float(np.abs(arr[:, 0, :] - arr[:, -1, :]).mean())
    if edge_diff > 8:
        raise SystemExit(f'{name}: left/right wrap seam too strong ({edge_diff:.1f})')

    tonal_std = float(luminance.std())
    if tonal_std < 18:
        raise SystemExit(f'{name}: texture lacks enough tonal detail ({tonal_std:.1f})')

    return sha256(path), edge_diff, darkest_sector, hemisphere_means


def main() -> None:
    hashes = {}
    for name in NAMES:
        digest, seam, darkest, turns = validate_texture(name, ROOT / f'{name}.png')
        hashes[name] = digest
        turn_text = '/'.join(f'{value:.1f}' for value in turns)
        print(f'{name}: OK · seam {seam:.1f} · darkest sector {darkest:.1f} · 0/90/180/270 {turn_text} · {digest[:12]}')

    if len(set(hashes.values())) != len(NAMES):
        raise SystemExit('Two or more territory planets share the same binary texture')

    print('Territory planet PNG + 360° proxy checks: ALL PASSED')


if __name__ == '__main__':
    main()
