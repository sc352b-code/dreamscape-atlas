# Dreamscape Territory Layer v1

## Purpose

Territory Layer v1 is the reusable layer between the rotating planetary atlas and individual dream places/symbols. Each territory resolves into a beautiful flat map that remains stylistically related to its planet while becoming more corpus-specific.

The flat map is artwork first: major places and corpus-derived symbols are painted into the scene rather than imposed as a heavy interface. Interaction reveals meaning without overwhelming the image with labels.

## Core experience

Planet → cinematic approach → flat territory map → zoom/pan and discover → place/symbol tarot detail → return to the exact map view.

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
8. Artwork must be authored at sufficient native resolution/detail to support close exploration without obvious softness or pixelation at intended maximum zoom.

## Map coordinates

Interactive coordinates are normalized against the flat-map artwork:

- `x = 0` left edge, `x = 1` right edge
- `y = 0` top edge, `y = 1` bottom edge

This keeps interaction independent of image pixel dimensions and responsive layout.

## UI behavior

### Opening from a planet

A territory is entered by selecting its planet. The runtime should preserve the existing celestial approach language, then transition from the spherical view into the approved flat-map scene. The transition implementation must be reusable across territories and configurable rather than territory-specific.

The map opens at the manifest's `zoom.default` value and its default centered framing unless a preserved territory view exists for the current session.

### Zoom and pan

Zoom is a core exploration behavior, not merely image magnification. It must support both visual enlargement and semantic disclosure of interactive objects.

The manifest defines:

- `zoom.min`: farthest permitted view;
- `zoom.max`: closest permitted view;
- `zoom.default`: entry/reset view;
- `zoom.stages.overview`: whole-territory reading;
- `zoom.stages.explore`: major-place and intermediate-detail exploration;
- `zoom.stages.detail`: close symbol and fine-detail exploration.

The exact numerical values are territory-configurable. They must follow a sensible ascending relationship: `min <= default`, and overview < explore < detail <= max.

Pan is enabled once the artwork is enlarged beyond the viewport. Dragging/touch movement pans the map. By default, pan is clamped to the artwork so users cannot lose the map in empty space. A small configured overscroll may be used for softness, but it should spring/clamp back into valid bounds.

Supported controls should be configured in the territory manifest and may include:

- subtle + / − buttons;
- mouse wheel / trackpad zoom;
- pinch zoom on touch devices;
- double-click / double-tap zoom toward the interaction point;
- drag-to-pan;
- reset/recenter.

Controls must be visually quiet and secondary to the artwork. The territory map must not look like GIS software or a conventional web map.

Zoom should focus toward the pointer/touch focal point where practical rather than always scaling from the center. Panning should remain smooth and inertia, if used, must be restrained rather than game-like.

### Semantic zoom activation

Every interactive place or symbol may specify a `visibleFromZoom` threshold.

Under the default `threshold` activation policy:

- objects below their threshold remain visually present if painted into the artwork, but their interactive hotspot is inactive and no hover label is shown;
- when the threshold is reached, the hotspot becomes active;
- the underlying art itself must never abruptly pop in solely because a hotspot activates.

This distinction is critical: semantic zoom changes **discoverability and interaction**, not the integrity of the painted scene.

Suggested behavior by stage:

- **overview**: appreciate the whole composition; only major territory-scale places or deliberately important anchors may be active;
- **explore**: major places become selectable and more local details become discoverable;
- **detail**: smaller places and dense symbol hotspots become active for Where's-Wally-style searching.

A future `progressive` activation policy may support smoothly increasing affordance strength, but v1 must work fully with threshold activation.

### Hovering

Desktop/pointer devices:

- hovering an active interactive place or symbol may create a subtle visual response such as glow, focus, or cursor change;
- a short name label may appear only when `hoverLabel` is enabled;
- hover must not permanently clutter the artwork;
- inactive hotspots below their semantic zoom threshold must not reveal themselves on hover.

Touch devices:

- no interaction may depend on hover;
- first tap should open or focus an active interactive object according to the runtime interaction policy.

### Clicking / tapping

Selecting an active place or symbol opens its referenced tarot card. The clicked artwork remains conceptually anchored to the map; the user should not feel transported into an unrelated generic modal system.

If an object is still below its semantic zoom threshold, clicking/tapping its painted location should continue normal map exploration rather than opening its tarot.

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

### Back behavior and view-state preservation

Back is hierarchical:

1. tarot open → Back closes tarot and returns to the same map position and zoom;
2. About open → Back closes About and returns to the same map position and zoom;
3. map open → Back returns to the territory planet/cosmos state;
4. Escape follows the same nearest-parent rule on keyboard-capable devices.

When `zoom.preserveViewState` is true, opening and closing tarot/About must preserve zoom and pan exactly. The user should be able to inspect something, close it, and continue searching from the same patch of artwork.

Reset/recenter returns to `zoom.default` and the territory's default framing. Leaving the territory for the cosmos may clear the transient view state unless the product later chooses to persist it across territory visits.

## Semantic zoom and artwork completeness

Semantic zoom must never be used to conceal missing corpus-derived content. All approved, corpus-evidenced places and symbols assigned to a territory must be represented in the authored flat-map scene and registered in the territory package. Zoom thresholds only govern when they become interactively discoverable.

This is especially important for Hearthlands: the final artwork should function as a beautiful dense scene in which the complete approved Hearthlands place-and-symbol inventory is deliberately embedded, with enough native detail to reward close inspection.

## Corpus and privacy rules

Raw dreams, identifiable source material, and detailed evidence remain private. Public runtime manifests contain only approved derived material.

Every place, symbol and tarot object carries evidence references and privacy classification so the pipeline can trace a runtime interpretation back to private derivation without publishing source text.

Unknown counts remain unknown. Territory Layer v1 must never infer or fabricate occurrence/frequency counts simply to populate a card.

## Engine rule

Every bespoke territory implementation must improve both:

1. the current reference world;
2. the reusable Territory Layer engine.

Hearthlands is the first reference implementation, not a special-case architecture.
