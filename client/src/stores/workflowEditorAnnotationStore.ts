import { defineStore } from "pinia";
import { computed, del, ref, set } from "vue";

import { Colour } from "@/components/Workflow/Editor/Annotations/colours";
import { assertDefined } from "@/utils/assertions";
import { hasKeys, match } from "@/utils/utils";

export type WorkflowAnnotationColour = Colour | "none";

export interface BaseWorkflowAnnotation {
    id: number;
    type: string;
    colour: WorkflowAnnotationColour;
    position: [number, number];
    size: [number, number];
    data: unknown;
}

export interface TextWorkflowAnnotation extends BaseWorkflowAnnotation {
    type: "text";
    data: {
        bold?: true;
        italic?: true;
        size: number;
        text: string;
    };
}

export interface MarkdownWorkflowAnnotation extends BaseWorkflowAnnotation {
    type: "markdown";
    data: string;
}

export interface GroupWorkflowAnnotation extends BaseWorkflowAnnotation {
    type: "group";
    data: {
        title: string;
    };
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

function assertAnnotationDataValid(
    annotationType: WorkflowAnnotation["type"],
    annotationData: unknown
): asserts annotationData is WorkflowAnnotation["data"] {
    const valid = match(annotationType, {
        text: () => hasKeys(annotationData, ["text", "size"]),
        markdown: () => typeof annotationData === "string",
        group: () => hasKeys(annotationData, ["title"]),
        freehand: () => hasKeys(annotationData, ["thickness", "line"]),
    });

    if (!valid) {
        throw new TypeError(
            `Object "${annotationData}" is not a valid data object for an ${annotationType} annotation`
        );
    }
}

export const useWorkflowAnnotationStore = (workflowId: string) => {
    return defineStore(`workflowAnnotationStore${workflowId}`, () => {
        const annotationsRecord = ref<Record<string, WorkflowAnnotation>>({});

        const $reset = () => {
            annotationsRecord.value = {};
        };

        const annotations = computed(() => Object.values(annotationsRecord.value));
        const addAnnotations = (annotationsArray: WorkflowAnnotation[], defaultPosition: [number, number] = [0, 0]) => {
            annotationsArray.forEach((annotation) => {
                const newAnnotation = structuredClone(annotation);
                newAnnotation.position[0] += defaultPosition[0];
                newAnnotation.position[1] += defaultPosition[1];

                set(annotationsRecord.value, newAnnotation.id, newAnnotation);
            });
        };

        const getAnnotation = (id: number) => {
            const annotation = annotationsRecord.value[id];
            assertDefined(annotation);
            return annotation;
        };

        const changePosition = (id: number, position: [number, number]) => {
            const annotation = getAnnotation(id);
            set(annotation, "position", position);
        };

        const changeSize = (id: number, size: [number, number]) => {
            const annotation = getAnnotation(id);
            set(annotation, "size", size);
        };

        const changeData = (id: number, data: unknown) => {
            const annotation = getAnnotation(id);
            assertAnnotationDataValid(annotation.type, data);
            set(annotation, "data", data);
        };

        const changeColour = (id: number, colour: WorkflowAnnotationColour) => {
            const annotation = getAnnotation(id);
            set(annotation, "colour", colour);
        };

        const deleteAnnotation = (id: number) => {
            del(annotationsRecord.value, id);
        };

        return {
            annotations,
            annotationsRecord,
            addAnnotations,
            getAnnotation,
            changePosition,
            changeSize,
            changeData,
            changeColour,
            deleteAnnotation,
            $reset,
        };
    })();
};
