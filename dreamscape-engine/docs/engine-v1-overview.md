# Dreamscape World Engine v1

## Development rule
Every feature should improve both the current reference world and the reusable engine.

## Pipeline
1. **Corpus ingestion** — private source files are normalized behind a privacy boundary.
2. **Corpus modelling** — derive recurring places, environments, symbols, movement, relationships and recurrence.
3. **Territory formation** — infer or author larger territories from the corpus; territory names are corpus-specific, not hard-coded globally.
4. **Territory briefing** — create structured meaning, palette, geography, include/avoid and evidence summaries.
5. **Planet texture generation** — one standalone text-free 2:1 equirectangular texture per territory.
6. **Texture QA** — dimensions, uniqueness, empty sectors, seam continuity, longitudinal-strip regression and hash validation.
7. **Atlas assembly** — reusable Three.js renderer consumes world/runtime configuration.
8. **User approval checkpoint** — freeze the rotating planetary layer before deeper work.
9. **Territory flat-map generation** — derive closer maps and increasingly literal corpus-grounded places.
10. **Place/symbol layers** — places, symbols, readings, statistics and onward experiences use the same world model.

## Reference implementation
`worlds/reference-world/` is the first approved World Engine package. It is an engine output, not the engine itself.

## Architectural boundary
Reusable machinery belongs under `dreamscape-engine/` and generic runtime modules. Corpus-specific public-safe configuration belongs under `worlds/<world-id>/`. Raw or identifying corpus material must never be copied into public runtime assets.

## Planetary texture rules learned from v1
- Generate one territory asset at a time; reject poster/collage outputs.
- Use complete equirectangular surfaces; do not rely on repaired stitched maps.
- Validate before mounting.
- Establish a corpus-specific style anchor and preserve family resemblance without making territories near-duplicates.
- Never silently promote rejected generations.
- Freeze visually approved textures by hash.

## Next engine-backed milestone
Hearthlands flat-map refinement becomes the first territory-level engine output. The flat-map artifact should be referenced from the Hearthlands manifest entry rather than wired as a one-off feature.
