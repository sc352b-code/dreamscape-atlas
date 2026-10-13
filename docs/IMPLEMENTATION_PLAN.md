# Dreamscape implementation plan

## Authority and baseline (13 October 2026)

Read in full: the four uploaded master specifications dated 13 October 2026. In Depth App Info governs product scope; room specifications govern their detail. Historical instructions do not authorize extra rooms or a Tarot feature.

Audited main at f62ca7407b8f194cfb7b1ba0667d5e573c351be4 and family-home-pilot at b3af00d22dd0a2cd4d8688efbf44b121a5aba305. Read the pilot handover README, current state, data/evidence rules, visual/audio direction, continuation instructions, Git/Vercel details and file index. The exact filename DREAMSCAPE_ATLAS_MASTER_HANDOVER.md is absent; the branch's handover/ directory supplies continuity. Its production commit and deployment statements are historical, not current verification.

The current main is a vanilla JavaScript / Three.js browser prototype with a Node static server, Sam/Hearthlands and Natalie exemplars, painted map assets and two passing engine tests. It has no account system, database, billing integration or full room shell. The pilot has additional evidenced Family Home exploration and missing approved Octopus artwork. Preserve the pilot branch; do not overwrite it or import its obsolete Tarot feature.

## Canonical cosmos

Both inspected branches load assets/generated/cosmic-00.b64 through cosmic-03.b64 in that order. Concatenate trimmed base64 text and decode: AVIF, 1672 × 941, 50353 bytes, SHA-256 fe6c6e3ea08a4fea7e31fd8ecbaa09e303d2474620e6f7b6bc1af3354439b537. The original visually matches the user-supplied cosmos. Preserve chunks and save an exact decoded copy, never generate replacement artwork.

## Delivery stages

1. Shared foundation: exact nine-room registry and Home Hub; reusable cosmos; accessible navigation; real local accounts and private SQLite storage; dream/waking journals; original-text preservation; offline draft queue; export and deletion. Establish dream → selected period → evidence reflection → saved history → original dream links. Deterministic evidence reflection is explicitly a development fallback, not AI interpretation. Generated person-centred Oracle illustration remains pending.
2. Oracle intelligence: replaceable AI provider with explicit consent, evidence validation, asynchronous jobs, costs/quotas and person-centred artwork; actual April 2025 exemplar when that corpus is available; saved versions and deliberate regeneration.
3. Dream World continuity: integrate the richer Family Home pilot under approved naming, preserve approved planet/map art and semantic zoom, connect actual source records; generalize territories from each user's corpus. Keep Sam/Natalie views explicitly marked reference exemplars until source corpus validation is possible.
4. Journals: voice/audio transcription, PDF/photo/bulk imports, association editing and version history; offline audio and conflict resolution. Never silently replace original narratives.
5. Analysis and insights: deterministic period comparisons and charts; evidence-grounded interpretive reports, associations and retrieval conversations. Statistics from stored records can ship before AI narratives.
6. Audio and collections: licensed speech providers, background jobs, transcripts, saved podcasts and cross-room favourites. No simulated playable podcasts.
7. Luminous Messages and embedded dictionary/conversation: user-selected significance, chronology, personal associations and source-grounded answers.
8. Commercial and launch readiness: founder-approved plans, billing and entitlements, usage ceilings, managed secure storage/backups, account verification/recovery, legal review, retention and research consent, monitoring, accessibility and performance audits. No production deployment without approval.

## Verification gates

Test actual ownership and cross-account access, dates/counts/excerpts, session revocation, import atomicity, duplicate prevention, offline queue isolation, history/source links and failure states. Inspect real browser output on desktop/mobile, reduced motion, long lists and keyboard navigation. Preserve existing world art and verify rendered planets. Do not represent incomplete integrations as completed product capabilities.

## Inputs still unavailable

Actual April 2025 dream narratives; authenticated AI/image/speech/billing provider configuration; approved finished Octopus regional tile. Two visual references were supplied in chat, but no standalone local Oracle image file is available. These do not block shared foundations. No new public preview has been deployed; historical branch URLs do not show new code.
