# Dreamscape Tarot Engine Contract v1.0

This is the canonical specification for every new Dreamscape Tarot generated from a dream corpus.

Water is the gold-standard exemplar, but **Water-specific content is not the engine**. The engine is the set of evidence, privacy, layout, interaction and generation rules below.

## 1. Core principle

A Dreamscape Tarot is a corpus-grounded artefact, not a dream dictionary and not a decorated webpage.

The user should experience:

**painted world subject → stable image-led preview → main pictorial Tarot → fixed companion Tarot card(s) containing evidence / interpretation**

The pictorial Tarot remains the primary artefact. Information is expressed through companion cards from the same deck.

## 2. Corpus-first generation pipeline

Every Tarot must be generated in this order:

1. **Neutral extraction**
   - identify the subject's source-dream appearances;
   - preserve dream IDs/dates privately;
   - record literal form, actions, context, people/places around it, territory membership and chronology;
   - do not interpret during extraction.

2. **Derived evidence**
   - unique dream count;
   - recorded appearance count;
   - territory memberships;
   - recurring functions/actions;
   - verified co-occurrences where available;
   - chronology only when evidence supports one.

3. **Interpretation**
   - possible meanings and named theoretical lenses;
   - literal/autobiographical explanations remain available;
   - interpretations are hypotheses, never translations.

4. **Visual generation**
   - create/select the subject Tarot artwork;
   - this artwork becomes the exact deck-edge source for its companion cards;
   - do not invent a second decorative border system.

5. **Pagination plan**
   - assign content blocks to fixed Tarot pages before rendering;
   - if content will not fit cleanly, add another page;
   - never solve overflow by shrinking type, increasing card height or allowing vertical card stacks.

6. **Validation + visual QA**
   - machine contract validation;
   - automated regression tests;
   - desktop visual review;
   - mobile visual review;
   - only then may a Tarot propagate to production.

## 3. Count semantics

Three quantities must never be conflated:

- **unique dream count** = number of distinct dreams containing the subject;
- **appearance count** = number of recorded subject appearances/events;
- **territory membership count** = number of subject-containing dream memberships across territories.

If territory memberships overlap, their sum may exceed unique dream count. The Tarot must explicitly declare `geographyCountMode: "overlapping-memberships"` and explain this to the user.

Never force overlapping territory figures to add to the unique-dream count.

## 4. Evidence semantics

Recurring functions describe what the subject repeatedly **does / participates in** across dreams.

If confidence labels such as High / Medium-high / Medium are used:
- the Tarot must define them;
- they are qualitative evidence-strength labels unless a numerical methodology explicitly exists;
- they must never be presented as probabilities or percentages without such a model.

Related items must carry an explicit relationship status:
- `cooccurrence-verified`;
- `related-not-cooccurrence`;
- or `pending`.

Do not imply same-dream co-occurrence from visual proximity or thematic relatedness.

Chronology must be evidence-led. If there is no reliable developmental trend, say so. Never invent a story of progression merely because a chronology tab exists.

## 5. Interpretation boundary

Evidence and interpretation must remain distinct in both data and design.

Interpretive language uses forms such as:
- “may represent”;
- “one possibility is”;
- “a Jungian amplification might…”;
- “this becomes more persuasive where…”.

Never use fixed translation language such as “Water means emotion.”

Real people are literal people first. Symbolic/archetypal readings are optional secondary lenses and must not erase biographical reality.

## 6. Canonical chapters

Every new full Tarot uses these stable navigation chapters:

- Overview
- Where it appears
- Recurring patterns
- Appears alongside
- How it changes
- Source dreams
- Possible meanings

Navigation labels remain literal. In-card titles may be more poetic.

## 7. Fixed companion-card rule

This rule is non-negotiable:

> **Lock the physical dimensions of the companion Tarot. Never let content determine its height. Never shrink text below the chosen readable hierarchy. Never let one card flow into another vertically. Paginate instead.**

Implementation:
- fixed 2:3 physical card ratio;
- exactly one permanent companion Tarot shell per selected tab;
- multi-page tabs swap title/content **inside the same shell**;
- do not create a vertical stack of hidden/showing physical Tarot elements;
- no ordinary scrolling article inside a Tarot card;
- no content may escape the safe interior of the frame;
- page arrows/dots are integrated into the card.

The single-shell mechanism exists specifically because multiple hidden card elements caused repeated interaction and rendering failures during the Water prototype.

## 8. Frame fidelity

Companion cards use the subject Tarot artwork itself as the frame/deck-skin source.

Required:
- same real edge ornament;
- same corner motifs;
- same gold treatment;
- same silhouette;
- same subject-specific deck identity.

Forbidden:
- a separately invented “similar ornate” frame;
- a generic SVG border that merely approximates the subject card.

## 9. Page planning and content budgets

