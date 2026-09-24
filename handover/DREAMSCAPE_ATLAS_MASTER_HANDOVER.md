# DREAMSCAPE ATLAS — MASTER HANDOVER

Last updated: 2026-09-24

## Current state

The Dreamscape Atlas remains a corpus-led interactive dream world. Production is intentionally unchanged on `main`.

Active Tarot refinement branch: `tarot-v2-refinement`
Parent development branch: `family-home-pilot`
Production branch: `main`

The current Tarot v2 exemplars are Family Home, Water and Natalie. Water is the designated gold-standard exemplar for the current refinement pass.

## Current development focus

Immediate priority: visually validate the cleaned exact-subject-frame companion Tarot system before propagating it.

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
`f6df81e0d577bed6949b91472ac9c321b397bbe1`

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

### 2026-09-24 — Companion Tarot structural correction after screenshot review

Screenshot review exposed two remaining failures in all seven companion cards:

1. the visible border was still not the Water Tarot border; the previous layered CSS systems were competing in the cascade, leaving the invented companion ornament visible;
2. long chapter content was being forced into a fixed Tarot shape without a dedicated internal scroll region, causing Geography, Patterns, Alongside and other cards to clip at the bottom.

Correction implemented:
- removed the three stacked companion-card CSS systems introduced in prior passes and replaced them with one clean V4 system;
- the companion card no longer uses the separately invented ornate SVG at all;
- the visible frame is now the actual subject Tarot image itself, masked to the top/bottom/side edge bands so the real Water Tarot moons, gold edge, corner ornament and silhouette are used directly;
- future subjects inherit the same mechanism from `--tarot-deck-image`, so their own artwork becomes the exact frame source;
- companion cards are now bounded Tarot objects with fixed viewport-aware height rather than oversized webpage panels;
- every companion card now has a fixed header plus an independently scrollable `.tarot-companion-body`, preventing lower content from disappearing behind the frame;
- removed all companion blur/fade effects;
- fixed a renderer bug where Geography, Recurring Patterns and Interpretive Lenses could accidentally target decorative header DIVs after the first refresh;
- stable content containers are now explicitly classed (`territory-v1-geo-list`, `territory-v1-function-list`, `territory-v1-lens-list`);
- body typography remains full-opacity ivory/parchment;
- tab-specific interior compositions remain, but all seven cards now share one and only one outer deck-edge mechanism.

Superseded:
- all previous companion-card border systems and their CSS cascade layers;
- the custom ornate SVG is retained only as a historical unused asset.

Acceptance test:
- top of the companion card must visibly show the same Water Tarot moon-phase/gold edge language as the image card;
- no duplicate/custom geometric frame should be visible;
- bottom content must remain accessible inside the card rather than being cropped;
- switching tabs must not cause data to render into decorative header containers.


### 2026-09-24 — Exact deck-edge correction + legibility hotfix

User review found the first illustrated companion-card implementation visually unacceptable: companion cards were faded/blurred and the invented ornate frame was still not an exact replica of the Water Tarot frame.

Immediate correction implemented:
- removed the companion-card fade/blur animation loop that could keep cards in a veiled/unreadable state;
- removed blur from the dock-opening animation;
- companion cards now render at full opacity with no blur/filter transform;
- companion cards use the **actual subject Tarot artwork itself as the deck skin** via `--tarot-deck-image`;
- for Water, that means the exact `water-v2.png` artwork is reused as the outer card surface rather than a separately invented SVG frame;
- an opaque indigo inner field covers the pictorial centre while leaving the real Water Tarot border, moon phases, corner ornament, gold linework and silhouette visible around it;
- all seven Water companion chapters therefore share the same exact outer deck edge;
- companion cards now use the same 2:3 Tarot proportion rather than a tall webpage-panel silhouette;
- card width is capped and centred so it reads as a physical object rather than a full-screen panel;
- typography and body text were brightened to crisp parchment/ivory/pale-gold values;
- Overview retains the composed 42-of-362 medallion, 59 appearances, 5 territories and corpus-derived behaviour synthesis;
- other chapters keep their distinct interior compositions but no longer receive different outer frames;
- Source Dreams access remains active and private;
- the deck-skin mechanism is reusable: future Tarot subjects automatically expose their own card artwork as the exact companion-card frame source.

Superseded:
- the separately designed `assets/tarot-ornate-frame.svg` is no longer the canonical companion-card border. It remains in the repository for historical/reference purposes, but the final computed companion-card style uses the subject's actual Tarot artwork instead.

Acceptance test:
1. companion card must be immediately readable at rest;
2. no blur, opacity veil or dark overlay may sit above the text;
3. Water companion card must visibly reuse the exact Water Tarot deck edge;
4. companion card must read as a bounded 2:3 Tarot object, not a webpage panel.


### 2026-09-24 — Illustrated companion Tarot card system

