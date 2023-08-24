import { defineStore } from "pinia";
import { ref } from "vue";

import { useUserLocalStorage } from "@/composables/userLocalStorage";

export const snapDistance = 10;

export type AnnotationTool = "textAnnotation" | "markdownAnnotation" | "groupAnnotation";
export type EditorTool = "pointer" | AnnotationTool;

export const useWorkflowEditorToolbarStore = defineStore("workflowEditorToolbarStore", () => {
    const snapActive = useUserLocalStorage("workflow-editor-toolbar-snap-active", false);
    const currentTool = ref<EditorTool>("pointer");

    return {
        snapActive,
        currentTool,
    };
});
