# v57 Data, Geography, Readings and Evidence Rules

## Authoritative v57 source commit

The source-only v57 package supplied in the original development work was identified as authoritative at commit:

`15e876ec2f514e20a47a261e3211077113dd29d8`

The most important original source files were:

- `source/app/completeSymbolData.ts`
- `source/app/symbolData.ts`
- `source/app/symbolGeography.ts`
- `source/app/symbolMetrics.ts`
- `source/app/geographyData.ts`
- `source/app/interpretiveData.ts`
- `source/app/lensEvidenceData.ts`
- `source/app/UniversalSymbolTarot.tsx`
- `source/docs/DREAMSCAPE_PIPELINE_SPEC.md`

Additional Hearthlands place corpora supplied later:

- `currentHouseData.ts`
- `placeSeriesData.ts`
- `samWorldData.ts`

The full uncompressed source files are not all stored in this current repo branch. The branch does contain a mounted Family Home reading adapter and the exact Family Home pilot data needed for the current pilot. If the next thread needs to expand beyond Family Home, reattach the original v57 source-only package or these authoritative files.

## Symbol-membership rule

Do not infer Hearthlands membership from `completeSymbolData.ts` headline `territory` or `placement` fields.

v57 rebuilds territory counts from each symbol's deduplicated source dreams. A symbol belongs to Hearthlands if at least one authoritative source dream intersects Hearthlands, including a single rare appearance.

Place placement is stricter: `symbolGeography.ts` intersects each symbol's source-dream IDs with each mapped place corpus. Only non-zero intersections justify named-place placement.

## Hearthlands symbol count

The verified v57 result is:

- 76 evidenced Hearthlands symbols
- visible `79 symbols` labels in older UI are stale
- seven symbols with no Hearthlands dream evidence: Bull, Hill, Mila, Mountain, Rock, Television, Uniform

The 76 evidenced Hearthlands symbols are:

Alex; Alice; Bag; Bed; Bench; Bicycle; Boat; Book; Box; Brother; Bus; Car; Carl Jung; Cat; Chair; Clock; Clothes; Computer; Cow; Dad; Dog; Door; Drink; Egg; Field; Fire; Fish; Food; Forest; Garden; George; Grandma; Grass; Gun; House / Home; Insect; Key; Knife; Lake; Light; Lily; Lion; Max; Mirror; Money; Mum; Natalie; Ocean; Octopus; Percy; Phone; Plane; Rain; River; Sea; Sheep; Shirt; Shoe; Sister; Sky; Snake; Snow; Stephen Coarse; Storm; Sun; Table; Teddy; Toy; Train; Tree; Water; Wayne; Weight; Wind; Window; Woods.

## Full Hearthlands matrix result

From the authoritative supplied matrix:

- 76 total Hearthlands symbols
- 48 intersect one or more named Hearthlands places
- 28 have Hearthlands-level evidence only and therefore must not be assigned false named-place precision
- all six places and single appearances are retained

When expanding the visual system, cluster only the 48 place-supported symbols around places where the matrix count is non-zero. The remaining 28 belong in the wider territory.

## Six Hearthlands places

v57 defines six mapped Hearthlands places:

1. Cambridge Road Childhood House — 3 source dreams
2. Family Home — 2 source dreams
3. Current / Present House — 31 source dreams
4. The Large Many-Roomed House — 6 source dreams
5. The Unfamiliar House — 5 source dreams
6. The Haunted 17-Bedroom Mansion — 1 source dream

The Haunted Mansion is rare but must not be dropped.

## Family Home pilot set

Exactly 13 symbols have non-zero Family Home intersections in the current pilot:

| ID | Name | Hearthlands dreams | Family Home dreams | Zoom tier |
|---|---|---:|---:|---|
| house | House / Home | 109 | 2 | territory |
| mum | Mum | 35 | 2 | territory |
| water | Water | 30 | 1 | territory |
| garden | Garden | 25 | 1 | territory |
| cat | Cat | 23 | 1 | territory |
| dog | Dog | 15 | 1 | place |
| window | Window | 12 | 1 | place |
| bed | Bed | 11 | 1 | place |
| light | Light | 7 | 1 | place |
| sea | Sea | 6 | 1 | close |
| fish | Fish | 3 | 1 | close |
| egg | Egg | 2 | 1 | close |
| octopus | Octopus | 1 | 1 | close |

The exact current implementation is in:

`src/family-home-pilot-data.js`

The visual asset requirements and composition metadata are in:

`assets/family-home-pilot/manifest.json`

## Semantic zoom rule

Territory view should be quiet and show only major legible presences.

Place approach reveals more symbols.

Close view reveals rare/subtle objects.

All discoverable does not mean all 76 visible at once.

Current Family Home tier exposure:

### Territory
House / Home, Mum, Water, Garden, Cat

### Place
All territory symbols plus Dog, Window, Bed, Light

### Close
All 13, including Sea, Fish, Egg, Octopus

## Reading architecture

v57's reader uses seven sections:

1. Overview
2. Where it appears
3. Recurring patterns
4. Appears alongside
5. How it changes
6. Source dreams
7. Possible meanings

Do not collapse evidence into interpretation.

The current pilot adapter is:

`src/v57-family-home-readings.js`

Authored interpretive profiles mounted in the pilot:

- House / Home
- Water
- Mum
- Cat
- Dog

The remaining eight pilot records are deliberately evidence-only where no authored profile is mounted. Do not fabricate interpretive prose.

## Tarot artwork

The original v57 package contained all 83 `*-symbol-tarot.webp` files.

The current pilot attempts local assets first at:

`/assets/symbol-tarot/<id>-symbol-tarot.webp`

and falls back to the old v57 host:

https://dreamscape-dream-planet.sc352b.chatgpt.site/

The integrity suite checks that all 13 pilot tarot references are reachable.

## Evidence principles that must remain intact

- unique dream counts, not raw duplicate rows
- people and animals are real beings first, not automatically symbolic functions
- interpretation remains distinct from events/evidence
- possible meanings are provisional, not diagnoses or translation keys
- sparse evidence remains sparse; do not inflate it
- single appearances are retained
- dreamer associations can revise readings
- map proximity must never be treated as corpus co-occurrence unless the data supports it
- visual placement is an interface decision, not an interpretive claim