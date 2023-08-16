<script setup lang="ts">
import type { GroupWorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";

const _props = defineProps<{
    annotation: GroupWorkflowAnnotation;
}>();
</script>

<template>
    <div class="group-workflow-annotation"></div>
</template>

<style scoped lang="scss">
.group-workflow-annotation {
}
</style>
