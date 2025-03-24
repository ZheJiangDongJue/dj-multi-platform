<template>
    <div ref="element">
        <div class="universal-page" v-if="isLoaded">
            <DockPanel class="container">
                <DockItem :dock="item.Dock" v-for="item in vm.metaInfo.views" :key="item.Name">
                    <UniversalView class="view-in-page" :view="item"
                        :controls="vm.metaInfo.viewControls[item.Uid]" :page_vm="vm">
                    </UniversalView>
                </DockItem>
            </DockPanel>
        </div>
    </div>
</template>


<script>
import general from '@/api/general.ts';
import systemData from '@/api/system-data';
import { Query, JoinType } from '@/core/query.ts';
// import { Toast } from 'vant';
import DockPanel from '../dock/DockPanel.vue';
import DockItem from '../dock/DockItem.vue';
import UniversalView from './UniversalView.vue';
import arrayToSqlInString from '@/utils/sql_helper';
import { ControlType } from '@/core/enums/system/controlType';
import { Position } from '@/core/enums/system/position';
import UniversalPageViewModel from '@/core/universal-page-vm';

function log(message, ...optionalParams) {
    console.log(message, ...optionalParams);
}

export default {
    name: 'UniversalPage',
    components: {
        DockPanel, DockItem,
        UniversalView,
    },
    props: {
        pageName: String,
    },
    data() {
        return {
            isLoaded: false,
            // resizeObserver: null,
            // elementWidth: Number,
            // elementHeight: Number,
            controlMap: {},
            page: {},
            vm: new UniversalPageViewModel(),
        }
    },
    async created() {
        var pageName = this.$route.params.pageName ?? this.pageName;
        await this.initItems(pageName);
        this.isLoaded = true;
        setTimeout(() => {
            this.vm.business.setup();
        }, 1000);
    },
    // mounted() {
    //     this.resizeObserver = new ResizeObserver(entries => {
    //         for (const entry of entries) {
    //             console.log("Page", entry.contentRect);
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
        async initItems(pageName) {
            var pack;
            pack = await systemData.GetSystemPageByPageName(pageName)
            if (pack.Data.length == 0) {
                this.$dialog.alert({
                    title: '提示',
                    message: `没有配置这个页面`,
                })
                return;
            }

            var systemPage = pack.Data[0];
            this.page = systemPage;
            this.vm.metaInfo.pageMeta = systemPage;
            log("systemPage", systemPage);
            this.vm.init();
            this.vm.rootDataGroup = await systemData.GetDataGroup();

            pack = await systemData.GetSystemViewInPage(systemPage.Uid)
            const views = pack.Data;
            if (views.length == 0) {
                this.$dialog.alert({
                    title: '提示',
                    message: `没有配置这个页面的视图`,
                })
                return;
            }
            this.vm.metaInfo.views = views;
            log(`页面[${pageName}]的视图`, views);

            for (let i = 0; i < this.vm.metaInfo.views.length; i++) {
                const element = this.vm.metaInfo.views[i];
                element.Dock = this.PositionToDock(element.Position);
            }

            var viewUids = views.map(x => x.Uid);
            log("viewUids", viewUids);

            pack = await systemData.GetSystemControlInViews(viewUids);
            var controls = pack.Data;
            //获取当前已知的控件列表
            log('controls', controls);

            for (let i = 0; i < controls.length; i++) {
                const control = controls[i];
                this.vm.settingHub.AddControl(control.ControlType, control.SettingUid);
            }

            await this.处理更深层级的控件(controls);

            //根据Uid创建公共的控件Map
            this.controlMap = controls.reduce((acc, item) => {
                acc[item.Uid] = item;
                return acc;
            }, {});

            log('controlMap', this.controlMap);

            // 添加后续需要的属性
            for (const key in controls) {
                if (Object.prototype.hasOwnProperty.call(controls, key)) {
                    const control = controls[key];
                    control.Children = [];
                }
            }

            var loaderInfos = this.vm.settingHub.Loaders;

            for (let index = 0; index < loaderInfos.length; index++) {
                const loaderInfo = loaderInfos[index];
                
                await loaderInfo.Load();//加载全部
            }

            await this.处理数据视图();

            // // 分组
            // const groupedData = controls.reduce((acc, item) => {
            //     (acc[item.ControlType] = acc[item.ControlType] || []).push(item); // 分组
            //     return acc;
            // }, {});

            // log("groupedData", groupedData);

            // for (const key in groupedData) {
            //     await this.为控件附加属性(key, groupedData[key])
            // }

            // 根据父元素id进行分发子控件
            controls = this.整理分发子控件(controls)

            this.vm.metaInfo.controls = controls;
            // 根据视图分组
            this.vm.metaInfo.viewControls = controls.reduce((acc, item) => {
                (acc[item.ViewUid] = acc[item.ViewUid] || []).push(item); // 分组
                return acc;
            }, {});

            log("viewControls", this.vm.metaInfo.viewControls);
        },
        async 为控件附加属性(controlType, typeControlMap) {
            var controlUids;
            var query;
            var pack;
            var settings;
            log("typeControlMap", typeControlMap);
            controlType = parseInt(controlType);
            controlUids = typeControlMap.map(x => x.Uid);
            log("controlUids", controlUids);
            switch (controlType) {
                case ControlType.TextBlock:

                    break;
                case ControlType.Button:
                    {
                        query = new Query();
                        query.TableName = "SystemControl";
                        query.ShortName = "sc";
                        query.Select = "sc.Uid ControlUid,ssfb.*";
                        query.AddJoin(JoinType.Inner, "SystemSettingForButton", "ssfb", "ssfb.Uid = sc.SettingUid");
                        query.AddWhere(`sc.ControlType = ${controlType}`);
                        query.AddWhere(`sc.Uid in (${arrayToSqlInString(controlUids)}) and sc.IsDeleted = 0`);
                        // query1.Order = 'sc.SortValue';
                        pack = await general.getDataEx(query);
                        settings = pack.Data;
                        log('Button-Settings', settings);

                        for (const key in settings) {
                            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                                const setting = settings[key];
                                if (Object.prototype.hasOwnProperty.call(typeControlMap, setting.ControlUid)) {
                                    typeControlMap[setting.ControlUid].Setting = setting
                                }
                            }
                        }

                        log("附加Button-Setting后的controls", typeControlMap);

                        break;
                    }
                case ControlType.DataGrid:
                    {
                        query = new Query();
                        query.TableName = "SystemControl";
                        query.ShortName = "sc";
                        query.Select = "sc.Uid ControlUid, ssfdg.DataGridMode, sdv.*";
                        query.AddJoin(JoinType.Inner, "SystemSettingForDataGrid", "ssfdg", "ssfdg.Uid = sc.SettingUid");
                        query.AddJoin(JoinType.Inner, "SystemDataView", "sdv", "sdv.Uid = ssfdg.DataViewUid");
                        query.AddWhere(`sc.ControlType = ${controlType}`);
                        query.AddWhere(`sc.Uid in (${arrayToSqlInString(controlUids)}) and sc.IsDeleted = 0`);
                        pack = await general.getDataEx(query);
                        settings = pack.Data;
                        log('DataGrid-Settings', settings);

                        //附加字段元信息
                        var dataViewUids = settings.map(x => x.Uid);
                        query = new Query();
                        query.TableName = 'SystemDataViewField';
                        query.ShortName = 'sdvf';
                        query.Select = 'sdvf.*';
                        query.AddWhere(`sdvf.DataViewUid in (${arrayToSqlInString(dataViewUids)})`);
                        query.AddWhere(`sdvf.IsDeleted = 0`);
                        query.Order = 'sdvf.SortValue';
                        pack = await general.getDataEx(query);

                        // 根据数据视图分组
                        var dataViewToFieldsMap = pack.Data.reduce((acc, item) => {
                            (acc[item.DataViewUid] = acc[item.DataViewUid] || []).push(item); // 分组
                            return acc;
                        }, {});

                        for (const key in settings) {
                            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                                const setting = settings[key];
                                if (Object.prototype.hasOwnProperty.call(this.controlMap, setting.ControlUid)) {
                                    this.controlMap[setting.ControlUid].Setting = setting
                                }
                                if (Object.prototype.hasOwnProperty.call(dataViewToFieldsMap, setting.Uid)) {
                                    setting.Fields = dataViewToFieldsMap[setting.Uid]
                                }
                            }
                        }

                        log("附加DataGrid-Setting后的controls", typeControlMap);

                        break;
                    }
                case ControlType.ComboBox:
                    {
                        // ComboBox不选用Vant的Select是因为他不支持表头定义
                        query = new Query();
                        query.TableName = "SystemControl";
                        query.ShortName = "sc";
                        query.Select = "sc.Uid ControlUid, sscb.*";
                        query.AddJoin(JoinType.Inner, "SystemSettingForComboBox", "sscb", "sscb.Uid = sc.SettingUid")
                        query.AddWhere(`sc.ControlType = ${controlType}`)
                        query.AddWhere(`sc.Uid in (${arrayToSqlInString(controlUids)}) and sc.IsDeleted = 0`);
                        // query1.Order = 'sc.SortValue';
                        pack = await general.getDataEx(query);
                        settings = pack.Data;
                        log('ComboBox-Settings', settings);

                        for (const key in settings) {
                            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                                const setting = settings[key];
                                if (Object.prototype.hasOwnProperty.call(typeControlMap, setting.ControlUid)) {
                                    typeControlMap[setting.ControlUid].Setting = setting
                                }
                            }
                        }

                        log("附加ComboBox-Setting后的controls", typeControlMap);
                        break;
                    }
                default:
                    this.$dialog.alert({
                        title: '提示',
                        message: `关于控件类型[${controlType}]的解析还未设定`,
                    })
                    break;
            }
        },
        async 处理更深层级的控件() {
            if (this.vm.settingHub.TypeLoaderMap.has(ControlType.DataGrid)) {
                var loaderInfo = this.vm.settingHub.TypeLoaderMap.get(ControlType.DataGrid);

                var query = new Query();
                query.TableName = "SystemSettingForDataGrid";
                query.ShortName = "sdv";
                query.Select = "sdv.DataViewUid";
                query.AddWhere(`sdv.Uid in(${arrayToSqlInString(loaderInfo.SettingUidList)}) and sdv.IsDeleted=0`);
                var pack = await general.getDataEx(query);

                query = new Query();
                query.TableName = "SystemDataViewField";
                query.ShortName = "sdvf";
                query.Select = "sdvf.ControlType,sdvf.SettingUid";
                query.AddWhere(`sdvf.DataViewUid in(${arrayToSqlInString(pack.Data.map(x => x.DataViewUid))}) and sdvf.IsDeleted=0`);
                pack = await general.getDataEx(query);
                for (let index = 0; index < pack.Data.length; index++) {
                    const field_meta = pack.Data[index];
                    this.vm.settingHub.AddControl(field_meta.ControlType, field_meta.SettingUid);
                }
            }
        },
        async 处理数据视图() {
            var loaderInfo;
            if (this.vm.settingHub.TypeLoaderMap.has(ControlType.DataGrid)) {
                loaderInfo = this.vm.settingHub.TypeLoaderMap.get(ControlType.DataGrid);
                for (let index = 0; index < loaderInfo.Settings.length; index++) {
                    const setting = loaderInfo.Settings[index];
                    this.vm.dataViewHub.AddDataView(setting.DataViewUid);
                }
            }
            if (this.vm.settingHub.TypeLoaderMap.has(ControlType.ComboBox)) {
                loaderInfo = this.vm.settingHub.TypeLoaderMap.get(ControlType.ComboBox);
                for (let index = 0; index < loaderInfo.Settings.length; index++) {
                    const setting = loaderInfo.Settings[index];
                    this.vm.dataViewHub.AddDataView(setting.DataViewUid);
                }
            }
            await this.vm.dataViewHub.LoadAll();
        },
        整理分发子控件(controls) {
            var result = [];
            for (let i = 0; i < controls.length; i++) {
                const control = controls[i];
                if (control.ParentControlUid === null) {
                    result.push(control);
                }
            }

            var controlMap = controls.reduce((acc, item) => {
                acc[item.Uid] = item;
                return acc;
            }, {});

            for (let i = 0; i < controls.length; i++) {
                const control = controls[i];

                if (control.ParentControlUid !== null) {
                    var parent = controlMap[control.ParentControlUid];
                    parent.Children.push(control);
                }
            }
            return result;
        },
        PositionToDock(position) {
            position = parseInt(position);
            switch (position) {
                case Position.Left:
                    return 'left';
                case Position.Top:
                    return 'top';
                case Position.Right:
                    return 'right';
                case Position.Bottom:
                    return 'bottom';
                default:
                    return 'fill';
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.universal-page {
    background-color: white;
    height:100vh;
}

.view-in-page {
    width: 100%;
    height: 100%;
}

.container {
    width: 100vw;
    height: 100vh;
}
</style>