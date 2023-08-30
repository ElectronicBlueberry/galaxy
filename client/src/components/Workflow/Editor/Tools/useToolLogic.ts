import simplify from "simplify-js";
import { watch } from "vue";

import type { BaseWorkflowAnnotation, WorkflowAnnotationStore } from "@/stores/workflowEditorAnnotationStore";
import { type WorkflowEditorToolbarStore } from "@/stores/workflowEditorToolbarStore";
import { assertDefined } from "@/utils/assertions";
import { match } from "@/utils/utils";

import { vecMax, vecMin, vecReduceFigures, vecSnap, vecSubtract, type Vector } from "../modules/geometry";

export function useToolLogic(toolbarStore: WorkflowEditorToolbarStore, annotationStore: WorkflowAnnotationStore) {
    let annotation: BaseWorkflowAnnotation | null = null;
    let start: Vector | null = null;

    const { annotationOptions } = toolbarStore;

    watch(
        () => toolbarStore.currentTool,
        () => {
            if (annotation?.type === "freehand") {
                finalizeFreehandAnnotation(annotation);
            } else {
                annotation = null;
            }
        }
    );

    toolbarStore.onInputCatcherEvent("pointerdown", ({ position }) => {
        start = position;

        if (toolbarStore.currentTool === "freehandEraser") {
            return;
        }

        if (annotation?.type === "freehand" || !annotation) {
            const baseAnnotation = {
                id: annotationStore.highestAnnotationId + 1,
                position: start,
                size: [0, 0] as [number, number],
                colour: annotationOptions.colour,
            };

            annotation = match(toolbarStore.currentTool, {
                textAnnotation: () => ({
                    ...baseAnnotation,
                    type: "text",
                    data: {
                        size: annotationOptions.textSize,
                        text: "Enter Text",
                        bold: annotationOptions.bold,
                        italic: annotationOptions.italic,
                    } as BaseWorkflowAnnotation["data"],
                }),
                markdownAnnotation: () => ({
                    ...baseAnnotation,
                    type: "markdown",
                    data: {
                        text: "*Enter Text*",
                    },
                }),
                groupAnnotation: () => ({
                    ...baseAnnotation,
                    type: "group",
                    data: {
                        title: "Group",
                    },
                }),
                freehandAnnotation: () => ({
                    ...baseAnnotation,
                    type: "freehand",
                    data: {
                        thickness: annotationOptions.lineThickness,
                        line: [position],
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
        if (toolbarStore.currentTool === "freehandEraser") {
            return;
        }

        if (annotation && start) {
            if (annotation.type === "freehand") {
                annotationStore.addPoint(annotation.id, position);
            } else {
                positionAnnotation(start, position, annotation);
            }
        }
    });

    toolbarStore.onInputCatcherEvent("pointerup", () => {
        if (toolbarStore.currentTool === "freehandEraser") {
            return;
        } else if (annotation?.type === "freehand") {
            finalizeFreehandAnnotation(annotation);
        } else {
            toolbarStore.currentTool = "pointer";
        }

        annotation = null;
    });

    toolbarStore.onInputCatcherEvent("temporarilyDisabled", () => {
        if (annotation?.type === "freehand") {
            finalizeFreehandAnnotation(annotation);
            annotation = null;
        }
    });

    const finalizeFreehandAnnotation = (annotation: BaseWorkflowAnnotation) => {
        const freehandAnnotation = annotationStore.annotationsRecord[annotation.id];
        assertDefined(freehandAnnotation);
        if (freehandAnnotation.type !== "freehand") {
            throw new Error("Annotation is not of type freehandAnnotation");
        }

        // smooth
        const xyLine = freehandAnnotation.data.line.map((point) => ({ x: point[0], y: point[1] }));
        const simpleLine = simplify(xyLine, annotationOptions.smoothing).map((point) => [
            point.x,
            point.y,
        ]) as Array<Vector>;

        // normalize
        const normalized = simpleLine.map((p) => vecSubtract(p, freehandAnnotation.position));

        // reduce significant figures
        const line = normalized.map((p) => vecReduceFigures(p) as Vector);

        annotationStore.changeData(freehandAnnotation.id, { ...freehandAnnotation.data, line });
        annotationStore.changePosition(freehandAnnotation.id, vecReduceFigures(freehandAnnotation.position));
        annotationStore.changeSize(freehandAnnotation.id, vecReduceFigures(freehandAnnotation.size));
        annotationStore.clearJustCreated(freehandAnnotation.id);
    };

    const positionAnnotation = (pointA: Vector, pointB: Vector, annotation: BaseWorkflowAnnotation) => {
        if (toolbarStore.snapActive) {
            pointA = vecSnap(pointA, toolbarStore.snapDistance);
            pointB = vecSnap(pointB, toolbarStore.snapDistance);
        }

        const pointMin = vecMin(pointA, pointB);
        const pointMax = vecMax(pointA, pointB);

        const position = pointMin;
        const size = vecSubtract(pointMax, pointMin);

        annotationStore.changePosition(annotation.id, position);
        annotationStore.changeSize(annotation.id, size);
    };
}
