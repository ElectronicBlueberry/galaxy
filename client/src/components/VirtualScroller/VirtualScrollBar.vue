<script setup lang="ts">
/**
 * This component renders a scroll bar as if element had a given height,
 * however it keeps the position of the slot contents static.
 *
 * The `virtualScroll` event and `scrollTo` function can be used to
 * interact with the scroll. The scroll used is a relative value.
 *
 * This combined allows implementing a fully customized scrolling behavior
 * for the content passed to the VirtualScrollBars slot.
 */

import { ref, watch, type Ref } from "vue";
import { useAnimationFrameScroll } from "@/composables/sensors/animationFrameScroll";

const props = defineProps<{
    height: number;
}>();

const emit = defineEmits<{
    (e: "virtualScroll", relativePosition: number): void;
}>();

const virtualScrollBar: Ref<HTMLDivElement | null> = ref(null);
const { scrollTop } = useAnimationFrameScroll(virtualScrollBar);

watch(
    () => scrollTop.value,
    (scroll) => {
        const containerHeight = virtualScrollBar.value?.offsetHeight ?? 0;
        const totalScroll = props.height - containerHeight;

        emit("virtualScroll", scroll / totalScroll);
    }
);

function scrollTo(relativePosition: number, options?: { smooth?: boolean }): void {
    const containerHeight = virtualScrollBar.value?.offsetHeight ?? 0;
    const totalScroll = props.height - containerHeight;

    if (options?.smooth) {
        virtualScrollBar.value?.scrollTo({ top: relativePosition * totalScroll, behavior: "smooth" });
    } else if (virtualScrollBar.value) {
        virtualScrollBar.value.scrollTop = relativePosition * totalScroll;
    }
}

defineExpose({ scrollTo });
</script>

<template>
    <div ref="virtualScrollBar" class="virtual-scroll-bar" :style="`--height:${height}px`">
        <div class="virtual-scroll-bar-expander"></div>
        <div class="virtual-scroll-bar-content">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
.virtual-scroll-bar {
    position: relative;
    overflow-y: scroll;
    width: 100%;
    height: 100%;

    .virtual-scroll-bar-expander {
        position: absolute;
        top: 0;
        left: 0;

        height: var(--height);
        width: 100%;
    }

    .virtual-scroll-bar-content {
        position: sticky;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;

        overflow: hidden;
    }
}
</style>
