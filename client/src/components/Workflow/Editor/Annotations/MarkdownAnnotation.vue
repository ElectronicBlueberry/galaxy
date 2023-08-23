<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { UseElementBoundingReturn } from "@vueuse/core";
import { BButton, BButtonGroup } from "bootstrap-vue";
import { computed, reactive, ref } from "vue";

import { useMarkdown } from "@/composables/markdown";
import { useUid } from "@/composables/utils/uid";
import type { MarkdownWorkflowAnnotation, WorkflowAnnotationColour } from "@/stores/workflowEditorAnnotationStore";

import { darkenedColours } from "./colours";
import { useFocusWithin } from "./useFocusWithin";
import { useResizable } from "./useResizable";

import ColourSelector from "./ColourSelector.vue";
import DraggablePan from "@/components/Workflow/Editor/DraggablePan.vue";

library.add(faTrashAlt, faPalette);

const props = defineProps<{
    annotation: MarkdownWorkflowAnnotation;
    rootOffset: UseElementBoundingReturn;
    scale: number;
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: "change", data: MarkdownWorkflowAnnotation["data"]): void;
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

const textAreaId = useUid("textarea-");

const { renderMarkdown } = useMarkdown({ openLinksInNewPage: true });

const content = computed(() => {
    const renderedMarkdown = renderMarkdown(props.annotation.data);

    const node = document.createElement("div");
    node.innerHTML = renderedMarkdown;

    // make all rendered text selectable by dragging
    const allChildren = node.querySelectorAll("*");
    Array.from(allChildren).forEach((child) => {
        child.classList.add("prevent-zoom");
    });

    return node.innerHTML;
});

const markdownTextarea = ref<HTMLTextAreaElement>();

function onClick() {
    if (!props.readonly && window.getSelection()?.toString() === "") {
        markdownTextarea.value?.focus();
    }
}

function onMove(position: { x: number; y: number }) {
    emit("move", [position.x, position.y]);
}

const showColourSelector = ref(false);
const rootElement = ref<HTMLDivElement>();

const { focusWithin } = useFocusWithin(rootElement, null, () => {
    showColourSelector.value = false;
});

function onSetColour(colour: WorkflowAnnotationColour) {
    emit("setColour", colour);
}

function onTextChange() {
    const element = markdownTextarea.value;

    if (element) {
        emit("change", element.value);
    }
}

const cssVariables = computed(() => {
    const vars: Record<string, string> = {};

    if (props.annotation.colour !== "none") {
        vars["--primary-colour"] = darkenedColours[props.annotation.colour];
    }

    return vars;
});
</script>

<template>
    <div ref="rootElement" class="markdown-workflow-annotation">
        <div
            ref="resizeContainer"
            class="resize-container"
            :class="{ resizable: !props.readonly, 'prevent-zoom': !props.readonly }"
            :style="cssVariables">
            <DraggablePan
                v-if="!props.readonly"
                :root-offset="reactive(props.rootOffset)"
                :scale="props.scale"
                class="draggable-pan"
                @move="onMove"
                @pan-by="(p) => emit('panBy', p)" />

            <label :for="textAreaId" class="sr-only">Markdown Input</label>
            <textarea
                :id="textAreaId"
                ref="markdownTextarea"
                class="markdown-textarea prevent-zoom"
                :value="props.annotation.data"
                @input="onTextChange"></textarea>

            <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions vuejs-accessibility/click-events-have-key-events -->
            <div v-if="!focusWithin" class="rendered-markdown" @click="onClick" v-html="content"></div>
        </div>

        <BButtonGroup v-if="!props.readonly" class="style-buttons">
            <BButton
                class="button prevent-zoom"
                variant="outline-primary"
                title="Colour"
                :pressed="showColourSelector"
                @click="() => (showColourSelector = !showColourSelector)">
                <FontAwesomeIcon icon="fa-palette" />
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

$gap-x: 0.8rem;
$gap-y: 0.5rem;

.markdown-workflow-annotation {
    width: 100%;
    height: 100%;

    &:focus-within {
        .resize-container {
            resize: both;
        }

        .style-buttons {
            visibility: visible;
        }

        .colour-selector {
            visibility: visible;
        }

        .markdown-textarea {
            width: calc(100% - $gap-x - $gap-x);
            height: calc(100% - $gap-y - $gap-y);
        }
    }

    label {
        margin: 0;
        padding: 0;
        height: 100%;
        position: absolute;
        top: 0;
    }

    .markdown-textarea {
        border: none;
        background-color: transparent;
        padding: 0;
        margin: 0;
        resize: none;

        position: absolute;
        top: $gap-y;
        left: $gap-x;

        line-height: 1.2;

        &:focus-visible {
            box-shadow: none;
            border: none;
            outline: none;
        }

        width: 0;
        height: 0;
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

.rendered-markdown {
    position: absolute;
    top: $gap-y;
    left: $gap-x;
    overflow-y: scroll;
    line-height: 1.2;

    width: calc(100% - $gap-x - $gap-x);
    max-height: calc(100% - $gap-y - $gap-y);

    &:deep(h1),
    &:deep(h2),
    &:deep(h3),
    &:deep(h4),
    &:deep(h5),
    &:deep(h6) {
        margin-bottom: 0.2em;
    }

    &:deep(ul),
    &:deep(ol) {
        margin-bottom: 0.5rem;
        padding-left: 1.5rem;
    }

    &:deep(p) {
        margin-bottom: 0.5rem;
    }
}

.resize-container {
    --primary-colour: #{$brand-primary};

    color: var(--primary-colour);
    background-color: $white;

    .markdown-textarea {
        color: var(--primary-colour);
    }

    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;

    border-radius: 0.25rem;
    border-color: var(--primary-colour);
    border-style: solid;
    border-width: 2px;

    .draggable-pan {
        cursor: move;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
    }
}

.colour-selector {
    visibility: hidden;
    right: 0;
    top: -4.5rem;
}
</style>
