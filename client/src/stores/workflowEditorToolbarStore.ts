import { defineStore } from "pinia";

import { useUserLocalStorage } from "@/composables/userLocalStorage";

export const snapDistance = 10;

export const useWorkflowEditorToolbarStore = defineStore("workflowEditorToolbarStore", () => {
    const snapActive = useUserLocalStorage("workflow-editor-toolbar-snap-active", false);

    return {
        snapActive,
    };
});
