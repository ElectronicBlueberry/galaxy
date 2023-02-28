<script setup lang="ts">
import VirtualScrollBar from "./VirtualScrollBar.vue";
import { ref, type Ref, watch, computed, type ComputedRef } from "vue";
import { useAnimationFrame } from "@/composables/sensors/animationFrame";
import { useAnimationFrameResizeObserver } from "@/composables/sensors/animationFrameResizeObserver";

const props = defineProps<{
    items: Array<unknown>;
    estimatedItemHeight: number;
}>();

const emit = defineEmits<{
    (e: "windowScroll", fromIndex: number, toIndex: number): void;
}>();

const virtualScrollBar: Ref<InstanceType<typeof VirtualScrollBar> | null> = ref(null);
const virtualScrollBarElement: ComputedRef<HTMLElement | null> = computed(() => {
    const el = virtualScrollBar.value?.$el;
    if (el && typeof el !== "string") {
        return el as HTMLElement;
    } else {
        return null;
    }
});
const itemOffset = ref(0);
const itemCount = ref(0);
useAnimationFrameResizeObserver(virtualScrollBarElement, ({ clientSize }) => {
    const height = clientSize.height;
    itemCount.value = Math.ceil(height / props.estimatedItemHeight);
});

const scrollWindow = computed(() => {
    return {
        from: itemOffset.value,
        to: itemOffset.value + itemCount.value,
    };
});

watch(
    () => scrollWindow.value,
    ({ from, to }) => {
        emit("windowScroll", from, to);
    }
);

const itemsInWindow = computed(() => props.items.slice(scrollWindow.value.from, scrollWindow.value.to));

const contentWindow: Ref<Element | null> = ref(null);
const virtualScrollBarHeight = computed(() =>
    Math.max(itemsInWindow.value.length * props.estimatedItemHeight, contentWindow.value?.scrollHeight ?? 0)
);

const contentWindowOffset = ref(0);

//let relativeScroll = 0;
function virtualScroll(relativePosition: number) {
    //    relativeScroll = relativePosition;
}

useAnimationFrame(() => {
    //const indexOffset = (relativeScroll * virtualScrollBarHeight.value) / props.estimatedItemHeight;
});
</script>

<template>
    <VirtualScrollBar ref="virtualScrollBar" :height="virtualScrollBarHeight" @virtual-scroll="virtualScroll">
        <div
            ref="contentWindow"
            class="virtual-scroller-content-window"
            :style="`--position-top:${contentWindowOffset}px`">
            <div v-for="(item, i) in itemsInWindow" :id="`virtual-scroll-bar-content-${i}`" :key="i">
                <slot name="item" :item="item" :window="scrollWindow"></slot>
            </div>
        </div>
    </VirtualScrollBar>
</template>

<style scoped lang="scss">
.virtual-scroller-content-window {
    position: absolute;
    left: 0;
    top: var(--position-top);
    width: 100%;
}
</style>
