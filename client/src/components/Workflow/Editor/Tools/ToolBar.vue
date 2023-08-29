<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import { faEraser, faMagnet, faMousePointer, faObjectGroup, faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMagicKeys, whenever } from "@vueuse/core";
import { BButton, BButtonGroup, BFormInput } from "bootstrap-vue";
import { computed, toRefs, watch } from "vue";

import { useUid } from "@/composables/utils/uid";
import { useWorkflowStores } from "@/composables/workflowStores";
import { type AnnotationTool } from "@/stores/workflowEditorToolbarStore";
import { match } from "@/utils/utils";

import { useToolLogic } from "./useToolLogic";

import ColourSelector from "@/components/Workflow/Editor/Annotations/ColourSelector.vue";

library.add(faMagnet, faMousePointer, faObjectGroup, faMarkdown, faPen, faEraser);

const { toolbarStore, annotationStore } = useWorkflowStores();
const { snapActive, currentTool } = toRefs(toolbarStore);

const { annotationOptions } = toolbarStore;

const snapButtonTitle = computed(() => {
    if (snapActive.value) {
        return "Deactivate snapping (Ctrl + 2)";
    } else {
        return "Activate snapping (Ctrl + 2)";
    }
});

function onClickPointer() {
    currentTool.value = "pointer";
}

function onAnnotationToolClick(annotation: AnnotationTool) {
    currentTool.value = annotation;
}

watch(
    () => toolbarStore.currentTool,
    (currentTool) => {
        if (currentTool === "pointer") {
            toolbarStore.inputCatcherActive = false;
        } else {
            toolbarStore.inputCatcherActive = true;
        }
    }
);

const snappingDistanceId = useUid("snapping-distance-");

const snappingDistanceRangeValue = computed({
    get() {
        return match(toolbarStore.snapDistance, {
            10: () => "1",
            20: () => "2",
            50: () => "3",
            100: () => "4",
            200: () => "5",
        });
    },
    set(value) {
        toolbarStore.snapDistance = match(parseInt(value), {
            1: () => 10,
            2: () => 20,
            3: () => 50,
            4: () => 100,
            5: () => 200,
        });
    },
});

const fontSizeId = useUid("font-size-");

const fontSize = computed({
    get() {
        return `${annotationOptions.textSize}`;
    },
    set(value) {
        annotationOptions.textSize = parseInt(value);
    },
});

const thicknessId = useUid("thickness-");

const smoothingId = useUid("smoothing-");

function onRemoveAllFreehand() {
    annotationStore.deleteFreehandAnnotations();
}

useToolLogic(toolbarStore, annotationStore);

const { ctrl_1, ctrl_2, ctrl_3, ctrl_4, ctrl_5, ctrl_6, ctrl_7 } = useMagicKeys();

whenever(ctrl_1!, () => (toolbarStore.currentTool = "pointer"));
whenever(ctrl_2!, () => (toolbarStore.snapActive = !toolbarStore.snapActive));
whenever(ctrl_3!, () => (toolbarStore.currentTool = "textAnnotation"));
whenever(ctrl_4!, () => (toolbarStore.currentTool = "markdownAnnotation"));
whenever(ctrl_5!, () => (toolbarStore.currentTool = "groupAnnotation"));
whenever(ctrl_6!, () => (toolbarStore.currentTool = "freehandAnnotation"));
whenever(ctrl_7!, () => (toolbarStore.currentTool = "freehandEraser"));
</script>

