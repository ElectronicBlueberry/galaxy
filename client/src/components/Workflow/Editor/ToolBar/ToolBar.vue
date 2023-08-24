<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMagnet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { BButton } from "bootstrap-vue";
import { toRefs } from "vue";

import { useWorkflowEditorToolbarStore } from "@/stores/workflowEditorToolbarStore";

library.add(faMagnet);

const { snapActive } = toRefs(useWorkflowEditorToolbarStore());
</script>

<template>
    <div class="workflow-editor-toolbar">
        <BButton class="button" :pressed.sync="snapActive" variant="outline-primary">
            <FontAwesomeIcon icon="fa-magnet" />
        </BButton>
    </div>
</template>

<style scoped lang="scss">
@import "theme/blue.scss";

.workflow-editor-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    z-index: 1002;
    padding: 0.25rem;
    gap: 0.25rem;

    .button {
        padding: 0;
        display: grid;
        place-items: center;
        height: 2.25rem;
        width: 2.25rem;
    }

    &:deep(.btn-outline-primary) {
        &:not(.active) {
            background-color: $workflow-editor-bg;

            &:hover {
                background-color: $brand-primary;
            }
        }
    }
}
</style>
