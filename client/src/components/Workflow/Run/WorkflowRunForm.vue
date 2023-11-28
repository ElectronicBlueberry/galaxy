<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSitemap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import type { validateInputs } from "@/components/Form/utilities";
import { allowCachedJobs } from "@/components/Tool/utilities";
import { useHistoryStore } from "@/stores/historyStore";
import { useUserStore } from "@/stores/userStore";
import { assertDefined, maybeGetPropertyChain } from "@/utils/assertions";

import { getReplacements, type WorkflowRunModel } from "./model";
import { invokeWorkflow } from "./services";

import WorkflowRunDefaultStep from "./WorkflowRunDefaultStep.vue";
import WorkflowRunInputStep from "./WorkflowRunInputStep.vue";
import ButtonSpinner from "@/components/Common/ButtonSpinner.vue";
import FormCard from "@/components/Form/FormCard.vue";
import FormDisplay from "@/components/Form/FormDisplay.vue";
import FormElement from "@/components/Form/FormElement.vue";

library.add(faSitemap);

const props = defineProps<{
    model: WorkflowRunModel;
}>();

const emit = defineEmits<{
    (e: "submissionSuccess", invocations: unknown): void;
    (e: "submissionError", error: Error): void;
}>();

const { currentUser, currentPreferences } = storeToRefs(useUserStore());
const { currentHistoryId } = storeToRefs(useHistoryStore());

const showExecuting = ref(false);

type Value = unknown;
type StepData = Record<string, Value>;

const stepData = ref<Record<string, StepData>>({});
const inputs = ref<Record<string, unknown>>({});

function onDefaultStepInputs(stepId: string, data: { input: unknown }) {
    inputs.value[stepId] = data.input;
}

function onToolStepInputs(stepId: string, data: StepData) {
    stepData.value[stepId] = data;
}

const parameterInputs = computed(() => Object.values(props.model.wpInputs) ?? []);
const parameterInputsAvailable = computed(() => parameterInputs.value.length > 0);
const parameterData = ref<WorkflowRunModel["wpInputs"]>({});

function onParameterInputs(newData: typeof parameterData.value) {
    parameterData.value = newData;
}

function getReplacementParameters(inputs: typeof parameterData.value) {
    return getReplacements(inputs, stepData.value, parameterData.value);
}

const resourceInputs = computed(() =>
    props.model.workflowResourceParameters ? Object.values(props.model.workflowResourceParameters) : []
);
const resourceInputsAvailable = computed(() => resourceInputs.value.length > 0);
const resourceData = ref({});

function onResourceInputs(newData: typeof resourceData.value) {
    resourceData.value = newData;
}

const reuseAllowed = computed(() => allowCachedJobs(currentPreferences.value));

const stepScrollTo = ref<{
    stepId: string;
    error: [string, string];
}>();

function getValidationScrollTo(stepId: string) {
    if (stepScrollTo.value?.stepId === stepId) {
        return stepScrollTo.value.error;
    } else {
        return [];
    }
}

const historyInputs = [
    {
        type: "conditional",
        name: "new_history",
        test_param: {
            name: "check",
            label: "Send results to a new history",
            type: "boolean",
            value: "false",
            help: "",
        },
        cases: [
            {
                value: "true",
                inputs: [
                    {
                        name: "name",
                        label: "History name",
                        type: "text",
                        value: props.model.name,
                    },
                ],
            },
            {
                value: "false",
                inputs: [],
            },
        ],
    },
];
const historyData = ref<Record<string, string>>({});

function onHistoryInputs(newData: typeof historyData.value) {
    historyData.value = newData;
}

type Validation = ReturnType<typeof validateInputs>;

const stepValidations = ref<Record<string, Validation>>({});

function onValidation(stepId: string, validation: Validation) {
    stepValidations.value[stepId] = validation;
}

const useCachedJobs = ref(false);

