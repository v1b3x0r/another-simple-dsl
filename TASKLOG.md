# Task Log

## 2025-11-19
- Reorganized DSL engine into `parse.ts`/`run.ts` with typed state/effects helpers.
- Hooked Svelte UI to DreamEngine plus per-scene components using shared config.
- Verified via `npm run check` to keep schema + runtime in sync.
- Swapped DSL loading to Vite raw import (`routes/+page.svelte`) to avoid 404 fetch and adjusted dynamic scene rendering to satisfy Svelte 5 `{@const}` rules.
- Added DreamEngine trigger history logging + UI console log, plus converted `scene-frame` styling to Tailwind utilities for clarity.
- Promoted `dreamflow.dsl` to single source of truth by parsing scene metadata, removing `config.ts`, and wiring all components to DSL-derived data.
- Expanded `dreamflow.dsl` into 7 whimsical layers with kid-friendly actions (spin chairs, catch fireflies, jump timelines) to showcase narrative power without extra engine code.
- Introduced stateful counters + condition evaluator (supporting keys/boxes) and rewrote DSL in plain Gen-Z tone for the “green vs red box” mini-game with glitch door + gate checks.
- Added shared humanize utils plus a journey tracker UI in `+page.svelte` to visualize current layer vs. the rest of the dream stack.
- Removed obsolete scene-specific components and imports so the sandbox uses the generic `SceneFrame` for all DSL-defined scenes.
