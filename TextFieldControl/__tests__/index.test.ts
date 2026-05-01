import { TextFieldControl } from "../index";
import { IInputs, IOutputs } from "../generated/ManifestTypes";

// ---------------------------------------------------------------------------
// Minimal PCF context mock helpers
// ---------------------------------------------------------------------------

function makeStringProperty(raw: string | null): ComponentFramework.PropertyTypes.StringProperty {
    return {
        raw,
        error: false,
        errorMessage: "",
        formatted: raw ?? "",
        security: undefined,
        type: "SingleLine.Text",
        attributes: undefined,
    } as unknown as ComponentFramework.PropertyTypes.StringProperty;
}

function makeContext(
    value: string | null,
    labelText: string | null,
    labelColor: string | null,
    isDisabled = false
): ComponentFramework.Context<IInputs> {
    return {
        parameters: {
            value: makeStringProperty(value),
            labelText: makeStringProperty(labelText),
            labelColor: makeStringProperty(labelColor),
        },
        mode: {
            isControlDisabled: isDisabled,
            isVisible: true,
            label: "",
            allocatedHeight: -1,
            allocatedWidth: -1,
            trackContainerResize: jest.fn(),
        },
        // other members not needed for these tests
    } as unknown as ComponentFramework.Context<IInputs>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TextFieldControl", () => {
    let container: HTMLDivElement;
    let control: TextFieldControl;
    let notifyOutputChanged: jest.Mock;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        control = new TextFieldControl();
        notifyOutputChanged = jest.fn();
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    // --- init & DOM structure ---

    it("renders a label and an input inside a wrapper", () => {
        control.init(makeContext("", "", null), notifyOutputChanged, {}, container);

        const wrapper = container.querySelector(".textfield-wrapper");
        expect(wrapper).not.toBeNull();

        const label = container.querySelector(".textfield-label");
        expect(label).not.toBeNull();

        const input = container.querySelector(".textfield-input");
        expect(input).not.toBeNull();
    });

    // --- value binding ---

    it("displays the bound value in the input", () => {
        control.init(makeContext("Hello World", "Name", null), notifyOutputChanged, {}, container);

        const input = container.querySelector<HTMLInputElement>(".textfield-input");
        expect(input!.value).toBe("Hello World");
    });

    it("shows an empty input when value is null", () => {
        control.init(makeContext(null, "Name", null), notifyOutputChanged, {}, container);

        const input = container.querySelector<HTMLInputElement>(".textfield-input");
        expect(input!.value).toBe("");
    });

    // --- label text ---

    it("sets the label text from the labelText property", () => {
        control.init(makeContext("", "My Label", null), notifyOutputChanged, {}, container);

        const label = container.querySelector<HTMLLabelElement>(".textfield-label");
        expect(label!.textContent).toBe("My Label");
    });

    it("shows an empty label when labelText is null", () => {
        control.init(makeContext("", null, null), notifyOutputChanged, {}, container);

        const label = container.querySelector<HTMLLabelElement>(".textfield-label");
        expect(label!.textContent).toBe("");
    });

    // --- label color ---

    it("applies a custom color to the label", () => {
        control.init(makeContext("", "Label", "#c00000"), notifyOutputChanged, {}, container);

        const label = container.querySelector<HTMLLabelElement>(".textfield-label");
        // jsdom normalises hex to rgb(); accept either representation
        const color = label!.style.color;
        expect(color === "#c00000" || color === "rgb(192, 0, 0)").toBe(true);
    });

    it("leaves label color unset when labelColor is null", () => {
        control.init(makeContext("", "Label", null), notifyOutputChanged, {}, container);

        const label = container.querySelector<HTMLLabelElement>(".textfield-label");
        expect(label!.style.color).toBe("");
    });

    it("updates the label color via updateView", () => {
        control.init(makeContext("", "Label", null), notifyOutputChanged, {}, container);
        control.updateView(makeContext("", "Label", "blue"));

        const label = container.querySelector<HTMLLabelElement>(".textfield-label");
        expect(label!.style.color).toBe("blue");
    });

    // --- disabled state ---

    it("disables the input when isControlDisabled is true", () => {
        control.init(
            makeContext("", "Label", null, true),
            notifyOutputChanged,
            {},
            container
        );

        const input = container.querySelector<HTMLInputElement>(".textfield-input");
        expect(input!.disabled).toBe(true);
    });

    it("enables the input when isControlDisabled is false", () => {
        control.init(
            makeContext("", "Label", null, false),
            notifyOutputChanged,
            {},
            container
        );

        const input = container.querySelector<HTMLInputElement>(".textfield-input");
        expect(input!.disabled).toBe(false);
    });

    // --- change event → getOutputs ---

    it("calls notifyOutputChanged and returns new value after user input", () => {
        control.init(makeContext("initial", "Label", null), notifyOutputChanged, {}, container);

        const input = container.querySelector<HTMLInputElement>(".textfield-input")!;
        input.value = "updated";
        input.dispatchEvent(new Event("change"));

        expect(notifyOutputChanged).toHaveBeenCalledTimes(1);

        const outputs: IOutputs = control.getOutputs();
        expect(outputs.value).toBe("updated");
    });

    // --- updateView ---

    it("updates the input value via updateView", () => {
        control.init(makeContext("old", "Label", null), notifyOutputChanged, {}, container);
        control.updateView(makeContext("new", "Label", null));

        const input = container.querySelector<HTMLInputElement>(".textfield-input");
        expect(input!.value).toBe("new");
    });

    // --- destroy ---

    it("destroy() does not throw", () => {
        control.init(makeContext("", "", null), notifyOutputChanged, {}, container);
        expect(() => control.destroy()).not.toThrow();
    });
});
