# TextFieldControl

A **Dynamics 365 PCF (PowerApps Component Framework)** control that renders a text input field with a configurable label. The label color can be set to any valid CSS color, allowing you to highlight required fields, apply brand colors, or flag validation states.

---

## Features

| Feature | Details |
|---|---|
| Bound text field | Two-way binding to a **SingleLine.Text** attribute |
| Custom label | Optional label text shown above the input |
| Custom label color | Any CSS color value (`#c00000`, `red`, `rgb(0,120,212)`, …) |
| Disabled state | Automatically greys out the input when the form/field is read-only |
| Masked fields | Switches to `type="password"` for masked attributes |
| Fluent UI styling | Matches the Dynamics 365 / Power Apps look-and-feel out of the box |

---

## Control Properties

| Property | Type | Usage | Description |
|---|---|---|---|
| `value` | `SingleLine.Text` | **bound** | The text value bound to the Dynamics 365 field |
| `labelText` | `SingleLine.Text` | input | Label text displayed above the input |
| `labelColor` | `SingleLine.Text` | input | CSS color for the label (e.g. `#c00000` or `blue`) |

---

## Project Structure

```
TextFieldControl/
├── TextFieldControl/               # PCF component source
│   ├── ControlManifest.Input.xml   # Control manifest & property definitions
│   ├── index.ts                    # Main control implementation
│   ├── css/
│   │   └── TextFieldControl.css    # Fluent UI–inspired styles
│   ├── generated/
│   │   └── ManifestTypes.d.ts      # Auto-generated TypeScript types
│   └── __tests__/
│       └── index.test.ts           # Jest unit tests
├── __mocks__/
│   └── styleMock.js                # CSS mock for Jest
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## Getting Started

### Prerequisites

* **Node.js** v16 or later
* **npm** v8 or later
* (For deployment) [Microsoft Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) (`pac`)

### Install dependencies

```bash
npm install
```

### Run tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Start the test harness (local preview)

```bash
npm run start
```

This opens the PCF test harness in your browser where you can set property values and see the control live.

---

## Deploying to Dynamics 365

1. Build the control: `npm run build`
2. Create or open a solution project with `pac solution init`
3. Add the component reference: `pac solution add-reference --path .`
4. Package and import the solution into your Dynamics 365 environment via the maker portal or `pac solution push`

---

## License

MIT