User supplied the canonical visual rebuild brief requiring the information tabs to stop reading as decorated UI and instead become genuine physical/mystical cards from the same deck as the Water Tarot.

Implemented:
- added reusable `companionCards` metadata for all seven Water chapters;
- canonical Water companion titles are:
  - Overview → The Water Record
  - Where it appears → The Geography of Water
  - Recurring patterns → The Forms of Water
  - Appears alongside → The Constellation of Water
  - How it changes → Water Through Time
  - Source dreams → The Book of Waters
  - Possible meanings → The Mirror of Water
- rebuilt `assets/tarot-ornate-frame.svg` as a substantially richer multi-layer gilded frame with four nested rules, filigreed corners, celestial jewel details and subtle water ornament;
- renderer now creates a true companion-card header with card-specific title, subtitle, evidence/source/interpretation inscription and motif glyph;
- companion cards use a physical-card silhouette and illustrated midnight/celestial interiors rather than plain dark panels;
- each chapter has a distinct composition while sharing one deck language:
  - Overview uses a central 42-dream medallion, supporting inscriptions and three recurring-action poles;
  - Geography uses luminous Water currents and the explicit 42 unique / 69 membership logic;
  - Patterns uses four mini-emblem evidence cards plus the qualitative strength key;
  - Alongside uses a central Water emblem and constellation-like related-item field;
  - Chronology uses a vertical river/time motif and retains the no-invention fallback;
  - Source Dreams uses manuscript-like entries and the active private dream browser;
  - Possible Meanings uses a darker mirror/interpretive treatment and consolidates meanings, lenses and method boundary into one physical companion card;
- chapter switching now animates as one card replacing another with a restrained draw/fade/settle motion;
- navigation labels remain literal while in-card titles may be more evocative;
- meanings/lenses/method are now structurally consolidated so one selected tab truly renders one companion card;
- companion-card metadata is reusable in the Tarot schema and documented in `dreamscape-engine/docs/tarot-v2.md`;
- mobile preserves main Tarot → chapter selector → companion Tarot card rather than falling back to ordinary article styling;
- private source-dream access remains active and public raw dream narrative remains excluded.

Acceptance standard:
1. If all text is removed, the companion card should still look like an artefact worthy of the Water Tarot deck.
2. If all ornament is removed, the surviving information must still accurately represent the corpus.
3. Water remains the visual reference; future subjects can vary motifs while belonging to the same Dreamscape deck.


### 2026-09-24 — Ornate companion cards + active Water source dreams

User approved the Water Tarot size and tab differentiation, then requested two refinements: make every tab feel as magical/ornate as the Tarot itself, and remove the block on the 42 linked Water dreams.

Implemented:
- added one reusable scalable ornate frame asset at `assets/tarot-ornate-frame.svg`;
- every active Tarot chapter now uses that same companion-card frame language rather than a plain information panel;
- introduced a more magical serif typographic system using resilient system serif stacks (display/text/small-cap roles) without committing font files or adding a fragile font dependency;
- headings, body copy, navigation labels, confidence labels, source-dream rows and buttons now inherit the Tarot typography system;
- inner evidence pieces retain lighter miniature Tarot framing so the information still has hierarchy;
- Source Dreams is now always clickable; it is no longer disabled merely because records were not preloaded;
- `DreamscapePrivateProfile` can now lazily request records from a private/authenticated provider via `loadDreamRecords(subjectId)`;
- providers can optionally implement `openDreamRecord(record)` to open the full source dream;
- URL-valued private record refs are supported as a fallback;
- a local private-profile JSON can be loaded directly into the browser session when no provider is connected;
- local import remains session/private and is not written to the public repository;
- Water declares `privateCorpusAccess.enabled=true`, subject `water`, expected count 42;
- public code still contains no raw Water dream narrative.

Important limitation:
The public repository does not contain the 42 private Water dream records themselves. The UI is now active and will load/open all 42 when the authenticated provider supplies them. In a preview session without that provider, the Source Dreams card offers a local private-profile import instead of a disabled control.


### 2026-09-24 — Water data-logic and ornate-tab refinement

User review approved the smaller image-led preview and the docked Hearthlands/Tarot relationship, then requested a refinement pass focused on size, corpus logic, beauty, explanatory clarity and tab accuracy.

Implemented:
- enlarged the Water Tarot inside the dock (390px standard desktop, up to 410px wide desktop);
- removed the redundant quick-stat strip beneath the Tarot in the dock so the artwork has more visual authority;
- made the 42-vs-territory-count logic explicit:
  - 42 = unique Water dreams;
  - territory counts sum to 69 because they are overlapping territory memberships;
  - a single dream may contribute to more than one territory;
  - territory counts therefore must not be expected to add to 42;
