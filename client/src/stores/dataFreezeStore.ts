import { ref } from "vue";

import { defineScopedStore } from "@/stores/scopedStore";

/**
 * This store exists to work around a components slots being remounted,
 * when that slot is repositioned in the dom. Otherwise frozen data could
 * be stored directly inside the component, not requiring this store.
 *
 * Following two examples lead the child components remounting, even if they don't have to:
 *
 * ```vue
 * <component :is="changingVariable">
 *     <slot />
 * </component>
 * ```
 *
 * Example 2:
 *
 * ```vue
 * <span v-if="changingVariable">
 *     <slot />
 * </span>
 * <div v-else>
 *     <slot />
 * </div>
 * ```
 *
 * This store can be used to persist data in children rendered within slots.
 *
 * TODO: investigate if this is still needed in vue3
 */
export const useDataFreezeStore = defineScopedStore("dataFreezeStore", () => {
    // todo: use map in vue3
    const frozenData = ref<Record<string, unknown>>({});

    function reset() {
        frozenData.value = {};
    }

    function freezeData(key: string, data: unknown) {
        frozenData.value[key] = structuredClone(data);
    }

    function getData(key: string) {
        return frozenData.value[key];
    }

    return {
        frozenData,
        reset,
        freezeData,
        getData,
    };
});
