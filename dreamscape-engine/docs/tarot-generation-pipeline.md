# Dreamscape Tarot generation pipeline

This document describes how the engine should generate a Tarot for **any future user corpus** without repeating prototype-specific mistakes.

## Canonical implementation files

New Tarot generation must use these files rather than copying an existing Tarot by hand:

- `dreamscape-engine/schemas/tarot-analysis-v1.schema.json` — derived-analysis handoff contract;
- `dreamscape-engine/tarot/build-card.js` — canonical v1 package builder;
- `dreamscape-engine/tarot/companion-plan.js` — generic fixed-card page planner;
- `dreamscape-engine/schemas/tarot-engine-card-v1.schema.json` — generated runtime-card schema;
- `dreamscape-engine/contracts/tarot-engine-contract.v1.json` — machine-readable invariants;
- `scripts/validate-tarot-engine.mjs` — contract validator;
- `tests/tarot-engine-contract.test.js` — engine regression tests.

The generation path is:

**private corpus → theory-neutral evidence → public-safe derived analysis → `buildTarotCardV1()` → `planCompanionCards()` → validator/tests → visual QA → approved Tarot**

It supplements the canonical contract in `tarot-engine-contract.md`.

## Inputs

The Tarot generator receives two layers:

### Private corpus layer

Contains the user's real dream material and may include:

- full dream text;
- dates;
- private people/identity mappings;
- source dream IDs;
- extraction records;
- place/symbol/person/animal occurrences;
- private evidence references.

This layer is never emitted into the public Atlas package.

### World / geography layer

Contains the user's derived Dreamscape structure:

- territories;
- places;
- symbols;
- people/animals/objects;
- subject-to-territory memberships;
- map/world identifiers;
- public-safe artwork references.

## Stage A — theory-neutral extraction

For each candidate Tarot subject, extract without interpreting:

- every source dream containing the subject;
- distinct dream count;
- recorded appearance count;
- form/state of the subject;
- what the subject is doing;
- what the dreamer is doing in relation to it;
- locations/territories;
- nearby or co-occurring people, symbols, places and animals;
- emotional tone only when directly supportable from the dream record;
- chronology/date;
- transformations or changes in form.

Do not inject Jungian, symbolic, diagnostic or therapeutic theory here.

### Output

A private evidence bundle with traceability to source dreams.

## Stage B — derived corpus model

Compute:

- `uniqueDreamCount`;
- `appearanceCount`;
- `territoryCounts`;
- `geographyCountMode`;
- recurring functions/actions;
- related items;
- co-occurrence status;
- chronology signal;
- confidence labels and definitions.

### Count rule

Do not make unlike measures tally artificially.

- unique dreams count distinct dreams;
- appearances count events/mentions;
- territory memberships may overlap.

If a single dream can belong to multiple territories, use `overlapping-memberships` and explain it.

## Stage C — recurring-pattern synthesis

Derive a small number of recurring functions from repeated dream behaviour.

Good function:
> “Crossing from one place or state to another.”

Bad function:
> “Water symbolises the unconscious.”

The first describes a repeated corpus pattern. The second is an interpretation.

Each function must remain privately traceable to source evidence even if public evidence IDs are withheld.

Confidence is qualitative unless a numerical method has actually been defined.

## Stage D — relationships

Distinguish:

- **cooccurrence-verified** — repeated same-dream relationship is demonstrated;
- **related-not-cooccurrence** — related within the derived Dreamscape model but same-dream recurrence is not established;
- **pending** — analysis not complete.

Never convert map proximity, thematic similarity or visual association into a co-occurrence claim.

## Stage E — chronology

Test whether the subject changes meaningfully across time.

Possible outputs:

- evidence-supported chronology summary;
- explicit statement that no strong chronology is supported.

Never fabricate a developmental arc to fill the chronology tab.

## Stage F — interpretation layer

Only after evidence is complete, generate possible readings.

Requirements:

- literal/autobiographical explanation remains available;
- named theoretical lenses are clearly labelled;
- each lens includes a caveat where appropriate;
- no fixed “X means Y” translation;
- real people remain literal people first;
- the public Tarot includes an `interpretiveBoundary`.

## Stage G — public-safe Tarot package

Create a separate derived package containing:

- public-safe title/summary;
- aggregate counts;
- recurring functions;
- public-safe related-item labels;
- chronology summary;
- possible meanings/lenses;
- presentation metadata;
- companion-page plan;
- artwork paths;
- private-provider access metadata.

Do not include raw dream text, private identity maps or dream-record payloads.

Every generated docked Tarot must declare:

`tarotEngineContractVersion: "1.0"`

and provenance:

- corpus version;
- whole-corpus or declared-subset scope;
- theory-neutral extraction flag;
- private evidence-ref mode.

## Stage H — artwork

Generate/select the main pictorial Tarot.

The pictorial card is the deck identity.

The companion Tarot frame must reuse that subject artwork as its actual edge/deck skin. Do not create a second “similar ornate” frame.

## Stage I — preview

The small preview is image-led and intentionally simple.

Before it becomes visible:

1. populate all content;
2. apply final preview classes/structure;
3. set final image framing;
4. measure final geometry;
5. position it;
6. reveal with opacity/transform only.