The generation layer must plan pages before rendering.

A page should normally contain:
- one primary information idea;
- no more than three substantial blocks;
- short explanatory prose rather than essay-length copy;
- only the items that can remain legible at the canonical type scale.

When uncertain, **paginate earlier**.

Examples:
- Overview may require Record / Action / Recurring Actions cards.
- Recurring Patterns may require Evidence Strength / Pattern cards.
- Possible Meanings may require separate readings and lens cards.
- Source Dreams is a doorway card, not a list of dozens of dream records.

## 10. Source-dream privacy

The public repository/package may contain:
- derived summaries;
- aggregate counts;
- non-sensitive public-safe metadata.

It must not contain:
- raw private dream text;
- private identity mappings;
- private full dream records.

“Source dreams” opens the authenticated/private corpus layer. If private records are not connected, the public Tarot must not fabricate them.

## 11. Stable preview opening

The compact information preview must be fully composed before it becomes visible.

Sequence:
1. populate data;
2. apply final image-led preview structure;
3. determine final dimensions;
4. position using untransformed geometry;
5. force layout;
6. reveal using **opacity and transform only**.

Never animate or change width, height, padding, position, image ratio or content structure after first visible paint. This rule prevents the preview twitch seen during Water development.

## 12. Pagination interaction contract

Page controls must:
- operate inside one permanent card shell;
- update page index, title, content, counter and dots together;
- not change the selected chapter;
- not depend on MutationObserver refreshes;
- not recreate the frame or navigation controls;
- use one stable event path;
- remain keyboard-accessible.

Changing tabs intentionally returns that tab to page 1. Turning pages within a tab preserves the tab.

## 13. Responsive contract

Desktop:
- retain Atlas/world context where practical;
- main pictorial Tarot remains visually dominant;
- companion Tarot sits alongside it when space permits.

Compact desktop/tablet:
- preserve the same artefact hierarchy;
- do not revert to a long website article.

Mobile:
- main Tarot;
- chapter selector;
- one fixed companion Tarot;
- page controls inside that Tarot.

No breakpoint may fall back to generic dashboard/article styling.

## 14. CSS/runtime architecture

For new Tarot work:
- one canonical companion-card CSS system;
- do not layer a new experimental Tarot system beneath/above the canonical one;
- do not use card pseudo-elements for critical frame identity when older selectors may collide;
- critical frame is a real `.tarot-companion-frame` element;
- one permanent `.tarot-companion-page` shell;
- inactive authored blocks live outside the visible body and are swapped in;
- page turning must not require class mutations observed by the global Tarot observer.

Historic classes such as `tarot-v3-water`, `tarot-sidepanel`, and earlier experimental companion-frame systems are not templates for new work.

## 15. Generation portability

The engine must remain subject-agnostic:
- symbols;
- places;
- people;
- animals;
- objects;
- territories.

Lens pagination is generic (`lens:0`, `lens:1`, …), not hard-coded to Water/Jungian/story/life names.

Subject-specific language, imagery and motifs may vary. The structural contract does not.

## 16. Release gate

A new Tarot cannot be considered engine-ready until:
- the contract validator passes;
- automated tests pass;
- count semantics are explicit;
- relationship semantics are explicit;
- chronology is honest;
- interpretation boundaries are visible;
- private dream content stays private;
- preview opens without layout jump;
- every multi-page control works;
- no content clips or escapes the card;
- desktop has been visually reviewed;
- mobile has been visually reviewed;
- explicit approval is given before production merge.

## 17. Two acceptance tests

**Visual test:** if the text were removed, the companion card should still look like a deck-mate of the pictorial Tarot.

**Evidence test:** if the ornament were removed, every surviving statement should still be justified by the corpus or explicitly labelled interpretation.



## 18. Self-describing subject identity

Every canonical Tarot package is portable and must identify itself without relying on the surrounding JSON key or file path.

Required:

- `subjectId`;
- `subjectType`;
- `title`.

Supported subject types:

- place;
- symbol;
- person;
- animal;
- object;
- territory.

The private corpus access subject ID must match the Tarot package `subjectId`.

## 19. Engine enforcement files

The contract is enforced through:

- `dreamscape-engine/schemas/tarot-analysis-v1.schema.json`;
- `dreamscape-engine/tarot/build-card.js`;
- `dreamscape-engine/tarot/companion-plan.js`;
- `dreamscape-engine/schemas/tarot-engine-card-v1.schema.json`;
- `scripts/validate-tarot-engine.mjs`;
- `tests/tarot-engine-contract.test.js`;
- runtime fit auditing in `src/hearthlands-tarot-v2-overlays.js`.

A runtime overflow event `dreamscape-tarot-fit-failure` means the page plan failed. The remedy is to repaginate, not to shrink typography or make the card taller.
