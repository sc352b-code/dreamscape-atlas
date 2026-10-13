# Dreamscape — current implementation handover

## Branch and delivery

Development branch: `codex/dreamscape-foundations`, based on main `f62ca7407b8f194cfb7b1ba0667d5e573c351be4`. Use `git log -1` for the implementation checkpoint. No production branch changes, remote pushes, merges or deployments were performed. Existing `family-home-pilot` at `b3af00d22dd0a2cd4d8688efbf44b121a5aba305` is preserved.

The full roadmap and factual baseline are in IMPLEMENTATION_PLAN.md. The four supplied PDFs were read in full before application changes. The exact historical master-handover filename is absent; the pilot's handover/ folder was inspected. Historical production/preview URLs must not be represented as current previews of this stage.

## Architecture

One vanilla JavaScript application, preserving the existing stack. `src/app/rooms.js` defines the exact nine-room registry. `src/app/cosmos.js` mounts one persistent DreamscapeCosmosBackground behind all foreground rooms. `src/app/offline.js` stores user-scoped local drafts in IndexedDB. `src/app/app.js` owns room navigation and first-stage UI. Node `server.js` provides the same-origin API and restricted static server. `backend/store.js` provides SQLite persistence. `engine/evidence.js` provides deterministic evidence matching, period boundaries and statistics.

Database tables: users, sessions, entries, readings, favourites. Entries contain kind, stable id, dream date, current narrative, originalText, associations, user-marked flags, tags, revision and edit history. Readings snapshot their source excerpts, source IDs, period and corpus version. Favourites reference source records instead of duplicating them.

## Canonical assets and Dream World

Exact original cosmos: assets/cosmos/original-cosmic.avif, decoded without re-encoding from assets/generated/cosmic-00.b64 … cosmic-03.b64. See assets/cosmos/PROVENANCE.md for SHA-256 and dimensions. No replacement background was generated.

The preserved reference entry is dream-world-reference.html, embedded beneath the shared cosmos. Sam reference uses the pilot branch's original territory-cosmos renderer and five exact `assets/territory-planets/*-final.png` textures, plus existing Hearthlands map/navigation. Imported files: src/territory-cosmos.js, src/territory-cosmos.css, src/world-runtime-config.js. Only renderer import path, approved room naming and motion/visibility safeguards were adapted. The richer Family Home pilot remains on its original branch for the next continuity stage; its missing painted Octopus is not silently substituted.

Natalie uses the existing main renderer. Old Tarot wording/identifiers were removed; symbol discovery is a Dream World detail view, with explicit reference status. Original rotating surfaces/art remain preserved. No Tarot feature or separate symbolic card room is exposed. Three.js 0.180.0 is packaged locally through an integrity-locked npm dependency; no browser CDN trust bypass is used.

These Sam/Natalie views are reference exemplars, not generated from the signed-in user's corpus. Their source datasets are incomplete and historical counts are not presented as current-user statistics.

## What currently works

- Nine-room Home Hub, shared exact-art cosmos with slow drift, distinct layer motion, independent twinkling, rare 20–50-second shooting stars and reduced-motion/hidden-tab handling.
- Development account registration, sign-in, sign-out and revocable HTTP-only sessions. Server-enforced account isolation; private DB never served.
- Dream and Waking journals: typed entries, titles/dates/tags/flags, personal association notes, search, edits retaining originals/history, delete, JSON import/export.
- Local drafts; submitted offline drafts survive reload in the previously signed-in tab, then sync with idempotent creation and revision checks. A new tab requires online sign-in before accessing account-scoped drafts. API data is never service-worker cached.
- Oracle evidence reflection: all dreams in selected period considered, unrelated dreams excluded, exact excerpts/counts/source links, immutable history, stale-version indication, favourites and print layout. Duplicate unchanged reflections reuse stored results.
- Deterministic period counts/tag chart/evidence summaries, user-marked Luminous Messages and entry/reading favourites.
- Existing rotating reference worlds under the shared navigation.

## Limits that must remain visible

The reflection is a small-vocabulary deterministic development fallback, not an AI Oracle reading. It establishes recurring imagery, not a psychological overarching theme. Person-centred artwork is not generated. The supplied April 2025 Oracle image is a visual reference, not source-corpus validation.

Podcast audio, transcription, PDF/photo imports, personal corpus-derived planets/maps, full AI reports/conversations, named collections, billing and usage entitlements are unfinished. AI/image/speech/payment providers are not configured or verified; no dream text has been sent to them.

Accounts lack email verification, recovery, MFA and launch-grade operational monitoring. SQLite has restricted file permissions, but this stage does not provide managed encryption-at-rest/backups. Account deletion clears active relational records/sessions and the current browser's account draft store; backup retention and erasure on other devices remain launch-stage work. Do not claim production or legal readiness.

## Preview and verification

The stage runs inside the cloud workspace. No public preview URL exists for these changes. A Node host with HTTPS and persistent storage is needed for a shareable account-backed preview; existing static Vercel deployment details do not establish that hosting capability.

Run `npm ci --cache /tmp/dreamscape-npm-cache`, then `npm run dev` (port 4173), or set PORT and matching DREAMSCAPE_ORIGIN. Store the private DB outside the checkout using DREAMSCAPE_DB. Setup and service restart instructions are saved separately in the environment draft.

Run `npm test` for ownership/date/evidence/session/import/artwork tests. Run `python tools/browser-smoke.py` with platform Python Playwright and system Chromium for real UI behaviour. It creates isolated synthetic QA records, uses a temporary database and deletes it after execution. Screenshots under `/tmp/dreamscape-review` are visual review artifacts, not real user dreams or a public deployment.

## Next inputs and stage

Next priority: real Oracle intelligence and person-centred art, with explicit provider-processing consent, evidence validation, job history and cost ceilings. Actual April 2025 narratives are absent. No text/image provider credentials are configured. Collect these through secure environment configuration, never chat or Git. Complete available foundation work while these are unavailable. Never hard-code the example message or invent thirteen source dreams.
