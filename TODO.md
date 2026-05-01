# TODO (Prioritized)

## P0 — Must address before production rollout

- [ ] **Fix duplicate DOM id collision (`textfield-input`) across multiple control instances.**
  - **Risk:** Label association (`htmlFor`) and accessibility targeting can break when multiple controls render on one form.
  - **Action:** Generate a per-instance unique id in `init()` and use it for both label and input.

- [ ] **Move value commit from `change` to `input` event (with optional debounced notify).**
  - **Risk:** `change` only fires on blur/enter, so data can be lost or stale during autosave/navigation.
  - **Action:** Listen on `input` for real-time sync and optionally debounce `notifyOutputChanged` (e.g., 100–200ms).

- [ ] **Validate and constrain dynamic style inputs (especially `labelColor`).**
  - **Risk:** User-controlled style values can cause visual spoofing/phishing patterns (UI deception) even if script injection is blocked.
  - **Action:** Use an allowlist-based parser (`CSS.supports('color', value)`) and reject unsupported values.

- [ ] **Add input constraints and validation strategy.**
  - **Risk:** Unbounded text can lead to poor UX and downstream server-side validation failures.
  - **Action:** Add optional max length, required indicator, and validation messaging in manifest + control rendering.

## P1 — High value engineering improvements

- [ ] **Add accessibility hardening (WCAG 2.1 AA).**
  - Add `aria-label`/`aria-describedby`, error announcement region, visible focus ring consistency, and color contrast checks.

- [ ] **Improve secure development lifecycle checks in CI.**
  - Add `npm audit --production`, dependency pinning policy, and periodic lockfile refresh.

- [ ] **Extend automated tests for edge/security behavior.**
  - Cases: multiple control instances, masked attribute switching, malformed color strings, rapid typing, and disabled-state transitions.

- [ ] **Add telemetry hooks (privacy-safe, opt-in).**
  - Capture error counts and performance timings without logging field values/PII.

## P2 — Optimization and maintainability

- [ ] **Reduce render churn in `updateView()`.**
  - Cache previous `labelText`, `labelColor`, disabled state, and `input.type`; apply updates only when changed.

- [ ] **Use immutable style tokens / CSS variables for theming.**
  - Improve maintainability and environment-level branding support.

- [ ] **Refactor to small pure functions for easier testing.**
  - Example: `resolveValue`, `resolveLabelColor`, `resolveInputType` helper functions.

- [ ] **Document threat model + privacy model in-repo.**
  - Include data flow, trust boundaries, and control responsibilities vs. platform responsibilities.

## P3 — Nice-to-have future enhancements

- [ ] **Support optional multiline mode and character counter.**
- [ ] **Expose localization-ready label/help/error resources.**
- [ ] **Add UX patterns for inline success/warning/error states.**
