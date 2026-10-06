# DREAMSCAPE ATLAS — MASTER HANDOVER

Last updated: 2026-09-29

## Current state

The Dreamscape Atlas remains a corpus-led interactive dream world. Production is intentionally unchanged on `main`.

Active Tarot refinement branch: `tarot-v2-refinement`
Parent development branch: `family-home-pilot`
Production branch: `main`

Water is the **only canonical Tarot Engine v1.0 exemplar**. Family Home, Natalie/person-11, House/Home, Cat and Dog remain legacy/pending migration and must not be copied as templates.

## Current development focus

Immediate priority: visually verify that the Tarot can now be scrolled fully without vertical jump and that the new ornament-only fallback frame/typography are clearly visible; then continue polish or replace fallback with the dedicated companionFrameImage.

This pass has now locked the reusable Tarot engine architecture:
1. theory-neutral corpus analysis → public-safe derived analysis;
2. canonical v1 builder + generic companion-page planner;
3. exact subject-artwork deck edge rather than invented companion frames;
4. fixed 2:3 companion Tarot with single-shell pagination;
5. evidence/source/interpretation separation;
6. private source-dream library boundary;
7. machine contract validation + regression tests + runtime fit audit;
8. desktop/mobile visual QA before propagation.

## Last known good state

Production remains frozen at:
`27243e76c1f25e0fee32f6f8b4bf5f0bc6d5d08f`

Previous active development branch:
`family-home-pilot`

Current refinement branch:
`tarot-v2-refinement`

Stable Tarot refinement preview:
`https://dreamscape-atlas-git-tarot-v2-refinement-sc352b-2806.vercel.app/`

Preview-link rule:
Use the stable branch alias above for ongoing work. Do not use deployment-specific Vercel URLs as the canonical working link because individual preview deployments may later be removed.

Latest implementation/documentation commit before this handover update:
`70fddc75acd186443337a9491627ea2843f3afdd`

No merge to production has been performed.

## Files changed in this Tarot refinement pass

### Canonical Tarot Engine v1 files

- `dreamscape-engine/docs/tarot-engine-contract.md` — authoritative human-readable contract.
- `dreamscape-engine/docs/tarot-generation-pipeline.md` — corpus-to-Tarot generation workflow and anti-patterns.
- `dreamscape-engine/contracts/tarot-engine-contract.v1.json` — machine-readable invariants.
- `dreamscape-engine/contracts/tarot-migration-status.json` — identifies Water as canonical and older Tarots as legacy/pending migration.
- `dreamscape-engine/schemas/tarot-analysis-v1.schema.json` — public-safe derived-analysis handoff from corpus analysis.
- `dreamscape-engine/schemas/tarot-engine-card-v1.schema.json` — canonical generated runtime-card schema.
- `dreamscape-engine/tarot/build-card.js` — canonical v1 Tarot package builder.
- `dreamscape-engine/tarot/companion-plan.js` — subject-agnostic fixed-card pagination planner.
- `dreamscape-engine/tarot/README.md` — developer entry point; explicitly forbids copying legacy Tarots as templates.
- `scripts/validate-tarot-engine.mjs` — contract/privacy/count/page-budget validator.
- `tests/tarot-engine-contract.test.js` — engine-level regression tests.

New Tarots must travel through these files. Hand-copying Water or any legacy DOM/CSS is not the generation pathway.


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

### DECISION: Water is the only canonical Tarot Engine v1 exemplar.
WHY: The Water prototype exposed the interaction, layout, evidence and privacy failure modes that the engine contract now prevents.
CONSEQUENCE: Family Home, Natalie, Cat, Dog and House/Home are legacy until migrated through `buildTarotCardV1()`, the generic planner, validator and visual QA.

### DECISION: Fixed Tarot dimensions are structural, not decorative.
WHY: Letting content determine height, shrink type, scroll like an article or create vertical card stacks repeatedly broke the Tarot metaphor.
CONSEQUENCE: A tab owns one permanent 2:3 Tarot shell; dense content is paginated inside that shell.

