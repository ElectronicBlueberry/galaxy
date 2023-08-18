<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { UseElementBoundingReturn } from "@vueuse/core";
import { BButton, BButtonGroup } from "bootstrap-vue";
import { sanitize } from "dompurify";
import { reactive, ref, watch } from "vue";

import type { TextWorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";
import { wait } from "@/utils/utils";

import DraggablePan from "@/components/Workflow/Editor/DraggablePan.vue";

library.add(faTrashAlt, faPalette);

const props = defineProps<{
    annotation: TextWorkflowAnnotation;
    rootOffset: UseElementBoundingReturn;
    scale: number;
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: "change", data: TextWorkflowAnnotation["data"]): void;
    (e: "resize", size: [number, number]): void;
    (e: "move", position: [number, number]): void;
    (e: "panBy", position: { x: number; y: number }): void;
    (e: "remove"): void;
}>();

// override user resize if size changes externally
watch(
    () => props.annotation.size,
    ([width, height]) => {
        const element = resizeContainer.value;

        if (element) {
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
        }
    }
);

const editableElement = ref<HTMLSpanElement>();
const resizeContainer = ref<HTMLDivElement>();

function escapeAndSanitize(text: string) {
    return sanitize(text, { ALLOWED_TAGS: [] }).replace(/(?:^(\s|&nbsp;)+)|(?:(\s|&nbsp;)+$)/g, "");
}

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
    emit("change", { ...props.annotation.data, text: getInnerText() });
}

function toggleBold() {
    if (props.annotation.data.bold) {
        const { bold: _bold, ...data } = props.annotation.data;
        emit("change", data);
    } else {
        emit("change", { ...props.annotation.data, bold: true });
    }
}

function toggleItalic() {
    if (props.annotation.data.italic) {
        const { italic: _italic, ...data } = props.annotation.data;
        emit("change", data);
    } else {
        emit("change", { ...props.annotation.data, italic: true });
    }
}

function increaseFontSize() {
    const size = props.annotation.data.size;

    if (size < 5) {
        emit("change", { ...props.annotation.data, size: size + 1 });
    }
}

function decreaseFontSize() {
    const size = props.annotation.data.size;

    if (size > 1) {
        emit("change", { ...props.annotation.data, size: size - 1 });
    }
}

function onRootClick() {
    editableElement.value?.focus();
}

function onMouseUp(_event: MouseEvent) {
    const element = resizeContainer.value;

    if (element) {
        const width = element.offsetWidth;
        const height = element.offsetHeight;

        emit("resize", [width, height]);
    }

    saveText();
}

function onMove(position: { x: number; y: number }) {
    emit("move", [position.x, position.y]);
}

let hasFocus = false;

function onFocusIn() {
    hasFocus = true;
}

async function onFocusOut() {
    hasFocus = false;

    // wait for end of event-loop
    await wait(0);

    if (!hasFocus) {
        if (getInnerText() === "") {
            emit("remove");
        } else {
            saveText();
        }
    }
}
</script>

<template>
    <div class="text-workflow-annotation" @focusout="onFocusOut" @focusin="onFocusIn">
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions vuejs-accessibility/click-events-have-key-events -->
        <div
            ref="resizeContainer"
            class="resize-container prevent-zoom"
            :style="{
                '--font-size': `${props.annotation.data.size}rem`,
            }"
            @click="onRootClick"
            @mouseup="onMouseUp">
            <DraggablePan
                :root-offset="reactive(props.rootOffset)"
                :scale="props.scale"
                class="draggable-pan"
                @move="onMove"
                @mouseup="saveText"
                @pan-by="(p) => emit('panBy', p)" />
            <span
                ref="editableElement"
                class="prevent-zoom"
                contenteditable
                spellcheck="false"
                :class="{
                    bold: props.annotation.data.bold,
                    italic: props.annotation.data.italic,
                }"
                @blur="saveText"
                @mouseup.stop
                v-html="escapeAndSanitize(props.annotation.data.text)" />
        </div>

        <BButtonGroup class="style-buttons">
            <BButton
                class="button font-weight-bold prevent-zoom"
                variant="outline-primary"
                title="bold"
                :pressed="props.annotation.data.bold"
                @click="toggleBold">
                B
            </BButton>
            <BButton
                class="button font-italic prevent-zoom"
                variant="outline-primary"
                title="italic"
                :pressed="props.annotation.data.italic"
                @click="toggleItalic">
                I
            </BButton>
            <BButton class="button prevent-zoom" variant="primary" title="colour">
                <FontAwesomeIcon icon="fa-palette" />
            </BButton>
            <BButton class="button prevent-zoom" variant="primary" title="decrease font size" @click="decreaseFontSize">
                a
            </BButton>
            <BButton class="button prevent-zoom" variant="primary" title="increase font size" @click="increaseFontSize">
                A
            </BButton>
            <BButton class="button prevent-zoom" variant="dark" title="delete annotation" @click="() => emit('remove')">
                <FontAwesomeIcon icon="far fa-trash-alt" />
            </BButton>
        </BButtonGroup>
    </div>
</template>

<style scoped lang="scss">
@import "theme/blue.scss";

.text-workflow-annotation {
    position: absolute;
    width: 100%;
    height: 100%;

    &:focus-within {
        .style-buttons {
            visibility: visible;
        }

        .resize-container {
            resize: both;
            border-color: $brand-primary;
        }
    }

    .style-buttons {
        visibility: hidden;
        position: absolute;
        top: -2rem;
        right: 0;

        .button {
            padding: 0;
            height: 1.5rem;
            width: 1.5rem;
        }
    }
}

.resize-container {
    --font-size: 1rem;

    color: $brand-primary;
    font-size: var(--font-size);

    width: 100%;
    height: 100%;

    min-height: calc(1.5em + 10px);
    min-width: calc(1.5em + 20px);

    border-color: transparent;
    border-radius: 0.25rem;
    border-width: 2px;
    border-style: solid;

    overflow: hidden;

    position: absolute;

    span {
        position: absolute;
        margin: 5px 10px;

        &.bold {
            font-weight: 700;
        }

        &.italic {
            font-style: italic;
        }

        &:focus,
        &:focus-visible {
            border: none;
            outline: none;
        }
    }

    .draggable-pan {
        cursor: move;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
    }

    &:focus-within,
    &:focus {
        resize: both;
        border-color: $brand-primary;
    }
}
</style>
