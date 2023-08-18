<script setup lang="ts">
import type { UseElementBoundingReturn } from "@vueuse/core";
import { computed } from "vue";

import { useWorkflowStores } from "@/composables/workflowStores";
import type { WorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";

import FreehandAnnotation from "./FreehandAnnotation.vue";
import GroupAnnotation from "./GroupAnnotation.vue";
import MarkdownAnnotation from "./MarkdownAnnotation.vue";
import TextAnnotation from "./TextAnnotation.vue";

const props = defineProps<{
    annotation: WorkflowAnnotation;
    scale: number;
    rootOffset: UseElementBoundingReturn;
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: "pan-by", position: { x: number; y: number }): void;
}>();

const cssVariables = computed(() => ({
    "--position-left": `${props.annotation.position[0]}px`,
    "--position-top": `${props.annotation.position[1]}px`,
    "--width": `${props.annotation.size[0]}px`,
    "--height": `${props.annotation.size[1]}px`,
}));

const { annotationStore } = useWorkflowStores();

function onUpdateData(data: any) {
    annotationStore.changeData(props.annotation.id, data);
}

function onResize(size: [number, number]) {
    annotationStore.changeSize(props.annotation.id, size);
}

function onMove(position: [number, number]) {
    annotationStore.changePosition(props.annotation.id, position);
}

function onRemove() {
    annotationStore.deleteAnnotation(props.annotation.id);
}

function onSetColour(colour: string) {
    annotationStore.changeColour(props.annotation.id, colour);
}
</script>

<template>
    <div class="workflow-editor-annotation" :style="cssVariables">
        <TextAnnotation
            v-if="props.annotation.type === 'text'"
            :annotation="props.annotation"
            :scale="props.scale"
            :readonly="props.readonly"
            :root-offset="props.rootOffset"
            @change="onUpdateData"
            @resize="onResize"
            @move="onMove"
            @panBy="(p) => emit('pan-by', p)"
            @remove="onRemove"
            @setColour="onSetColour" />
        <MarkdownAnnotation v-else-if="props.annotation.type === 'markdown'" :annotation="props.annotation" />
        <GroupAnnotation v-else-if="props.annotation.type === 'group'" :annotation="props.annotation" />
        <FreehandAnnotation v-else-if="props.annotation.type === 'freehand'" :annotation="props.annotation" />
    </div>
</template>

<style scoped lang="scss">
.workflow-editor-annotation {
    position: absolute;
    width: var(--width);
    height: var(--height);
    top: var(--position-top);
    left: var(--position-left);

    &:deep(.workflow-draggable) {
        width: 100%;
        height: 100%;
    }
}
</style>
