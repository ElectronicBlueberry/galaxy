import type { FormParameterType } from "./parameterTypes";

type NodeType = "repeat" | "conditional" | "section" | FormParameterType;
type Value = string | boolean | number;

interface BaseInputNode {
    name?: string;
    type?: NodeType;
    value?: Value;
    optional?: boolean;
    step_linked?: boolean;
    wp_linked?: boolean;
    text_value?: string;
}

interface RepeatInputNode extends BaseInputNode {
    type: "repeat";
    cache: Inputs[];
}

interface ConditionalInputNode extends BaseInputNode {
    type: "conditional";
    test_param?: InputNode & { name: string; value: Value };
    cases: Array<{
        value: Value;
        inputs: Inputs;
    }>;
}

interface SectionInputNode extends BaseInputNode {
    type: "section";
    inputs: Inputs;
}

interface BooleanInputNode extends BaseInputNode {
    type: "boolean";
    truevalue?: string;
    falsevalue?: string;
}

type InputNode = RepeatInputNode | ConditionalInputNode | SectionInputNode | BooleanInputNode;

interface Inputs {
    [key: string]: InputNode;
}

/*interface BaseInputs {
    [key: string]: InputNode | BaseInputNode;
}*/

type VisitContext = Record<string, InputNode>;

type VisitCallback = (node: InputNode | BaseInputNode, name: string, context: VisitContext) => void;

/** Runs the callback function on all leaf nodes of the inputs dictionary
 * @param inputs    Nested dictionary of input elements
 * @param callback  Called with the mapped dictionary object and corresponding model node
 */
export function visitInputs(inputs: Inputs, callback: VisitCallback) {
    traverseInputTree(inputs, callback, null, {});
}

/**
 * Recursively traverses the input tree, running the callback on all leaf nodes
 */
function traverseInputTree(
    inputs: Inputs,
    callback: VisitCallback,
    prefix: string | null,
    parentContext: VisitContext
) {
    const context = { ...parentContext };

    Object.entries(inputs).forEach(([key, node]) => {
        if (node.type && node.name) {
            context[node.name] = node;
        }

        const name = prefix ? `${prefix}|${node.name}` : node.name ?? key;

        switch (node.type) {
            case "repeat":
                node.cache.forEach((cache, index) => {
                    traverseInputTree(cache, callback, `${name}_${index}`, context);
                });
                break;
            case "conditional":
                if (node.test_param) {
                    callback(node.test_param, `${name}|${node.test_param.name}`, context);

                    const selectedCaseIndex = matchCase(node, node.test_param.value);
                    const selectedCase = node.cases[selectedCaseIndex];

                    if (selectedCase) {
                        traverseInputTree(selectedCase.inputs, callback, name, context);
                    } else {
                        console.debug(`Invalid case selected for ${name}`);
                    }
                } else {
                    console.debug(`Conditional test parameter missing for ${name}`);
                }
                break;
            case "section":
                traverseInputTree(node.inputs, callback, name, context);
                break;
            default:
                callback(node, name, context);
        }
    });
}

/** Matches conditional values to selected cases
 * @param input Definition of conditional input parameter
 * @param value Current value
 *
 * @returns index of matched case. `-1` when no match was found
 */
export function matchCase(input: ConditionalInputNode, value: Value) {
    if (input.test_param?.type === "boolean") {
        if (["true", true].includes(value as string | boolean)) {
            if (input.test_param.truevalue !== undefined) {
                value = input.test_param.truevalue;
            } else {
                value = "true";
            }
        } else {
            if (input.test_param.falsevalue !== undefined) {
                value = input.test_param.falsevalue;
            } else {
                value = "false";
            }
        }
    }

    for (let i = 0; i < input.cases.length; i++) {
        if (input.cases[i]!.value === value) {
            return i;
        }
    }

    return -1;
}

type ErrorResponse =
    | string
    | {
          [key: string]: ErrorResponse;
      }
    | {
          [index: number]: ErrorResponse;
      };

/** Match server validation response to highlight inputs
 * @param inputsRecord  Record of input definitions
 * @param response      Nested dictionary with error/warning messages
 */
export function matchInputs(inputsRecord: Record<string, Inputs>, response: ErrorResponse) {
    const result: Record<string, string> = {};

    const search = (id: string | number, head: ErrorResponse) => {
        if (typeof head === "string") {
            if (inputsRecord[id]) {
                result[id] = head;
            }
        } else {
            const keys = Array.isArray(head) ? Array.from(head.keys()) : Object.keys(head);

            keys.forEach((key) => {
                let newId = key;

                if (id !== "") {
                    const separator = Array.isArray(head) ? "_" : "|";

                    newId = id + separator + newId;
                }

                search(newId, head[key as keyof typeof head]);
            });
        }
    };

    search("", response);

    return result;
}

/*interface Rule {
    error?: unknown;
}

type ParameterValue =
    | Value
    | null
    | undefined
    | { values?: ParameterValue[]; rules?: Rule[]; mapping?: unknown[]; batch?: boolean; src?: string };*/

/** Validates input parameters to identify issues before submitting a server request, where comprehensive validation is performed.
 * @param inputsRecord  Record of input definitions
 * @param values        Record of parameter values
 */
/*
export function validateInputs(inputsRecord: BaseInputs, values: Record<string, ParameterValue>) {
    const batchCount = -1;
    const batchSource = null;

    for (const [inputId, inputValue] of Object.entries(values)) {
        const inputDef = inputsRecord[inputId]!;

        if (!inputDef || inputDef.step_linked) {
            continue;
        }

        if (inputValue == null && !inputDef.optional && inputDef.type !== "hidden") {
            return [inputId, "Please provide a value for this option."];
        }

        if (inputDef.wp_linked && inputDef.text_value == inputValue) {
            return [inputId, "Please provide a value for this workflow parameter."];
        }

        if (
            inputValue &&
            typeof inputValue === "object" &&
            Array.isArray(inputValue.values) &&
            inputValue.values.length == 0 &&
            !inputDef.optional
        ) {
            return [inputId, "Please provide data for this input."];
        }

        if (inputValue && typeof inputValue === "object") {
            if (inputValue.rules && inputValue.rules.length == 0) {
                return [inputId, "No rules defined, define at least one rule."];
            }

            if (inputValue.mapping && inputValue.mapping.length == 0) {
                return [inputId, "No collection identifiers defined, specify at least one collection identifier."];
            }

            if (inputValue.rules && inputValue.rules.length > 0) {
                for (const rule of inputValue.rules) {
                    if (rule.error) {
                        return [inputId, "Error detected in one or more rules."];
                    }
                }
            }
        }

        if (inputValue && typeof inputValue === "object" && inputValue.batch && inputValue.values) {
            const n = inputValue.values.length;
            const src =
                n > 0 && inputValue.values[0] && typeof inputValue.values[0] === "object" && inputValue.values[0].src;

            if (src) {
                if (batchSrc === null) {
                    batchSrc = src;
                } else if (batchSrc !== src) {
                    return [inputId, "Please select either dataset or dataset list fields for all batch mode fields."];
                }
            }
            if (batchN === -1) {
                batchN = n;
            } else if (batchN !== n) {
                return [
                    inputId,
                    `Please make sure that you select the same number of inputs for all batch mode fields. This field contains <b>${n}</b> selection(s) while a previous field contains <b>${batchN}</b>.`,
                ];
            }
        }
    }
    return null;
}*/
