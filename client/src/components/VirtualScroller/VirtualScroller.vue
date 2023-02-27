<script setup lang="ts">
import VirtualScrollBar from "./VirtualScrollBar.vue";
import { ref, reactive, type Ref, watch, computed } from "vue";

const props = defineProps<{
    items: Array<unknown>;
    estimatedItemHeight: number;
}>();

const emit = defineEmits<{
    (e: "windowScroll", fromIndex: number, toIndex: number): void;
}>();

const scrollWindow = reactive({
    from: 0,
    to: 0,
});

watch(
    () => scrollWindow,
    ({ from, to }) => {
        emit("windowScroll", from, to);
    }
);

const itemsInWindow = computed(() => props.items.slice(scrollWindow.from, scrollWindow.to));

const virtualScrollBarHeight = ref(0);
const virtualScrollBar: Ref<typeof VirtualScrollBar | null> = ref(null);

const contentWindowPosition = ref(0);
</script>

<template>
    <VirtualScrollBar ref="virtualScrollBar" :height="virtualScrollBarHeight">
        <div class="virtual-scroller-content-window" :style="`--position-top:${contentWindowPosition}px`">
            <div v-for="(item, i) in itemsInWindow" :key="i">
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
