import { defineStore } from "pinia";
import { computed, del, ref, set } from "vue";

import { Colour } from "@/components/Workflow/Editor/Annotations/colours";
import { vecAdd, vecMax, vecMin, vecReduceFigures, vecSubtract } from "@/components/Workflow/Editor/modules/geometry";
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
    data: {
        text: string;
    };
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
        markdown: () => hasKeys(annotationData, ["text"]),
        group: () => hasKeys(annotationData, ["title"]),
        freehand: () => hasKeys(annotationData, ["thickness", "line"]),
    });

    if (!valid) {
        throw new TypeError(
            `Object "${annotationData}" is not a valid data object for an ${annotationType} annotation`
        );
    }
}

interface AnnotationMetadata {
    justCreated?: boolean;
}

export type WorkflowAnnotationStore = ReturnType<typeof useWorkflowAnnotationStore>;

export const useWorkflowAnnotationStore = (workflowId: string) => {
    return defineStore(`workflowAnnotationStore${workflowId}`, () => {
        const annotationsRecord = ref<Record<number, WorkflowAnnotation>>({});
        const localAnnotationsMetadata = ref<Record<number, AnnotationMetadata>>({});

        const $reset = () => {
            annotationsRecord.value = {};
            localAnnotationsMetadata.value = {};
        };

        const workflowAnnotations = computed(() => Object.values(annotationsRecord.value));
        const addAnnotations = (annotationsArray: WorkflowAnnotation[], defaultPosition: [number, number] = [0, 0]) => {
            annotationsArray.forEach((annotation) => {
                const newAnnotation = structuredClone(annotation);
                newAnnotation.position[0] += defaultPosition[0];
                newAnnotation.position[1] += defaultPosition[1];

                set(annotationsRecord.value, newAnnotation.id, newAnnotation);
            });
        };

        const highestAnnotationId = computed(
            () => workflowAnnotations.value[workflowAnnotations.value.length - 1]?.id ?? -1
        );

        const getAnnotation = computed(() => (id: number) => {
            const annotation = annotationsRecord.value[id];
            assertDefined(annotation);
            return annotation;
        });

        function changePosition(id: number, position: [number, number]) {
            const annotation = getAnnotation.value(id);
            set(annotation, "position", vecReduceFigures(position));
        }

        function changeSize(id: number, size: [number, number]) {
            const annotation = getAnnotation.value(id);
            set(annotation, "size", vecReduceFigures(size));
        }

        function changeData(id: number, data: unknown) {
            const annotation = getAnnotation.value(id);
            assertAnnotationDataValid(annotation.type, data);
            set(annotation, "data", data);
        }

        function addPoint(id: number, point: [number, number]) {
            const annotation = getAnnotation.value(id);
            if (!(annotation.type === "freehand")) {
                throw new Error("Can only add points to freehand annotation");
            }

            annotation.data.line.push(point);

            annotation.size = vecMax(annotation.size, vecSubtract(point, annotation.position));

            const prevPosition = annotation.position;
            annotation.position = vecMin(annotation.position, point);

            const diff = vecSubtract(prevPosition, annotation.position);
            annotation.size = vecAdd(annotation.size, diff);
        }

        function changeColour(id: number, colour: WorkflowAnnotationColour) {
            const annotation = getAnnotation.value(id);
            set(annotation, "colour", colour);
        }

        function deleteAnnotation(id: number) {
            del(annotationsRecord.value, id);
        }

        /**
         * Adds a single annotation. Sets the `userCreated` flag.
         * Meant to be used when a user adds an annotation.
         * @param annotation
         */
        function createAnnotation(annotation: BaseWorkflowAnnotation) {
            markJustCreated(annotation.id);
            addAnnotations([annotation as WorkflowAnnotation]);
        }

        const isJustCreated = computed(() => (id: number) => localAnnotationsMetadata.value[id]?.justCreated ?? false);

        function markJustCreated(id: number) {
            const metadata = localAnnotationsMetadata.value[id];

            if (metadata) {
                set(metadata, "justCreated", true);
            } else {
                set(localAnnotationsMetadata.value, id, { justCreated: true });
            }
        }

        function clearJustCreated(id: number) {
            const metadata = localAnnotationsMetadata.value[id];

            if (metadata) {
                del(metadata, "justCreated");
            }
        }

        function deleteFreehandAnnotations() {
            Object.values(annotationsRecord.value).forEach((annotation) => {
                if (annotation.type === "freehand") {
                    deleteAnnotation(annotation.id);
                }
            });
        }

        return {
            workflowAnnotations,
            annotationsRecord,
            highestAnnotationId,
            addAnnotations,
            getAnnotation,
            changePosition,
            changeSize,
            changeData,
            changeColour,
            addPoint,
            deleteAnnotation,
            createAnnotation,
            isJustCreated,
            markJustCreated,
            clearJustCreated,
            deleteFreehandAnnotations,
            $reset,
        };
    })();
};
