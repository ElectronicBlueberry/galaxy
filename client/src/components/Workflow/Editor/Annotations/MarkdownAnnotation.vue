<script setup lang="ts">
import type { MarkdownWorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";

const _props = defineProps<{
    annotation: MarkdownWorkflowAnnotation;
}>();
</script>

<template>
    <div class="markdown-workflow-annotation"></div>
</template>

<style scoped lang="scss">
.markdown-workflow-annotation {
}
</style>
