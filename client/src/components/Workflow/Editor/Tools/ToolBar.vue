<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import { faMagnet, faMousePointer, faObjectGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { BButton, BButtonGroup } from "bootstrap-vue";
import { computed, toRefs, watch } from "vue";

import { useWorkflowStores } from "@/composables/workflowStores";
import { type AnnotationTool } from "@/stores/workflowEditorToolbarStore";

import { useToolLogic } from "./useToolLogic";

library.add(faMagnet, faMousePointer, faObjectGroup, faMarkdown);

const { toolbarStore, annotationStore } = useWorkflowStores();
const { snapActive, currentTool } = toRefs(toolbarStore);

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

useToolLogic(toolbarStore, annotationStore);
</script>

<template>
    <div class="workflow-editor-toolbar">
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
</template>

<style scoped lang="scss">
@import "theme/blue.scss";

.workflow-editor-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    z-index: 1002;
    padding: 0.25rem;
    gap: 0.25rem;

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

.icon-t {
    font-size: 1.2rem;
}
</style>
