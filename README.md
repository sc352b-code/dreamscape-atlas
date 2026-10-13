# Dreamscape

A modular development application built on the existing Dream World prototype. The four master documents dated 13 October 2026 govern the nine approved rooms. Dream World and Oracle Cards are separate experiences.

## Development

Requires Node.js 24+ (built-in SQLite) and npm.

```sh
npm ci --cache /tmp/dreamscape-npm-cache
npm run dev
```

The server listens on port 4173. Set `DREAMSCAPE_ORIGIN` to the exact browser origin when using another hostname or port; writes from other origins are rejected. Set `PORT` for a different port. `DREAMSCAPE_DB` controls the persistent SQLite file; default `/workspace/.dreamscape-data/app.sqlite`. The database is private and is never served as a static file. Do not publish or commit it.

The project packages Three.js 0.180.0 locally with a frozen dependency lockfile. Existing planet and map artwork is retained. The shared cosmos uses the exact original AVIF, decoded from the original chunks; see [provenance](assets/cosmos/PROVENANCE.md).

Create a development account with a password of at least 12 characters. Record your own dreams, or import a JSON file containing `entries` (up to 200 entries / 1 MB): each entry needs `kind` (`dream` or `waking`), `date` (YYYY-MM-DD), `title`, `text`, `tags` (array), and optional `flags`/`associations`. Imports create fresh records; inspect your file before importing it twice. Export includes your narratives, edit history, readings and favourites.

## First-stage functionality

- Exact nine-room navigation and Home Hub with one persistent animated cosmic background.
- Local account registration/sign-in, hashed passwords, revocable HTTP-only sessions and server-enforced ownership.
- Text Dream Journal and separate Waking Journal; edit history and original narratives, search, JSON import/export.
- IndexedDB local drafts and a submitted-draft sync queue with idempotent creation and revision conflict protection. The service worker caches only public shell assets, never API data. Offline reload in the same signed-in tab can recover local drafts. Online authentication is required on a new tab; offline sign-in is not supported.
- Oracle evidence reflections with exact excerpts, supporting-dream selection, saved immutable history and source links. This deterministic development fallback is explicitly labelled. It matches a small vocabulary of recurring imagery; it does not perform AI psychological interpretation or establish the strongest overarching theme. Person-centred generated art is not connected.
- Deterministic statistics, evidence summaries, user-marked Luminous Messages and favourites.
- Existing Sam and Natalie worlds available as clearly marked reference exemplars; their data is not the signed-in user's corpus. Natalie symbol discovery is a Dream World detail capability, not another card room.

## Verification

```sh
npm test
python tools/browser-smoke.py
```

The browser script requires Python Playwright and system Chromium. It starts a temporary server/database, exercises actual browser interactions and removes its account data afterward. Screenshots are written to `/tmp/dreamscape-review`. No external AI calls occur. Tests cover source filtering, privacy/isolation, evidence and version history, import validation, session revocation, original artwork integrity, mobile overflow, local draft recovery and the preserved world renderers.

## Remaining work

See [implementation plan](docs/IMPLEMENTATION_PLAN.md) and [current handover](docs/CURRENT_HANDOVER.md). This is not the finished application or a production deployment. AI interpretation and illustration, audio/transcription, PDF/photo import, user-derived planets, named collections, complete reports/conversation, subscriptions, managed backup and account recovery remain unfinished.

Development account storage is local SQLite, without a managed encrypted backup service. Deployment requires a Node host with a persistent disk, HTTPS, an exact configured origin, secure database storage and the launch controls documented in the plan. The historical static Vercel URLs do not host this new account-backed application.
