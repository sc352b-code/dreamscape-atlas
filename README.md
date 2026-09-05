# Dreamscape Atlas — Enchanted Vertical Slice v1

This repository is the source of truth for the Dream Atlas vertical slice and the reusable corpus-to-world engine beneath it.

## Current slice

Home constellation → Atlas reveal → living planet → Hearthlands approach → territory descent → place → symbol → reading → return.

The browser prototype currently implements the first half of that choreography as a data-driven interaction: constellation → planet → Hearthlands descent → Hearthlands landing → return.

## Architecture rule

**World meaning is data. Enchantment is presentation.**

Nothing in the rendering layer should need to know that a territory is called “Hearthlands”. The engine emits a `WorldModel`; the UI renders any valid model.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Generate a world model from a corpus

```bash
npm run world:build
```

This writes `worlds/generated-world.json` from `corpora/reference-corpus.json`.

## Repository map

- `corpora/` — normalized dream-corpus inputs
- `engine/` — corpus → motifs → territories/places/symbols → world model
- `schemas/` — contracts for corpus/world data
- `worlds/` — reference and generated world configurations
- `src/` — visual renderer and motion choreography
- `docs/` — art/motion bible and pipeline decisions
- `tests/` — deterministic engine tests

## Product principle

Dreamscape is not a conventional dream-analysis UI with fantasy decoration. The world itself is the interface, and its visual evolution must remain traceable to the dream corpus.
