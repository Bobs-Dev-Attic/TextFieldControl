# Deployment Guide

End-to-end guide for building, packaging, and deploying the **TextFieldControl** PCF component to a Dynamics 365 / Power Apps environment with the fewest possible surprises.

> **Note on the reference repo:** `Bobs-Dev-Attic/SubgridToKeywordControl` was not accessible at the time this guide was written (HTTP 404 / private). The version recommendations below are based on the current public `pcf-scripts` toolchain and the dependencies declared in this repo's `package.json`. If the sister repo is later made available, reconcile any version drift against this file.

---

## 1. Toolchain Prerequisites

Pin these on every dev/build machine and in CI. Mismatches here are the #1 source of "works on my machine" PCF failures.

| Tool | Required version | Notes |
|---|---|---|
| **Node.js** | **18.x LTS** or **20.x LTS** | `pcf-scripts` ≥ 1.32 dropped Node 16. Avoid Node 22+ until officially supported. |
| **npm** | 9.x or 10.x | Ships with the Node LTS above. |
| **Power Platform CLI (`pac`)** | **1.34.4** or newer | Required for `pac pcf push` / `pac solution`. Install via `dotnet tool install --global Microsoft.PowerApps.CLI.Tool` or the standalone MSI. |
| **.NET SDK** | **6.0** (LTS) — 8.0 also works | Needed by `pac` and by `dotnet build` when packaging the solution. |
| **MSBuild** | 17.x | Only needed if building the `.cdsproj` solution locally on Windows; otherwise `dotnet build` handles it. |
| **Visual Studio Build Tools** *(Windows only)* | 2022 | Optional. Required only if building solutions outside `dotnet`. |

Verify with:

```bash
node -v
npm -v
pac --version
dotnet --version
```

---

## 2. NPM Dependencies — Current vs. Recommended

Current `package.json` uses very loose ranges (`^1`, `^29`, `~4.9`). For reproducible deploys, **pin to exact minor or patch ranges** and refresh `package-lock.json` deliberately.

| Package | Current | Latest stable | Recommended pin | Rationale |
|---|---|---|---|---|
| `pcf-scripts` | `^1` | `1.51.x` | `~1.51.0` | Floating across all minors invites breaking CLI/manifest behavior. |
| `pcf-start` | `^1` | `1.51.x` | `~1.51.0` | Keep aligned with `pcf-scripts` minor. |
| `@types/powerapps-component-framework` | `^1.3.18` | `1.3.18` | `1.3.18` (exact) | Types should match runtime API version (`api-version="1.3.3"` in manifest). |
| `typescript` | `~4.9` | 5.x available | `~4.9.5` | **Do not bump past what `pcf-scripts` supports.** As of `pcf-scripts` 1.51, TS 4.9 is the safe target. Validate before moving to TS 5.x. |
| `jest` | `^29` | `30.x` | `~29.7.0` | Stay on 29 until `ts-jest` and `jest-environment-jsdom` track 30 stably across the team. |
| `@types/jest` | `^29` | `30.x` | `~29.5.14` | Match `jest` major. |
| `ts-jest` | `^29` | `29.4.x` | `~29.4.0` | Aligned with jest 29. |
| `jest-environment-jsdom` | `^29` | `30.x` | `~29.7.0` | Aligned with jest 29. |

> **Why not chase latest?** PCF builds compile against a specific TypeScript version bundled by `pcf-scripts`. Bumping TS independently is the most common cause of `tsc` errors at `npm run build` time on a CI runner that does a clean install. Pin first, upgrade deliberately, validate locally, then promote.

