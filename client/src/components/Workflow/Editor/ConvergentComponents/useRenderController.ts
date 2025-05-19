import { computed, nextTick, ref, watch } from "vue";

import { useDataFreezeStore } from "@/stores/dataFreezeStore";

/**
 * The svg state is rendered in 2 steps.
 * First, the renderState has to be set to "pre-render", so that the components which require it
 * can freeze their positions and size. Svg has no reactive layout properties, which is why this
 * state is needed. In this state, the convergent components should only render the html
 * components which will also appear in the svg, and store their positional/size data.
 */
export type RenderState = "html" | "pre-render" | "svg";

export function useRenderController(workflowId: string) {
    const currentRenderState = ref<RenderState>("html");
    const renderDone = ref<boolean>(false);

    const dataFreezeStore = useDataFreezeStore(workflowId);

    let asyncOperationId = 0;

    const setRenderState = async (newRenderState: RenderState) => {
        asyncOperationId += 1;
        const currentOperationId = asyncOperationId;

        if (newRenderState === "html") {
            currentRenderState.value = "html";
        } else if (newRenderState === "svg" && currentRenderState.value !== "svg") {
            // clear old frozen data
            dataFreezeStore.reset();
            currentRenderState.value = "pre-render";

            await nextTick();

            if (currentOperationId === asyncOperationId) {
                currentRenderState.value = "svg";
            }
        } else if (newRenderState === "pre-render") {
            currentRenderState.value = "pre-render";
        }
    };

    const renderState = computed({
        get: () => currentRenderState.value,
        set: (value) => {
            setRenderState(value);
        },
    });

    watch(
        () => currentRenderState.value,
        async () => {
            if (currentRenderState.value === "svg") {
                await nextTick();
                renderDone.value = true;
            } else {
                renderDone.value = false;
            }
        }
    );

    return {
        renderState,
        renderDone,
        setRenderState,
    };
}
