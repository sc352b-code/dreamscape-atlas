# DREAMSCAPE ATLAS — MASTER HANDOVER

Last updated: 2026-09-24

## Current state

The Dreamscape Atlas remains a corpus-led interactive dream world. Production is intentionally unchanged on `main`.

Active Tarot refinement branch: `tarot-v2-refinement`
Parent development branch: `family-home-pilot`
Production branch: `main`

The current Tarot v2 exemplars are Family Home, Water and Natalie. Water is the designated gold-standard exemplar for the current refinement pass.

## Current development focus

Immediate priority: canonical Tarot side-panel refinement, with Water as the gold-standard exemplar.

This pass is focused on:
1. per-card artwork framing rather than one universal crop;
2. a more majestic illuminated-manuscript / celestial-oracle visual language;
3. stronger visible separation between corpus evidence and interpretation;
4. reusable engine/schema support rather than one-off styling.

## Last known good state

Production remains frozen at:
`27243e76c1f25e0fee32f6f8b4bf5f0bc6d5d08f`

Previous active development branch:
`family-home-pilot`

Current refinement branch:
`tarot-v2-refinement`

Latest commit at this handover update:
`1de06ae1880a12c67759d8a39f5d8411aa2fb4a6`

No merge to production has been performed.

## Files changed in this Tarot refinement pass

- `worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json`
  - adds per-card preview/full image framing metadata;
  - marks Water as the single gold-standard exemplar;
  - adds a concise evidence/interpretation boundary for Water.

- `src/hearthlands-tarot-v2-overlays.js`
  - reads per-card framing metadata;
  - applies different preview and full-card crops;
  - adds confidence labels to recurring-function evidence when available;
  - renders territory distribution as scaled visual bars;
  - applies the evidence/interpretation method boundary.

- `src/hearthlands-territory-v1.css`
  - removes the universal `object-position:center 38%` rule;
  - deepens the Tarot artefact treatment;
  - adds evidence/interpretation visual labels;
  - adds subtle territory distribution bars and confidence styling.

- `dreamscape-engine/schemas/tarot-card.schema.json`
  - adds `person`, `animal` and `object` Tarot subject types;
  - adds reusable `imageFraming` metadata;
  - adds `interpretiveBoundary` and `goldStandardExemplar`.

- `tests/tarot-v2-refinement.test.js`
  - verifies independent framing metadata;
  - verifies one gold-standard exemplar;
  - verifies the renderer no longer depends on the universal crop;
  - verifies evidence/interpretation distinction is present.

## Decisions locked in

### DECISION: Territory geography and symbol placement remain corpus-derived.
WHY: The Atlas represents the user's dream corpus, not invented fantasy geography.
CONSEQUENCE: Visual art conforms to the world blueprint; it does not define corpus truth.

### DECISION: Semantic precision must match evidence precision.
WHY: Territory-level evidence must not be rendered as falsely precise place-level evidence.
CONSEQUENCE: Semantic zoom and placement metadata remain part of the engine.

### DECISION: Tarot evidence and interpretation are distinct layers.
WHY: Recurrence counts, geography and source records are not equivalent to possible meanings or theory.
CONSEQUENCE: The UI and schema must keep those classes visibly and structurally separate.

### DECISION: Real people are literal people first.
WHY: A recurring real person must not be reduced to an archetype.
CONSEQUENCE: Jungian or other symbolic lenses are optional secondary readings.

### DECISION: Tarot artwork requires per-card focal metadata.
WHY: A universal crop caused important faces/subjects to be cut off.
CONSEQUENCE: preview and full-card framing can differ for each Tarot.

### DECISION: Water is the current gold-standard Tarot exemplar.
WHY: It has strong recurrence, cross-territory geography and multiple corpus-derived functions.
CONSEQUENCE: Finish Water to a genuinely excellent standard before scaling broadly.

### DECISION: No new private dream narrative should be added to the public repository.
WHY: Dream corpora contain intensely personal material and this repository is public.
CONSEQUENCE: source-dream text and sensitive examples belong behind the authenticated/private corpus provider.

## Known problems

- The Tarot refinement has not yet been visually inspected in the deployed preview.
- Per-card focal values are sensible first-pass metadata and must be checked against actual rendered art, especially the Natalie portrait.
- Full source-dream access remains a private-provider integration requirement rather than a public-data feature.
- The current public Tarot overlays contain derived material; avoid adding further sensitive source detail.
- Water content is substantially stronger than generic dictionary interpretation, but the next content pass should connect recurring functions to private evidence references where the private provider permits it.

## Data provenance

Authoritative reference corpus: v57.

Known validated corpus state:
- 362 original dream PDFs;
- 362 non-empty text extractions;
- consolidated corpus;
- analytical atlases/workbooks;
- symbols, places, territories, chronology, associations and world-blueprint data.

For current Hearthlands placement, use the authoritative v57 dream intersections and symbol-place matrix. Do not infer place membership from a headline label.

## Visual decisions

Approved:
- celestial, numinous, painterly Dreamscape visual thread;
- painting first, interface second;
- restrained gold/celestial detail;
- luminous imagery;
- elegant typography;
- atmosphere without decorative clutter;
- map -> object -> Tarot continuity.

