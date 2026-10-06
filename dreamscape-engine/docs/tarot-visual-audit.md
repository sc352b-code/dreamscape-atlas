# Dreamscape Tarot visual audit — border, typography and display

Date: 2026-10-06
Canonical exemplar: Water
Status: visual direction for Tarot Engine v1

## Overall finding

The companion Tarot now belongs recognisably to the Water deck, but it is not yet at final visual quality.

The main pictorial Water Tarot is still the strongest object. The companion card currently achieves continuity by masking strips from the full Water painting around its edges. That works as a prototype, but it reads as a cropped picture rather than a purpose-built illuminated frame.

The next visual goal is:

> **same deck, same ornament, different function**

The main Tarot is pictorial. The companion Tarot is textual/diagrammatic. They should share the same ornamental DNA without forcing the same landscape bitmap to do both jobs.

## Border audit

### What works

- gold botanical/celestial language clearly belongs to the Water Tarot;
- dark blue-black field is compatible with the Atlas;
- moon/celestial cues connect to Dreamscape's wider visual world;
- border establishes the card as an artefact rather than a website panel.

### What does not yet work

- the border is currently made from masked strips of the entire pictorial card;
- scenic mountains, water and flowers become visible as accidental edge fragments;
- the scenic strips are too thick, so the eye reads “cropped Water image” before “ornate companion card”;
- ornament does not have enough independent hierarchy from the painting;
- the current method will be inconsistent across future Tarot artworks whose scenery reaches the edge differently.

### Final-quality border rule

Create a dedicated `companionFrameImage` for each deck/subject visual family.

It should be derived from the approved pictorial Tarot and retain:

- the same gold filigree;
- the same corner botanical motifs;
- the same moon/celestial crown language;
- the same line weight and aged-gold character;
- the same silhouette/proportions;
- any deck-specific sigil used in the approved art.

It should remove or greatly suppress:

- landscape;
- figures;
- water/sea imagery;
- large scenic colour fields;
- accidental subject composition.

The result should look like the **empty illuminated frame from the same physical deck**.

Until that frame asset exists, the masked artwork edge is a prototype fallback only.

## Recommended frame proportions

For a 2:3 companion card:

- ornamental side rail: approximately 6–7% of card width;
- ornamental top crown: approximately 8–9% of height;
- ornamental lower rail: approximately 7–8% of height;
- one luminous outer gold line;
- one restrained inner gold line;
- dark breathing room between ornament and reading field.

The information field should feel protected by the frame rather than squeezed by it.

## Typography audit

### Current strengths

- old-style serif/italic display language suits the oracle/Tarot identity;
- warm ivory and gold hierarchy works against the midnight field;
- small-caps evidence labels help distinguish evidence from interpretation.

### Current weaknesses

- the font stack is system-dependent, so the exact character changes by device;
- some utility labels are too small and feel like UI metadata rather than inscription;
- too many sizes/styles compete in dense cards;
- some page subtitles repeat the same hierarchy as the heading;
- the body can still feel like website copy when paragraph width is too broad.

## Typography hierarchy

Use four roles only:

1. **Chapter title**
   - exact tab label;
   - luminous old-style serif;
   - approximately 27–31px at canonical card size;
   - italic is appropriate where it matches the pictorial Tarot.

2. **Page topic**
   - subordinate to chapter title;
   - approximately 12–14px;
   - warm gold;
   - may be italic.

3. **Body / evidence prose**
   - upright highly readable serif;
   - approximately 12–13px at canonical card size;
   - 1.45–1.6 line-height;
   - pale parchment/ivory rather than pure white.

4. **Evidence/source/interpretation labels**
   - minimum approximately 8–9px;
   - widely tracked small caps;
   - celestial blue for evidence/source; restrained mauve/rose-gold for interpretation if needed.

Do not solve fit problems by dropping below the hierarchy. Paginate instead.

