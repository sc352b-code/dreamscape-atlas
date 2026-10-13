# Current Build State

## Runtime state to inherit

The last app-behaviour commit before handover documentation began is:

`fcfe2e46f0574ef782afe43234462435c25411fd` — `Wire explicit Family Home approach scene`

Later commits that only add files under `handover/` or packaging automation should not be interpreted as changes to the runtime product.

## Production

`main` is intentionally frozen at:

`27243e76c1f25e0fee32f6f8b4bf5f0bc6d5d08f`

Production URL:

https://dreamscape-atlas-sc352b-2806.vercel.app/

Do not merge the current draft PR until the pilot is validated.

## Development preview

Branch: `family-home-pilot`

Preview URL:

https://dreamscape-atlas-git-family-home-pilot-sc352b-2806.vercel.app/

The preview currently includes:

### Hearthlands / Family Home

- six v57 Hearthlands places retained
- Family Home uses a dedicated approach scene after selection
- oversized map labels / generic place UI are suppressed as the user enters Family Home
- visible semantic controls for moving inward and back out
- territory / place / close semantic states
- no legacy `hearthlands-symbols.js` or `hearthlands-symbols.css` glyph system loaded
- art and hotspot layers are separate
- missing art keeps its hotspot disabled

### Important recent correction

A hand-coded purple SVG Octopus was briefly present and looked like a sticker/cartoon. It was explicitly rejected and deleted from the branch.

Do not recreate or restore it.

The rejected file was:

`assets/family-home-pilot/family-home-octopus-tile.svg`

The correct visual target is a painterly environmental/regional tile that feels like the fox already painted into the Hearthlands world.

### Family Home source crop

The repository contains:

`assets/family-home-pilot/family-home-octopus-source-crop.webp`

This is the registered source crop used for the regional-inpainting method. It is not itself the finished Octopus art tile.

The crop registration is:

- canonical master size: 1672 x 941
- x: 518
- y: 292
- width: 334
- height: 226
- approx percentages: left 31%, top 31%, width 20%, height 24%

### Approved painterly Octopus image from the long thread

A much better painterly image was generated and the user explicitly said it was great.

Generation ID:

`ce2b6774-f44c-4517-a6ef-76c84dae5cd0`

Thread-local path:

`/mnt/data/twilight_cottage_garden_by_the_stream.png`

It is NOT currently in GitHub because the local binary runtime failed. Treat it as an approved reference/asset to carry manually into the next thread if accessible.

### Tarot / readings

`src/v57-family-home-readings.js` is the mounted adapter.

Authored v57 profiles are mounted for:

- House / Home
- Water
- Mum
- Cat
- Dog

The other eight Family Home records resolve to their v57 identity, geography and tarot art without inventing an authored interpretation.

### Integrity suite

`tests/family-home-integrity.mjs`

Workflow:

`.github/workflows/family-home-integrity.yml`

The suite verifies:

1. exactly 13 Family Home symbols
2. every symbol has non-zero Family Home evidence
3. every symbol resolves to a v57 record
4. referenced tarot images are reachable
5. absent painted art cannot create a visible/clickable hotspot
6. semantic zoom tiers expose intended records
7. legacy glyph overlay is not loaded
8. authored v57 profiles are mounted for House, Water, Mum, Cat and Dog

The integrity workflow has repeatedly passed on the pilot branch.

### Cosmic atmosphere

Current branch keeps:

- dark / expansive cosmic background
- sparse stronger glints
- rare cinematic shooting stars
- user-controlled sound toggle with persisted preference

### Cosmic audio — latest direction

The earlier continuous filtered noise sounded like a vacuum cleaner and was rejected.

The current development audio removes the broadband noise and moves toward a two-note celestial pattern:

- alternating lower / higher pitched tones
- soft attack
- long decay
- quiet harmonic bed
- approx one alternate tone every ~3.6 seconds
- persistent mute state
- starts after first user gesture because of browser autoplay restrictions

The exact current implementation is in `src/cosmos-ambience.js`.

The user asked for the feeling of repeatedly alternating higher/lower piano-like notes as a background space twinkle, not mechanical noise.

## Known limitation at handover

The application architecture, readings, tests, semantic controls and audio are ahead of the visual art production.

The next thread must NOT call the Family Home visual pilot complete until a real painterly Octopus regional tile is mounted and validated in the actual preview.