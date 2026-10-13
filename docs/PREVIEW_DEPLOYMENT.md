# Separate Dreamscape demonstration preview

Target branch: `codex/dreamscape-foundations-20261013`. Main and the existing live app are not changed.

## Build and privacy boundary

Vercel configuration on this development branch explicitly runs `npm run preview:build` and publishes only `dist/` as a static website. The build has an explicit public asset manifest. It does not copy databases, backend/server code, private corpora, credential files, Git metadata or process environment values. The exact original cosmic AVIF, original map artwork and pilot planet textures remain unchanged. Source-specific names/counts are removed from the public reference adapter where applicable.

The demonstration starts automatically with fictional journal entries and an evidence reflection. It is labelled on every page. All nine approved rooms are accessible without collecting an email/password. Test edits, favourites and history stay in that browser's local storage; two people use the same URL with independent test records. No private account backend or remote AI/audio/payment service is connected. The original Node account-backed development mode remains available through npm run dev and does not automatically become a public database.

Unfinished features remain labelled. Podcast Overview includes a fictional transcript/excerpt example and explicitly has no generated audio. Oracle illustrations/interpretation and personal generated worlds remain unfinished. Reset demonstration data from Preview settings.

## Deployment route

The preferred route is the existing Vercel Git integration for this repository. A new commit on this non-production branch can trigger a Preview build using its branch-specific vercel.json. Do not use --prod, promote a deployment, merge into main, change the project's production branch or replace the live domain. If the integration is absent or the Preview is protected, appropriate Vercel access is needed; do not assume an absent environment token establishes absent Git integration.

## Current access observation

Native Git read/push access works. GitHub API and Vercel API requests were blocked by the cloud egress proxy before authentication (CONNECT returned 403 from envoy). GH_TOKEN is present; no value was printed. No Vercel variable binding or CLI authentication file was found. No new GitHub credential is requested merely because the API is network-blocked.

Saved network draft additions: api.github.com, api.vercel.com, vercel.com, *.vercel.app. Existing package-manager preset rules are preserved. Saving a configuration draft does not apply its rules to the running instance. The user must review/save the network settings before hosted verification can proceed. Deployment status and a working shared URL must be independently verified; do not report a predicted hostname as a deployed URL.

## Verification

Run npm run preview:build and npm run test:preview. The browser test serves only the exact dist artifact, without an API/database. It checks all nine rooms, fictional evidence counts and source links, local edits/reload, separate browsers, restoration, mobile layouts, both reference world renderers and Hearthlands entry/return. It rejects any API/provider/external request and any browser page error.

Once network access works: read GitHub commit statuses/checks for the actual pushed commit, obtain the Vercel Preview URL from deployment metadata, request the URL over HTTPS with TLS verification, and exercise the same navigation/source-link/artwork checks on the hosted app. Check that Sam and the user can access it without team-only Vercel authentication. Do not disable authentication protection project-wide; use a separate preview or an appropriately scoped sharing setting when authorized.
