import general from "@/api/general";
import { Query } from "../query";
import { DataViewMeta } from "./data-grid-vm";
import { ControlCore, MetaGroup } from "./control-view-model";

const DefaultDisplayField: string = 'title';
const DefaultValueField: string = 'value';

class ComboBoxMeta implements MetaGroup {
    controlMeta: any | undefined;
    controlSetting: any | undefined;
    dataViewMeta: DataViewMeta = new DataViewMeta();
}

export class ComboBoxCore implements ControlCore {
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
    text: string | undefined;

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

    async GetSingleItemByDisplayText(text: any): Promise<any> {

        var dataView = this.meta.dataViewMeta.DataView as any;
        var query = new Query();
        query.TableName = dataView.TableName as string;
        query.ShortName = dataView.TableShortName;
        query.Select = dataView.Select;
        if (dataView.Where != null) {
            query.AddWhere(dataView.Where);
        }
        query.AddWhere(`${dataView.TableShortName}.${this.displayField} = '${text}'`);
        query.Order = dataView.OrderBy;
        query.GroupBy = dataView.GroupBy;
        query.Having = dataView.Having;
        var pack = (await general.getDataEx(query) as any);
        if (pack.Data.length > 0) {
            return {
                data: pack.Data[0],
                value: pack.Data[0][this.field],
            };
        }
        return null;
    }

    getPlaceholder() {
        return this.isMultiSelect ? '{v-list}' : '{v}';
    }
}