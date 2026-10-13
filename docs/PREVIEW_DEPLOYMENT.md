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

## Verified public deployment

Verified on 13 October 2026:

https://dreamscape-natalie-living-preview-npbwldxzl-sc352b-2806.vercel.app

This is the existing dedicated preview project's **Preview** deployment of commit `228c1e159df6f5cf957557841d212ae6ec64471d` on `codex/dreamscape-foundations-20261013`. GitHub deployment ID: 7044661821; status success. The main project's separate Preview also succeeded, but requires a Vercel login; the dedicated preview above opens anonymously. No project-wide protection setting was weakened. Main remained at f62ca7407b8f194cfb7b1ba0667d5e573c351be4, and neither deployment is a Production environment.

The initial cloud-network blocker was resolved during this task. GitHub API access and public Vercel HTTPS requests now succeed. No Vercel token or new credential was required: the existing Git integrations built the development branch.

Hosted verification used fresh desktop and mobile browser contexts with no Vercel login. All nine rooms, fictional source-backed reading, source links, local edits/reload, independent browser records, reset, both reference world renderers and Hearthlands entry/return passed. No browser page errors or application API/provider requests occurred. HTTPS certificate verification remained enabled; Chromium used the environment's existing trusted certificate database via the approved execution path.

GET /api/state and /server.js both return 404. The hosted cosmic AVIF SHA-256 matches the original: fe6c6e3ea08a4fea7e31fd8ecbaa09e303d2474620e6f7b6bc1af3354439b537. The hosted bundled app matches the locally tested artifact: SHA-256 91688c4c4c6cbf4c8b5150d552474e3c1269c8a804e97d5fa2ba051542a950a9.

Repeat hosted checks with `DREAMSCAPE_PREVIEW_URL=https://dreamscape-natalie-living-preview-npbwldxzl-sc352b-2806.vercel.app python tools/preview-smoke.py`. If the cloud filesystem sandbox prevents Chromium opening its existing NSS certificate store, use the approved execution path; do not bypass TLS verification.
