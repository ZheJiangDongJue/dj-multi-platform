import general from "@/api/general";
import { Query } from "../query";
import { DataViewMeta } from "./data-grid-vm";
import { ControlType } from "../enums/system/controlType";

const DefaultDisplayField: string = 'title';
const DefaultValueField: string = 'value';

class ComboBoxMeta {
    comboBoxMeta: any | undefined;
    comboBoxSetting: any | undefined;
    dataViewMeta: DataViewMeta = new DataViewMeta();
}

export class ComboBoxViewModel {
    type: ControlType | undefined;
    meta: ComboBoxMeta = new ComboBoxMeta();
    data: any = {};
    selectedItem: any | undefined;
    selectedItems: Array<any> = [];
    /*
        普通单选Box:当前选中项的field字段;
        普通多选Box:选中项列表的field字段数组;
        枚举单选Box:枚举值;
        枚举多选Box:枚举值合计;
    */
    editValue: any | undefined;
    isMultiSelect: boolean = false;
    field: string = DefaultValueField;
    displayField: string = DefaultDisplayField;

    //根据Setting和.Fields构建查询
    async Refresh(): Promise<void> {
        var dataView = this.meta.dataViewMeta.DataView as any;
        var query = new Query();
        query.TableName = dataView.TableName as string;
        query.ShortName = dataView.TableShortName;
        query.Select = dataView.Select;
        if (dataView.Where != null) {
            query.AddWhere(dataView.Where);
        }
        query.Order = dataView.OrderBy;
        query.GroupBy = dataView.GroupBy;
        query.Having = dataView.Having;
        // console.log(general);
        var pack = (await general.getDataEx(query) as any);
        this.data = pack.Data;
    }

    getPlaceholder() {
        return this.isMultiSelect ? '{v-list}' : '{v}';
    }
}