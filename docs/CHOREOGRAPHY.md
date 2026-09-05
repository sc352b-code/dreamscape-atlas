# Enchanted Vertical Slice — Choreography Contract

The Atlas → territory transition is a continuous spatial journey, not a screen change.

## State sequence

1. `constellation` — home context remains visible; planet is one object in a larger Dreamscape constellation.
2. `atlas` — planet wakes; the strongest territory signal becomes visible.
3. `focus` — camera commits to that signal; surrounding UI and celestial context recede.
4. `descent` — the planet expands beyond the viewport, stars occlude, atmosphere becomes the transition medium, and territory landscape fades in beneath it.
5. `hearthlands` — landscape settles; the place is discoverable within the territory.
6. `returning` — the same spatial logic reverses and restores the wider Atlas.

## Engine/presentation boundary

The choreography consumes only reusable world properties such as palette, atmosphere, strength, territory name, place name and evidence counts. It must never depend on Hearthlands-specific CSS selectors or animation code.

## Timing defaults

- territory focus card: 1.25s after camera commitment
- descent: 3.6s
- arrival reveal: 0.65s after landscape settles
- return: 1.9s

These timings are presentation configuration and should migrate into motion presets as the engine matures.

## Sensory principle

Meaning should arrive before explanation. The user sees a signal, follows it, crosses atmosphere, arrives in a place, and only then receives textual context.
