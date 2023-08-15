import { defineStore } from "pinia";
import { ref } from "vue";

type WorkflowAnnotationColours = "none" | "red" | "green" | "blue" | "orange" | "pink";

export interface BaseWorkflowAnnotation {
    type: string;
    id: string;
    colour: WorkflowAnnotationColours;
    position: [number, number];
    size: [number, number];
    data: unknown;
}

export interface TextWorkflowAnnotation {
    type: "text";
    data: string;
}

export interface MarkdownWorkflowAnnotation {
    type: "markdown";
    data: string;
}

export interface ContainerWorkflowAnnotation {
    type: "container";
    data: string;
}

export interface FreehandWorkflowAnnotation {
    type: "freehand";
    data: {
        thickness: number;
        line: Array<[number, number]>;
    };
}

export type WorkflowAnnotation =
    | TextWorkflowAnnotation
    | MarkdownWorkflowAnnotation
    | ContainerWorkflowAnnotation
    | FreehandWorkflowAnnotation;

export const useWorkflowAnnotationStore = (workflowId: string) => {
    return defineStore(`workflowAnnotationStore${workflowId}`, () => {
        const annotations = ref<WorkflowAnnotation[]>([]);

        return {
            annotations,
        };
    })();
};
