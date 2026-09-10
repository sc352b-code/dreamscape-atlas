# Exact Continuation Instructions for the Next Thread

## First action

Do not modify `main`.

Open or clone `sc352b-code/dreamscape-atlas` and work on branch:

`family-home-pilot`

Treat `fcfe2e46f0574ef782afe43234462435c25411fd` as the last runtime-behaviour checkpoint before handover docs were added.

Keep `checkpoint-family-home-8d4150d` untouched as the earlier architecture checkpoint.

Keep PR #1 draft until validation passes.

## Read these first

1. `handover/README_HANDOVER.md`
2. `handover/CURRENT_STATE.md`
3. `handover/DATA_AND_V57.md`
4. `handover/VISUAL_AUDIO_DIRECTION.md`
5. `handover/GIT_VERCEL.md`
6. `assets/family-home-pilot/manifest.json`
7. `assets/family-home-pilot/OCTOPUS_INPAINT_BRIEF.md`
8. `tests/family-home-integrity.mjs`

## Immediate next objective

Finish ONE complete Family Home pilot before touching the other 63 Hearthlands symbols.

The pilot must include:

- acceptable painterly Octopus regional tile
- Octopus visible only at intended close semantic zoom
- invisible aligned hotspot
- genuine v57 tarot artwork opening
- evidence-led reading opening
- desktop interaction
- mobile interaction
- current alternating cosmic tones tested by the user
- mute persistence
- no map/UI contamination in the painted scene

## Visual production method

Do NOT regenerate the full Hearthlands image.

Do NOT generate another transparent Octopus sprite in the long app-development context.

Preferred method:

1. use `assets/family-home-pilot/family-home-octopus-source-crop.webp`
2. in a fresh image-only conversation or external image editor, preserve the crop exactly
3. paint one subtle Octopus physically into the stream
4. no UI, text, labels, frames, glow badges, cards or icon language
5. validate against the fox benchmark
6. export seamless regional tile as `family-home-octopus-tile.webp`
7. upload that binary to `assets/family-home-pilot/`
8. update `manifest.json` to point Octopus to the real `.webp` tile and mark validation only after visual approval
9. align the hotspot to the painted creature
10. verify the tile seam disappears at place/close zoom

If the approved long-thread painterly image is available, manually upload it into the fresh thread as an important visual reference. Its generation ID was `ce2b6774-f44c-4517-a6ef-76c84dae5cd0`.

## Do not restore the rejected SVG

The deleted file `family-home-octopus-tile.svg` was visibly wrong and must stay deleted.

## Audio

Test the current `src/cosmos-ambience.js` first before changing it again.

User preference at transfer:

- no vacuum/fan/noise character
- alternating lower/higher soft piano/bell-like tones
- quiet cosmic twinkle
- long decay
- spacious and non-musical

If further tuning is needed, preserve the no-noise principle and change pitch interval/timing/envelope, not by adding broadband noise.

## Approach / semantic zoom

The user previously could not discover hidden semantic zoom.

Keep the explicit approach controls in `family-home-approach.js` / `.css`.

Desired route:

Hearthlands -> Family Home -> Place -> Look closer -> Close -> Back out / Return.

Do not fall back to an overview covered in giant place labels and a generic bottom/right panel.

## Readings

Use `src/v57-family-home-readings.js`.

Do not invent missing interpretation.

Authored v57 profiles already mounted:

- House / Home
- Water
- Mum
- Cat
- Dog

Other pilot symbols should remain evidence-led unless their actual v57 authored/corpus-derived content is imported.

## Testing

Before every proposed merge:

1. run GitHub Family Home integrity workflow
2. confirm Vercel preview build success
3. user personally tests preview URL
4. verify desktop and mobile
5. verify audio start/mute/reload
6. verify no absent art has clickable hotspots
7. verify no glyph-overlay JS/CSS returned
8. visually inspect Octopus against fox benchmark

## Merge gate

Do not merge because CI is green.

Merge only when user explicitly approves the complete Family Home pilot after preview testing.

## After Family Home is approved

Only then scale the asset pipeline in controlled batches:

1. Cambridge Road Childhood House
2. Current / Present House
3. Large Many-Roomed House
4. Unfamiliar House
5. Haunted 17-Bedroom Mansion
6. wider-territory-only symbols

Use the authoritative full v57 matrix for every placement. Do not infer place membership from labels.

## Eventual 76-symbol experience

Do not display all 76 equally at overview scale.

Use semantic zoom:

- territory = major presences
- place approach = more symbols materialise
- close = rare/subtle objects become discoverable
- hover/tap = name + tarot preview
- click = full evidence-led reading

The world remains a painting first and an interface second.