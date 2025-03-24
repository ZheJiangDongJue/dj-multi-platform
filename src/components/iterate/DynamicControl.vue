<template>
    <div ref="element" class="dynamic-control" style="overflow: hidden;height: 100%;" v-if="isReady">
        <p v-if="type == 0">{{ control.Header }}</p>
        <TextBox v-if="type == 1" type="text" :label="control.Header" v-model="value" @input="handleInput" />
        <van-button v-if="type == 2" @click="handleClick" plain>{{ control.Header }}</van-button>
        <vxe-table class="checkbox-table" stripe show-overflow show-header-overflow show-footer-overflow width="100%"
            height="100%" :checkbox-config="{}" :scroll-x="{ enabled: true, gt: 0 }"
            :scroll-y="{ enabled: true, gt: 0 }" :column-config="{ XisCurrentX: true, isHover: true, resizable: true }"
            :edit-config="{ trigger: 'click', mode: 'cell' }" :row-config="{ isCurrent: true, isHover: true }"
            v-if="type == 3" :data="control_vm.core.data">
            <vxe-column :type="calcColumnType(field)" :fixed="getFixed(field)" :width="field.width" :field="field.field"
                :title="field.title" :edit-render="getEditRender(field)" v-for="field in control_vm.core.fields"
                :key="field.title" sortable></vxe-column>
        </vxe-table>
        <!-- <el-select v-model="value" placeholder="请选择" v-if="isComboBox()"
            :multiple="control_vm.core.meta.controlSetting.IsMultiSelect"
            :collapse-tags="control_vm.core.meta.controlSetting.IsMultiSelect">
            <el-option v-for="item in control_vm.core.data" filterable :key="item.value"
                :label="item[control_vm.core.displayField]" :value="item[control_vm.core.field]">
            </el-option>
        </el-select> -->
        <TextBox v-if="isComboBox()" type="text" :label="control.Header" v-model="value"
            @input="handleAutoSelectInput" />
        <DynamicPanel v-if="type == 7" :type="setting.ViewType" :controls="control.Children" :page_vm="page_vm">
            <DynamicControl :type="item.ControlType" :control="item" v-for="item in control.Children" :key="item.Uid"
                :page_vm="page_vm" />
        </DynamicPanel>
        <!-- <UniversalView v-if="type == 14" :view-type="view.ViewType" :view="view"></UniversalView> -->
        <TemplateListView v-if="type == 26" :control="control" :setting="setting" :page_vm="page_vm"
            :control_vm="control_vm"></TemplateListView>
    </div>
</template>

<script>
import bit_helper from '@/utils/bit_helper';
import UniversalPageViewModel from '@/core/universal-page-vm';
import DynamicPanel from './DynamicPanel.vue';
import { DataGridCore, DataGridField } from '@/core/control-vm/data-grid-vm';
import { ControlType } from '@/core/enums/system/controlType';
import { DataFieldMode } from '@/core/enums/system/dataFieldMode';
import { ComboBoxCore } from '@/core/control-vm/select-vm';
import { EnumHub } from '@/core/enums/enum-hub';
import { ControlViewModel } from '@/core/control-vm/control-view-model';
import { TemplateListViewCore } from '@/core/control-vm/template-list-view-core';
import TemplateListView from './TemplateListView.vue';
import { TextBoxCore } from '@/core/control-vm/textbox-vm';
import TextBox from '../TextBox.vue';
// import { ComboBoxViewModel } from '@/core/control-vm/select-vm';


