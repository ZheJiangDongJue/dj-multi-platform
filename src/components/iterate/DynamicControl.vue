<template>
    <div ref="element" class="dynamic-control" style="overflow: hidden;height: 100%;" v-if="isReady">
        <p v-if="type == 0">{{ control.Header }}</p>
        <van-button v-if="type == 2" @click="handleClick" plain>{{ control.Header }}</van-button>
        <vxe-table class="checkbox-table" stripe show-overflow show-header-overflow show-footer-overflow width="100%"
            height="100%" :checkbox-config="{}" :scroll-x="{ enabled: true, gt: 0 }"
            :scroll-y="{ enabled: true, gt: 0 }" :column-config="{ XisCurrentX: true, isHover: true, resizable: true }"
            :edit-config="{ trigger: 'click', mode: 'cell' }" :row-config="{ isCurrent: true, isHover: true }"
            v-if="type == 3" :data="control_vm.data">
            <vxe-column :type="calcColumnType(field)" :fixed="getFixed(field)" :width="field.width" :field="field.field"
                :title="field.title" :edit-render="getEditRender(field)" v-for="field in control_vm.fields"
                :key="field.title" sortable></vxe-column>
        </vxe-table>
        <el-select v-model="value" placeholder="请选择" v-if="isComboBox()"
            :multiple="control_vm.meta.comboBoxSetting.IsMultiSelect"
            :collapse-tags="control_vm.meta.comboBoxSetting.IsMultiSelect">
            <el-option v-for="item in control_vm.data" filterable :key="item.value"
                :label="item[control_vm.displayField]" :value="item[control_vm.field]">
            </el-option>
        </el-select>
        <DynamicPanel v-if="type == 7" :type="setting.ViewType" :controls="control.Children" :page_vm="page_vm">
            <DynamicControl :type="item.ControlType" :control="item" v-for="item in control.Children" :key="item.Uid"
                :page_vm="page_vm" />
        </DynamicPanel>
        <!-- <UniversalView v-if="type == 14" :view-type="view.ViewType" :view="view"></UniversalView> -->
    </div>
</template>

<script>
import bit_helper from '@/utils/bit_helper';
import UniversalPageViewModel from '@/core/universal-page-vm';
import DynamicPanel from './DynamicPanel.vue';
// import UniversalView from '@/components/iterate/UniversalView.vue';
import { DataGridModel, DataGridField } from '@/core/control-vm/data-grid-vm';
import { ControlType } from '@/core/enums/system/controlType';
import { DataFieldMode } from '@/core/enums/system/dataFieldMode';
import { ComboBoxViewModel } from '@/core/control-vm/select-vm';
import { EnumHub } from '@/core/enums/enum-hub';
// import { ComboBoxViewModel } from '@/core/control-vm/select-vm';


