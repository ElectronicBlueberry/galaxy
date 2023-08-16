import { defineStore } from "pinia";
import { computed, ref, set } from "vue";

import { assertDefined } from "@/utils/assertions";

type WorkflowAnnotationColours = "none" | "red" | "green" | "blue" | "orange" | "pink";

export interface BaseWorkflowAnnotation {
    id: number;
    type: string;
    colour: WorkflowAnnotationColours;
    position: [number, number];
    size: [number, number];
    data: unknown;
}

export interface TextWorkflowAnnotation extends BaseWorkflowAnnotation {
    type: "text";
    data: string;
}

export interface MarkdownWorkflowAnnotation extends BaseWorkflowAnnotation {
    type: "markdown";
    data: string;
}

export interface GroupWorkflowAnnotation extends BaseWorkflowAnnotation {
    type: "group";
    data: string;
}

export interface FreehandWorkflowAnnotation extends BaseWorkflowAnnotation {
    type: "freehand";
    data: {
        thickness: number;
        line: Array<[number, number]>;
    };
}

export type WorkflowAnnotation =
    | TextWorkflowAnnotation
    | MarkdownWorkflowAnnotation
    | GroupWorkflowAnnotation
    | FreehandWorkflowAnnotation;

export const useWorkflowAnnotationStore = (workflowId: string) => {
    return defineStore(`workflowAnnotationStore${workflowId}`, () => {
        const annotationsRecord = ref<Record<string, WorkflowAnnotation>>({});

        const $reset = () => {
            annotationsRecord.value = {};
        };

        const annotations = computed(() => Object.values(annotationsRecord.value));
        const addAnnotations = (annotationsArray: WorkflowAnnotation[]) => {
            annotationsArray.forEach((annotation) => set(annotationsRecord.value, annotation.id, annotation));
        };

        const editAnnotation = (id: number, edits: Partial<BaseWorkflowAnnotation>) => {
            const annotation = annotationsRecord.value[id];
            assertDefined(annotation);

            Object.entries(edits).forEach(([key, value]) => {
                if (key === "id") {
                    throw new Error("WorkflowAnnotation id is immutable.");
                }

                set(annotation, key, value);
            });
        };

        return {
            annotations,
            annotationsRecord,
            addAnnotations,
            editAnnotation,
            $reset,
        };
    })();
};