### DECISION: New Tarot packages are generated, not hand-authored from old UI.
WHY: Copying prototype markup/CSS reproduces prototype bugs and Water-specific assumptions.
CONSEQUENCE: The canonical path is derived analysis → `buildTarotCardV1()` → `planCompanionCards()` → validation/tests → visual QA.

### DECISION: Public Tarot data and private corpus evidence are separate layers.
WHY: Future user corpora will contain sensitive raw dreams and identities.
CONSEQUENCE: theory-neutral extraction/evidence remain private; public Tarot packages contain derived summaries and aggregate counts only; Source Dreams is a doorway to the private provider.

### DECISION: Runtime overflow is a QA failure, not a styling opportunity.
WHY: Silent clipping and text shrinking caused repeated card-fit failures.
CONSEQUENCE: the runtime emits `dreamscape-tarot-fit-failure`; the response is to repaginate, never shrink the type or grow the card.

### DECISION: Water is the current gold-standard Tarot exemplar.
WHY: It has strong recurrence, cross-territory geography and multiple corpus-derived functions.
CONSEQUENCE: Finish Water to a genuinely excellent standard before scaling broadly.

### DECISION: No new private dream narrative should be added to the public repository.
WHY: Dream corpora contain intensely personal material and this repository is public.
CONSEQUENCE: source-dream text and sensitive examples belong behind the authenticated/private corpus provider.

## Known problems

- Water still needs visual/readability polish; the **engine architecture is locked**, but typography/spacing/content phrasing may be refined.
- Water is the only current v1-migrated Tarot; all other authored overlays are explicitly legacy/pending migration.
- Full source-dream browsing still requires the authenticated/private provider (or private local profile) and must not move into public assets.
- Automated contract/tests now exist, but visual QA across wide desktop, laptop/tablet and mobile remains a required human release gate.
- Runtime fit failures must be treated as page-planning defects and repaginated rather than patched with smaller text/scrolling.

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

### 2026-10-06 — Scroll-jump correction + visibly distinct companion frame/type pass

User reported three remaining defects after the navigation pass:
1. scrolling toward the bottom of the Tarot could jump the card upward, keeping the bottom out of reach;
2. border changes were not visibly different;
3. font/text changes were not visibly different.

Root cause of scroll jump:
- active chapter positioning used `scrollIntoView()`, which can vertically scroll ancestor containers;
- `activate()` reset the information pane to top on ordinary renderer refreshes, even when the user had not changed tabs.

Corrections:
- removed active-tab `scrollIntoView()` from the Tarot path;
- added `keepChapterTabVisible()`, which changes only the horizontal tab-strip scroll position;
- information pane now resets to top only when the selected chapter actually changes;
- disabled browser scroll anchoring inside the Tarot reading containers and contained overscroll;
- companion fallback frame no longer displays scenic strips from the Water painting;
- fallback is now a visibly separate celestial ornament frame: moon-phase crown, double gold rails, corner filigree geometry and side/bottom sigils;
- exact/dedicated `companionFrameImage` support remains for the future high-fidelity ornament-only asset;
- typography now separates display and body roles more strongly:
  - Baskerville/Palatino-style display hierarchy;
  - Georgia reading text;
  - 31px companion chapter heading;
  - 12.5px body with increased line-height;
  - larger small-caps evidence labels;
- standard-desktop companion card width increased slightly to preserve readable hierarchy.

Verification:
- relevant JS/test syntax checks: OK;
- Water engine validation: 0 errors;
- no active-tab `scrollIntoView()` remains;
- vertical information reset is conditional on actual tab change;
- scenic fallback frame is explicitly disabled;
- celestial ornament fallback and distinct font hierarchy are present.


### 2026-10-06 — Tarot navigation, geography pagination and visual audit pass

User review identified five refinements:
1. clipped/off-screen chapter tabs were not discoverably scrollable;
2. Where it appears clipped explanatory prose at the bottom of the fixed card;
3. arrows remained visible even when no page existed in that direction;
4. previous-page navigation needed to be explicit;
5. companion borders/fonts/display needed a visual-quality audit.

