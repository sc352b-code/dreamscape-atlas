# Dreamscape Tarot v2 — corpus-grounded revelation cards

## Purpose

A Dreamscape tarot is not a generic dream-dictionary definition. It is an evidence-led reading of one recurring place, person, animal or symbol across the user's evolving dream corpus.

The interaction sequence is:

**painted subject → hover identity → anchored evidence preview → full tarot dossier**

The map remains the main event. Tarot only opens after a deliberate second action from the anchored preview.

## Required experience

### 1. Hover

Hovering the exact painted subject should:

- brighten/glow that subject locally;
- show the correct label anchored to the registered centre point;
- never show a generic floating square or a label detached from the subject;
- preserve privacy gating for person identities.

### 2. Anchored evidence preview

Clicking the subject opens a small card beside the subject, containing only enough information to confirm the selection and invite deeper exploration:

- semantic title;
- `Recurring symbol`, `Recurring place`, or equivalent type;
- one concise corpus-grounded summary;
- known whole-series and current-territory counts where available;
- **Open tarot →**.

The exact painted subject stays highlighted while the preview is open.

### 3. Full tarot dossier

The full tarot should support these sections.

#### Corpus overview

- number of dreams in the whole series containing the subject;
- status of that count (`known`, `private`, `pending`, etc.);
- territory geography: number of appearances in each Dreamscape territory;
- no invented counts.

#### Dream records

Authenticated/private access to the dream-by-dream corpus records in which the subject appears. Public runtime data must never contain raw dream text or private record details.

The private provider should eventually expose a method equivalent to:

```js
getDreamRecords(subjectId)
```

The tarot UI may show the number of available private records and open the authenticated record browser, but the record payload remains outside the public world package.

#### Recurring functions

A short set of corpus-derived patterns describing what the subject tends to *do* in the dreams rather than what it supposedly means universally.

For a recurring person this might include patterns such as accompanying, challenging, protecting, connecting generations, carrying desire, or appearing during transitions — but only when the corpus evidence supports those functions.

Each function should carry evidence references and, where useful, a confidence level.

#### Possible meanings

A synthesis grounded in those recurring functions and contexts. It should preserve literal/autobiographical explanations as well as symbolic ones.

Interpretive language should use forms such as:

- `may represent`;
- `one possibility is`;
- `a Jungian amplification might read this as`;
- `this becomes more persuasive in dreams where...`.

It must not use translation-key language such as `X means Y`.

#### Interpretive lenses

A tarot may contain several lenses rather than one final answer, for example:

- Jungian/archetypal;
- attachment;
- family systems;
- autobiographical memory;
- narrative/spatial function;
- care ethics;
- another clearly named framework.

Each lens should be tied back to corpus evidence and include a caveat where the framework could overreach.

#### Possible lesson / reflection

A concise reflection on what the recurring pattern might be asking the dreamer to notice, practise, integrate or question.

This is not a diagnosis or authoritative instruction. It is a reflective hypothesis generated from the corpus pattern.

## Example structure for a recurring person

A future private-profile tarot for a person such as Natalie might contain:

- **Whole series:** verified count from the corpus model;
- **Geography:** verified counts by territory;
- **Recurring functions:** a small number of evidence-backed roles actually found in her dreams;
- **Jungian lens:** e.g. an anima-related possibility *only if the dream material supports that amplification*;
- **Alternative lens:** literal relationship/autobiographical role;
- **Possible lesson:** a reflective synthesis grounded in repeated interactions;
- **Dream records:** authenticated access to each source dream.

No number, function, anima interpretation or lesson should be invented merely because the person is important.

## Data contract

`dreamscape-engine/schemas/tarot-card.schema.json` now supports optional Tarot v2 fields:

- `previewSummary`
- `corpusOverview.wholeSeriesCount`
- `corpusOverview.territoryCounts`
- `recurringFunctions[]`
- `interpretiveLenses[]`
- `possibleLesson`
- `reflectionPrompt`
- `dreamRecordAccess`

Older evidence-only cards remain valid while richer corpus analysis is derived and reviewed.

## Privacy rule

The public atlas can contain approved derived summaries and aggregate counts. Raw dreams, private identity mappings and individual dream-record payloads remain in the authenticated private corpus layer.


## Companion Tarot card system

The canonical docked Tarot does not render selected chapters as ordinary web panels.

Each chapter is a **Dreamscape companion Tarot card**: a second physical/mystical card from the same visual deck as the subject artwork.

### Visual contract

A companion card must:

- use the same gilded/celestial deck language as the main Tarot;
- have a physical-card silhouette and multi-layer ornate frame;
- remain beautiful even if its text is removed;
- preserve exact corpus meaning if its ornament is removed;
- use a display-serif / book-serif hierarchy rather than generic application typography;
- compose data as inscriptions, constellations, currents, emblems or manuscript records where appropriate;
- never turn uncertain evidence into decorative certainty.

### Chapter contract

The reusable chapter IDs remain factual and stable:

- `overview`
- `geography`
- `patterns`
- `alongside`
- `chronology`
- `sources`
- `meanings`

A card may additionally supply `companionCards.<chapterId>` metadata:

- `title` — evocative in-card title;
- `subtitle` — concise explanatory inscription;
- `motif` — visual motif identifier;
- `tone` — `evidence`, `source`, or `interpretation`.

The navigation label remains literal and predictable. The companion-card title may be more poetic without changing the meaning of the tab.

### Water gold-standard mapping

Water currently establishes the exemplar:

- Overview → **The Water Record**
- Where it appears → **The Geography of Water**
- Recurring patterns → **The Forms of Water**
- Appears alongside → **The Constellation of Water**
- How it changes → **Water Through Time**
- Source dreams → **The Book of Waters**
- Possible meanings → **The Mirror of Water**

The renderer must remain subject-agnostic so other symbols, places, animals and people can supply their own motifs while remaining recognisably part of the same Dreamscape Tarot deck.

### Responsive rule

Desktop may present the main Tarot and companion card beside each other inside the dock when space allows. Smaller desktop/tablet can place the companion card below the main Tarot. Mobile must preserve the sequence:

**main Tarot → chapter selector → companion Tarot card**

At no breakpoint should the companion card fall back to an ordinary article/page treatment.
