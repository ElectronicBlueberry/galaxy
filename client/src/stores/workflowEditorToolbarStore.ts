import { defineStore } from "pinia";
import { onScopeDispose, ref } from "vue";

import { useUserLocalStorage } from "@/composables/userLocalStorage";

export const snapDistance = 10;

export type AnnotationTool = "textAnnotation" | "markdownAnnotation" | "groupAnnotation";
export type EditorTool = "pointer" | AnnotationTool;
export type InputCatcherEventType = "pointerdown" | "pointerup" | "pointermove";

interface InputCatcherEventListener {
    type: InputCatcherEventType;
    callback: (event: InputCatcherEvent) => void;
}

interface InputCatcherEvent {
    type: InputCatcherEventType;
    position: [number, number];
}

export type WorkflowEditorToolbarStore = ReturnType<typeof useWorkflowEditorToolbarStore>;

export const useWorkflowEditorToolbarStore = (workflowId: string) => {
    return defineStore(`workflowEditorToolbarStore${workflowId}`, () => {
        const snapActive = useUserLocalStorage("workflow-editor-toolbar-snap-active", false);
        const currentTool = ref<EditorTool>("pointer");
        const inputCatcherActive = ref<boolean>(false);
        const inputCatcherEventListeners = new Set<InputCatcherEventListener>();

        function onInputCatcherEvent(type: InputCatcherEventType, callback: InputCatcherEventListener["callback"]) {
            const listener = {
                type,
                callback,
            };

            inputCatcherEventListeners.add(listener);

            onScopeDispose(() => {
                inputCatcherEventListeners.delete(listener);
            });
        }

        function emitInputCatcherEvent(type: InputCatcherEventType, event: InputCatcherEvent) {
            inputCatcherEventListeners.forEach((listener) => {
                if (listener.type === type) {
                    listener.callback(event);
                }
            });
        }

        return {
            snapActive,
            currentTool,
            inputCatcherActive,
            onInputCatcherEvent,
            emitInputCatcherEvent,
        };
    })();
};