### One-shot refresh

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npm test
```

Commit the regenerated `package-lock.json`.

---

## 3. Manifest & Solution Settings

| Setting | Value | Where |
|---|---|---|
| `api-version` | `1.3.3` | `TextFieldControl/ControlManifest.Input.xml` — match `@types/powerapps-component-framework` |
| `version` | bump on every shipped change (e.g. `1.0.1`) | Same manifest. **Required** — Dataverse refuses re-import of unchanged versions. |
| `namespace` | `XRMatic` | Must remain stable across releases or existing form bindings break. |
| Solution publisher prefix | match the target environment publisher | `cdsproj` / Solution.xml |
| Solution type | **Managed** for prod, **Unmanaged** for dev | Set on import, not in source. |

---

## 4. Local Build & Test

```bash
npm install            # clean install from lockfile in CI: `npm ci`
npm test               # jest unit tests (jsdom)
npm run build          # produces ./out/controls/TextFieldControl
npm run start:watch    # local PCF test harness
```

CI should run `npm ci && npm test && npm run build` — never `npm install` on CI (it can mutate the lockfile).

---

## 5. Packaging the Solution

The repo currently ships only the PCF component, not a `.cdsproj` solution wrapper. Create one once and commit it under `Solution/`:

```bash
mkdir Solution && cd Solution
pac solution init --publisher-name XRMatic --publisher-prefix xrm
pac solution add-reference --path ..
dotnet build -c Release
```

Output: `Solution/bin/Release/Solution.zip` (unmanaged) and `Solution_managed.zip` (managed).

---

## 6. Deploying to a Dynamics 365 / Power Apps Environment

### 6a. Quick path — direct push (dev environments only)

```bash
pac auth create --url https://<your-org>.crm.dynamics.com
pac pcf push --publisher-prefix xrm
```

Use only for dev. Publishes the control directly without producing an artifact.

### 6b. Repeatable path — solution import (test/prod)

```bash
pac auth create --url https://<your-org>.crm.dynamics.com
pac solution import --path Solution/bin/Release/Solution_managed.zip --publish-changes
```

Or upload `Solution_managed.zip` via **make.powerapps.com → Solutions → Import**.

### 6c. Verify after import

1. Open a model-driven app form that uses a `SingleLine.Text` field.
2. Field properties → **Components → Add component → TextFieldControl**.
3. Configure `labelText` and `labelColor`.
4. Publish customizations and reload the form.

---

## 7. CI/CD Recommendations

A minimal GitHub Actions pipeline (the repo currently has no `.github/workflows/`):

```yaml
name: build
on: [push, pull_request]
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: microsoft/powerplatform-actions/actions-install@v1
      - run: pac --version
```

For deploy, add a job using `microsoft/powerplatform-actions/import-solution@v1` gated on a manual environment approval.

---

## 8. Pre-Deployment Checklist

- [ ] `package-lock.json` is committed and matches `package.json`.
- [ ] `npm ci && npm test && npm run build` succeed on a clean clone.
- [ ] `ControlManifest.Input.xml` `version` is incremented.
- [ ] Generated `ManifestTypes.d.ts` regenerated (`npm run refreshTypes`) if manifest changed.
- [ ] No `console.log` / debug code left in `index.ts`.
- [ ] Target environment is on a compatible Power Apps runtime (current Wave channel).
- [ ] Backup taken of the target solution before importing a new managed version.
- [ ] Deploy to **dev → test → prod** in order; never skip stages.

---

## 9. Common Deployment Failures

| Symptom | Likely cause | Fix |
|---|---|---|
| `Error: 'pcf-scripts' build failed: TS2307` | TypeScript version mismatch with `pcf-scripts` | Pin `typescript` to `~4.9.5`; delete `node_modules`; reinstall. |
| `Solution component already exists with different version` | Manifest `version` not bumped | Increment manifest `version`, rebuild, repackage. |
| Control loads but field isn't bound | Renamed `namespace` or `constructor` between releases | Keep both immutable; create a new control if a rename is truly needed. |
| `pac pcf push` fails with auth error | Stale `pac auth` profile | `pac auth clear` and re-create. |
| Import succeeds but control not selectable on form | Customizations not published | `pac solution publish` or "Publish all customizations" in maker portal. |
| Different behavior in prod vs. local harness | Test harness uses mocked context; missing manifest property | Add and bind the missing property; rebuild. |

---

## 10. Rollback

Managed solutions are versioned. To roll back:

1. In the target environment: **Solutions → TextFieldControl → History**.
2. Select the previous version → **Restore**.
3. If restore is unavailable, re-import the previous `Solution_managed.zip` from your artifact store.

Always retain the last 3 deployed `.zip` artifacts.
