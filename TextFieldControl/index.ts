import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class TextFieldControl
    implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container: HTMLDivElement;
    private _wrapper: HTMLDivElement;
    private _label: HTMLLabelElement;
    private _input: HTMLInputElement;
    private _value: string;
    private _notifyOutputChanged: () => void;
    private _onChangeBound: (event: Event) => void;

    constructor() {
        // empty – PCF framework calls init() next
    }

    /**
     * Called once when the control is first loaded.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;
        this._value = "";
        this._onChangeBound = this._onChange.bind(this);

        // Wrapper div
        this._wrapper = document.createElement("div");
        this._wrapper.className = "textfield-wrapper";

        // Label
        this._label = document.createElement("label");
        this._label.className = "textfield-label";
        this._label.htmlFor = "textfield-input";

        // Text input
        this._input = document.createElement("input");
        this._input.type = "text";
        this._input.id = "textfield-input";
        this._input.className = "textfield-input";

        this._input.addEventListener("change", this._onChangeBound);

        this._wrapper.appendChild(this._label);
        this._wrapper.appendChild(this._input);
        this._container.appendChild(this._wrapper);

        // Render initial state
        this.updateView(context);
    }

    /**
     * Called whenever a property value or control context changes.
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const { value, labelText, labelColor } = context.parameters;

        // --- Value ---
        const rawValue = (value && value.raw != null) ? value.raw : "";
        if (this._input.value !== rawValue) {
            this._input.value = rawValue;
        }
        this._value = rawValue;

        // --- Label text ---
        this._label.textContent =
            (labelText && labelText.raw != null) ? labelText.raw : "";

        // --- Label color ---
        this._label.style.color =
            (labelColor && labelColor.raw) ? labelColor.raw : "";

        // --- Disabled state ---
        const isDisabled = context.mode.isControlDisabled;
        this._input.disabled = isDisabled;

        // --- Masked field (password-type fields) ---
        // Some environments expose an IsMasked flag via a non-standard extension.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isMasked = value && value.attributes && (value.attributes as any).IsMasked === true;
        this._input.type = isMasked ? "password" : "text";
    }

    /** Returns the current output values to be written back to the field. */
    public getOutputs(): IOutputs {
        return { value: this._value };
    }

    /** Clean up event listeners when the control is removed. */
    public destroy(): void {
        this._input.removeEventListener("change", this._onChangeBound);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private _onChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this._value = target.value;
        this._notifyOutputChanged();
    }
}
