<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        default: "",
    },
    textArea: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits<{
    (e: "input", value: string): void;
}>();

const currentValue = computed({
    get: () => props.value,
    set: (value) => emit("input", value),
});
</script>

<template>
    <textarea v-if="props.textArea" :id="props.id" v-model="currentValue" class="ui-textarea" />
    <input v-else :id="props.id" v-model="currentValue" class="ui-input" />
</template>
