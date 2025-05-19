<script setup lang="ts">
import type { RenderState } from "@/components/Workflow/Editor/ConvergentComponents/useRenderController";

const props = defineProps<{
    renderState: RenderState;
    width?: number;
    height?: number;
}>();
</script>

<template>
    <svg
        v-if="props.renderState === 'svg'"
        :viewBox="`0 0 ${props.width ?? 600} ${props.height ?? 400}`"
        preserveAspectRatio="xMidYMid slice"
        role="img">
        <slot></slot>
    </svg>
    <div v-else class="canvas-content" @drop.prevent @dragover.prevent>
        <slot></slot>
    </div>
</template>

<style scoped>
.canvas-content {
    width: 100%;
    position: relative;
    left: 0px;
    top: 0px;
    overflow: hidden;
}
</style>
