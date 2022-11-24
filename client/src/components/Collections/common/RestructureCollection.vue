<script setup>
import { computed, onMounted, ref } from "vue";
import { rethrowSimple } from "utils/simple-error";
import axios from "axios";
import { getAppRoot } from "onload";

const props = defineProps({
    collection_id: { type: String, required: true },
});

const collection = ref(null);

onMounted(async () => {
    const url = `${getAppRoot()}api/dataset_collections/${props.collection_id}?instance_type=history`;
    try {
        const { data } = await axios.get(url);
        collection.value = data;
    } catch (e) {
        rethrowSimple(e);
    }
});

const isPaired = computed(() => collection.value?.collection_type.startsWith("paired"));
const isList = computed(() => collection.value?.collection_type.startsWith("list"));
const isFlatList = computed(() => collection.value?.collection_type === "list");
const isNestedList = computed(() => collection.value?.collection_type.startsWith("list:list"));

const hasList = computed(() => Boolean(collection.value?.collection_type.includes("list")));
const hasPaired = computed(() => Boolean(collection.value?.collection_type.includes("paired")));
</script>

<template></template>
