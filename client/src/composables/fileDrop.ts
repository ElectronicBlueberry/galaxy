import { computed, ref, unref, type Ref } from "vue";
import { useEventListener, type MaybeComputedRef } from "@vueuse/core";

export type FileDropHandler = (event: DragEvent) => void;

/**
 * Custom File-Drop composable
 * @param dropZone Element which files should be dropped on
 * @param onDrop callback function called when drop occurs
 * @param solo when true, only reacts if no modal is open
 * @param idleTime how long to wait until state resets
 */
export function useFileDrop(
    dropZone: MaybeComputedRef<EventTarget | null | undefined>,
    onDrop: Ref<FileDropHandler> | FileDropHandler,
    solo: MaybeComputedRef<boolean>,
    idleTime = 800
) {
    /** returns if any bootstrap modal is open */
    function isAnyModalOpen() {
        return document.querySelectorAll(".modal.show").length > 0;
    }

    type State = "idle" | "blocked" | "fileDragging";
    type StateMachine = {
        [state in State]: (event: MouseEvent) => State;
    };

    const currentState: Ref<State> = ref("idle");

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const resetTimer = () => {
        if (idleTimer) {
            clearTimeout(idleTimer);
        }
    };

    const stateMachine = {
        idle(event: MouseEvent): State {
            switch (event.type) {
                case "dragstart":
                    return "blocked";
                case "dragenter":
                    if (!(unref(solo) && isAnyModalOpen())) {
                        return "fileDragging";
                    }
                    break;
            }

            return "idle";
        },
        blocked(event: MouseEvent): State {
            switch (event.type) {
                case "drop":
                    return "idle";
                case "dragend":
                    return "idle";
            }

            return "blocked";
        },
        fileDragging(event: MouseEvent): State {
            switch (event.type) {
                case "dragover":
                    event.preventDefault();
                    break;
                case "drop":
                    event.preventDefault();
                    if (isFileOverDropZone.value) {
                        const dropHandler = unref(onDrop);
                        dropHandler(event as DragEvent);
                    }
                    resetTimer();
                    return "idle";
                case "dragend":
                    resetTimer();
                    return "idle";
                case "mouseleave":
                    console.log(event);
            }

            resetTimer();
            idleTimer = setTimeout(() => (currentState.value = "idle"), idleTime);

            return "fileDragging";
        },
    } as const satisfies StateMachine;

    const eventHandler = (event: MouseEvent) => (currentState.value = stateMachine[currentState.value](event));

    useEventListener(document.body, "dragstart", eventHandler, true);
    useEventListener(document.body, "dragover", eventHandler, true);
    useEventListener(document.body, "drop", eventHandler, true);
    useEventListener(document.body, "dragend", eventHandler, true);
    useEventListener(document.body, "dragenter", eventHandler, true);

    const isFileOverDocument = computed({
        get() {
            return currentState.value === "fileDragging";
        },
        set(value) {
            if (value !== true) {
                currentState.value = "idle";
            } else {
                currentState.value = "fileDragging";
            }
        },
    });

    const isFileOverDropZone = ref(false);

    useEventListener(
        dropZone,
        "dragenter",
        () => {
            isFileOverDropZone.value = true;
        },
        true
    );

    useEventListener(
        dropZone,
        "dragleave",
        () => {
            isFileOverDropZone.value = false;
        },
        true
    );

    return { isFileOverDocument, isFileOverDropZone };
}
