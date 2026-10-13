# Foundation-stage validation — 13 October 2026

## Automated checks

`npm ci --cache /tmp/dreamscape-npm-cache --no-audit --no-fund` completed successfully, preserving package integrity verification and the lockfile. Node.js 24.19.0; npm 11.9.0; pinned Three.js 0.180.0.

`npm test`: 11 executed, 11 passed, zero skipped/failed. Tests cover account isolation including read/edit/delete attempts across users, source-dream links and exact evidence excerpts, correct supporting/analysed counts, immutable reading history and stale versions, favourites ownership, original narrative preservation, revision conflicts, duplicate offline creation retries, atomic import validation, authentication/origin protection, exports, account deletion and session revocation, restricted static-file serving, valid dates/calendar ranges, vocabulary matching, room inventory and canonical artwork byte integrity.

The inherited world-identity test previously compared absent top-level IDs/seeds, so it was corrected to require the actual territory ID and compare complete generated models. This fixes validation quality without inventing a model contract.

## Real browser checks

`python tools/browser-smoke.py`: passed using system Chromium and Python Playwright, with synthetic QA records in a disposable database. No browser page errors. No TLS verification was disabled; the original browser CDN dependency is replaced by locally packaged Three.js.

Verified journal entry and JSON import; three supporting dreams out of four analysed; excluded unrelated source; original narrative reopening; reading history and favourites; 27-source list scrolling; accurate 28-dream period count; all nine navigation routes; submitted offline capture, page reload, account-scoped draft recovery and exactly-once creation after reconnect; five preserved pilot territory planets; real pointer entry to Hearthlands with loaded map artwork and return; existing Natalie renderer; no Tarot wording in its live page; mobile horizontal-overflow checks and five-planet reference rendering after selecting Sam and bringing the embedded view into sight; reduced-motion static presentation; keyboard skip-to-content without navigating away from Oracle.

Screenshots inspected: Home Hub, Oracle desktop/mobile and preserved planet views desktop/mobile. Artifacts are under `/tmp/dreamscape-review`; they contain synthetic QA fixtures, not a real user's corpus. A screenshot is a visual review artifact, not a publicly hosted interactive preview.

The app's new Oracle result intentionally shows that AI interpretation and person-centred illustration are not yet connected. It must not be used as evidence that a full AI reading or the April 2025 exemplar is complete.

## Unverified and unfinished

No public deployment, production migration or fresh-task snapshot restoration was tested. External AI/image/speech/billing calls were not executed because those integrations and credentials are not configured. This stage does not establish production security, GDPR compliance, managed backups, commercial subscriptions, full personal-world generation or the richer Family Home art pilot's completion. Full performance profiling, screen-reader/manual accessibility review, AI evaluations and launch operations remain in later stages.
