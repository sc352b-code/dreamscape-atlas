# Current Dreamscape handover — foundation stage

Branch: `codex/dreamscape-foundations`, based on main `f62ca7407b8f194cfb7b1ba0667d5e573c351be4`.
Resolve the latest exact implementation commit with `git log -1 --format=%H` (avoids a self-referencing commit hash).
Production, `main`, and `family-home-pilot` remain untouched.

## Working capabilities

- Exactly nine approved room routes, connected through one Home Hub and one persistent `DreamscapeCosmosBackground`.
- Original canonical AVIF decoded byte-for-byte; slow image drift, gentle pointer parallax, independent canvas twinkles, glimmers, random shooting stars (20–50s / .7–1.8s), reduced motion and hidden-tab suspension.
- Private local passphrase-protected journals. IndexedDB stores authenticated AES-GCM ciphertext; PBKDF2 SHA256 uses 310,000 iterations. The key is held only in memory. This is not cloud authentication, production user isolation, remote backup or synchronisation.
- Typed/pasted dream and waking entries, encrypted debounced drafts, fast-navigation draft flushing, dream labels, search, editing with original narrative retained, JSON imports with atomic validation/deduplication, readable JSON export, lock and local deletion.
- A complete **local evidence-study journey**: user narratives → calendar period → explicitly supported image thread → matched front/back cards → original source dream dialogs → saved, versioned history → favourites. Different corpora give different supported sources. Only genuinely matching original passages appear. Unsupported periods do not fabricate a reading.
- Existing person-centred illustration clearly labelled as reference artwork. This does not satisfy personalised Oracle artwork generation. Rules-based observations do not replace the specified AI analysis/lens synthesis.
- Deterministic tag/feeling statistics and an initial factual insights digest; user-marked luminous dreams; dream/reading favourites.
- Approved five rotating territory planets and their unchanged textures, with the existing Hearthlands painting and return control. Explicitly labelled as the preserved geography reference, not worlds generated from the local user's dreams.
- Offline cached application shell. Tests reload with the network disabled, unlock the journal and save an encrypted dream. No remote sync states or fabricated remote backup confirmation.

## Artwork provenance

Canonical original chunks: `assets/generated/cosmic-00.b64` through `cosmic-03.b64`, present and identical on main and family-home-pilot.

Decoded image: `assets/cosmos/original.avif`, 1672 × 941, SHA256 `fe6c6e3ea08a4fea7e31fd8ecbaa09e303d2474620e6f7b6bc1af3354439b537`. No image generation, recolouring, recompression or painting change was applied to the bytes. Display-only atmospheric treatment follows the existing darkness, contrast and vignette direction.

Approved textures: five files under `assets/territory-planets/*-final.png`, copied exactly from `family-home-pilot` at `b3af00d22dd0a2cd4d8688efbf44b121a5aba305`. The preserved human-centred illustration is `assets/reference/illuminated-figure.png`. Source paths and hashes are in `assets/reference/provenance.json`.

The supplied cosmic image visually matches the recovered AVIF. The supplied Oracle image was used as a visual reference for matched cards and evidence layout; its April list was not imported as fictional dream narratives. There is no obsolete card-reading room in the active app. Historical terminology remains in untouched old modules/Git history for continuity, without being imported by the new app.

## Files and architecture

`src/app/app.js` owns the shared shell and current room views, with stable hash routes. `rooms.js` is the single room registry; `evidence.js` holds deterministic period/count/citation logic; `vault.js` owns local encryption/storage; `cosmos.js`/`cosmos.css` own background lifecycle; `planets.js` presents the approved reference textures. There is no per-room AI engine.

`index.html` now mounts this application. Old Dream World source modules, paintings and models remain intact. No existing assets were regenerated. `server.js` serves an explicit public path set, rejects checkout metadata and malformed paths, and applies browser security headers. `sw.js` caches only explicit public shell assets, never private journal narratives. The sample is the existing public reference corpus.

## Validation

