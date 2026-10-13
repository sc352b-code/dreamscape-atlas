# Dreamscape implementation plan

Authority: the four founder specifications dated 13 October 2026. All four PDFs were read in full before changes. Historical continuity comes from `family-home-pilot` at `b3af00d22dd0a2cd4d8688efbf44b121a5aba305` and the handover files copied under `docs/historical`. A standalone `DREAMSCAPE_ATLAS_MASTER_HANDOVER.md` was not supplied or found; the branch's detailed handover was inspected instead.

## Audit

The current main checkout uses native JavaScript modules, Node's static server, Three.js 0.180.0, and two engine tests. It contains Sam and Natalie reference prototypes, not authentication, database, billing or AI services. The identity test currently compares absent fields; it does not prove world schema compliance. Main and family-home-pilot have diverged: preserve both rather than resetting either branch. Production and existing branches will remain untouched.

The canonical cosmos is four files `assets/generated/cosmic-00.b64` through `cosmic-03.b64`. Their decoded bytes are a 1672 × 941 AVIF with SHA256 `fe6c6e3ea08a4fea7e31fd8ecbaa09e303d2474620e6f7b6bc1af3354439b537`, identical on both branches. `assets/cosmos/original.avif` is that exact decoded asset. It visually matches the uploaded cosmic reference; byte identity with the uploaded image cannot be established because a downloadable PNG was not attached. The five approved final planet textures are copied unchanged from family-home-pilot. The historical Octopus handover is stale: the current branch now contains a WebP tile. Its visual acceptance is a separate follow-up.

The actual April 2025 dream narratives are unavailable. The supplied card image is a visual reference, not evidence. The checked-in corpus contains three reference dreams dated May–July 2026. Historical derived summaries cannot replace original private narratives. Never present these as a founder's or visitor's personal records.

## Delivery stages

1. **Shared foundations and first working journey (this stage).** Preserve the existing artwork and prototypes; create the single persistent living cosmos, exact nine-room registry, Home Hub, accessible navigation, encrypted local journal, deterministic evidence engine, date selection, front/back Oracle evidence study, source links, history and favourites. Use an existing person-centred illustration explicitly labelled reference artwork. No fabricated AI interpretation or personalised image. Capture, read and export actual user dreams; support local offline persistence. Public sample mode is clearly separated from private data. No cloud account or synchronisation claim.
2. **Secure cloud foundation.** Connect a reviewed managed authentication/database/object storage provider with server-enforced ownership, TLS, encryption, backup, deletion and explicit provider disclosures. Add durable idempotent offline synchronisation, import queues and original-source handling. Security tests must precede real multiuser release.
3. **Full Oracle generation.** Connect replaceable text and image providers behind evidence validation; blend supported interpretive lenses, validate excerpts and supporting subsets, cache versioned results and artworks, enforce quotas, expose job failure states. Analyse the full real April corpus when available. Do not force its exemplar title.
4. **Dream World continuity.** Preserve approved five-planet geography reference and Natalie function reference; integrate the full Family Home work and verified place/symbol intersections. Complete a real user-specific corpus-to-world pipeline. Keep people, places and symbol exploration inside Dream World, without card-reading terminology or invented geography.
5. **Journals and personal context.** Add voice/audio/OCR/PDF transcription, supported bulk imports, associations, draft recovery, edit history and waking-to-dream links. Do not mix waking data into dream evidence.
6. **Analysis and Insights.** Expand deterministic date-based statistics, period comparisons, evidence-rich reports, saved history and optional interpretive lenses. Distinguish denominators and classification coverage. No psychological measurements inferred from text.
7. **Listening and treasures.** Add licensed single/two-speaker audio generation, transcripts, source links and saved audio; expand named collections across all content types.
8. **Luminous and embedded capabilities.** Complete dreamer-labelled significant dreams, chronological patterns, personal dictionary and evidence-retrieving conversations in existing rooms.
9. **Commercial and launch readiness.** Founder-approved plans/prices, quotas, payments/cancellation, privacy policies/legal review, consent, operational monitoring, recovery tests, accessibility and performance. No production deployment or merge without approval.

## Architecture and gates

Retain the small existing stack: native browser modules, shared domain functions, encrypted IndexedDB for this local stage, and a restricted static server. One room registry, one background, one corpus and one evidence pipeline. Provider-dependent rooms visibly state their limits. The local vault is device storage, not cloud authentication; no remote journal API exists in this stage.

Required checks: period boundaries, exact counts and citations, non-supporting dream exclusion, safe import/rendering, ciphertext authentication, passphrase failure, persistence, history/versioning, navigation/source-return behavior, offline shell, desktop/tablet/mobile scrolling, reduced motion, original asset hashes and no obsolete card room. Browser screenshots must be inspected. Preserve the originals even when legacy prototypes are not routed in the new interface.

Preview is the running development server in this cloud workspace. No public URL exists until a separate preview deployment is available. Old Vercel branch previews are historical and are not previews of this change.
