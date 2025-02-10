<template>
    <div class="universal-page" v-if="isLoaded">
        <DockPanel class="container">
            <DockItem :dock="item.Dock" v-for="item in views" :key="item.Name">
                <UniversalView :view="item" :controls="viewControls[item.Uid]"></UniversalView>
            </DockItem>
        </DockPanel>
    </div>
</template>


<script>
import general from '@/api/general.ts';
import { Query, JoinType } from '@/core/query.ts';
import { Toast } from 'vant';
import DockPanel from '../dock/DockPanel.vue';
import DockItem from '../dock/DockItem.vue';
import UniversalView from './UniversalView.vue';
import arrayToSqlInString from '@/utils/sql_helper';
import { ControlType } from '@/core/enums/controlType';
import { Position } from '@/core/enums/position';

function log(message, ...optionalParams) {
    console.log(message, optionalParams);
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
            page: {},
            views: [],
            controls: [],
            viewControls: {},
        }
    },
    async created() {
        await this.initItems();
        this.isLoaded = true;
    },
    methods: {
        async initItems() {
            var pack;
            var queryPage = new Query();
            queryPage.TableName = "SystemPage";
            queryPage.Select = 'Uid, BusinessCoreKey, Name, PageMode'
            queryPage.AddWhere(`Name = '${this.pageName}' and IsDeleted = 0`);
            pack = await general.getDataEx(this.dbName, queryPage);
            if (pack.Data.length == 0) {
                Toast('没有配置这个页面')
                return;
            }

            var systemPage = pack.Data[0];
            this.page = systemPage;
            log("systemPage", systemPage);

            var queryView = new Query();
            queryView.TableName = "SystemView";
            queryView.ShortName = 'sv';
            queryView.Select = 'spvl.Position, sv.*'
            queryView.AddJoin(JoinType.Inner, 'SystemPageViewLink', 'spvl', 'spvl.ViewUid = sv.Uid');
            queryView.AddWhere(`spvl.PageUid = '${systemPage.Uid}' and sv.IsDeleted = 0 and spvl.IsDeleted = 0`)
            queryView.Order = 'spvl.SortValue';
            pack = await general.getDataEx(this.dbName, queryView);
            const views = pack.Data;
            if (views.length == 0) {
                Toast('没有配置这个页面的视图')
                return;
            }
            this.views = views;
            log(`页面[${this.pageName}]的视图`, views);

            for (let i = 0; i < this.views.length; i++) {
                const element = this.views[i];
                element.Dock = this.PositionToDock(element.Position);
                console.log(element.Position, element.Dock);
            }

            var viewUids = views.map(x => x.Uid);
            log("viewUids", viewUids);

            var query1 = new Query();
            query1.TableName = "SystemControl";
            query1.ShortName = "sc";
            query1.AddWhere(`sc.ViewUid in (${arrayToSqlInString(viewUids)}) and sc.IsDeleted = 0`);
            query1.Order = 'sc.SortValue';
            pack = await general.getDataEx(this.dbName, query1);
            const controls = pack.Data;
            log('controls', controls);

            var controlMap = controls.reduce((acc, item) => {
                acc[item.Uid] = item;
                return acc;
            }, {});

            log('controlMap', controlMap);

            // 添加后续需要的属性
            for (const key in controls) {
                if (Object.prototype.hasOwnProperty.call(controls, key)) {
                    const control = controls[key];
                    control.Children = {};
                }
            }

            // 分组
            const groupedData = controls.reduce((acc, item) => {
                (acc[item.ControlType] = acc[item.ControlType] || []).push(item); // 分组
                return acc;
            }, {});

            log("groupedData", groupedData);

            for (const key in groupedData) {
                await this.为控件附加属性(key, controlMap)
            }

            console.log(controls);

            // 根据视图分组
            this.viewControls = controls.reduce((acc, item) => {
                (acc[item.ViewUid] = acc[item.ViewUid] || []).push(item); // 分组
                return acc;
            }, {});

            console.log("viewControls", this.viewControls);

        },
        async 为控件附加属性(controlType, controlMap) {
            controlType = parseInt(controlType)
            switch (controlType) {
                case ControlType.TextBlock:

                    break;
                case ControlType.Button:
                    var controlUids = Object.keys(controlMap)

                    var query1 = new Query();
                    query1.TableName = "SystemControl";
                    query1.ShortName = "sc";
                    query1.Select = "sc.Uid ControlUid,ssfb.*";
                    query1.AddJoin(JoinType.Inner, "SystemSettingForButton", "ssfb", "ssfb.Uid = sc.SettingUid")
                    query1.AddWhere(`sc.Uid in (${arrayToSqlInString(controlUids)}) and sc.IsDeleted = 0`);
                    // query1.Order = 'sc.SortValue';
                    var pack = await general.getDataEx(this.dbName, query1);
                    var settings = pack.Data;
                    log('ButtonSettings', settings);

                    for (const key in settings) {
                        if (Object.prototype.hasOwnProperty.call(settings, key)) {
                            const setting = settings[key];
                            if (Object.prototype.hasOwnProperty.call(controlMap, setting.ControlUid)) {
                                controlMap[setting.ControlUid].Setting = setting
                            }
                        }
                    }

                    log("附加Setting后的controls", controlMap);

                    break;
                default:
                    Toast(`关于控件类型[${controlType}]的解析还未设定`);
                    break;
            }
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
}

.container {
    width: 100vw;
    height: 100vh;
}
</style>