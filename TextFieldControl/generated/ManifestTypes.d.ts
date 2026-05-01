/**
 * This is auto generated from the ControlManifest.Input.xml file.
 */

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    /** The text value bound to the Dynamics 365 field */
    value: ComponentFramework.PropertyTypes.StringProperty;
    /** Custom label text displayed above the input */
    labelText: ComponentFramework.PropertyTypes.StringProperty;
    /** CSS color for the label (e.g. "#c00000" or "red") */
    labelColor: ComponentFramework.PropertyTypes.StringProperty;
}

export interface IOutputs {
    value?: string;
}
