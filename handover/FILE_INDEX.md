# Important File Index

The packaged repository snapshot contains the full branch. This file highlights the files most relevant to continuing the current pilot.

## Entry / runtime

### `index.html`
Loads the live Atlas runtime and the current development modules.

Current pilot entry modules include:

- `/src/main.js`
- `/src/v57-hearthlands-geography.js`
- `/src/family-home-pilot.js`
- `/src/family-home-approach.js`
- `/src/cosmos-ambience.js`

Styles include:

- `/src/styles.css`
- `/src/buildpass.css`
- `/src/family-home-pilot.css`
- `/src/family-home-approach.css`

## Core Atlas runtime

### `src/main.js`
Main Three.js / Atlas runtime. Handles world, Hearthlands descent, flatmap scene, interaction and core UI.

### `src/styles.css`
Primary app styling.

### `src/buildpass.css`
Later visual overrides for cosmic/flatmap behaviour.

### `src/buildpass-prelude.js`
Compatibility prelude used by the recovered runtime.

## Hearthlands geography

### `src/v57-hearthlands-geography.js`
Restores/corrects the six mapped v57 Hearthlands places including the rare Haunted 17-Bedroom Mansion.

## Family Home pilot

### `src/family-home-pilot-data.js`
Authoritative 13-symbol Family Home pilot data, six-place intersections, semantic tiers and composition coordinates.

### `src/family-home-pilot.js`
Painted-art layer + invisible hotspot layer + semantic zoom + tarot/reading opening. Missing art must not create an active hotspot.

### `src/family-home-pilot.css`
Pilot visual layer, hotspot and reader styling.

### `src/family-home-approach.js`
Explicit Family Home enter/place/close/back-out behaviour added after user feedback that semantic zoom was too hidden.

### `src/family-home-approach.css`
Approach-state styling that suppresses the overwhelming overview labels/panels and lets Family Home behave as a place rather than a generic modal on the same map.

### `src/v57-family-home-readings.js`
Mounted v57 reading adapter. Contains complete-record extracts, authored profiles for House/Water/Mum/Cat/Dog, lens evidence and tarot-art candidates.

## Family Home assets

### `assets/family-home-pilot/manifest.json`
13-symbol asset manifest with IDs, place counts, semantic zoom tiers, environmental forms, composition coordinates, expected filenames, dimensions/orientation and validation state.

### `assets/family-home-pilot/family-home-octopus-source-crop.webp`
The clean registered Family Home stream crop for regional inpainting. Not the finished symbol tile.

### `assets/family-home-pilot/OCTOPUS_INPAINT_BRIEF.md`
Exact instructions for producing the Octopus regional tile in a fresh image-only workflow or external image editor.

### Rejected file — intentionally deleted
`assets/family-home-pilot/family-home-octopus-tile.svg`

Do not restore. It was the purple cartoon/sticker seen in the failed preview screenshot.

## Audio / cosmos

### `src/cosmos-ambience.js`
Contains:

- dark cosmic spark layer
- bright occasional twinkles
- rare shooting-star scheduler
- sound toggle
- first-gesture audio start
- persisted mute state
- latest low/high alternating tone design

The earlier broadband filtered-noise layer was rejected as sounding like a vacuum cleaner. Preserve the pitched twinkle direction.

## Tests / workflows

### `tests/family-home-integrity.mjs`
Automated integrity assertions for pilot data, tarot resolution, semantic zoom, missing-art hotspot guard and glyph-overlay removal.

### `.github/workflows/family-home-integrity.yml`
Runs the Family Home integrity suite.

### `.github/workflows/build-octopus-crop.yml`
Workflow created to prepare/build the Octopus source crop through GitHub Actions when local execution was unavailable.

## General assets

### `assets/atlas-v57.jpg`
Small v57 visual reference.

### `assets/generated/`
Generated/chunked cosmic and Hearthlands asset data used by the runtime.

### `assets/data-avif/`
Chunked AVIF/world/hearth source data.

The package includes all these files even if they are not listed individually here.

## Existing project structure also packaged

- `corpora/`
- `docs/`
- `engine/`
- `assets/`
- `src/`
- `.github/`
- root README and build/source assets

Do not treat old local `/mnt/data/dreamscape-atlas` folders from previous threads as authoritative. GitHub `sc352b-code/dreamscape-atlas` is the current source of truth.