import { assertDefined } from "@/utils/assertions";
import type { FormParameterDrilldownOption, FormParameterOptions } from "./parameterTypes";

export function ensureDrilldownOptionArray(options?: FormParameterOptions): FormParameterDrilldownOption[] {
    assertDefined(options, "Attribute 'options' needs to be defined for element of type 'drill_down'");

    const firstElement = options[0];

    // empty array is a valid value
    if (!firstElement) {
        return options as FormParameterDrilldownOption[];
    }

    // out of the possible inputs, only DrilldownOptions have a "name" field
    const valid = Object.keys(firstElement).includes("name");

    if (!valid) {
        throw new TypeError("Unexpected type for FormDrilldownOptions");
    }

    return options as FormParameterDrilldownOption[];
}
