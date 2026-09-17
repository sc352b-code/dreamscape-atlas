# Dreamscape Dream Atlas — Family Home Pilot Handover

This folder is the authoritative transfer package for continuing the current Dream Atlas / Hearthlands Family Home pilot in a fresh thread.

## Start here

Repository: `sc352b-code/dreamscape-atlas`

GitHub: https://github.com/sc352b-code/dreamscape-atlas

Development branch: `family-home-pilot`

Runtime build head at handover start: `fcfe2e46f0574ef782afe43234462435c25411fd`

Last runtime commit message: `Wire explicit Family Home approach scene`

Production branch: `main`

Production main commit: `27243e76c1f25e0fee32f6f8b4bf5f0bc6d5d08f`

Architectural checkpoint branch: `checkpoint-family-home-8d4150d`

Architectural checkpoint commit: `8d4150db8dd6f4df81b965d5afd84a742e2f1dc9`

Draft PR: https://github.com/sc352b-code/dreamscape-atlas/pull/1

Preview URL: https://dreamscape-atlas-git-family-home-pilot-sc352b-2806.vercel.app/

Production URL: https://dreamscape-atlas-sc352b-2806.vercel.app/

Current preview Vercel deployment status for `fcfe2e46`: SUCCESS

Vercel dashboard target for this build: https://vercel.com/sc352b-2806/dreamscape-atlas/EAurvZeHwBgS26dFZGjjBcCYHC68

## Critical rule

DO NOT merge PR #1 or publish the pilot to production until the complete Family Home pilot passes visual, interaction, mobile, tarot, audio and atmosphere validation together.

The current branch is a development preview only.

## What is already implemented

- production frozen on `main`
- architectural checkpoint preserved at `8d4150d`
- separate development branch `family-home-pilot`
- authoritative 13-symbol Family Home set
- full six-place intersections for those 13 symbols
- semantic zoom model: territory / place / close
- explicit Family Home approach state with visible controls
- separate painted-art layer and invisible hotspot layer
- no glyph fallback when art is absent
- rejected cartoon SVG Octopus removed
- v57 reading adapter mounted
- authored v57 interpretive profiles mounted for House / Home, Water, Mum, Cat and Dog
- evidence-only v57 records for the other eight Family Home symbols; no invented authored interpretations
- tarot artwork resolution for all 13 symbols, local-first with old-v57-host fallback
- automated integrity tests
- darkened cosmos with sparse glints and rare shooting stars
- cosmic audio revised away from broadband noise toward alternating pitched tones
- persistent mute state

## What is NOT finished

The visual-symbol pilot is not complete.

The approved painterly Family Home/Octopus image generated in the long thread is NOT in GitHub. It was generated with image id:

`ce2b6774-f44c-4517-a6ef-76c84dae5cd0`

and was written in that thread to:

`/mnt/data/twilight_cottage_garden_by_the_stream.png`

The local binary runtime failed repeatedly, so that PNG could not be uploaded into the repository. This is the only important approved binary that is not inside the repo snapshot. If continuing in another thread, upload that image manually if available from the original chat, or reproduce the regional-tile workflow from the included source crop and brief.

The canonical v57 Hearthlands background remains unchanged. Do not flatten or regenerate the whole map.

## Visual principle

The overlay is not the problem; an overlay that looks like interface furniture is the problem.

Use layered environmental art that feels painted into the scene. The fox in the Hearthlands artwork is the quality benchmark. No icons, badges, glyph stickers, labels or visible hotspot furniture.

## Family Home pilot target

A complete pilot means:

1. enter Hearthlands
2. select Family Home
3. map furniture recedes and Family Home becomes an approach/place scene
4. semantic zoom moves territory -> place -> close through visible controls
5. a genuine painted Octopus is physically present in the water
6. its hotspot is invisible but aligned
7. hover/tap gives discovery feedback
8. click/tap opens real v57 tarot artwork and evidence-led reading
9. desktop and mobile both work
10. cosmic tones are audible, restrained and user-mutable
11. cosmos still glistens occasionally with rare shooting stars
12. no UI contamination appears in the landscape

## Source-of-truth rule for symbols

Do not use a symbol's headline territory label to infer Hearthlands membership.

Hearthlands membership comes from source-dream intersections implemented in v57 `symbolMetrics.ts` / `symbolGeography.ts`.

For place placement, use the authoritative v57 symbol-place matrix. A symbol may be clustered around a named Hearthlands place only if that place count is non-zero. Single appearances are retained.

Known global result from the supplied v57 matrix:

- 76 symbols occur in Hearthlands dreams
- 48 intersect at least one named Hearthlands place
- 28 have Hearthlands-level evidence but no defensible named-place location
- all six Hearthlands places are retained

The current pilot uses the 13 symbols with non-zero Family Home evidence.

## Read the rest of this handover

- `CURRENT_STATE.md` — exact code/build status and current branch behaviour
- `DATA_AND_V57.md` — source files, evidence rules, symbol data and reading rules
- `VISUAL_AUDIO_DIRECTION.md` — approved visual and sound direction
- `GIT_VERCEL.md` — branches, commits, PR and deployment details
- `NEXT_THREAD_INSTRUCTIONS.md` — exact continuation procedure
- `FILE_INDEX.md` — important repo files and what they do
- `TRANSFER_PROMPT.md` — copy/paste first message for a new thread

The repository snapshot packaged with this handover is the source of truth for all actual code.