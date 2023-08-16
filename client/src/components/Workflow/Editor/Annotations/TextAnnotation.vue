<script setup lang="ts">
import type { TextWorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";

const _props = defineProps<{
    annotation: TextWorkflowAnnotation;
}>();
</script>

<template>
    <div class="text-workflow-annotation"></div>
</template>

<style scoped lang="scss">
.text-workflow-annotation {
}
</style>
