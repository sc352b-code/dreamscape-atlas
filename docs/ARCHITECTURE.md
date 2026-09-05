# Architecture

## Layers

1. **Corpus layer** — normalized dreams, dates, places, motifs, emotions, numinous markers and evidence spans.
2. **Interpretation layer** — recurrence and affinity scoring. No visual code.
3. **World model layer** — territories, places, symbols, links, visual parameters and provenance.
4. **Presentation layer** — camera, atmosphere, particles, transitions, interaction and sound cues.
5. **Persistence layer (next)** — versioned world snapshots so worlds evolve rather than regenerate incoherently.

## Stable contract

The key reusable object is `WorldModel`:

- `world.id`
- `world.title`
- `world.seed`
- `territories[]`
- each territory contains `places[]`, `symbols[]`, evidence references and visual parameters
- `links[]` represent relationships between nodes
- `provenance` records which engine version generated the model

## Separation rule

The renderer is forbidden from branching on user-specific names (`if territory.name === 'Hearthlands'`). It may branch only on generic properties such as `palette`, `atmosphere`, `energy`, `terrain`, and `motionPreset`.

## Evolution

Later, each corpus update should produce a delta against the previous world model:

- strengthen existing nodes when evidence recurs
- create new nodes only above novelty/confidence thresholds
- fade rather than immediately delete low-support nodes
- preserve stable node IDs to maintain continuity
