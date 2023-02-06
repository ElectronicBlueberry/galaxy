<script lang="ts">
import { BDropdownItem } from "bootstrap-vue";

/**
 * Used inside Dropdown components.
 * Wraps around each item in the Dropdown menu.
 *
 * @see Dropdown
 */
export default {
    name: "DropdownItem",
    components: { BDropdownItem },
};
</script>

<template>
    <BDropdownItem>
        <slot></slot>
    </BDropdownItem>
</template>

<style lang="scss" scoped></style>
