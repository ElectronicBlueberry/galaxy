<script setup>
import { computed, ref } from "vue";
import { DatasetCollection } from "../../model/DatasetCollection";

const props = defineProps({
    collection: { type: DatasetCollection, required: true },
});

const isPaired = computed(() => props.collection.collection_type.startsWith("paired"));
const isList = computed(() => props.collection.collection_type.startsWith("list"));
const isFlatList = computed(() => props.collection.collection_type === "list");
const isNestedList = computed(() => props.collection.collection_type.startsWith("list:list"));

const hasList = computed(() => Boolean(props.collection.collection_type.includes("list")));
const hasPaired = computed(() => Boolean(props.collection.collection_type.includes("paired")));
</script>

<template></template>
