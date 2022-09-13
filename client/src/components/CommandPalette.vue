<script setup>
import { ref } from "vue";
import { useKeyUp } from "composables/events";

const modal = ref(null);
const { onKeyUp } = useKeyUp();

onKeyUp("P", { shiftKey: true }, () => {
    modal.value.toggle();
});
</script>

<template>
    <b-modal ref="modal" hide-header hide-footer> Hello World </b-modal>
</template>
