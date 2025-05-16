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

const unit = computed(() => {
    if (props.svg) {
        return "";
    } else {
        return "px";
    }
});

const transformString = computed(() => {
    return `translate(${props.transform.x}${unit.value}, ${props.transform.y}${unit.value}) scale(${props.transform.k})`;
});
</script>

<template>
    <g v-if="props.svg" :transform="transformString">
        <slot></slot>
    </g>
    <div v-else :style="`transform: ${transformString};`">
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
    transform-origin: 0 0;
}
</style>
