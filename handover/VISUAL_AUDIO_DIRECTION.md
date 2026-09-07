# Visual and Audio Direction

## Core visual standard

Dreamscape should feel celestial, magical, intimate, numinous and exploratory. The world itself should be the interface.

Avoid generic dashboard / wellness-app UI and avoid procedural-looking primary artwork.

The successful reference point is the painterly v57 world and Hearthlands art, but cleaner, deeper and more immersive.

## Hearthlands visual rule

Preserve the canonical Hearthlands background. Do not regenerate or flatten the entire Hearthlands master in a single image-model pass.

Use a layered painted-asset system:

1. canonical background remains unchanged
2. environmental painted sprites or seamless regional art tiles sit precisely over it
3. tiles/sprites appear by semantic zoom level
4. invisible hotspots align separately
5. hover/tap opens discovery UI; the visible art itself contains no interface chrome

## Fox benchmark

The existing fox in the Hearthlands artwork is the target quality for every visible symbol.

A successful symbol:

- belongs physically in the landscape
- shares the scene's lighting, colour, perspective and softness
- does not look like a sticker, badge, icon, glyph or card
- is recognisable at the intended zoom
- is partially occluded when appropriate by water, foliage or architecture
- is placed only where the corpus supports it

## Regional tile method

Preferred next production method for Octopus:

- use a tightly cropped Family Home stream region
- preserve everything already in the crop
- paint one subtle Octopus physically into the water
- composite the approved edited crop back over the untouched master
- use semantic zoom to fade it in
- align an invisible hotspot to the Octopus

Registered source crop:

- master: 1672 x 941
- x = 518
- y = 292
- width = 334
- height = 226

Source crop already in repo:

`assets/family-home-pilot/family-home-octopus-source-crop.webp`

Production brief:

`assets/family-home-pilot/OCTOPUS_INPAINT_BRIEF.md`

## Approved painterly image from the previous thread

The user explicitly approved the image generated with:

`gen_id: ce2b6774-f44c-4517-a6ef-76c84dae5cd0`

Thread-local path:

`/mnt/data/twilight_cottage_garden_by_the_stream.png`

It shows the desired Family Home painterly language and contains an Octopus naturally in the stream.

This PNG is not in GitHub due local runtime failure. Manually transfer it if available. It is preferable to the rejected SVG placeholder.

## Explicitly rejected visual approach

Never restore:

`assets/family-home-pilot/family-home-octopus-tile.svg`

That purple hand-coded SVG looked like a cartoon/sticker and failed the acceptance test.

Never substitute visible glyphs if environmental art is absent.

Current code should keep the hotspot disabled when the art asset fails to load.

## Semantic zoom interaction

The current pilot now has an explicit Family Home approach state.

Desired user journey:

Hearthlands overview -> select Family Home -> enter Place -> Look closer -> Close -> discover subtle symbols -> open tarot/reading -> Back out -> Return to Hearthlands.

The user previously found hidden wheel/double-click semantic zoom confusing. Controls must remain visible and discoverable.

Do not let labels and panels dominate the place once Family Home is entered.

## Cosmos visual direction

Keep the current cosmos but deepen it:

- darker underlying field
- more black negative space
- retain nebulae, filaments and stars
- planet should feel illuminated against expansive darkness
- occasional bright isolated glints
- rare elegant shooting stars
- avoid constant screensaver sparkle

The current implementation lives in:

`src/cosmos-ambience.js`

## Audio direction

The first audible cosmic-hum implementation worked mechanically but the user said it sounded like a vacuum cleaner.

The broad filtered-noise layer was therefore rejected.

Current requested sound character:

- background celestial twinkle rather than continuous noise
- repeatedly alternate a lower note and a higher note
- like two soft piano/bell keys answering each other
- very gentle attack
- long decay / resonance
- quiet and spacious
- not rhythmic enough to become a song
- not mechanical
- not a therapeutic or healing claim

Latest implementation direction in `src/cosmos-ambience.js`:

- broadband noise removed
- faint harmonic bed retained
- alternating low/high pitched tones approximately every 3.6 seconds
- persistent mute preference
- first-interaction start because browsers block unsolicited autoplay
- page-hidden fade / resume handling

The user asked for something closer to a low-note / high-note / low-note / high-note background space twinkle.

## Audio acceptance test

The sound passes only if:

- clearly audible at low volume after first interaction
- does not resemble a fan, vacuum or airflow
- alternation between higher/lower pitches is perceptible
- remains calm and unobtrusive
- mute reliably reaches silence
- preference persists after reload
- mobile browsers start it after a user gesture