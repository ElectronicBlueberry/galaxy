<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    svg: boolean;
    transform: {
        x: number;
        y: number;
        k: number;
    };
}>();

const transformStyle = computed(() => {
    return {
        transform: `translate(${props.transform.x}px, ${props.transform.y}px) scale(${props.transform.k})`,
        "transform-origin": "0 0",
    };
});
</script>

<template>
    <g v-if="props.svg" :style="transformStyle">
        <slot></slot>
    </g>
    <div v-else :style="transformStyle">
        <slot></slot>
    </div>
</template>

<style scoped>
.node-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