export default {
    name: 'DynamicControl',
    components: {
        DynamicPanel,
        TemplateListView,
        TextBox,
    },
    props: {
        type: {
            type: Number,
            required: true,
        },
        control: Object,
        setting: Object,
        inGridForControl: Object,
        page_vm: UniversalPageViewModel,
        dontWatchMe: Boolean,
        dataContext: Object,
    },
    data() {
        return {
            isReady: false,
            // view: {},
            control_vm: new ControlViewModel(),
            value: null,
            fieldName: null,
        };
    },
    watch: {
        // 监听 value
        value: function (newValue,) {
            if (this.type == ControlType.TextBox) {
                /**@type {TextBoxCore} */
                let core = this.control_vm.core;
                core.text = newValue;
                return;
            }
            if (this.type == ControlType.ComboBox) {
                if (this.control_vm.core.meta.controlSetting.IsMultiSelect) {
                    this.control_vm.core.selectedItems = newValue;
                    this.control_vm.core.editValue = newValue;
                }
                else {
                    this.control_vm.core.selectedItem = newValue;
                    this.control_vm.core.editValue = newValue;
                }
            }
            if (this.type == ControlType.ComboBoxForEnum) {
                if (this.control_vm.core.meta.controlSetting.IsMultiSelect) {
                    this.control_vm.core.selectedItems = newValue;
                    let sum = 0;
                    for (const number of newValue) {
                        sum += number;
                    }
                    this.control_vm.core.editValue = sum;
                }
                else {
                    this.control_vm.core.selectedItem = newValue;
                    this.control_vm.core.editValue = newValue;
                }
            }
        },
    },
    async created() {
        var vm, dataView, dataViewFields;
        var type = parseInt(this.type);
        switch (type) {
            case ControlType.TextBlock:
                break;
            case ControlType.TextBox: {
                /**@type {UniversalPageViewModel} */
                let page_vm = this.page_vm;
                let core = new TextBoxCore();
                vm = new ControlViewModel();
                vm.type = ControlType.TextBox;
                vm.core = core;
                let field = page_vm.rootDataGroup.ControlFieldAttachs[this.control.Uid];
                if (field != null) {
                    this.$set(core, 'fieldName', field.FieldName);
                }
                this.control_vm = vm;
                break;
            }
            case ControlType.Button:
                break;
            case ControlType.DataGrid:
                {
                    vm = new ControlViewModel();
                    vm.type = ControlType.DataGrid;
                    let core = new DataGridCore();
                    vm.core = core;
                    core.meta.setting = this.setting;
                    core.page_vm = this.page_vm;
                    this.control_vm = vm;

                    var dataGridAttach = this.page_vm.rootDataGroup.AttachGroup.ControlDataGridAttach[this.control.Uid]
                    if (dataGridAttach != null) {
                        //设置明细附加属性
                        core.dataGridAttach = dataGridAttach;
                    }
                    this.addControl(vm);
                    if (this.page_vm.dataViewHub.DataViewUidMap.has(this.setting.DataViewUid)) {
                        dataView = this.page_vm.dataViewHub.DataViewUidMap.get(this.setting.DataViewUid);
                        core.meta.DataView = dataView;
                    }

                    if (this.page_vm.dataViewHub.DataViewFieldsMap.has(core.meta.DataView.Uid)) {
                        dataViewFields = this.page_vm.dataViewHub.DataViewFieldsMap.get(core.meta.DataView.Uid);
                        core.meta.DataViewFields = dataViewFields;
                    }
                    core.fields.push(new DataGridField({
                        title: "序号",
                        field: "seq",
                        width: 50,
                        mode: DataFieldMode.IsFreeze,
                    }));
                    core.fields.push(new DataGridField({
                        title: "选中",
                        field: "checked",
                        type: ControlType.CheckBox,
                        width: 80,
                        mode: DataFieldMode.IsFreeze,
                    }));
                    for (let i = 0; i < core.meta.DataViewFields.length; i++) {
                        const field_meta = core.meta.DataViewFields[i];
                        var field = new DataGridField({
                            title: field_meta.Header,
                            field: field_meta.FieldName,
                            type: field_meta.ControlType,
                            mode: field_meta.DataFieldMode,
                            meta: field_meta,
                        });
                        core.fields.push(field);
                    }

                    await core.Refresh();

                    (async () => {
                        for (let index = 0; index < core.fields.length; index++) {
                            const fieldControl = core.fields[index];//field
                            if (fieldControl.meta === undefined) continue;
                            const field_meta = fieldControl.meta;
                            const controlType = field_meta.ControlType;
                            if (this.page_vm.settingHub.TypeLoaderMap.has(controlType)) {
                                let loader = this.page_vm.settingHub.TypeLoaderMap.get(controlType);
                                if (loader.SettingUidMap.has(field_meta.SettingUid)) {
                                    let setting = loader.SettingUidMap.get(field_meta.SettingUid);
                                    if (controlType == ControlType.ComboBoxForEnum) {
                                        let agent = EnumHub.getInstance().EnumClassNameMap.get(setting.EnumType);
                                        if (agent != null) {
                                            core.attachData.set(this.getFullNameInDataGrid(fieldControl), agent.Data);
                                        }
                                        else {
                                            this.$dialog.alert({
                                                title: '提示',
                                                message: `没有找到枚举值:[${this.setting.EnumType}]`,
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    })
                    break;
                }
            case ControlType.ComboBox:
                {
                    vm = new ControlViewModel();
                    vm.type = ControlType.ComboBox;
                    let core = new ComboBoxCore();
                    vm.core = core;
                    core.meta.controlMeta = this.control;
                    core.meta.controlSetting = this.setting;
                    core.displayField = this.setting.DisplayMember;
                    core.field = this.setting.ValueMember;
                    this.control_vm = vm;
                    this.addControl(vm);
                    if (this.page_vm.dataViewHub.DataViewUidMap.has(this.setting.DataViewUid)) {
                        dataView = this.page_vm.dataViewHub.DataViewUidMap.get(this.setting.DataViewUid);
                        core.meta.dataViewMeta.DataView = dataView;
                    }

                    if (core.meta.dataViewMeta.DataView != null) {
                        if (this.page_vm.dataViewHub.DataViewFieldsMap.has(core.meta.dataViewMeta.DataView.Uid)) {
                            dataViewFields = this.page_vm.dataViewHub.DataViewFieldsMap.get(core.meta.dataViewMeta.DataView.Uid);
                            core.meta.dataViewMeta.DataViewFields = dataViewFields;
                        }
                    }

                    console.log(core);

                    // await core.Refresh();
                    break;
                }
            case ControlType.CustomEnumControl:
                break;
            case ControlType.DropDownButton:
                break;
            case ControlType.DateSelect:
                break;
            case ControlType.TemplateListView:
                {
                    vm = new ControlViewModel();
                    vm.type = ControlType.TemplateListView;
                    let core = new TemplateListViewCore();
                    core.page_vm = this.page_vm;
                    vm.core = core;
                    core.controlMeta = this.control;
                    core.controlSetting = this.setting;
                    core.dataViewUid = this.setting.DataViewUid;
                    core.dataView = this.page_vm.rootDataGroup.DataViews[this.setting.DataViewUid];
                    this.control_vm = vm;
                    this.addControl(vm);
                    break;
                }
            case ControlType.FlowBillState: {
                break;
            }
            default:
                this.$dialog.alert({
                    title: '提示',
                    message: `控件-["${this.control.Name}"](${this.control.Uid}):暂不支持的控件类型:[${this.control.ControlType}]`,
                })
                return;
        }
        this.isReady = true;
    },
    mounted() {
        //初始化中转绑定值
        if (this.dataContext != null) {
            if (this.control_vm.type == ControlType.TextBox) {
                if (this.control_vm.core.fieldName != null) {
                    this.value = this.dataContext[this.control_vm.core.fieldName];
                }
            }
        }
    },
    methods: {
        addControl(vm) {
            if (this.dontWatchMe) return;
            this.page_vm.nameToControlViewModel.set(this.control.Name, vm);
        },
        handleClick() {
            // this.$emit('click');
            this.handleCommand();
        },
        handleCommand() {
            console.log(`调用[${this.setting.CommandKey}]`);
            this.$EventBus.$emit(this.setting.CommandKey, this.page_vm);
            console.log(`调用[${this.setting.CommandKey}]结束`);
        },
        calcColumnType(field) {
            if (field.field == 'seq') {
                return 'seq';
            }
            if (field.field == 'checked') {
                return 'checkbox';
            }

            return undefined;
        },
        getEditRender(field) {

            if (field.type == undefined) return;
            if (bit_helper.hasFlag(field.mode, DataFieldMode.Readonly)) {
                return;
            }
            switch (field.type) {
                case ControlType.TextBox:
                    return { name: 'VxeInput' };

                case ControlType.ComboBoxForEnum:

                    var item = {
                        name: 'VxeSelect',
                        props: {
                            multiple: true
                        },
                        options: this.control_vm.core.attachData.get(this.getFullNameInDataGrid(field)),
                        optionProps: {
                            label: 'key',
                            value: 'value'
                        },
                    };
                    // vm.Refresh().then((v) => {
                    //     item.options = v;
                    // })

                    return item;//都是为了你啊

                case ControlType.CheckBox:
                    return { name: 'VxeSwitch' }

                default:
                    this.$dialog.alert({
                        title: '提示',
                        message: `列-["${field.title}"]:暂不支持的控件类型:[${field.type}]`,
                    })
                    break;
            }
        },
        getFixed(field) {
            return bit_helper.hasFlag(field.mode, DataFieldMode.IsFreeze) ? 'left' : null;
        },
        getFullNameInDataGrid(field) {
            return this.control.Name + field.title;
        },
        isComboBox() {
            return this.type == ControlType.ComboBox || this.type == ControlType.ComboBoxForEnum;
        },
        handleInput(value) {
            let field = this.control_vm.core.fieldName;
            // 直接修改数组元素的响应式方法
            this.$set(this.dataContext, field, value)
            // 或者触发自定义事件通知父组件
            // this.$emit('update-item', { index, field, value })
        },
        async handleAutoSelectInput(value) {
            console.log(value);
            /**@type {ComboBoxCore} */
            let core = this.control_vm.core;
            if (value != null) {
                let field = core.field;

                let t = await core.GetSingleItemByDisplayText(value);
                if (t != null) {
                    core.selectedItem = t;
                    core.editValue = t.value;
                    console.log(value, t);
                    this.$set(this.dataContext, field, t.value);
                }
            }
            // let field = this.fieldName;
            // // 直接修改数组元素的响应式方法
            // this.$set(this.dataContext, field, value)
            // // 或者触发自定义事件通知父组件
            // // this.$emit('update-item', { index, field, value })
        }
    },
}
</script>

<style lang="scss" scoped>
.dynamic-control {}
</style>