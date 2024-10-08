import { computed, type Ref, ref } from "vue";

import {
    copyWorkflow as copyWorkflowService,
    deleteWorkflow as deleteWorkflowService,
    updateWorkflow as updateWorkflowService,
} from "@/components/Workflow/workflows.services";
import { useConfig } from "@/composables/config";
import { useConfirmDialog } from "@/composables/confirmDialog";
import { useToast } from "@/composables/toast";
import { copy } from "@/utils/clipboard";
import { withPrefix } from "@/utils/redirect";
import { getFullAppUrl } from "@/utils/utils";

// TODO: replace me with a more accurate type
type Workflow = any;

export function useWorkflowActions(workflow: Ref<Workflow>, refreshCallback: () => void) {
    const toast = useToast();
    const { config } = useConfig() as { config: Record<string, any> };

    const bookmarkLoading = ref(false);

    const toggleBookmark = async (checked: boolean) => {
        try {
            bookmarkLoading.value = true;

            await updateWorkflowService(workflow.value.id, {
                show_in_tool_panel: checked,
            });

            toast.info(`Workflow ${checked ? "added to" : "removed from"} bookmarks`);

            if (checked) {
                config.stored_workflow_menu_entries.push({
                    id: workflow.value.id,
                    name: workflow.value.name,
                });
            } else {
                const indexToRemove = config.stored_workflow_menu_entries.findIndex(
                    (w: Workflow) => w.id === workflow.value.id
                );
                config.stored_workflow_menu_entries.splice(indexToRemove, 1);
            }
        } catch (error) {
            toast.error("Failed to update workflow bookmark status");
        } finally {
            refreshCallback();
            bookmarkLoading.value = false;
        }
    };

    const { confirm } = useConfirmDialog();

    const deleteWorkflow = async () => {
        const confirmed = await confirm("Are you sure you want to delete this workflow?", {
            title: "Delete workflow",
            okTitle: "Delete",
            okVariant: "danger",
        });

        if (confirmed) {
            await deleteWorkflowService(workflow.value.id);
            refreshCallback();
            toast.info("Workflow deleted");
        }
    };

    const relativeLink = computed(() => {
        return `/published/workflow?id=${workflow.value.id}`;
    });

    const fullLink = computed(() => {
        return getFullAppUrl(relativeLink.value.substring(1));
    });

    function copyPublicLink() {
        copy(fullLink.value);
        toast.success("Link to workflow copied");
    }

    async function copyWorkflow() {
        const confirmed = await confirm("Are you sure you want to make a copy of this workflow?", "Copy workflow");

        if (confirmed) {
            await copyWorkflowService(workflow.value.id, workflow.value.owner);
            refreshCallback();
            toast.success("Workflow copied");
        }
    }

    const downloadUrl = computed(() => {
        return withPrefix(`/api/workflows/${workflow.value.id}/download?format=json-download`);
    });

    async function importWorkflow() {
        await copyWorkflowService(workflow.value.id, workflow.value.owner);
        toast.success("Workflow imported successfully");
    }

    return {
        bookmarkLoading,
        toggleBookmark,
        deleteWorkflow,
        copyPublicLink,
        copyWorkflow,
        importWorkflow,
        downloadUrl,
    };
}