## Font asset recommendation

The current system-font stack is acceptable for prototype continuity but not sufficient for a polished cross-device app because rendering changes by operating system.

Before final production polish:

- choose one licensed bundled web display serif and one highly readable companion text serif;
- load them locally through the app rather than relying on an external font CDN;
- retain the current fallback stack for resilience;
- evaluate numerals, italics, small caps and long-form readability before locking.

The font should feel:
- manuscript-like;
- elegant;
- slightly old-world;
- not faux-medieval;
- readable at mobile size.

## Display / information-field audit

### What works

- fixed 2:3 card object;
- same physical shell through pagination;
- literal chapter headings;
- celestial glyphs;
- dark field with restrained gold;
- evidence and interpretation remain structurally distinct.

### Refinements now required

- horizontally clipped chapter tabs must always be reachable;
- dead arrows must never be displayed;
- previous-page navigation must be visible whenever a prior card exists;
- long explanatory prose must get a new Tarot page rather than clip at the lower border;
- page dots should remain a secondary navigation aid, not the only indication of more content;
- dense chapters should split at a conceptual boundary rather than arbitrary word count.

## Navigation display rule

### Chapter navigation

- horizontally scrollable by touch/trackpad/mouse wheel;
- previous/next chapter edge controls remain visible;
- selected tab automatically scrolls into view;
- impossible previous/next chapter arrows are hidden.

### Companion-page navigation

- no arrows for a one-page chapter;
- first page: next arrow only;
- middle page: previous + next;
- final page: previous arrow only;
- page dots always reflect current page and remain clickable;
- left/right keyboard navigation supported when focus is in the card controls.

## Celestial/magical alignment

The companion card should feel closer to the Atlas by using atmosphere rather than more ornament everywhere.

Preferred:
- subtle blue/teal radial glow behind the reading field;
- occasional restrained mauve/indigo depth;
- gold lines that brighten slightly at intersections/sigils;
- tiny celestial points or star-like separators;
- gentle luminous focus around medallions/glyphs;
- quiet animated shimmer only if it remains almost imperceptible and respects reduced motion.

Avoid:
- glitter;
- constant pulsing;
- large gradients that resemble SaaS UI;
- heavy glassmorphism;
- generic fantasy SVG flourishes unrelated to the approved Tarot.

## Current Water actions from this audit

Implemented immediately:
- chapter navigation edge controls are visible;
- active tab scrolls into view;
- mouse wheel/touch can traverse the tab strip;
- impossible chapter/page arrows are hidden;
- page arrows are larger, clearer touch targets;
- backward card navigation is preserved;
- geography explanation moved to its own second card;
- scenic frame strips reduced;
- an additional gold line hierarchy was added;
- information field received slightly more celestial depth;
- engine now supports `companionFrameImage`.

Still required for final visual quality:
- create the dedicated ornament-only Water companion frame asset;
- select/bundle final production serif typography;
- visually QA all seven chapters on laptop, wide desktop and mobile after the frame/font asset pass.



## Implemented prototype correction — ornament-only fallback

The interim Water fallback no longer uses scenic masked strips from the pictorial Tarot.

When `companionFrameImage` is absent, the runtime now renders a CSS ornament frame with:
- moon-phase crown;
- layered warm-gold rails;
- four corner filigree geometries;
- side and lower celestial sigils;
- dark breathing margin.

This is intentionally a **visibly different fallback** from the earlier scenic crop. It remains subordinate to the future dedicated ornament-only Water frame asset.

Typography has also been made visibly distinct in the prototype:
- display: Baskerville / Palatino family;
- reading copy: Georgia family;
- larger chapter title;
- larger body text and line-height;
- more legible small-caps labels.

Scroll stability is part of visual QA: no tab visibility helper may use `scrollIntoView()` because it can move the vertical reader. Horizontal tab reveal must operate directly on the tab strip's `scrollLeft`.