Implemented:
- chapter strip remains horizontally scrollable and now also responds to mouse-wheel movement;
- visible previous/next chapter edge controls added;
- selected chapter automatically scrolls into the centre of the strip;
- impossible chapter arrows are hidden at first/last chapter;
- impossible companion-page arrows are hidden at first/last page;
- single-page chapters show no page arrows;
- previous companion-page arrow appears whenever a prior card exists;
- page navigation also supports ArrowLeft / ArrowRight keyboard operation;
- page-arrow hit targets enlarged and protected above decorative layers;
- Where it appears is now two physical companion cards:
  - page 1: overlap logic + territory distribution;
  - page 2: plain-language distribution explanation;
- the clipped geography sentence is therefore removed from the chart card rather than shrunk;
- current Water page counts are now Overview 3 / Geography 2 / Patterns 3 / Alongside 2 / Chronology 1 / Sources 1 / Meanings 4;
- scenic frame strips were reduced so the fallback reads more like ornament and less like a cropped second picture;
- gold line hierarchy and subtle celestial depth were added to the companion card field;
- engine now supports optional `companionFrameImage` so final cards can use a dedicated ornament-only frame derived from the approved pictorial Tarot;
- masked pictorial artwork is explicitly a prototype fallback, not final-quality frame architecture;
- visual audit added: `dreamscape-engine/docs/tarot-visual-audit.md`.

Visual audit conclusion:
- current border is recognisably the Water deck but is still a scenic crop, so it is not final;
- final frame should reuse Water's moons, filigree, botanical corners, gold line work and deck silhouette while removing landscape/water scene content;
- current system-font stack is acceptable for prototype but final production should bundle a licensed display serif + readable text serif locally;
- typography should use only four roles: literal chapter title, subordinate page topic, readable body, small-caps evidence/source/interpretation label;
- fit problems must continue to be solved through pagination rather than smaller type.

Verification:
- current runtime/engine/test JavaScript syntax checks: OK;
- Water engine validation: 0 errors;
- generic planner exactly matches authored Water page structure;
- navigation/geography/frame feature checks: all present.


### 2026-10-06 — Water content containment, literal headings and content audit

User screenshot review showed that Recurring Patterns source content could remain visible above the physical companion Tarot.

Implemented:
- all authored blocks for a selected chapter are resolved first and moved into the hidden companion stash before page 1 renders;
- only blocks belonging to the selected companion page may move into the visible Tarot body;
- CSS now hides any stray direct chapter content outside the pager as a second containment safeguard;
- visible Tarot headings now exactly mirror the seven navigation labels;
- page-specific wording is subordinate topic text rather than a competing heading;
- the engine contract/schema/template/validator now enforce literal chapter titles;
- geography rows now show both counts and percentage of the 42 unique Water dreams;
- Water geography copy explicitly explains overlapping memberships;
- Water corpus synthesis now emphasizes the strongest cross-pattern variable: agency;
- recurring Water functions were rewritten in more corpus-specific, reader-friendly language;
- Possible Meanings were strengthened around transition, intensity, responsibility and renewal;
- the chronology card now explicitly states that the current v57-derived analysis does not support a strong developmental progression;
- related-item wording now explicitly states that same-dream co-occurrence is not yet verified;
- Recurring Patterns now paginates the four functions in pairs rather than forcing all four detailed readings onto one card;
- Possible Meanings now paginates individual readings in pairs before the interpretive-lens cards;
- generic indexed blocks `function:N` and `meaning:N` were added to the engine alongside `lens:N`;
- runtime/schema/validator/tests were extended accordingly;
- a canonical content-quality standard was added at `dreamscape-engine/docs/tarot-content-quality.md`.

Current Water content audit:
- Overview: strong;
- Where it appears: strong;
- Recurring patterns: strong;
- Appears alongside: provisional until same-dream co-occurrence is verified;
- How it changes: provisional but honest; no strong chronology currently established;
- Source dreams: structurally strong, depends on private provider;
- Possible meanings: strong and corpus-specific.


### 2026-10-06 — Stable preview continuity rule

