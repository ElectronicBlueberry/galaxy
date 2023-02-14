<template>
    <div class="listing-layout">
        <DynamicScroller
            ref="listing"
            class="listing"
            role="list"
            key-field="id"
            :items="items"
            :min-item-size="40"
            :buffer="600">
            <template v-slot="{ item, index, active }">
                <slot name="item" :item="item" :index="index" :active="active" :current-offset="getOffset()" />
            </template>
        </DynamicScroller>
    </div>
</template>

<script>
import { DynamicScroller } from "vue-virtual-scroller";

import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

export default {
    components: {
        DynamicScroller,
    },
    props: {
        offset: { type: Number, default: 0 },
        loading: { type: Boolean, default: false },
        items: { type: Array, default: null },
        queryKey: { type: String, default: null },
    },
    data() {
        return {
            previousStart: undefined,
        };
    },
    watch: {
        queryKey() {
            this.$refs.listing.scrollToOffset(0);
        },
    },
    methods: {
        onScroll() {
            const rangeStart = this.$refs.listing.range.start;
            if (this.previousStart !== rangeStart) {
                this.previousStart = rangeStart;
                this.$emit("scroll", rangeStart);
            }
        },
        getOffset() {
            return this.$refs.listing?.offsetTop ?? 0;
        },
    },
};
</script>

<style scoped lang="scss">
.listing-layout {
    .listing {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-x: hidden;
        overflow-y: scroll;
        scroll-behavior: smooth;

        &:deep(.dynamic-scroller-item) {
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
        }
    }
}
</style>
