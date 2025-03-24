import { DataGetterEffectPack, DataGetterPack } from "../data-getter-pack";
import { ControlType } from "../enums/system/controlType";
import UniversalPageViewModel from "../universal-page-vm";
import { ControlViewModel } from "./control-view-model";
import general from '@/api/general';
import { ComboBoxCore } from "./select-vm";

export class TemplateListViewCore {
    controlMeta: any | undefined;
    controlSetting: any | undefined;
    dataView: any | undefined;
    page_vm: UniversalPageViewModel | undefined;
    data: {} = {};


    async Refresh(): Promise<void> {
        await this.Filter();
    }

    //根据Setting和.Fields构建查询
    async Filter(attachWhere?: string): Promise<void> {

        console.log("Filter");
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

        var result = (await general.getDataUseDataView(this.controlSetting.DataViewUid, pack)) as any;
        var data = result.Data;
        console.log("过滤结果", data);
        this.data = data;
    }
}