A previously shared deployment-specific Vercel URL for the Water Tarot stopped resolving even though the `tarot-v2-refinement` branch and its code remained intact.

Correction:
- canonical working preview is now the stable branch alias:
  `https://dreamscape-atlas-git-tarot-v2-refinement-sc352b-2806.vercel.app/`
- deployment-specific URLs are not to be used as the persistent project handoff link;
- the branch alias should remain the working URL as new commits are deployed;
- the Tarot work remains on `tarot-v2-refinement`; no rollback or production merge was performed.


### 2026-09-29 — Tarot Engine v1.0 final hardening and reproducibility check

Final engine hardening completed after the v1 contract was introduced:

- canonical Tarot packages are now self-describing with `subjectId` and `subjectType`;
- Water declares `subjectId: "water"` and `subjectType: "symbol"`;
- the canonical builder requires a supported subject type and forces private source access to use the same subject ID;
- runtime schema/template/validator all enforce portable subject identity;
- the generic planner no longer contains Water-specific interpretive-lens names; it uses `lens:0`, `lens:1`, etc.;
- caveated/heavier lenses are automatically kept on their own companion page;
- public/private provenance is explicit and recursively checked for forbidden raw-dream payload keys;
- chapter block ownership is machine-validated, preventing Overview/Patterns/Geography/etc. content from leaking into the wrong tab;
- per-page maximum block budget is machine-validated;
- exact subject artwork, image framing, evidence-first presentation, full-artwork opening and responsive strategy are validation requirements;
- a runtime fit audit sets card fit state and emits `dreamscape-tarot-fit-failure` when content exceeds the fixed card body;
- `dreamscape-engine/schemas/tarot-analysis-v1.schema.json` now defines the analysis-to-builder handoff;
- `dreamscape-engine/schemas/tarot-engine-card-v1.schema.json` defines the canonical runtime package;
- `dreamscape-engine/tarot/README.md` is the developer entry point;
- legacy Tarot migration status is explicit and only Water may currently be used as the engine template.

Verification performed:
- relevant runtime/engine/test JavaScript syntax checks: **OK**;
- machine-readable JSON parse checks: **OK**;
- current Water package contract audit: **0 errors**;
- canonical builder reconstructs Water into a contract-valid v1 package: **0 errors**;
- generic planner reproduces Water's authored companion-page block structure exactly: **yes**;
- Water remains 42 unique dreams, 59 recorded appearances and 69 overlapping territory memberships, with those quantities explicitly treated as different measures.

The remaining Water work is visual/readability polish only. Do not change these locked architecture rules to solve visual issues; paginate/recompose within the contract instead.


### 2026-09-29 — Tarot Engine v1.0 institutionalised from Water lessons

The Water development process has now been converted into a reusable engine contract so future Tarots and future user corpora do not repeat prototype mistakes.

Implemented:
- Water marked `tarotEngineContractVersion: "1.0"` and given explicit v57/whole-corpus/theory-neutral/private-evidence provenance;
- canonical human contract: `dreamscape-engine/docs/tarot-engine-contract.md`;
- corpus-to-Tarot pipeline: `dreamscape-engine/docs/tarot-generation-pipeline.md`;
- machine contract: `dreamscape-engine/contracts/tarot-engine-contract.v1.json`;
- canonical runtime schema: `dreamscape-engine/schemas/tarot-engine-card-v1.schema.json`;
- derived-analysis handoff schema: `dreamscape-engine/schemas/tarot-analysis-v1.schema.json`;
- generic page planner: `dreamscape-engine/tarot/companion-plan.js`;
- canonical package builder: `dreamscape-engine/tarot/build-card.js`;
- contract validator: `scripts/validate-tarot-engine.mjs`;
- engine regression suite: `tests/tarot-engine-contract.test.js`;
- npm commands: `tarot:validate`, `tarot:test`, `check`;
- migration manifest explicitly prevents legacy Family Home/Natalie/Cat/Dog/House-Home records being used as templates;
- interpretive-lens pagination changed from Water-specific names to generic `lens:0`, `lens:1`, etc.;
- one permanent companion Tarot shell per selected tab is the canonical pagination mechanism;
- exact subject artwork is the canonical companion-card frame source;
- runtime fixed-card overflow audit emits `dreamscape-tarot-fit-failure`;
- preview compose-before-reveal rule is canonical to prevent layout twitch;
- counts, confidence labels, related-item semantics, chronology honesty, interpretation boundaries and private/public separation are validator rules rather than optional prose guidance.

