<script lang="ts">
import { BDropdownText } from "bootstrap-vue";

/**
 * Text section in a dropdown menu.
 *
 * @see Dropdown
 */
export default {
    name: "DropdownText",
    components: { BDropdownText },
};
</script>

<template>
    <BDropdownText>
        <slot></slot>
    </BDropdownText>
</template>
