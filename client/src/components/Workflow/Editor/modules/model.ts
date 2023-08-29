import { useWorkflowAnnotationStore, type WorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";
import { type ConnectionOutputLink, type Steps, useWorkflowStepStore } from "@/stores/workflowStepStore";

interface Workflow {
    name: string;
    annotation: string;
    license: string;
    creator: any;
    version: number;
    report: any;
    steps: Steps;
    annotations: WorkflowAnnotation[];
}

/**
 * Loads a workflow into the editor
 *
 * @param id ID of workflow to load data *into*
 * @param data Workflow data to load from
 * @param appendData if true appends data to current workflow, making sure to create new uuids
 * @param defaultPosition where to position workflow in the editor
 */
export async function fromSimple(
    id: string,
    data: Workflow,
    appendData = false,
    defaultPosition = { top: 0, left: 0 }
) {
    const stepStore = useWorkflowStepStore(id);
    const annotationStore = useWorkflowAnnotationStore(id);

    const stepIdOffset = stepStore.getStepIndex + 1;

    Object.values(data.steps).forEach((step) => {
        // If workflow being copied into another, wipe UUID and let
        // Galaxy assign new ones.
        if (appendData) {
            delete step.uuid;
            if (!step.position) {
                // Should only happen for manually authored editor content,
                // good enough for a first pass IMO.
                step.position = { top: step.id * 100, left: step.id * 100 };
            }
            step.id += stepIdOffset;
            step.position.left += defaultPosition.left;
            step.position.top += defaultPosition.top;
            Object.values(step.input_connections).forEach((link) => {
                if (link === undefined) {
                    console.error("input connections invalid", step.input_connections);
                } else {
                    let linkArray: ConnectionOutputLink[];
                    if (!Array.isArray(link)) {
                        linkArray = [link];
                    } else {
                        linkArray = link;
                    }
                    linkArray.forEach((link) => {
                        link.id += stepIdOffset;
                    });
                }
            });
        }
    });
    Object.values(data.steps).map((step) => {
        stepStore.addStep(step);
    });

    // Do not load annotations in append mode
    if (!appendData) {
        annotationStore.addAnnotations(data.annotations, [defaultPosition.left, defaultPosition.top]);
    }
}

export function toSimple(workflow: Workflow) {
    const steps = workflow.steps;
    const report = workflow.report;
    const license = workflow.license;
    const creator = workflow.creator;
    const annotation = workflow.annotation;
    const name = workflow.name;

    const annotations = workflow.annotations.filter(
        (annotation) => !(annotation.type === "text" && annotation.data.text === "")
    );

    return { steps, report, license, creator, annotation, name, annotations };
}
