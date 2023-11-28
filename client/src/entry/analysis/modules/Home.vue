<template>
    <div>
        <ToolForm v-if="isTool && !isUpload" v-bind="toolParams" />
        <WorkflowRun v-else-if="isWorkflow" v-bind="workflowParams" />
        <div v-else-if="isController" :src="controllerParams" />
        <CenterFrame v-else src="/welcome" />
    </div>
</template>

<script>
import ToolForm from "components/Tool/ToolForm";
import WorkflowRun from "components/Workflow/Run/WorkflowRun";
import decodeUriComponent from "decode-uri-component";
import CenterFrame from "entry/analysis/modules/CenterFrame";
import { computed } from "vue";
import { useRoute } from "vue-router/composables";

export default {
    components: {
        CenterFrame,
        ToolForm,
        WorkflowRun,
    },
    props: {
        config: {
            type: Object,
            required: true,
        },
        query: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const route = useRoute();

        const preferSimpleFormOverride = computed(() => route.query["simplified_workflow_run_ui"]);

        const workflowParams = computed(() => {
            const params = {
                workflowId: props.query.workflow_id,
                preferSimpleForm: props.config.simplified_workflow_run_ui === "prefer",
                simpleFormTargetHistory: props.config.simplified_workflow_run_ui_target_history,
                simpleFormUseJobCache: props.config.simplified_workflow_run_ui_job_cache === "on",
            };

            if (preferSimpleFormOverride.value === "prefer") {
                params.preferSimpleForm = true;
            } else if (preferSimpleFormOverride.value === "off") {
                params.preferSimpleForm = false;
            }

            return params;
        });

        return {
            workflowParams,
        };
    },
    computed: {
        isController() {
            return this.query.m_c && this.query.m_a;
        },
        isTool() {
            return this.query.tool_id || this.query.job_id;
        },
        isUpload() {
            return this.query.tool_id === "upload1";
        },
        isWorkflow() {
            return this.query.workflow_id;
        },
        controllerParams() {
            return `${this.query.m_c}/${this.query.m_a}`;
        },
        toolParams() {
            const result = { ...this.query };
            const tool_id = this.query.tool_id;
            if (tool_id) {
                result.id = tool_id.indexOf("+") >= 0 ? tool_id : decodeUriComponent(tool_id);
            }
            const tool_version = this.query.version;
            if (tool_version) {
                result.version = tool_version.indexOf("+") >= 0 ? tool_version : decodeUriComponent(tool_version);
            }
            return result;
        },
    },
};
</script>
