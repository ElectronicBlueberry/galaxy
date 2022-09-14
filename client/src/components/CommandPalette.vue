<script setup>
import { ref, computed } from "vue";
import { useKeyUp, useKeyDown } from "composables/events";
import { useCommands } from "composables/commands";
import { useFilterObjectArray } from "composables/utils/filter";

// ----- Modal -----

const modal = ref(null);
const input = ref(null);

const modalActive = ref(false);
const inputFocused = ref(false);
const command = ref("");

const { onKeyUp } = useKeyUp();
const { onKeyDown } = useKeyDown();

onKeyUp("P", { shiftKey: true }, () => {
    if (!modalActive.value) {
        command.value = "";
        modal.value.show();
    }
});

onKeyDown("Enter", {}, () => {
    if (modalActive.value && inputFocused.value) {
        modal.value.hide();
        onCommandSubmitted();
    }
});

function onModalShown() {
    modalActive.value = true;
    input.value.focus();
}

function onModalHidden() {
    modalActive.value = false;
}

// ----- Commands -----

const { commands, recentCommands, runCommand } = useCommands();
const filteredCommands = useFilterObjectArray(commands, command, ["name", "command"]);
const topCommands = computed(() => filteredCommands.value.slice(0, 5));

const previewCommands = computed(() => {
    if (command.value === "") {
        return recentCommands.value;
    } else {
        return topCommands.value;
    }
});

function onCommandSubmitted() {
    runCommand(command.value);
}

// ----- Arrow Key Focus -----

let focusIndex = 0;

onKeyDown("ArrowDown", {}, () => {
    if (modalActive.value) {
        focusIndex += 1;
        updateFocus();
    }
});

onKeyDown("ArrowUp", {}, () => {
    if (modalActive.value) {
        focusIndex -= 1;
        updateFocus();
    }
});

function updateFocus() {
    const palette = document.getElementById("command-palette-commands");

    if (palette) {
        // loop focus
        if (focusIndex < 0) {
            focusIndex = palette.childElementCount;
        }
        if (focusIndex > palette.childElementCount) {
            focusIndex = 0;
        }

        // select appropriate element
        if (focusIndex === 0) {
            input.value.focus();
        } else {
            const focusElement = palette.childNodes[focusIndex - 1];
            focusElement.focus();
        }
    } else {
        focusIndex = 0;
    }
}

// ----- Command Selection -----

function commandSelected(selectedCommand) {
    command.value = selectedCommand.command;
    focusIndex = 0;
    input.value.focus();
}
</script>

<template>
    <b-modal ref="modal" hide-header hide-footer @shown="onModalShown" @hidden="onModalHidden">
        <b-form-input
            ref="input"
            v-model="command"
            placeholder="Enter Command"
            @focus="() => (inputFocused = true)"
            @blur="() => (inputFocused = false)" />
        <div id="command-palette-commands" class="d-flex flex-column">
            <b-button
                v-for="(c, i) of previewCommands"
                :key="i"
                squared
                size="sm"
                variant="secondary"
                class="command-button"
                @click="() => commandSelected(c)">
                <b>{{ c.command }}</b> <span>{{ c.name }}</span>
            </b-button>
        </div>
    </b-modal>
</template>

<style lang="scss" scoped>
#command-palette-commands::v-deep .command-button {
    display: flex;
    justify-content: space-between;
    border: 0px;
}
</style>
