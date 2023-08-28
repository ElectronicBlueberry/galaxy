import { watch } from "vue";

import type {
    BaseWorkflowAnnotation,
    WorkflowAnnotationColour,
    WorkflowAnnotationStore,
} from "@/stores/workflowEditorAnnotationStore";
import { snapDistance, type WorkflowEditorToolbarStore } from "@/stores/workflowEditorToolbarStore";
import { match } from "@/utils/utils";

import { vecMax, vecMin, vecSnap, vecSubtract, type Vector } from "../modules/geometry";

export function useToolLogic(toolbarStore: WorkflowEditorToolbarStore, annotationStore: WorkflowAnnotationStore) {
    let annotation: BaseWorkflowAnnotation | null = null;
    let start: Vector | null = null;

    watch(
        () => toolbarStore.currentTool,
        () => {
            annotation = null;
        }
    );

    toolbarStore.onInputCatcherEvent("pointerdown", ({ position }) => {
        start = position;

        if (!annotation) {
            const baseAnnotation = {
                id: annotationStore.highestAnnotationId + 1,
                position: start,
                size: [0, 0] as [number, number],
                colour: "none" as WorkflowAnnotationColour,
            };

            annotation = match(toolbarStore.currentTool, {
                textAnnotation: () => ({
                    ...baseAnnotation,
                    type: "text",
                    data: {
                        size: 2,
                        text: "Enter Text",
                    } as BaseWorkflowAnnotation["data"],
                }),
                markdownAnnotation: () => ({
                    ...baseAnnotation,
                    type: "markdown",
                    data: "*Enter Text*",
                }),
                groupAnnotation: () => ({
                    ...baseAnnotation,
                    type: "group",
                    data: {
                        title: "Group",
                    },
                }),
                pointer: () => {
                    throw new Error("Tool logic should not be active when pointer tool is selected");
                },
            });

            annotationStore.createAnnotation(annotation);
        } else {
            positionAnnotation(start, position, annotation);
        }
    });

    toolbarStore.onInputCatcherEvent("pointermove", ({ position }) => {
        if (annotation && start) {
            positionAnnotation(start, position, annotation);
        }
    });

    toolbarStore.onInputCatcherEvent("pointerup", () => {
        toolbarStore.currentTool = "pointer";
    });

    const positionAnnotation = (pointA: Vector, pointB: Vector, annotation: BaseWorkflowAnnotation) => {
        if (toolbarStore.snapActive) {
            pointA = vecSnap(pointA, snapDistance);
            pointB = vecSnap(pointB, snapDistance);
        }

        const pointMin = vecMin(pointA, pointB);
        const pointMax = vecMax(pointA, pointB);

        const position = pointMin;
        const size = vecSubtract(pointMax, pointMin);

        annotationStore.changePosition(annotation.id, position);
        annotationStore.changeSize(annotation.id, size);
    };
}