export default {
    name: 'DynamicControl',
    components: {
        DynamicPanel,
        // UniversalView,
    },
    props: {
        type: {
            type: Number,
            required: true,
        },
        control: Object,
        setting: Object,
        page_vm: UniversalPageViewModel,
    },
    data() {
        return {
            isReady: false,
            // view: {},
            control_vm: null,
            value: null,
        };
    },
    watch: {
        // 监听 value
        value: function (newValue,) {
            if (this.type == ControlType.ComboBox) {
                if (this.control_vm.meta.comboBoxSetting.IsMultiSelect) {
                    this.control_vm.selectedItems = newValue;
                    this.control_vm.editValue = newValue;
                }
                else {
                    this.control_vm.selectedItem = newValue;
                    this.control_vm.editValue = newValue;
                }
            }
            if (this.type == ControlType.ComboBoxForEnum) {
                if (this.control_vm.meta.comboBoxSetting.IsMultiSelect) {
                    this.control_vm.selectedItems = newValue;
                    let sum = 0;
                    for (const number of newValue) {
                        sum += number;
                    }
                    this.control_vm.editValue = sum;
                }
                else {
                    this.control_vm.selectedItem = newValue;
                    this.control_vm.editValue = newValue;
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
            case ControlType.Button:
                break;
            case ControlType.DataGrid:
                vm = new DataGridModel();
                vm.setting = this.setting;
                vm.page_vm = this.page_vm;
                this.control_vm = vm;
                this.page_vm.nameToControlViewModel.set(this.control.Name, vm);
                if (this.page_vm.dataViewHub.DataViewUidMap.has(this.setting.DataViewUid)) {
                    dataView = this.page_vm.dataViewHub.DataViewUidMap.get(this.setting.DataViewUid);
                    vm.meta.DataView = dataView;
                }

                if (this.page_vm.dataViewHub.DataViewFieldsMap.has(vm.meta.DataView.Uid)) {
                    dataViewFields = this.page_vm.dataViewHub.DataViewFieldsMap.get(vm.meta.DataView.Uid);
                    vm.meta.DataViewFields = dataViewFields;
                }
                vm.fields.push(new DataGridField({
                    title: "序号",
                    field: "seq",
                    width: 50,
                    mode: DataFieldMode.IsFreeze,
                }));
                vm.fields.push(new DataGridField({
                    title: "选中",
                    field: "checked",
                    type: ControlType.CheckBox,
                    width: 80,
                    mode: DataFieldMode.IsFreeze,
                }));
                for (let i = 0; i < vm.meta.DataViewFields.length; i++) {
                    const field_meta = vm.meta.DataViewFields[i];
                    var field = new DataGridField({
                        title: field_meta.Header,
                        field: field_meta.FieldName,
                        type: field_meta.ControlType,
                        mode: field_meta.DataFieldMode,
                        meta: field_meta,
                    });
                    vm.fields.push(field);
                }

                await vm.Refresh();

                for (let index = 0; index < vm.fields.length; index++) {
                    const fieldControl = vm.fields[index];//field
                    if (fieldControl.meta === undefined) continue;
                    const field_meta = fieldControl.meta;
                    if (this.page_vm.settingHub.TypeLoaderMap.has(field_meta.ControlType)) {
                        var loader = this.page_vm.settingHub.TypeLoaderMap.get(field_meta.ControlType);
                        if (loader.SettingUidMap.has(field_meta.SettingUid)) {
                            var setting = loader.SettingUidMap.get(field_meta.SettingUid);
                            if (field_meta.ControlType == ControlType.ComboBoxForEnum) {
                                var agent = EnumHub.getInstance().EnumClassNameMap.get(setting.EnumType);
                                if (agent != null) {
                                    vm.attachData.set(this.getFullNameInDataGrid(fieldControl), agent.Data);
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

                break;
            case ControlType.ComboBox:
                vm = new ComboBoxViewModel();
                vm.type = ControlType.ComboBox;
                vm.meta.comboBoxMeta = this.control;
                vm.meta.comboBoxSetting = this.setting;
                vm.displayField = this.setting.DisplayMember;
                vm.field = this.setting.ValueMember;
                this.control_vm = vm;
                this.page_vm.nameToControlViewModel.set(this.control.Name, vm);
                if (this.page_vm.dataViewHub.DataViewUidMap.has(this.setting.DataViewUid)) {
                    dataView = this.page_vm.dataViewHub.DataViewUidMap.get(this.setting.DataViewUid);
                    vm.meta.dataViewMeta.DataView = dataView;
                }

                if (vm.meta.dataViewMeta.DataView != null) {
                    if (this.page_vm.dataViewHub.DataViewFieldsMap.has(vm.meta.dataViewMeta.DataView.Uid)) {
                        dataViewFields = this.page_vm.dataViewHub.DataViewFieldsMap.get(vm.meta.dataViewMeta.DataView.Uid);
                        vm.meta.dataViewMeta.DataViewFields = dataViewFields;
                    }
                }

                await vm.Refresh();
                break;
            default:
                this.$dialog.alert({
                    title: '提示',
                    message: `控件-["${this.control.Name}"]:暂不支持的控件类型:[${this.control.ControlType}]`,
                })
                return;
        }
        this.isReady = true;
    },
    methods: {
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
                        options: this.control_vm.attachData.get(this.getFullNameInDataGrid(field)),
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
        }
    },
}
</script>

<style lang="scss" scoped>
.dynamic-control {}
</style>