Rejected:
- cheap fantasy styling;
- sticker/icon/glyph symbols;
- generic SaaS panels;
- universal Tarot image crops;
- decorative complexity that weakens legibility.

## Acceptance criteria for Tarot v2 refinement

Before this stage is called successful:

1. Natalie, Water and Family Home all frame correctly in preview and full Tarot.
2. Water feels like an exceptional artefact rather than a polished app panel.
3. Territory distribution is attractive and understandable.
4. Evidence is visibly distinct from interpretation.
5. Recurring functions preserve confidence/strength where known.
6. Source-dream access points back to the authenticated corpus layer.
7. Real-person Tarot preserves literal-person-first treatment.
8. Desktop and mobile both render correctly.
9. No sensitive raw dream text is introduced into the public world package.
10. The implementation remains reusable for future users and future visual-generation systems.

## Immediate next actions

1. Run the branch test suite / CI.
2. Inspect the deployed preview for `tarot-v2-refinement`.
3. Open Water first and judge it as the gold-standard card.
4. Check the three artwork crops, especially the Natalie portrait.
5. Adjust focal metadata from visual inspection rather than applying a universal crop.
6. If the visual standard is good, deepen Water's private evidence references and source-dream navigation without publishing raw dream content.
7. Only then propagate the architecture to more Tarot records.

## Change log

### 2026-09-24 — Canonical right-side Tarot shell

User review rejected the almost-full-screen Water v3 presentation and re-established the older Tarot interaction model as the stronger reference.

**Locked interaction direction:**
- keep the dream territory visible on the left;
- open Tarot as a tall right-hand panel on desktop;
- use portrait Tarot artwork as the visual anchor at the top;
- overlay the whole-series dream count as a circular medallion;
- place title and a plain-language corpus subtitle beneath the artwork;
- navigate the reading through chapters rather than one giant document;
- preserve evidence before interpretation;
- return to the same Atlas context on close.

Implemented on `tarot-v2-refinement`:
- Water presentation mode changed from `artefact-scroll` to reusable `side-panel`;
- canonical shell width is `clamp(430px, 37vw, 640px)` on desktop;
- Atlas dimming reduced to preserve the world as visible context;
- complete portrait artwork uses `contain` rather than a heavy crop;
- 42-dream medallion is overlaid on the artwork;
- plain-language subtitle now explains the recurring Water pattern;
- chapter navigation added: Overview, Where it appears, Recurring patterns, Appears alongside, How it changes, Source dreams, Possible meanings;
- previous/next chapter arrows and direct chapter selection added;
- Overview includes the evidence statement “Water appears in 42 of your 362 dreams” from public-safe corpus counts;
- geography remains corpus-derived;
- related items are explicitly marked as related-not-cooccurrence unless same-dream evidence is verified;
- chronology has a truthful pending/fallback state instead of an invented developmental narrative;
- private dream records remain behind `DreamscapePrivateProfile`;
- possible meanings remain explicitly marked as interpretation, not corpus fact;
- mobile falls back to a near/full-width Tarot panel.

**Superseded:** the full-screen `artefact-scroll` Water presentation is no longer the target interaction model. Its CSS may remain historically in the stylesheet for now, but Water no longer receives that class/mode.

**Acceptance test:** the user should be able to see both the Dreamscape territory and the open Tarot at the same time on desktop, matching the strengths of the older Tarot reference.



### 2026-09-24 — Water Tarot v3 artefact build

User review established that Water v2 still felt like an ornate image placed above an ordinary interface. The required direction is now locked:

**The Tarot artwork is the interface.**

Implemented on `tarot-v2-refinement`:
- Water now uses a dedicated reusable `artefact-scroll` presentation mode.
- Opening composition shows the complete artwork with `object-fit: contain` rather than cropping it into a hero strip.
- Water opens almost full-screen inside one continuous gold/celestial frame.
- Conventional statistic cards were replaced by inscription-like counters.
- Territory distribution is rendered as fine luminous currents rather than dashboard bars.
- Evidence sections precede interpretation in the document order.
- Recurring functions use connected illuminated annotations rather than boxed cards.
- Private dream-source fragments render only from `DreamscapePrivateProfile`; no raw dream text was added to the public repository.
- The source route reads “See all 42 dreams →” and only activates when authenticated private records are present.
- Possible readings and theoretical lenses are visually and textually marked as interpretation rather than corpus fact.
- Related items use constellation-like links.
- The final reflection receives a quieter moonlit/depth treatment.
- Motion is deliberately restrained and respects reduced-motion preferences.
- The reusable Tarot schema now contains presentation metadata so later cards can choose `artefact-scroll` without hard-coding Water.

New acceptance criterion:
If the words were removed, Water should still read as one extraordinary Tarot artefact; if the decoration were removed, its surviving information must still accurately represent the corpus.

Current validation status:
Code/build validation is still required after the v3 commits. Visual approval is not implied by implementation.


### 2026-09-24 — Tarot v2 refinement branch created
- branched from `family-home-pilot` to preserve the existing pilot;
- added per-card framing metadata;
- removed universal Tarot crop behavior;
- added evidence/interpretation visual distinction;
- added territory distribution bars and confidence treatment;
- extended reusable Tarot schema;
- added regression tests;
- production remained untouched.
