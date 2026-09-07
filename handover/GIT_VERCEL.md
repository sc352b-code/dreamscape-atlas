# Git, PR and Vercel Details

## Repository

`sc352b-code/dreamscape-atlas`

https://github.com/sc352b-code/dreamscape-atlas

## Branches

### Production

`main`

Current production commit:

`27243e76c1f25e0fee32f6f8b4bf5f0bc6d5d08f`

Commit message: `Make cosmic hum mute fully silent`

Tree at that commit:

`ecde6a37a68b93f5d09d2de11047bd5f813b7d20`

Do not move `main` until the pilot validation gate is passed.

### Active development

`family-home-pilot`

Runtime build head at handover start:

`fcfe2e46f0574ef782afe43234462435c25411fd`

Commit message: `Wire explicit Family Home approach scene`

Tree at that runtime commit:

`8201e774f7d61aa055e573ce4aa4cc33edff8b51`

Note: later commits on this branch may add `handover/` documentation and packaging workflow only. If comparing runtime changes, compare app/source files against `fcfe2e46`.

### Architectural checkpoint

`checkpoint-family-home-8d4150d`

Commit:

`8d4150db8dd6f4df81b965d5afd84a742e2f1dc9`

Commit message: `Wire Family Home pilot on development branch`

This branch exists to preserve the original recoverable architecture before later reading/audio/presentation work.

## Draft PR

PR #1

https://github.com/sc352b-code/dreamscape-atlas/pull/1

Title:

`Family Home painted-symbol pilot and cosmic ambience`

State at handover:

- open
- draft
- not merged
- base: `main`
- head: `family-home-pilot`

At runtime head `fcfe2e46`, the PR contained 28 commits and 14 changed files relative to main.

## Preview deployment

Branch preview hostname:

https://dreamscape-atlas-git-family-home-pilot-sc352b-2806.vercel.app/

Vercel status for runtime commit `fcfe2e46`:

`success`

Vercel deployment dashboard target:

https://vercel.com/sc352b-2806/dreamscape-atlas/EAurvZeHwBgS26dFZGjjBcCYHC68

## Production deployment

Production URL:

https://dreamscape-atlas-sc352b-2806.vercel.app/

Keep production untouched until the pilot is approved.

## Old v57 reference deployment

The historical v57 reference site used for original tarot artwork fallback and behavioural reference is:

https://dreamscape-dream-planet.sc352b.chatgpt.site/

Do not confuse this with the current Vercel production app.

## Vercel connector limitation seen in the old thread

The Vercel connector in the long development session did not have the expected team scope for some dashboard reads and sometimes returned 403. GitHub commit status/check metadata was used successfully to recover the preview hostname and deployment success.

If Vercel API access fails in the next thread:

1. inspect GitHub combined commit status
2. inspect Vercel checks on the PR/commit
3. use the branch preview hostname above
4. use the Vercel dashboard URL above if the account has access

## Deployment rule

Do not merge PR #1 merely because Vercel is green.

Green means the code built. It does not mean the Family Home visual pilot passed.

The merge gate is visual/interaction validation, not CI alone.