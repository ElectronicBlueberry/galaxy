<script setup lang="ts">
import type { UseElementBoundingReturn } from "@vueuse/core";
import { sanitize } from "dompurify";
import { reactive, ref, watch } from "vue";

import type { TextWorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";

import DraggablePan from "@/components/Workflow/Editor/DraggablePan.vue";

const props = defineProps<{
    annotation: TextWorkflowAnnotation;
    rootOffset: UseElementBoundingReturn;
    scale: number;
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: "change", data: string): void;
    (e: "resize", size: [number, number]): void;
    (e: "move", position: [number, number]): void;
    (e: "pan-by", position: { x: number; y: number }): void;
}>();

// override user resize if size changes externally
watch(
    () => props.annotation.size,
    ([width, height]) => {
        const element = rootElement.value;

        if (element) {
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
        }
    }
);

const editableElement = ref<HTMLSpanElement>();
const rootElement = ref<HTMLDivElement>();

function escapeAndSanitize(text: string) {
    return sanitize(text, { ALLOWED_TAGS: [] });
}

function onTextInput(_event: Event) {
    const element = editableElement.value;

    if (element) {
        const value = element.innerHTML ?? "";
        emit("change", escapeAndSanitize(value));
    }
}

function onRootClick() {
    editableElement.value?.focus();
}

function onMouseUp(_event: MouseEvent) {
    const element = rootElement.value;

    if (element) {
        const width = element.offsetWidth;
        const height = element.offsetHeight;

        emit("resize", [width, height]);
    }
}

function onMove(position: { x: number; y: number }) {
    emit("move", [position.x, position.y]);
}
</script>

<template>
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions vuejs-accessibility/click-events-have-key-events -->
    <div ref="rootElement" class="text-workflow-annotation prevent-zoom" @click="onRootClick" @mouseup="onMouseUp">
        <span
            ref="editableElement"
            class="prevent-zoom"
            contenteditable
            spellcheck="false"
            @blur="onTextInput"
            v-html="escapeAndSanitize(props.annotation.data)" />
        <DraggablePan
            :root-offset="reactive(props.rootOffset)"
            :scale="props.scale"
            style="position: absolute; width: 100%; height: 100%"
            @move="onMove"
            @pan-by="(p) => emit('pan-by', p)" />
    </div>
</template>

<style scoped lang="scss">
@import "theme/blue.scss";

.text-workflow-annotation {
    width: 100%;
    height: 100%;

    min-height: 1.75em;
    min-width: 1.75em;

    border-color: transparent;
    border-radius: 0.25rem;
    border-width: 2px;
    border-style: solid;

    overflow: hidden;

    position: absolute;

    span {
        &:focus,
        &:focus-visible {
            border: none;
            outline: none;
        }
    }

    &:focus-within,
    &:focus {
        resize: both;
        border-color: $brand-primary;
    }
}
</style>
