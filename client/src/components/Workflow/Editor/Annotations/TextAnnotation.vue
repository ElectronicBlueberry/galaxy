<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { UseElementBoundingReturn } from "@vueuse/core";
import { BButton, BButtonGroup } from "bootstrap-vue";
import { sanitize } from "dompurify";
import { computed, reactive, ref, watch } from "vue";

import type { TextWorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";
import { wait } from "@/utils/utils";

import { type Colour, colours } from "./colours";

import ColourSelector from "./ColourSelector.vue";
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
    (e: "setColour", colour: string): void;
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
    return sanitize(text, { ALLOWED_TAGS: ["br"] }).replace(/(?:^(\s|&nbsp;)+)|(?:(\s|&nbsp;)+$)/g, "");
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

const fontSize = computed(() => props.annotation.data.size);
const canIncreaseFontSize = computed(() => fontSize.value < 5);
const canDecreaseFontSize = computed(() => fontSize.value > 1);

function increaseFontSize() {
    if (canIncreaseFontSize.value) {
        emit("change", { ...props.annotation.data, size: fontSize.value + 1 });
    }
}

const increaseFontSizeTitle = computed(() =>
    canIncreaseFontSize.value ? `Increase font size to ${fontSize.value + 1}` : "Maximum font size"
);

function decreaseFontSize() {
    if (canDecreaseFontSize.value) {
        emit("change", { ...props.annotation.data, size: fontSize.value - 1 });
    }
}

const decreaseFontSizeTitle = computed(() =>
    canDecreaseFontSize.value ? `Decrease font size to ${fontSize.value - 1}` : "Minimum font size"
);

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
        showColourSelector.value = false;

        if (getInnerText() === "") {
            emit("remove");
        } else {
            saveText();
        }
    }
}

const showColourSelector = ref(false);

function onSetColour(colour: string) {
    emit("setColour", colour);
}

const cssVariables = computed(() => {
    const vars: Record<string, string> = {
        "--font-size": `${fontSize.value}rem`,
    };

    if (props.annotation.colour !== "none") {
        vars["--font-colour"] = colours[props.annotation.colour as Colour];
    }

    return vars;
});
</script>

<template>
    <div class="text-workflow-annotation" @focusout="onFocusOut" @focusin="onFocusIn">
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions vuejs-accessibility/click-events-have-key-events -->
        <div
            ref="resizeContainer"
            class="resize-container"
            :class="{ resizable: !props.readonly, 'prevent-zoom': !props.readonly }"
            :style="cssVariables"
            @click="onRootClick"
            @mouseup="onMouseUp">
            <DraggablePan
                v-if="!props.readonly"
                :root-offset="reactive(props.rootOffset)"
                :scale="props.scale"
                class="draggable-pan"
                @move="onMove"
                @mouseup="saveText"
                @pan-by="(p) => emit('panBy', p)" />
            <span
                ref="editableElement"
                :contenteditable="!props.readonly"
                class="prevent-zoom"
                spellcheck="false"
                :class="{
                    bold: props.annotation.data.bold,
                    italic: props.annotation.data.italic,
                }"
                @blur="saveText"
                @mouseup.stop
                v-html="escapeAndSanitize(props.annotation.data.text)" />
        </div>

        <BButtonGroup v-if="!props.readonly" class="style-buttons">
            <BButton
                class="button font-weight-bold prevent-zoom"
                variant="outline-primary"
                :title="props.annotation.data.bold ? 'Reset bold' : 'Make bold'"
                :pressed="props.annotation.data.bold"
                @click="toggleBold">
                B
            </BButton>
            <BButton
                class="button font-italic prevent-zoom"
                variant="outline-primary"
                :title="props.annotation.data.italic ? 'Reset italic' : 'Make italic'"
                :pressed="props.annotation.data.italic"
                @click="toggleItalic">
                I
            </BButton>
            <BButton
                class="button prevent-zoom"
                variant="outline-primary"
                title="Colour"
                :pressed="showColourSelector"
                @click="() => (showColourSelector = !showColourSelector)">
                <FontAwesomeIcon icon="fa-palette" />
            </BButton>
            <BButton
                class="button prevent-zoom"
                variant="primary"
                :title="decreaseFontSizeTitle"
                @click="decreaseFontSize">
                <FontAwesomeIcon :icon="['gxd', 'textSmaller']" />
            </BButton>
            <BButton
                class="button prevent-zoom"
                variant="primary"
                :title="increaseFontSizeTitle"
                @click="increaseFontSize">
                <FontAwesomeIcon :icon="['gxd', 'textLarger']" />
            </BButton>
            <BButton class="button prevent-zoom" variant="dark" title="Delete annotation" @click="() => emit('remove')">
                <FontAwesomeIcon icon="far fa-trash-alt" />
            </BButton>
        </BButtonGroup>

        <ColourSelector
            v-if="showColourSelector"
            class="colour-selector"
            :colour="props.annotation.colour"
            @setColour="onSetColour" />
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

        .colour-selector {
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
    --font-colour: #{$brand-primary};

    color: var(--font-colour);
    font-size: var(--font-size);

    width: 100%;
    height: 100%;

    min-height: calc(1em + 10px);
    min-width: calc(1em + 20px);

    border-color: transparent;
    border-radius: 0.25rem;
    border-width: 2px;
    border-style: solid;

    overflow: hidden;

    position: absolute;

    span {
        position: absolute;
        margin: 5px 10px;
        line-height: 1;

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

    &.resizable:focus-within,
    &.resizable:focus {
        resize: both;
        border-color: $brand-primary;
    }
}

.colour-selector {
    visibility: hidden;
    right: 0.75rem;
    top: -4.5rem;
}
</style>
