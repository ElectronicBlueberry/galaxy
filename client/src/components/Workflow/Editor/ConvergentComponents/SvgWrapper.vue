<script setup lang="ts">
/** Provides a svg context in html, and a group in svg */
const props = defineProps<{
    svg: boolean;
}>();
</script>

<template>
    <g v-if="props.svg">
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
