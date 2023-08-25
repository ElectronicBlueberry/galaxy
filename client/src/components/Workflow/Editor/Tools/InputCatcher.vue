<script setup lang="ts">
import { useEventListener, useMagicKeys } from "@vueuse/core";
import { computed, ref } from "vue";

import { Transform } from "@/components/Workflow/Editor/modules/geometry";
import { useWorkflowStores } from "@/composables/workflowStores";

const props = defineProps<{
    transform: { x: number; y: number; k: number };
}>();

const { toolbarStore } = useWorkflowStores();

const inputCatcher = ref<HTMLDivElement>();
const events = ["pointerup", "pointerdown", "pointermove"] as const;

const inverseCanvasTransform = computed(() =>
    new Transform()
        .translate([props.transform.x, props.transform.y])
        .scale([props.transform.k, props.transform.k])
        .inverse()
);

useEventListener(inputCatcher, [...events], (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const position = inverseCanvasTransform.value.apply([event.offsetX, event.offsetY]);
    const catcherEvent = {
        type: event.type as (typeof events)[number],
        position,
    };
    toolbarStore.emitInputCatcherEvent(event.type as (typeof events)[number], catcherEvent);
});

const { shift, space, alt, ctrl } = useMagicKeys();
const temporarilyDisabled = computed(() => shift?.value || space?.value || alt?.value || ctrl?.value);
</script>

<template>
    <div v-if="toolbarStore.inputCatcherActive && !temporarilyDisabled" ref="inputCatcher" class="input-catcher"></div>
</template>

<style scoped lang="scss">
.input-catcher {
    position: absolute;
    z-index: 1002;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
</style>
