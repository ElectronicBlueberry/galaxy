<script setup lang="ts">
import { curveCatmullRom, curveLinear, line } from "d3";
import { computed } from "vue";

import { useWorkflowStores } from "@/composables/workflowStores";
import type { FreehandWorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";

import { vecSubtract } from "../modules/geometry";
import { colours } from "./colours";

const props = defineProps<{
    annotation: FreehandWorkflowAnnotation;
}>();

const emit = defineEmits<{
    (e: "remove"): void;
}>();

const linear = line().curve(curveLinear);
const catmullRom = line().curve(curveCatmullRom);
const { annotationStore, toolbarStore } = useWorkflowStores();

const curve = computed(() => {
    if (annotationStore.isJustCreated(props.annotation.id)) {
        return linear(props.annotation.data.line.map((p) => vecSubtract(p, props.annotation.position))) ?? undefined;
    } else {
        return catmullRom(props.annotation.data.line) ?? undefined;
    }
});

const style = computed(() => {
    const style = {
        "pointer-events": toolbarStore.currentTool === "freehandEraser" ? "stroke" : "none",
        "--thickness": `${props.annotation.data.thickness}px`,
    } as Record<string, string>;

    if (props.annotation.colour !== "none") {
        style["--colour"] = colours[props.annotation.colour];
    }

    if (toolbarStore.inputCatcherEnabled) {
        style["cursor"] = "crosshair";
    }

    return style;
});

function onMouseOver() {
    if (toolbarStore.inputCatcherPressed) {
        emit("remove");
    }
}

function onClick() {
    if (toolbarStore.inputCatcherEnabled) {
        emit("remove");
    }
}
</script>

<template>
    <svg class="freehand-workflow-annotation">
        <path
            :class="toolbarStore.inputCatcherEnabled ? 'prevent-zoom' : ''"
            :d="curve"
            :style="style"
            @mouseover="onMouseOver"
            @mousedown.prevent="onClick"></path>
    </svg>
</template>

<style scoped lang="scss">
@import "theme/blue.scss";

.freehand-workflow-annotation {
    --colour: #{$brand-primary};
    --thickness: 5px;

    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1600;
    overflow: visible;

    fill: none;
    stroke-linecap: round;

    path {
        stroke-width: var(--thickness);
        stroke: var(--colour);
    }

    pointer-events: none;
}
</style>
