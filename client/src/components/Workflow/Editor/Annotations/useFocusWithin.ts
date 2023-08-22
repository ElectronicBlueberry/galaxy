import { useEventListener } from "@vueuse/core";
import { type Ref, ref } from "vue";

import { wait } from "@/utils/utils";

/**
 * Tracks if an element has focus within
 *
 * @param target Element to track
 * @param onFocusWithinIn Optional event handler when inner focus is gained
 * @param onFocusWithinOut Optional event handler when inner focus is lost
 */
export function useFocusWithin(
    target: Ref<HTMLElement | undefined | null>,
    onFocusWithinIn?: (() => void) | null,
    onFocusWithinOut?: (() => void) | null
) {
    let hasFocus = false;
    let hadFocus = false;

    const focusWithin = ref(false);

    async function onFocusIn() {
        if (!hadFocus) {
            if (onFocusWithinIn) {
                onFocusWithinIn();
            }

            focusWithin.value = true;
        }

        hasFocus = true;

        // wait for end of event-loop
        await wait(0);

        if (hasFocus) {
            hadFocus = true;
        }
    }

    async function onFocusOut() {
        hasFocus = false;

        // wait for end of event-loop
        await wait(0);

        if (!hasFocus) {
            hadFocus = false;

            if (onFocusWithinOut) {
                onFocusWithinOut();
            }

            focusWithin.value = false;
        }
    }

    useEventListener(target, "focusin", onFocusIn, { capture: true });
    useEventListener(target, "focusout", onFocusOut, { capture: true });

    return {
        focusWithin,
    };
}
