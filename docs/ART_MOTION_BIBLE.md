# Art & Motion Bible — v0.1

## Emotional target

Celestial, intimate, numinous, exploratory. Never “game HUD”, never generic wellness dashboard, never fantasy-slot-machine spectacle.

## Motion principles

- **Invitation over urgency** — default movements are slow and eased.
- **World first** — UI chrome fades before major transitions.
- **Meaningful luminosity** — glow indicates corpus significance, not decoration.
- **Layered depth** — stars, haze, planet, terrain and labels move at distinct rates.
- **Revelation, not pop-up** — important symbols emerge through spatial or light transitions.

## Timing baseline

- hover/touch acknowledgement: 180–320 ms
- focus transition: 900–1600 ms
- territory descent: 1800–2800 ms
- revelation: 1400–2200 ms
- return to atlas: 1400–2400 ms

## Performance guardrails

- adapt particle count to viewport and device pixel ratio
- pause nonessential animation in background tabs
- prefer transform/opacity in DOM animation
- cap DPR at 2
- keep atmosphere procedural where practical

## Accessibility

Respect `prefers-reduced-motion`: use fades and cuts instead of camera travel while preserving information architecture.