async function onExecute() {
    for (const [stepId, stepValidation] of Object.entries(stepValidations.value)) {
        if (stepValidation) {
            stepScrollTo.value = {
                stepId: stepId,
                error: stepValidation.slice() as [string, string],
            };

            return;
        }
    }

    const parameters: Record<string, StepData> = {};

    Object.entries(stepData.value).forEach(([stepId, stepData]) => {
        const stepDataFiltered: Record<string, Value> = {};

        Object.entries(stepData).forEach(([inputName, inputValue]) => {
            if (!props.model.isConnected(stepId, inputName)) {
                stepDataFiltered[inputName] = inputValue;
            }
        });

        parameters[stepId] = stepDataFiltered;
    });

    const jobDef = {
        new_history_name: historyData.value["new_history|name"] ? historyData.value["new_history|name"] : null,
        history_id: !historyData.value["new_history|name"] ? props.model.historyId : null,
        resource_params: resourceData.value,
        replacement_params: parameterData.value,
        use_cached_job: useCachedJobs.value,
        inputs: inputs.value,
        parameters: parameters.value,
        // Tool form will submit flat maps for each parameter
        // (e.g. "repeat_0|cond|param": "foo" instead of nested
        // data structures).
        parameters_normalized: true,
        // Tool form always wants a list of invocations back
        // so that inputs can be batched.
        batch: true,
        // the user is already warned if tool versions are wrong,
        // they can still choose to invoke the workflow anyway.
        require_exact_tool_versions: false,
    } as const;

    console.debug("WorkflowRunForm::onExecute()", "Ready for submission.", jobDef);
    showExecuting.value = true;

    try {
        const invocations = await invokeWorkflow(props.model.workflowId, jobDef);

        console.debug("WorkflowRunForm::onExecute()", "Submission successful.", invocations);
        showExecuting.value = false;
        emit("submissionSuccess", invocations);
    } catch (e) {
        console.debug("WorkflowRunForm::onExecute()", "Submission failed.", e);
        showExecuting.value = false;

        const errorData = maybeGetPropertyChain<Record<string, string>>(e, ["response", "data", "err_data"]);

        if (errorData) {
            try {
                const errorEntries = Object.entries(errorData);
                const stepId = errorEntries[0]?.[0];
                const error = Object.entries(errorEntries[0]?.[1] ?? {})[0];

                assertDefined(stepId);
                assertDefined(error);

                stepScrollTo.value = {
                    stepId,
                    error,
                };
            } catch (errorFormatting) {
                console.debug(
                    errorFormatting,
                    "WorkflowRunForm::onExecute()",
                    "Invalid server error response format.",
                    errorData
                );
                emit("submissionError", e as Error);
            }
        } else {
            emit("submissionError", e as Error);
        }
    }
}
</script>

<template>
    <div v-if="currentUser && currentHistoryId" class="workflow-expanded-form">
        <div class="workflow-header sticky-top bg-secondary px-2 py-1 rounded mb-4">
            <span class="d-flex flex-gapx-1">
                <FontAwesomeIcon icon="fa-sitemap" />
                <h1 class="h-text mb-0 font-weight-bold">Workflow: {{ props.model.name }}</h1>
            </span>

            <ButtonSpinner
                id="run-workflow"
                class="btn-sm"
                title="Run Workflow"
                :wait="showExecuting"
                @onClick="onExecute" />
        </div>

        <FormCard v-if="parameterInputsAvailable" title="Workflow Parameters">
            <FormDisplay :inputs="parameterInputs" @onChange="onParameterInputs" />
        </FormCard>

        <FormCard title="History Options">
            <FormDisplay :inputs="historyInputs" @onChange="onHistoryInputs" />
        </FormCard>

        <FormCard v-if="reuseAllowed" title="Job re-use Options">
            <FormElement
                v-model="useCachedJobs"
                title="Attempt to re-use jobs with identical parameters?"
                help="This may skip executing jobs that you have already run."
                type="boolean" />
        </FormCard>

        <FormCard v-if="resourceInputsAvailable" title="Workflow Resource Options">
            <FormDisplay :inputs="resourceInputs" @onChange="onResourceInputs" />
        </FormCard>

        <div v-for="step in model.steps" :key="step.index">
            <WorkflowRunDefaultStep
                v-if="step.step_type == 'tool' || step.step_type == 'subworkflow'"
                :model="step"
                :replace-params="getReplacementParameters(step.inputs)"
                :validation-scroll-to="getValidationScrollTo(step.index)"
                :history-id="currentHistoryId"
                @onChange="onToolStepInputs"
                @onValidation="onValidation" />
            <WorkflowRunInputStep
                v-else
                :model="step"
                :validation-scroll-to="getValidationScrollTo(step.index)"
                @onChange="onDefaultStepInputs"
                @onValidation="onValidation" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.workflow-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
