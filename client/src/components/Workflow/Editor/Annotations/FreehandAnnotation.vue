<script setup lang="ts">
import type { FreehandWorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";

const _props = defineProps<{
    annotation: FreehandWorkflowAnnotation;
}>();
</script>

<template>
    <div class="freehand-workflow-annotation"></div>
</template>

<style scoped lang="scss">
.freehand-workflow-annotation {
}
</style>