- `npm test`: 13 executed, 13 passed, 0 failed/skipped. Two original tests are retained, with their world identity-test limitation documented in the plan; 11 new tests check room names, calendar boundaries, supporting subsets, quotation integrity, distinct corpora, counts, imports, versioning, encryption and canonical artwork.
- `python tests/browser_foundations.py`: 15 integration groups passed, no uncaught browser errors. Tests cover source navigation, history/favourites, no fabricated April result, one persistent cosmos, actual WebGL planets/map return, private/sample separation, drafts, original text preservation, stale readings, wrong passphrases, safe markup, exports, waking separation, offline capture, desktop/tablet/mobile overflow and card scrolling, reduced motion, actual shooting-star creation, static-server restrictions and deletion.
- Chromium screenshots at 1440 × 1000, 768 × 1024 and 390 × 844 were visually inspected. A decorative frame overflow found on smaller layouts was corrected.
- Original cosmic and all six copied paintings were compared byte-for-byte to their sources.
- Browser tests use installed Playwright Python and system Chromium. Chromium may require writable NSS trust storage for the cloud proxy CA; never bypass TLS validation.

## Preview and deployment

Update: a live, publicly accessible development preview is now verified at
https://dreamscape-natalie-living-preview-5xbkgtq2s-sc352b-2806.vercel.app/
It serves `codex/dreamscape-foundations` commit `fa12166c5ab5a11890c1139acab908b5c006b0d8` through the existing secondary Vercel preview project. Despite the historical project name in the hostname, this is the shared Dreamscape application. GitHub deployment status is successful, HTTP returns the application shell without login, and an actual Chromium session verified the nine-room Home Hub, sample Oracle reading, original source navigation and saved history with no uncaught browser errors. The primary project's preview requires Vercel authentication; its protection was not changed. Production remains untouched.

This is the first local-storage application stage. The live preview does not add cloud journal storage, private accounts or paid providers. The static Vercel deployment does not run `server.js`; Node-server path restrictions tested locally must not be described as deployed Vercel access controls.

The development branch has been pushed to GitHub. The runtime implementation commit is `92eab0a182e22b270e416a12b3ab6e0889672093`. The tested instance runs in this workspace on port 4174 (`PORT=4174 npm run dev`), since an earlier server occupies 4173. No public preview or production deployment is claimed until an external deployment has been confirmed. Screenshot artifacts are saved outside the repository at `/workspace/dreamscape-review`. The historical Vercel URLs are previews of other branches, not this change. The app uses the canonical static sample path `/corpora/reference-corpus.json`, so the browser does not depend on a custom server rewrite for sample loading.

Runtime HTTPS requests to the GitHub API and Vercel were blocked by the environment's egress proxy (CONNECT 403). Native Git read and push work with the existing platform authentication. Required domains `api.github.com` and `*.vercel.app` were added to the environment configuration draft, preserving presets and existing custom domains. Saving this draft does not apply runtime networking or verify a deployment. The startup instructions were also updated in the draft (977 characters). Review/save these settings and publish the prepared cloud environment; then retry preview discovery/verification. No extra credential is declared based merely on these network denials.

For a fresh workspace, run `npm test` and `npm run dev`; there are no package dependencies to install. Use the existing checkout, with no worktree unless explicitly requested. Processes must restart after environment restoration.

## Unfinished and missing inputs

This is the first working local stage, not the full nine-room product. Cloud authentication, server-enforced multiuser isolation, synchronisation, recovery/backups, accounts/billing, licensed speech and text/image providers, asynchronous paid jobs, quotas and production launch controls are not connected. No suitable Supabase/Clerk/database/Stripe/Vercel credentials were found in environment variable names; the repository has no such integration. Do not put secrets into code or chat.

Oracle generation is currently a transparent deterministic evidence study. Full AI theme analysis, Jungian/Adlerian/transpersonal synthesis, personalised artwork and the gold-standard actual April 2025 reading remain unfinished. The original April narratives are missing. The supplied front/back artwork is not enough to validate the underlying dreams.

Family Home semantic exploration and the wider verified symbol/place matrix remain preserved on the historical branch but are not fully connected to this shell. Natalie and Sam private narratives are not replaced by public aggregates. Per-user generated geography, voice/audio/OCR/PDF ingestion, named collections, comparisons, saved Insights history, personal dictionary/conversations and licensed podcasts remain staged work. Podcast explicitly discloses that no audio service is connected.

Keep private backups safe: exported JSON is intentionally readable and not encrypted. The passphrase cannot be recovered. Reload locks the in-memory vault. Clearing browser storage deletes local persistence. A failed storage write reports failure instead of claiming a successful save. This is not a GDPR compliance declaration or a production security audit.

Continue with the full plan in `IMPLEMENTATION_PLAN.md`. Obtain the actual April corpus and securely configured production services for the next provider-dependent stages. Do not deploy or merge into production without founder approval.
