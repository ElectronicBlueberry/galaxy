<script lang="ts">
import { BDropdown } from "bootstrap-vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import type { PropType } from "vue";

// @ts-ignore bad library types
library.add(faCaretDown);

/**
 * Dropdown Menu
 *
 * Add `DropdownItem`s to add menu items to the dropdown
 *
 * @props
 *  - `title`:
 *    required - sets the title of the dropdown menu
 *  - `size`:
 *    optional - "lg" | "md" | "sm" - change the size of the dropdown menu button
 *  - `button-class`:
 *    optional - class to add to the toggle button
 *  - `menu-class`:
 *    optional - class to add to the dropdown menu
 *  - `tooltip-side`:
 *    optional - "top" | "bottom" - forces the tooltip to appear on the top or bottom
 *
 * @slots
 *  - `button-content`:
 *    Customize the content of the dropdown button. Default is a caret icon
 *    and a screen-reader only text of the title.
 *
   @see DropdownItem
   @see DropdownDivider
 */
export default {
    name: "Dropdown",
    components: { BDropdown, FontAwesomeIcon },
    props: {
        title: {
            type: String,
            required: true,
        },
        size: {
            type: String as PropType<"lg" | "md" | "sm">,
            default: "md",
        },
        buttonClass: {
            type: String,
            default: "",
        },
        menuClass: {
            type: String,
            default: "",
        },
        tooltipSide: {
            type: String as PropType<"top" | "bottom">,
            default: "top",
        },
    },
};
</script>

<template>
    <BDropdown
        v-b-tooltip.hover="{ placement: tooltipSide }"
        no-caret
        :title="title"
        :size="size"
        :toggle-class="buttonClass"
        :menu-class="menuClass"
        variant="link">
        <template v-slot:button-content>
            <slot name="button-content">
                <FontAwesomeIcon icon="fa-caret-down" />
                <span class="sr-only">{{ title }}</span>
            </slot>
        </template>

        <slot></slot>
    </BDropdown>
</template>

<style lang="scss" scoped></style>
