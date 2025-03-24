import general from "@/api/general";
import { ControlType } from "../enums/system/controlType";
import { DataFieldMode } from "../enums/system/dataFieldMode";
import { Query } from "@/core/query";
import UniversalPageViewModel from "../universal-page-vm";
import { ComboBoxCore } from "./select-vm";
import { DataGetterEffectPack, DataGetterPack } from "../data-getter-pack";
import { ControlViewModel } from "./control-view-model";

const DefaultTitle: string = '未定义字段名';
const empty: string = '';
const DefaultWidth: number = 200;

interface DataGridFieldOptions {
    title: string;
    field?: string;
    type?: ControlType; // 可选参数
    mode: DataFieldMode;
    width?: Number;
    meta: any;
}

export class DataGridField {
    title: string = DefaultTitle;
    field?: string = empty;
    type?: ControlType = ControlType.TextBlock;
    mode: DataFieldMode = DataFieldMode.None;
    width: Number;
    meta: any;

    constructor(option: DataGridFieldOptions) {
        this.title = option.title;
        this.field = option.field;
        this.type = option.type;
        this.mode = option.mode;
        this.width = option.width ? option.width : DefaultWidth;
        this.meta = option.meta;
    }
}

export class DataViewMeta {
    DataView: any | undefined;
    DataViewFields: any | undefined;
    setting: any | undefined;
}

export class DataGridCore {
    meta: DataViewMeta = new DataViewMeta();
    fields: Array<DataGridField> = [];
    data: Array<any> = [];
    attachData: Map<String, any> = new Map;
    page_vm: UniversalPageViewModel | undefined;
    dataGridAttach: any | undefined;

    async Refresh(): Promise<void> {
        await this.Filter();
    }

    //根据Setting和.Fields构建查询
    async Filter(attachWhere?: string): Promise<void> {

        // var setting = this.meta.DataView;
        // var query = new Query();
        // query.TableName = setting.TableName;
        // query.ShortName = setting.TableShortName;
        // query.Select = setting.Select;
        // if (setting.Where != null) {
        //     query.AddWhere(setting.Where);
        // }
        // query.Order = setting.OrderBy;
        // query.GroupBy = setting.GroupBy;
        // query.Having = setting.Having;
        // var pack = (await general.getDataEx(query) as any);
        // this.data = pack.Data;

        if (this.page_vm == undefined) {
            return;
        }
        var pack = new DataGetterPack();
        var array = Array.from(this.page_vm.nameToControlViewModel.keys());

        for (let index = 0; index < array.length; index++) {
            const key = array[index];
            var vm = this.page_vm.nameToControlViewModel.get(key);
            if (vm != null) {
                if (vm.type == ControlType.ComboBox) {
                    var _vm = vm as ControlViewModel;
                    var _core = _vm.core as ComboBoxCore;
                    var tableName = _core.meta.controlMeta.AttachTable;
                    var shortName = _core.meta.controlMeta.AttachShortName;
                    var joinType = _core.meta.controlMeta.AttachJoinType;
                    var joinOn = _core.meta.controlMeta.AttachJoin;
                    var where = _core.meta.controlMeta.AttachWhere;
                    var effectPack = new DataGetterEffectPack();
                    effectPack.Key = _core.getPlaceholder();
                    effectPack.Value = _core.editValue;
                    effectPack.AttachWhere = where;
                    effectPack.AttachJoinInfo.JoinType = joinType;
                    effectPack.AttachJoinInfo.TableName = tableName;
                    effectPack.AttachJoinInfo.ShortName = shortName;
                    effectPack.AttachJoinInfo.On = joinOn;
                    pack.EffectPack.push(effectPack)
                }
            }
        }

        if (attachWhere != null) {
            pack.AttachWhere["main"] = attachWhere;
        }

        var result = (await general.getDataUseDataView(this.meta.DataView.Uid, pack)) as any;
        var data = result.Data;
        console.log("过滤结果", data);
        this.data = data;
    }
}