Machine audit of the current Water package returns zero contract errors. Its 42 unique dreams, 59 appearances and 69 overlapping territory memberships remain intentionally distinct measures.

Next propagation rule:
**Do not manually restyle the next Tarot. Feed its derived corpus analysis into the v1 builder/planner, validate it, then visually QA it.**


### 2026-09-29 — Pagination rebuilt as one permanent Tarot shell

User confirmed that all companion-page arrows still appeared but did nothing.

Deeper correction:
- removed the multi-card hidden/show pager entirely;
- every tab now owns exactly one permanent physical companion Tarot shell;
- page turns no longer reveal a different hidden `article`;
- page turns instead swap the authored page title/subtitle/content blocks inside the same fixed Tarot shell;
- inactive page content is moved to a hidden stash and restored when that page is selected;
- frame, nav and arrow elements are therefore never recreated during a page turn;
- the tab exposes one stable `__dreamscapeSetCompanionPage(index)` setter;
- tab switching calls that setter to reset to page 1 only when changing chapter;
- the pager uses one capture-phase click listener, so arrow/dot clicks are handled before any lower Atlas click logic;
- dots are real buttons rather than decorative `i` elements;
- the selected page counter/dots are updated inside the permanent shell;
- no class mutation is required for page turning.

This supersedes all previous hidden-card pagination implementations.

Acceptance test:
- every multi-page tab must turn immediately within the same visible Tarot card;
- the border must not move/disappear;
- page count/title/content must update together;
- no page turn may depend on DOM hide/show of multiple Tarot card elements.


### 2026-09-29 — Persistent companion-page navigation fix

User confirmed the compact preview twitch was resolved and reported that multi-page companion Tarot arrows still rendered but did not advance beyond card 1.

Root cause:
- page turns toggled `is-active-page` classes;
- the global Tarot MutationObserver watches class changes anywhere in the reader;
- the page turn therefore triggered a full Tarot refresh immediately after the click, allowing the pagination state to be rebuilt/reset.

Implemented:
- companion page turns no longer mutate page classes;
- page visibility now uses only `hidden` and `aria-hidden`;
- active celestial page dots use `aria-current="page"` rather than an `.active` class;
- the global class observer explicitly ignores class mutations originating inside `.tarot-companion-pager`;
- direct arrow click handlers and clickable/keyboard-accessible dots remain in place;
- page count text updates with the selected companion page;
- the selected tab/chapter does not change when turning companion pages.

Acceptance test:
- Recurring Patterns page 1 right-arrow must reveal page 2 and remain there;
- page 2 left-arrow must return to page 1;
- Overview must allow access to all 3 cards;
- Appears Alongside must allow access to both cards;
- Possible Meanings must allow access to all 3 cards;
- page-dot selection must persist rather than immediately snapping back to page 1.


### 2026-09-29 — Recurring-pattern frame + companion-page controls fix

User review of the fixed-card pagination pass found two remaining defects:

1. Recurring Patterns opened a companion card without the visible Water Tarot border;
2. the small page arrows rendered at the bottom of multi-page tabs but did not reliably advance to the next companion card.

Root causes and corrections:
- Recurring Patterns pages are `article` elements nested inside `.territory-v1-functions`, and older Tarot CSS also targets article pseudo-elements. The frame therefore remained vulnerable to selector collisions.
- Companion-card frame rendering no longer uses `article::before` / `::after` at all.
- Every page now owns a real `.tarot-companion-frame` child element using the subject Tarot image as its exact deck-edge source.
- The old page pseudo-frame is explicitly disabled.
- Frame existence is guaranteed on every render, including already-created companion pages.
- Multi-page navigation no longer relies on one delegated section listener.
- Each page-arrow button now receives a direct click handler after its nav is rendered.
- Page-arrow clicks call `preventDefault()` and `stopPropagation()`, then update the deck page deterministically.
- Celestial page dots are now clickable/keyboard-accessible as an additional page-navigation route.
- Page controls have explicit z-index/pointer-event protection above all decorative layers.