- added reusable `geographyCountMode` metadata so future Tarot records can declare whether territory counts are exclusive or overlapping;
- changed Overview so it contains only overview material plus a corpus-derived “what you tend to be doing around Water” synthesis;
- removed Water's final reflection question from the docked presentation;
- added a qualitative confidence-scale explainer:
  - High = strongest support among currently identified recurring patterns;
  - Medium-high = substantial recurring support, below High;
  - Medium = recurring but more limited/mixed support;
  - explicitly states these are not percentages, probabilities or dream counts;
- moved/kept territory distribution in “Where it appears” and confidence labels in “Recurring patterns” rather than allowing them to leak into Overview;
- fixed the chapter renderer so the active tab is re-applied on every refresh, preventing later sections from reappearing under the selected tab;
- gave every active reading field a restrained double-line/celestial Tarot frame;
- restyled territory bars as luminous Water currents with gold/celestial endpoints;
- added ornate overview inscriptions and an evidence-strength legend;
- preserved evidence vs interpretation, private dream access and co-occurrence caveats.

Data source note:
The current authoritative public Water record states 42 unique dreams, 59 recorded appearances and territory memberships of Roadlands 27, Hearthlands 19, Littoral 12, Institutional 6 and River 5. The overlap note already existed in the Water authored overlay; this pass makes that logic impossible to miss in the interface.


### 2026-09-24 — Mum-style responsive Tarot dock

User review confirmed that the compact preview card works, but the full-screen/central overlay breaks the sense of place. The canonical desktop relationship is now:

**Hearthlands remains the place. The Tarot opens beside it.**

Locked responsive architecture:
- desktop: Hearthlands remains visible on the left while a Tarot workspace docks on the right;
- wide desktop: the dock can use an internal mini-triptych (chapter rail | Tarot | selected reading);
- standard desktop/tablet: the Tarot is artwork-first, followed by a compact chapter strip and one selected reading;
- mobile: the same hierarchy collapses into a full-height drawer (Tarot -> chapters -> one reading);
- closing the Tarot returns the user to the same map context;
- the small image-led preview remains the discovery step and is not expanded into a mini webpage.

Implemented on `tarot-v2-refinement`:
- Water presentation mode changed from `triptych` to reusable `docked-workspace`;
- desktop dock width is responsive, preserving roughly 54–60% of the viewport for Hearthlands;
- the map viewport shrinks to make physical room for the dock rather than being covered by a modal;
- background dimming is reduced substantially so Hearthlands stays visually alive;
- wide desktops retain a compact three-zone reading inside the dock;
- medium desktops/tablets use the older Mum-style artwork-first hierarchy;
- mobile uses a full-height drawer without losing chapter semantics;
- Water artwork remains portrait, full-frame and dominant inside the dock;
- the dream-count medallion is reduced and attached more tightly to the Tarot;
- only the active chapter is shown in the reading region;
- evidence/privacy/co-occurrence/chronology boundaries are unchanged.

**Superseded:** the large centred triptych overlay is no longer the canonical desktop pattern.

Acceptance test:
On desktop, the user must be able to see a meaningful amount of Hearthlands and the open Tarot at the same time; the Tarot must read as an object opened beside the world rather than a new page covering it.


### 2026-09-24 — Canonical Tarot triptych

User review established that even the right-hand side-panel still treated the Tarot artwork as an image above an interface. The canonical direction is now a triptych composition:

**navigation | enlarged Tarot | selected reading**

Locked principles:
- the Tarot artwork is the visual centre and remains visible while sections change;
- navigation is an ornate vertical chapter rail, not a generic website tab bar;
- selected information appears in the opposite dark field, not underneath the Tarot;
- the Dreamscape territory remains visible around/behind the presentation;
- the compact preview becomes image-led and deliberately does not try to explain the full Tarot;
- evidence and interpretation remain structurally distinct;
- the architecture is reusable across symbols, places, animals, objects and people.

Implemented on `tarot-v2-refinement`:
- Water presentation mode changed from `side-panel` to `triptych`;
- full Tarot shell uses three desktop zones: chapter navigation, large portrait Tarot, selected chapter content;
- portrait artwork is fixed at the centre and uses `object-fit: contain`;
- dream-count medallion remains attached to the Tarot artwork;
- information no longer stacks underneath the Tarot on desktop;
- chapter switching updates only the right-hand reading field while the Tarot remains in place;
- compact Water preview is now mostly artwork, with only title, dream count and a small “Open tarot” invitation;
- right-hand information styling uses manuscript/editorial typography and restrained dividers rather than boxed UI cards;
- mobile collapses to Tarot first, horizontal chapter navigation second, active reading third;
- relationship and chronology caveats remain evidence-safe;
- private dream records continue to load only through the authenticated/private profile layer.

**Superseded:** the right-side panel is no longer the target desktop architecture. It remains a historical step in the change log only.

Acceptance test:
Opening Water should immediately read as one central symbolic artefact with knowledge arranged around it; changing chapters must not displace the Tarot itself.


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
