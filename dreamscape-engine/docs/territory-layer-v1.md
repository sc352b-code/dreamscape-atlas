# Dreamscape Territory Layer v1

## Purpose

Territory Layer v1 is the reusable layer between the rotating planetary atlas and individual dream places/symbols. Each territory resolves into a beautiful flat map that remains stylistically related to its planet while becoming more corpus-specific.

The flat map is artwork first: major places and corpus-derived symbols are painted into the scene rather than imposed as a heavy interface. Interaction reveals meaning without overwhelming the image with labels.

## Core experience

Planet → cinematic approach → flat territory map → discover place/symbol → tarot detail → return to map.

Each territory also exposes an About view explaining what the territory represents, how it was derived from the corpus, and what evidence supports it.

## Package structure

Each territory should ultimately live under:

`worlds/<world-id>/territories/<territory-id>/`

Recommended contents:

- `territory-manifest.json`
- `places.json` or embedded place objects
- `symbols.json` or embedded symbol objects
- `tarot/`
- `assets/`
- `validation/`

The first implementation will be Hearthlands.

## Artwork principles

1. Flat-map artwork should feel like a closer view of the same world as the approved planet texture.
2. Palette, atmosphere and painterly language should remain related to the source planet.
3. Major places found in corpus analysis should be integrated into the painted geography.
4. Territory-associated symbols should be embedded into the artwork in a discoverable, Where's-Wally-like mode.
5. Labels must remain minimal, selective or absent. The scene should communicate primarily through art.
6. Interactive hit areas are separate from painted labels: objects can be clickable without visible UI chrome.
7. Specific place/symbol meaning belongs in tarot details, not as text pasted across the map.

## Map coordinates

Interactive coordinates are normalized against the flat-map artwork:

- `x = 0` left edge, `x = 1` right edge
- `y = 0` top edge, `y = 1` bottom edge

This keeps interaction independent of image pixel dimensions and responsive layout.

## UI behavior

### Opening from a planet

A territory is entered by selecting its planet. The runtime should preserve the existing celestial approach language, then transition from the spherical view into the approved flat-map scene. The transition implementation must be reusable across territories and configurable rather than territory-specific.

### Hovering

Desktop/pointer devices:

- hovering an interactive place or symbol may create a subtle visual response such as glow, focus, or cursor change;
- a short name label may appear only when `hoverLabel` is enabled;
- hover must not permanently clutter the artwork.

Touch devices:

- no interaction may depend on hover;
- first tap should open or focus the interactive object according to the runtime interaction policy.

### Clicking / tapping

Selecting a place or symbol opens its referenced tarot card. The clicked artwork remains conceptually anchored to the map; the user should not feel transported into an unrelated generic modal system.

### Tarot details

Tarot cards are reusable for places and symbols. They contain:

- beautiful subject artwork;
- title;
- concise interpretation/basic analysis;
- corpus-grounding information;
- related items where supported by the corpus.

Tarot content must distinguish derived evidence from interpretation and must not fabricate missing corpus counts or evidence.

### About this territory

Each map exposes a quiet, secondary `About this territory` action. It should open territory provenance information without dominating the artwork.

The About view should explain:

- what the territory represents;
- how it was derived;
- source-corpus basis at a privacy-safe level;
- major place/symbol patterns contributing to it;
- known counts only when they are genuinely established and approved for display.

### Back behavior

Back is hierarchical:

1. tarot open → Back closes tarot and returns to the same map position/zoom;
2. About open → Back closes About and returns to the same map position/zoom;
3. map open → Back returns to the territory planet/cosmos state;
4. Escape follows the same nearest-parent rule on keyboard-capable devices.

Map pan/zoom state should be preserved when closing tarot/About details.

## Semantic zoom

The runtime should support progressive disclosure rather than showing every hotspot equally at all scales.

Suggested layers:

- entry: overall territory composition;
- territory: major places and only the most important symbols;
- place: more place detail and symbol discoveries;
- close: dense symbol/detail exploration.

Exact thresholds live in the territory manifest.

## Corpus and privacy rules

Raw dreams, identifiable source material, and detailed evidence remain private. Public runtime manifests contain only approved derived material.

Every place, symbol and tarot object carries evidence references and privacy classification so the pipeline can trace a runtime interpretation back to private derivation without publishing source text.

Unknown counts remain unknown. Territory Layer v1 must never infer or fabricate occurrence/frequency counts simply to populate a card.

## Engine rule

Every bespoke territory implementation must improve both:

1. the current reference world;
2. the reusable Territory Layer engine.

Hearthlands is the first reference implementation, not a special-case architecture.
