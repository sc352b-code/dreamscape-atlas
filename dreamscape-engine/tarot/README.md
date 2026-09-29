# Dreamscape Tarot Engine v1

Use this directory for all new Tarot generation.

## Canonical flow

1. Analyse the user's full private corpus using the theory-neutral extraction rules in:
   - `../docs/tarot-generation-pipeline.md`
2. Produce a public-safe derived analysis matching:
   - `../schemas/tarot-analysis-v1.schema.json`
3. Build the Tarot package with:
   - `buildTarotCardV1()` in `build-card.js`
4. The builder creates the page plan through:
   - `planCompanionCards()` in `companion-plan.js`
5. The resulting package must satisfy:
   - `../schemas/tarot-engine-card-v1.schema.json`
   - `../contracts/tarot-engine-contract.v1.json`
6. Validate:
   - `npm run tarot:validate`
7. Run regression tests:
   - `npm test`
8. Perform desktop and mobile visual QA.
9. Do not merge to production without explicit approval.

## Never generate a new Tarot by copying old DOM/CSS

Water is the current canonical v1 exemplar.

The following are **legacy/pending migration** and are not templates:
- House/Home
- Cat
- Dog
- Family Home
- Natalie / person-11

See:
- `../contracts/tarot-migration-status.json`

## Minimal builder usage

```js
import {buildTarotCardV1} from './build-card.js';

const tarot = buildTarotCardV1(derivedAnalysis);
```

`derivedAnalysis` must be public-safe derived data. Raw dream text and private dream records do not belong in this object.

## Structural rules the builder/planner protect

- seven canonical chapters;
- evidence / source / interpretation separation;
- fixed 2:3 companion Tarot;
- one permanent card shell per selected tab;
- pagination instead of overflow;
- generic interpretive lens pagination;
- source dreams as a private-library doorway;
- exact subject artwork reused as deck edge;
- image-led preview;
- no Water-specific renderer logic;
- contract versioning and provenance.

## What remains human-reviewed

The engine can enforce structure and data semantics, but visual quality still requires review.

Before propagation, check:
- typography remains readable;
- no page overflows;
- no clipping;
- frame is genuinely the subject deck frame;
- page controls work;
- main Tarot remains the visual focus;
- mobile preserves the same artefact hierarchy;
- wording is accurate to the corpus and not repetitive.

A runtime page-fit audit emits `dreamscape-tarot-fit-failure` if a fixed card exceeds its content budget. Treat that as a failed QA condition and repaginate; do not shrink the type or card.

