<script setup lang="ts">
import type { WorkflowAnnotation } from "@/stores/workflowEditorAnnotationStore";

import FreehandAnnotation from "./FreehandAnnotation.vue";
import GroupAnnotation from "./GroupAnnotation.vue";
import MarkdownAnnotation from "./MarkdownAnnotation.vue";
import TextAnnotation from "./TextAnnotation.vue";

const props = defineProps<{
    annotation: WorkflowAnnotation;
}>();
</script>

<template>
    <div class="workflow-editor-annotation">
        <TextAnnotation v-if="props.annotation.type === 'text'" :annotation="props.annotation" />
        <MarkdownAnnotation v-else-if="props.annotation.type === 'markdown'" :annotation="props.annotation" />
        <GroupAnnotation v-else-if="props.annotation.type === 'group'" :annotation="props.annotation" />
        <FreehandAnnotation v-else-if="props.annotation.type === 'freehand'" :annotation="props.annotation" />
    </div>
</template>

<style scoped lang="scss">
.workflow-editor-annotation {
}
</style>