<template>
    <div class="workflow-editor-toolbar">
        <div class="tools">
            <BButtonGroup vertical>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    class="button"
                    title="Pointer Tool (Ctrl + 1)"
                    :pressed="currentTool === 'pointer'"
                    variant="outline-primary"
                    @click="onClickPointer">
                    <FontAwesomeIcon icon="fa-mouse-pointer" size="lg" />
                </BButton>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    class="button"
                    :title="snapButtonTitle"
                    :pressed.sync="snapActive"
                    variant="outline-primary">
                    <FontAwesomeIcon icon="fa-magnet" size="lg" />
                </BButton>
            </BButtonGroup>

            <BButtonGroup vertical>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    class="button font-weight-bold"
                    title="Text annotation (Ctrl + 3)"
                    :pressed="currentTool === 'textAnnotation'"
                    variant="outline-primary"
                    @click="() => onAnnotationToolClick('textAnnotation')">
                    <span class="icon-t">T</span>
                </BButton>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    class="button"
                    title="Markdown annotation (Ctrl + 4)"
                    :pressed="currentTool === 'markdownAnnotation'"
                    variant="outline-primary"
                    @click="() => onAnnotationToolClick('markdownAnnotation')">
                    <FontAwesomeIcon :icon="['fab', 'markdown']" size="lg" />
                </BButton>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    class="button"
                    title="Group annotation (Ctrl + 5)"
                    :pressed="currentTool === 'groupAnnotation'"
                    variant="outline-primary"
                    @click="() => onAnnotationToolClick('groupAnnotation')">
                    <FontAwesomeIcon icon="fa-object-group" size="lg" />
                </BButton>
            </BButtonGroup>

            <BButtonGroup vertical>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    title="Freehand Pen (Ctrl + 6)"
                    :pressed="currentTool === 'freehandAnnotation'"
                    class="button"
                    variant="outline-primary"
                    @click="() => onAnnotationToolClick('freehandAnnotation')">
                    <FontAwesomeIcon icon="fa-pen" size="lg" />
                </BButton>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    title="Freehand Eraser (Ctrl + 7)"
                    :pressed="currentTool === 'freehandEraser'"
                    class="button"
                    variant="outline-primary"
                    @click="() => onAnnotationToolClick('freehandEraser')">
                    <FontAwesomeIcon icon="fa-eraser" size="lg" />
                </BButton>
            </BButtonGroup>
        </div>
        <div class="options">
            <div
                v-if="
                    toolbarStore.snapActive &&
                    !['freehandAnnotation', 'freehandEraser'].includes(toolbarStore.currentTool)
                "
                class="option wide">
                <label :for="snappingDistanceId" class="flex-label">
                    <span class="font-weight-bold">Snapping Distance</span>
                    {{ toolbarStore.snapDistance }} pixels
                </label>
                <BFormInput
                    :id="snappingDistanceId"
                    v-model="snappingDistanceRangeValue"
                    type="range"
                    min="1"
                    max="5"
                    step="1" />
            </div>

            <div v-if="toolbarStore.currentTool === 'textAnnotation'" class="option buttons">
                <BButtonGroup>
                    <BButton
                        :pressed.sync="annotationOptions.bold"
                        variant="outline-primary"
                        class="button font-weight-bold">
                        Bold
                    </BButton>
                    <BButton
                        :pressed.sync="annotationOptions.italic"
                        variant="outline-primary"
                        class="button font-italic">
                        Italic
                    </BButton>
                </BButtonGroup>
            </div>

            <div v-if="!['pointer', 'freehandEraser'].includes(toolbarStore.currentTool)" class="option buttons">
                <ColourSelector
                    :colour="annotationOptions.colour"
                    class="colour-selector"
                    @set-colour="(colour) => (annotationOptions.colour = colour)" />
            </div>

            <div v-if="toolbarStore.currentTool === 'textAnnotation'" class="option small">
                <label :for="fontSizeId" class="flex-label">
                    <span class="font-weight-bold">Text Size</span>
                    {{ annotationOptions.textSize }}00%
                </label>
                <BFormInput :id="fontSizeId" v-model="fontSize" type="range" min="1" max="5" step="1" />
            </div>

            <div v-if="toolbarStore.currentTool === 'freehandAnnotation'" class="option small">
                <label :for="thicknessId" class="flex-label">
                    <span class="font-weight-bold">Size</span>
                    {{ annotationOptions.lineThickness }} pixels
                </label>
                <BFormInput
                    :id="thicknessId"
                    v-model="annotationOptions.lineThickness"
                    type="range"
                    min="4"
                    max="20"
                    step="1" />
            </div>

            <div v-if="toolbarStore.currentTool === 'freehandAnnotation'" class="option small">
                <label :for="smoothingId" class="flex-label">
                    <span class="font-weight-bold">Smoothing</span>
                    {{ annotationOptions.smoothing }}
                </label>
                <BFormInput
                    :id="smoothingId"
                    v-model="annotationOptions.smoothing"
                    type="range"
                    min="1"
                    max="10"
                    step="1" />
            </div>

            <div
                v-if="['freehandAnnotation', 'freehandEraser'].includes(toolbarStore.currentTool)"
                class="option buttons">
                <BButton class="button" title="Remove all freehand annotations" @click="onRemoveAllFreehand">
                    Remove all
                </BButton>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "theme/blue.scss";

.workflow-editor-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2000;
    pointer-events: none;
    display: flex;

    .tools {
        display: flex;
        flex-direction: column;
        padding: 0.25rem;
        gap: 0.25rem;
        pointer-events: auto;

        .button {
            padding: 0;
            display: grid;
            place-items: center;
            height: 2.25rem;
            width: 2.25rem;
        }

        &:deep(.btn-outline-primary) {
            &:not(.active) {
                background-color: $workflow-editor-bg;

                &:hover {
                    background-color: $brand-primary;
                }
            }
        }
    }

    .options {
        display: flex;
        height: 3rem;
        padding: 0.25rem;
        gap: 1rem;
        pointer-events: auto;

        .option {
            display: flex;
            flex-direction: column;
            position: relative;

            &.small {
                width: 6rem;
            }

            &.wide {
                width: 12rem;
            }

            label {
                margin-bottom: 0;
            }

            &:not(:last-child)::after {
                content: "";
                position: absolute;
                top: 0.5rem;
                bottom: 0.5rem;
                width: 0;
                right: calc(-0.5rem - 1px);
                align-self: stretch;
                border: 1px solid $border-color;
            }

            &.buttons {
                flex-direction: row;
                align-items: center;
            }

            .button {
                height: 2rem;
                padding: 0 0.5rem;
            }

            &:deep(.btn-outline-primary) {
                &:not(.active) {
                    background-color: $workflow-editor-bg;
                }

                &:hover {
                    background-color: $brand-primary;
                }
            }
        }
    }
}

.flex-label {
    display: flex;
    justify-content: space-between;
}

.colour-selector {
    position: relative;
}

.icon-t {
    font-size: 1.2rem;
}
</style>
