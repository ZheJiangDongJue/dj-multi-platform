<template>
    <div ref="element" class="universal-view">
        <DynamicPanel v-if="isLoad" class="panel-in-view" :type="viewType" :controls="controls" :page_vm="page_vm">
            <DynamicControl :type="item.ControlType" :setting="getSettingForControl(item)"
                :inGridForControl="getInGridForControl(item)" :control="item" v-for="item in controls" :key="item.Uid"
                :page_vm="page_vm" :dontWatchMe="dontWatchMe" :dataContext="dataContext">
            </DynamicControl>
        </DynamicPanel>
    </div>
</template>

<script>
import UniversalPageViewModel from '@/core/universal-page-vm';
import DynamicPanel from './DynamicPanel.vue';
import { Query } from '@/core/query';
import general from '@/api/general';
import arrayToSqlInString from '@/utils/sql_helper';

export default {
    name: 'UniversalView',
    components: {
        DynamicPanel,
    },
    props: {
        view: Object,
        page_vm: UniversalPageViewModel,
        controls: Array,
        dontWatchMe: Boolean,
        dataContext: Object,
    },
    data() {
        return {
            isLoad: false,
            viewType: 0,
            inGridForControls: new Map(),
            // resizeObserver: null,
            // elementWidth: Number,
            // elementHeight: Number,
        };
    },
    async mounted() {
        /**@type {UniversalPageViewModel} */
        let page_vm = this.page_vm;
        this.viewType = this.view.ViewType;
        if (this.controls != null) {
            var featureAttach = page_vm.rootDataGroup.AttachGroup.FeatureAttach[this.view.Uid];
            if (featureAttach != null) {
                if (featureAttach.ViewFeatureType == 1) {
                    if (page_vm.metaInfo.pageMeta.BusinessCoreKey == "单据类型") {
                        /**@type {BillBusiness} */
                        let business = page_vm.business;
                        var type = page_vm.rootDataGroup.TypeByUid[featureAttach.TypeUid];
                        business.billData.typeName = type.TableName;
                        business.billData.typeCNName = type.Name;

                        var fields = page_vm.rootDataGroup.TypeFields[featureAttach.TypeUid];

                        var fieldNames = [];
                        for (const key in fields) {
                            if (Object.prototype.hasOwnProperty.call(fields, key)) { // 过滤掉原型链上的属性
                                fieldNames.push(key);
                            }
                        }
                        business.billData.fieldNames = fieldNames;
                    }
                }
            }

            var uids = this.controls.map(control => control.Uid);
            var query = new Query();
            query.TableName = "SystemControlSettingInGrid";
            query.ShortName = "scsig";
            query.AddWhere(`scsig.ControlUid in (${arrayToSqlInString(uids)}) and scsig.IsDeleted = 0`);
            var pack = await general.getDataEx(query);
            var settings = pack.Data;

            // console.log('ControlSettingsInGrid', settings);

            settings.forEach(setting => {
                this.inGridForControls.set(setting.ControlUid, setting);
            });

            this.isLoad = true;
        }
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
        },
        getInGridForControl(control) {
            if (this.inGridForControls.has(control.Uid)) {
                return this.inGridForControls.get(control.Uid);
            }
            return null;
        },
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