Never reveal the preview and then change its dimensions/structure. That creates the opening twitch encountered during Water development.

## Stage J — companion-page planning

The generator plans **content before rendering**.

Canonical chapters:

1. Overview
2. Where it appears
3. Recurring patterns
4. Appears alongside
5. How it changes
6. Source dreams
7. Possible meanings

### Fixed-card rule

All pages use one fixed 2:3 physical Tarot shell.

Content must not:

- change card height;
- escape the frame;
- turn into a long article;
- force smaller-than-approved typography;
- create a vertical stack of cards.

If content is too dense, split it into another authored page.

### Page budget

Default maximum: three substantial blocks per page.

Prefer fewer when prose is dense.

Examples:

- Overview: Record / Action / Recurring Actions.
- Patterns: Evidence Strength / Functions.
- Alongside: Constellation / Related Elements.
- Meanings: Possible Readings / lens page(s).
- Sources: one doorway card only.

### Generic lens pagination

Interpretive lenses use generic blocks:

- `lens:0`
- `lens:1`
- `lens:2`
- …

Never hard-code Water-specific lens names into the renderer.

## Stage K — runtime interaction

Each selected tab owns **one permanent companion Tarot shell**.

For multi-page tabs:

- frame stays in place;
- arrows/dots stay in place;
- title/subtitle/content are swapped inside the shell;
- inactive content is stored outside the visible body;
- no second physical Tarot is created below or behind it;
- page turning does not trigger a global Tarot rebuild.

Switching tabs starts at page 1. Turning pages does not change tab.

## Stage L — Source Dreams

The Source Dreams Tarot is a doorway.

It may show:

- subject dream count;
- concise explanation;
- “See all N dreams →”.

The full record list opens in the private corpus/library surface.

Never squeeze dozens of records into a fixed Tarot card.

## Stage M — responsive rendering

### Wide desktop

Aim for:

**Atlas context | main pictorial Tarot | companion Tarot**

where viewport space allows.

### Standard desktop/tablet

Preserve:

- main Tarot as the primary object;
- literal chapter navigation;
- one fixed companion Tarot.

Do not revert to generic website sections.

### Mobile

Sequence:

**main Tarot → chapter selector → fixed companion Tarot**

Multi-page controls remain inside the companion card.

## Stage N — automated validation

Run:

`npm run tarot:validate`

Then:

`npm test`

The validator rejects:

- missing engine version;
- missing canonical chapters;
- incorrect chapter tone;
- missing pages;
- duplicate page IDs;
- unknown blocks;
- pages above the block budget;
- missing required chapter content;
- unpaginated interpretive lenses;
- incoherent count semantics;
- undefined confidence labels;
- ambiguous related-item semantics;
- raw/private dream payload keys in the public package;
- source-record lists embedded in the fixed Tarot;
- private source count mismatches.

## Stage O — visual QA before propagation

Automated validation is necessary but not sufficient.

The runtime also performs a fixed-card fit audit. If a page exceeds its available body, it sets `data-fit="overflow"` and emits `dreamscape-tarot-fit-failure`. Treat that event as a failed QA condition: repaginate the content. Never respond by shrinking the type, growing the card, or enabling article-style scrolling.

For the exemplar, inspect:

### Preview

- no twitch/jump;
- final size is visible immediately;
- image dominates;
- click target works.

### Main Tarot

- artwork large enough to remain the main event;
- Atlas/world context remains legible;
- no full-screen generic webpage takeover.

### Every chapter

- exact subject deck edge;
- text does not clip;
- approved type scale remains readable;
- one physical card only;
- page count is correct;
- right/left arrows work;
- dots work;
- page turn changes content but not tab;
- no duplicate blocks after repeated switching.

### Desktop

Test at minimum:
- wide desktop;
- standard laptop;
- compact/tablet-like width.

### Mobile

Test at minimum:
- narrow phone;
- tall phone;
- landscape where supported.

## Stage P — release

A Tarot is not propagated as the engine default until:

- corpus logic has been checked;
- contract validator passes;
- automated tests pass;
- desktop visual QA passes;
- mobile visual QA passes;
- private/public separation is verified;
- the exemplar has explicit human approval.

Only then generate other subjects from the same contract.

## Failure patterns learned from Water

Do not repeat these:

- hard-coded universal image crop;
- full-screen information webpage replacing the Atlas;
- artwork treated as decoration rather than the main artefact;
- generic dark UI beneath beautiful Tarot art;
- invented companion border instead of exact deck frame;
- opacity/blur that makes cards unreadable;
- one fixed card overloaded with too much content;
- content clipping below the border;
- several physical cards appearing vertically;
- internal article scrolling used as a substitute for page planning;
- page navigation coupled to MutationObserver refreshes;
- multiple hidden physical Tarot shells;
- Water-specific lens logic in the renderer;
- preview made visible before final layout;
- counts shown without explaining incompatible count semantics;
- tab content repeated across chapters;
- confidence labels left undefined;
- chronology invented because a chronology tab exists;
- related items presented as co-occurrences without evidence;
- raw/private dream content placed in public assets.

These are now explicit anti-patterns, not merely historical notes.