Acceptance test:
- both Recurring Patterns companion pages must show the same Water deck border as all other companion cards;
- right-arrow on page 1 must reveal page 2 immediately;
- left-arrow on page 2 must return to page 1;
- page dots must select their corresponding companion page;
- no page turn may change the selected chapter/tab.


### 2026-09-29 — Fixed companion-card pagination + preview jump fix

User locked two new architectural rules:

1. companion Tarot dimensions are fixed; content never determines card height, never gets shrunk below the chosen readable hierarchy, and never flows vertically into another card;
2. the compact preview must be completely composed and positioned before it becomes visible, with opening animation limited to opacity/transform.

Implemented:
- Water companion tabs now have explicit page plans in authored data;
- Overview is 3 cards: The Water Record / Water in Action / Recurring Actions;
- Geography is 1 card;
- Recurring Patterns is 2 cards: Reading the Evidence / The Forms of Water;
- Appears Alongside is 2 cards: The Constellation of Water / Water's Companions;
- Chronology is 1 card;
- Source Dreams is 1 doorway card; the private dream library remains a separate surface;
- Possible Meanings is 3 cards: The Mirror of Water / A Jungian View / Story & Life Experience;
- every companion page uses the same fixed 2:3 Tarot geometry and exact subject-artwork deck edge;
- page content is bounded and does not scroll or alter card height;
- multi-page tabs get integrated previous/next arrows and celestial page dots;
- switching tabs starts that tab at card 1;
- moving between cards inside a tab preserves the selected tab and no longer resets during observer refreshes;
- the active-tab controller remains the sole owner of chapter visibility;
- Source Dreams no longer attempts to display a 42-record list inside the Tarot card;
- the preview now dispatches a synchronous pre-open composition hook, is positioned using final offsetWidth/offsetHeight, then revealed;
- preview opening no longer depends on a post-open mutation pass, eliminating the width/position twitch caused by changing layout after the first paint.

Acceptance test:
- opening the small Water preview should produce one smooth reveal with no positional jump;
- every information tab should show one fixed Tarot card at a time;
- tabs with more content should page horizontally through additional Tarot cards;
- no companion card should change height, shrink typography to force a fit, or continue vertically into a second card.


### 2026-09-24 — One-tab-one-card correction

User screenshot review showed that, although the Water deck edge was now closer, the companion-card content still behaved incorrectly:

- multiple companion cards could appear one after another in the dock;
- long content could visually continue beyond the safe interior of the active card;
- the tab system did not reliably own visibility because data renderers were independently unhiding their sections.

Implemented:
- removed all visibility manipulation from data render helpers;
- the tab controller is now the sole owner of active chapter state;
- active chapter is published on `.tarot-triptych-info[data-active-chapter]`;
- CSS explicitly hides every top-level companion card except the selected chapter;
- exactly one companion card can render in the reading viewport at a time;
- every card now has a fixed header plus a dedicated `.tarot-companion-body`;
- only that inner body may scroll, so content cannot spill below the physical Tarot object;
- the chapter selector is sticky on standard desktop/tablet;
- Overview, Geography, Patterns and Alongside were compacted so their developed content fits much more cleanly within the card;
- Possible Meanings remains fully preserved but uses discreet internal scrolling when its content exceeds the available card body;
- Related-items rendering now writes into the card body instead of replacing the whole companion-card structure;
- render helpers no longer accidentally fight the tab state.

Acceptance test:
1. selecting a tab must show exactly one companion card;
2. no second Tarot card may appear below it;
3. no content may render outside the framed card;
4. dense cards may scroll internally, but the outer card itself must remain one stable object.


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
