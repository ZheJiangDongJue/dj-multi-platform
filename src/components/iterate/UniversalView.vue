<template>
    <div ref="element" class="universal-view">
        <DynamicPanel class="panel-in-view" :type="viewType" :controls="controls" :page_vm="page_vm">
            <DynamicControl :type="item.ControlType" :setting="getSettingForControl(item)" :control="item"
                v-for="item in controls" :key="item.Uid" :page_vm="page_vm">
            </DynamicControl>
        </DynamicPanel>
    </div>
</template>

<script>
import UniversalPageViewModel from '@/core/universal-page-vm';
import DynamicPanel from './DynamicPanel.vue';
import DynamicControl from './DynamicControl.vue';

export default {
    name: 'UniversalView',
    components: {
        DynamicPanel,
        DynamicControl,
    },
    props: {
        viewType: Number,
        view: Object,
        controls: Array,
        pageData: Object,
        page_vm: UniversalPageViewModel,
    },
    data() {
        return {
            // resizeObserver: null,
            // elementWidth: Number,
            // elementHeight: Number,
        };
    },
    // mounted() {
    //     this.resizeObserver = new ResizeObserver(entries => {
    //         for (const entry of entries) {
    //             console.log("View", entry.contentRect);
    //             this.elementWidth = entry.contentRect.width;
    //             this.elementHeight = entry.contentRect.height;
    //         }
    //     });
    //     this.$nextTick(() => {
    //         if (this.$refs.element) {
    //             this.resizeObserver.observe(this.$refs.element);
    //         }
    //     });
    // },
    // beforeDestroy() { // 组件销毁前停止观察
    //     if (this.resizeObserver) {
    //         this.resizeObserver.disconnect();
    //     }
    // },
    methods: {
        getSettingForControl(control) {
            if (this.page_vm.settingHub.TypeLoaderMap.has(control.ControlType)) {
                var loader = this.page_vm.settingHub.TypeLoaderMap.get(control.ControlType);
                if (loader.SettingUidMap.has(control.SettingUid)) {
                    return loader.SettingUidMap.get(control.SettingUid);
                }
            }
            return null;
        }
    },
}
</script>


<style>
.universal-view {}

.panel-in-view {
    width: 100%;
    height: 100%;
}
</style>