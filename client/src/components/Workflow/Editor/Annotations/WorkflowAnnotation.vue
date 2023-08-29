<script setup lang="ts">
import type { UseElementBoundingReturn } from "@vueuse/core";
import { computed } from "vue";

import { useWorkflowStores } from "@/composables/workflowStores";
import type { WorkflowAnnotation, WorkflowAnnotationColour } from "@/stores/workflowEditorAnnotationStore";

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

function onPan(position: { x: number; y: number }) {
    emit("pan-by", position);
}

function onRemove() {
    annotationStore.deleteAnnotation(props.annotation.id);
}

function onSetColour(colour: WorkflowAnnotationColour) {
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
            @pan-by="onPan"
            @remove="onRemove"
            @set-colour="onSetColour" />
        <MarkdownAnnotation
            v-else-if="props.annotation.type === 'markdown'"
            :annotation="props.annotation"
            :scale="props.scale"
            :readonly="props.readonly"
            :root-offset="props.rootOffset"
            @change="onUpdateData"
            @resize="onResize"
            @move="onMove"
            @pan-by="onPan"
            @remove="onRemove"
            @set-colour="onSetColour" />
        <GroupAnnotation
            v-else-if="props.annotation.type === 'group'"
            :annotation="props.annotation"
            :scale="props.scale"
            :readonly="props.readonly"
            :root-offset="props.rootOffset"
            @change="onUpdateData"
            @resize="onResize"
            @move="onMove"
            @pan-by="onPan"
            @remove="onRemove"
            @set-colour="onSetColour" />
        <FreehandAnnotation
            v-else-if="props.annotation.type === 'freehand'"
            :annotation="props.annotation"
            @remove="onRemove" />
    </div>
</template>

<style scoped lang="scss">
.workflow-editor-annotation {
    position: absolute;
    width: var(--width);
    height: var(--height);
    top: var(--position-top);
    left: var(--position-left);
}
</style>
