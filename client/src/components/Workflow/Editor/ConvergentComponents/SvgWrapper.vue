<script setup lang="ts">
import type { RenderState } from "@/components/Workflow/Editor/ConvergentComponents/useRenderController";

/** Provides a svg context in html, and a group in svg */
const props = defineProps<{
    renderState: RenderState;
}>();
</script>

<template>
    <g v-if="props.renderState === 'svg'">
        <slot></slot>
    </g>
    <svg v-else class="wrapper">
        <slot></slot>
    </svg>
</template>

<style scoped>
.wrapper {
    display: block;
    overflow: visible;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    position: absolute;
    transform-origin: 0 0;
}
</style>
