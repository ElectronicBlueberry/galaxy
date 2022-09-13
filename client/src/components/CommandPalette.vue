<script setup>
import { ref } from "vue";
import { useKeyUp } from "composables/events";

const modal = ref(null);
const input = ref(null);

const modalActive = ref(false);
const command = ref("");

const { onKeyUp } = useKeyUp();

onKeyUp("P", { shiftKey: true }, () => {
    if (!modalActive.value) {
        command.value = "";
        modal.value.show();
    }
});

onKeyUp("Enter", {}, () => {
    if (modalActive.value) {
        modal.value.hide();
        onCommandSubmitted();
    }
});

function onCommandSubmitted() {
    console.log(command.value);
}

function onModalShown() {
    modalActive.value = true;
    input.value.focus();
}

function onModalHidden() {
    modalActive.value = false;
}
</script>

<template>
    <b-modal ref="modal" hide-header hide-footer @shown="onModalShown" @hidden="onModalHidden">
        <b-form-input v-model="command" ref="input" placeholder="Enter Command" />
    </b-modal>
</template>
