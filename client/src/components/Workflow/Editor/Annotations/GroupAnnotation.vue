<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faObjectGroup, faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { type UseElementBoundingReturn, useFocusWithin } from "@vueuse/core";
import { sanitize } from "dompurify";
import { computed, ref, watch } from "vue";

import type { GroupWorkflowAnnotation, WorkflowAnnotationColour } from "@/stores/workflowEditorAnnotationStore";

import { useResizable } from "./useResizable";

library.add(faObjectGroup, faTrashAlt, faPalette);

const props = defineProps<{
    annotation: GroupWorkflowAnnotation;
    rootOffset: UseElementBoundingReturn;
    scale: number;
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: "change", data: GroupWorkflowAnnotation["data"]): void;
    (e: "resize", size: [number, number]): void;
    (e: "move", position: [number, number]): void;
    (e: "panBy", position: { x: number; y: number }): void;
    (e: "remove"): void;
    (e: "setColour", colour: WorkflowAnnotationColour): void;
}>();

const resizeContainer = ref<HTMLDivElement>();

useResizable(
    resizeContainer,
    computed(() => props.annotation.size),
    ([width, height]) => {
        emit("resize", [width, height]);
    }
);

function escapeAndSanitize(text: string) {
    return sanitize(text, { ALLOWED_TAGS: [] }).replace(/(?:^(\s|&nbsp;)+)|(?:(\s|&nbsp;)+$)/g, "");
}

const editableElement = ref<HTMLSpanElement>();

function getInnerText() {
    const element = editableElement.value;

    if (element) {
        const value = element.innerHTML ?? "";
        return escapeAndSanitize(value);
    } else {
        return "";
    }
}

function saveText() {
    emit("change", { ...props.annotation.data, title: getInnerText() });
}

const cssVariables = computed(() => ({}));

const showColourSelector = ref(false);
const rootElement = ref<HTMLDivElement>();

const { focused } = useFocusWithin(rootElement);

watch(
    () => focused.value,
    () => {
        if (!focused.value) {
            showColourSelector.value = false;
        }
    }
);

function onClick() {
    editableElement.value?.focus();
}
</script>

<template>
    <div ref="rootElement" class="group-workflow-annotation">
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions vuejs-accessibility/click-events-have-key-events -->
        <div
            ref="resizeContainer"
            class="resize-container"
            :class="{ resizable: !props.readonly, 'prevent-zoom': !props.readonly }"
            :style="cssVariables"
            @click="onClick">
            <div class="group-annotation-header">
                <FontAwesomeIcon icon="fas fa-object-group" />
                <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions vuejs-accessibility/click-events-have-key-events -->
                <span
                    ref="editableElement"
                    :contenteditable="!props.readonly"
                    class="prevent-zoom"
                    spellcheck="false"
                    @blur="saveText"
                    @keydown.enter.prevent="saveText"
                    @mouseup.stop
                    v-html="escapeAndSanitize(props.annotation.data.title)" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "theme/blue.scss";

.group-workflow-annotation {
    width: 100%;
    height: 100%;

    &:focus-within {
        .resize-container {
            resize: both;
        }
    }
}

.resize-container {
    --primary-colour: #{$brand-primary};

    color: var(--primary-colour);
    background-color: $white;

    .group-annotation-header {
        background-color: var(--primary-colour);
        color: $white;
        padding: 0 0.25rem;
    }

    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;

    border-radius: 0.25rem;
    border-color: var(--primary-colour);
    border-style: solid;
    border-width: 2px;
}
</style>
