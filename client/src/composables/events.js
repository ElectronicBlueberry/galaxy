import { onMounted, onBeforeUnmount } from "vue";

function matchKeyEvent(key, modifiers, event) {
    if (key === event.key) {
        // check if all modifiers match the event
        for (const key of ["shiftKey", "ctrlKey", "altKey"]) {
            if (event[key] !== Boolean(modifiers[key])) {
                return false;
            }
        }

        return true;
    } else {
        return false;
    }
}

export function useKeyUp() {
    const callbacks = [];

    const onKeyUp = (key, modifiers, callbackFunction) => {
        callbacks.push({
            key,
            modifiers,
            callbackFunction,
        });
    };

    const eventHandler = (e) => {
        callbacks.forEach((callback) => {
            if (matchKeyEvent(callback.key, callback.modifiers, e)) {
                callback.callbackFunction(e);
            }
        });
    };

    onMounted(() => {
        document.addEventListener("keyup", eventHandler);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("keyup", eventHandler);
    });

    return { onKeyUp };
}

export function useKeyDown() {
    const callbacks = [];

    const onKeyDown = (key, modifiers, callbackFunction) => {
        callbacks.push({
            key,
            modifiers,
            callbackFunction,
        });
    };

    const eventHandler = (e) => {
        callbacks.forEach((callback) => {
            if (matchKeyEvent(callback.key, callback.modifiers, e)) {
                callback.callbackFunction(e);
            }
        });
    };

    onMounted(() => {
        document.addEventListener("keydown", eventHandler);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("keydown", eventHandler);
    });

    return { onKeyDown };
}
