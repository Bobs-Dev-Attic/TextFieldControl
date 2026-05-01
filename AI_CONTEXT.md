# AI_CONTEXT.md

Purpose: quick-start context for coding agents (Codex/Claude Code) to reduce token usage and avoid rework.

## Fast project map
- `TextFieldControl/index.ts`: control logic and lifecycle hooks (`init`, `updateView`, `getOutputs`, `destroy`).
- `TextFieldControl/ControlManifest.Input.xml`: property definitions (`value`, `labelText`, `labelColor`).
- `TextFieldControl/css/TextFieldControl.css`: visual style rules.
- `TextFieldControl/__tests__/index.test.ts`: current unit tests.
- `TODO.md`: prioritized engineering/security/UX backlog.
- `REVIEW.md`: full technical review and recommendations.

## High-impact known issues (check first)
1. Hardcoded input id can collide across multiple control instances.
2. `change` event may delay model updates; evaluate `input` event.
3. `labelColor` should be validated/allowlisted.

## Minimal safe workflow for edits
1. Update code in `index.ts`.
2. Keep manifest in sync if properties change.
3. Add/adjust tests in `__tests__/index.test.ts`.
4. Run:
   - `npm test`
   - `npm run build`

## Non-goals unless requested
- Do not add external services or data egress.
- Do not add telemetry capturing field values.

## Definition of done
- Tests pass.
- Build passes.
- No duplicate-id regression.
- Accessibility impact considered in PR notes.
