import { type MaybeRefOrGetter, toValue } from "@vueuse/core";
import { inject, type Ref, ref, unref, type UnwrapRef, watch } from "vue";

import type { RenderState } from "@/components/Workflow/Editor/ConvergentComponents/useRenderController";
import { useDataFreezeStore } from "@/stores/dataFreezeStore";

/**
 * Wraps a Ref object, freezing it's data in the `pre-render` state, and returning the frozen data in the `svg` state
 */
export function useDataFreeze<T>(
    renderState: MaybeRefOrGetter<RenderState>,
    dataKey: string,
    inputData: Ref<T>
): Ref<T> {
    const workflowId = unref(inject("workflowId")) as string;
    const dataFreezeStore = useDataFreezeStore(workflowId);

    const maybeFrozenData = ref<T>(inputData.value);

    watch(
        () => [toValue(renderState), inputData.value as UnwrapRef<T>] as const,
        ([state, data]) => {
            if (state === "pre-render") {
                dataFreezeStore.freezeData(dataKey, data);
                maybeFrozenData.value = data;
            } else if (state === "svg") {
                maybeFrozenData.value = dataFreezeStore.getData(dataKey) as UnwrapRef<T>;
            } else if (state === "html") {
                maybeFrozenData.value = data;
            }
        }
    );

    return maybeFrozenData as Ref<T>;
}
