<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import { faMagnet, faMousePointer, faObjectGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { BButton, BButtonGroup, BFormInput } from "bootstrap-vue";
import { computed, toRefs, watch } from "vue";

import { useUid } from "@/composables/utils/uid";
import { useWorkflowStores } from "@/composables/workflowStores";
import { type AnnotationTool } from "@/stores/workflowEditorToolbarStore";
import { match } from "@/utils/utils";

import { useToolLogic } from "./useToolLogic";

import ColourSelector from "@/components/Workflow/Editor/Annotations/ColourSelector.vue";

library.add(faMagnet, faMousePointer, faObjectGroup, faMarkdown);

const { toolbarStore, annotationStore } = useWorkflowStores();
const { snapActive, currentTool } = toRefs(toolbarStore);

const { annotationOptions } = toolbarStore;

const snapButtonTitle = computed(() => {
    if (snapActive.value) {
        return "Deactivate magnet snapping";
    } else {
        return "Activate magnet snapping";
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

useToolLogic(toolbarStore, annotationStore);
</script>

<template>
    <div class="workflow-editor-toolbar">
        <div class="tools">
            <BButtonGroup vertical>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    class="button"
                    title="Pointer Tool"
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
                    title="Add text annotation"
                    :pressed="currentTool === 'textAnnotation'"
                    variant="outline-primary"
                    @click="() => onAnnotationToolClick('textAnnotation')">
                    <span class="icon-t">T</span>
                </BButton>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    class="button"
                    title="Add markdown annotation"
                    :pressed="currentTool === 'markdownAnnotation'"
                    variant="outline-primary"
                    @click="() => onAnnotationToolClick('markdownAnnotation')">
                    <FontAwesomeIcon :icon="['fab', 'markdown']" size="lg" />
                </BButton>
                <BButton
                    v-b-tooltip.hover.noninteractive.right
                    class="button"
                    title="Add group annotation"
                    :pressed="currentTool === 'groupAnnotation'"
                    variant="outline-primary"
                    @click="() => onAnnotationToolClick('groupAnnotation')">
                    <FontAwesomeIcon icon="fa-object-group" size="lg" />
                </BButton>
            </BButtonGroup>
        </div>
        <div class="options">
            <div v-if="toolbarStore.snapActive" class="option wide">
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

            <div v-if="toolbarStore.currentTool !== 'pointer'" class="option buttons">
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
                width: 2px;
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
