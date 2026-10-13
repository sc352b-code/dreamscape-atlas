# Dreamscape Atlas — Enchanted Vertical Slice v1

## Current development: Dreamscape shared application

The `codex/dreamscape-foundations` branch adds the Home Hub, exact nine-room navigation,
the original shared living cosmos, encrypted local dream/waking journals, evidence-grounded
Oracle studies, saved history, favourites and the preserved five rotating planets.
It is a development stage, not a production release or completed nine-room product.

Run `npm run dev` (Node 24; no npm dependencies). The built-in server listens on port 4173;
use `PORT=4174 npm run dev` when that port is occupied. Begin with the labelled reference
reading, or create a passphrase-protected journal to record your own dreams. Local journals
are not cloud accounts and have no remote backup. Export regular backups.

Run `npm test` for the domain/encryption/asset tests. For browser integration checks with
Playwright Python installed, start `PORT=4174 npm run dev`, then run
`python tests/browser_foundations.py`. No certificate verification bypass is permitted;
Chromium must be able to use the environment's installed proxy trust database.

See [the complete implementation plan](docs/IMPLEMENTATION_PLAN.md) and
[current handover](docs/CURRENT_HANDOVER.md). The historical prototype description below
is retained for continuity; the current room name is DREAM WORLD.

This repository is the source of truth for the Dream Atlas vertical slice and the reusable corpus-to-world engine beneath it.

## Current slice

Home constellation → Atlas reveal → living planet → Hearthlands approach → territory descent → place → symbol → reading → return.

The browser prototype currently implements the first half of that choreography as a data-driven interaction: constellation → planet → Hearthlands descent → Hearthlands landing → return.

## Architecture rule

**World meaning is data. Enchantment is presentation.**

Nothing in the rendering layer should need to know that a territory is called “Hearthlands”. The engine emits a `WorldModel`; the UI renders any valid model.

## Run locally

```bash
npm run dev
```

The application uses the built-in Node static server, not Vite.

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
