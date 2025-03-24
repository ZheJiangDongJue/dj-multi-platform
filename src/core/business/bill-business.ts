import { DataGridCore } from "../control-vm/data-grid-vm";
import { TemplateListViewCore } from "../control-vm/template-list-view-core";
import { DataGetterEffectPack } from "../data-getter-pack";
import { ControlType } from "../enums/system/controlType";
import { SpecialFieldType } from "../enums/system/specialFieldType";
import UniversalPageViewModel from "../universal-page-vm";
import { BusinessBase } from "./business-base";

export class BillData {
    typeName: string | undefined;
    typeCNName: string | undefined;
    fieldNames: string[] | undefined;
    data: { [key: string]: any } = {};
}

export class BillBusiness implements BusinessBase {
    page_vm: UniversalPageViewModel | undefined;
    billData: BillData = new BillData();
    detailData: any | undefined;

    constructor(page_vm: UniversalPageViewModel) {
        this.page_vm = page_vm;
    }

    setup(): void {

        this.NewBill();
    }

    async NewBill(): Promise<void> {
        this.billData = new BillData();

        this.detailData?.Filter("1=0")
    }

    async OpenBill(billid: Number): Promise<void> {

        if (this.page_vm != undefined) {
            var array = Array.from(this.page_vm.nameToControlViewModel.keys());

            for (let index = 0; index < array.length; index++) {
                const key = array[index];
                var vm = this.page_vm.nameToControlViewModel.get(key);
                if (vm != null) {
                    if (vm.type == ControlType.DataGrid) {
                        let core = vm.core as DataGridCore;
                        console.log("输出core:", core);
                        if (core.dataGridAttach == undefined) {
                            if (core.dataGridAttach.DataGridFeature == 1) {
                                //一级明细
                                this.detailData = core;
                            }
                        }
                    }
                    else if (vm.type == ControlType.TemplateListView) {
                        let core = vm.core as TemplateListViewCore;
                        this.detailData = core;
                    }
                }
            }
        }

        if (this.billData.typeName != null) {

            let type = this.page_vm?.rootDataGroup.TypeByTableName[this.billData.typeName];
            let fields = this.page_vm?.rootDataGroup.TypeFields[type.Uid];
            if (fields != null) {
                // let createTimeFieldNames = this.page_vm?.rootDataGroup.SpecialFields[SpecialFieldType.CreateTime];
                let deleteTagFieldNames = this.page_vm?.rootDataGroup.SpecialFields[SpecialFieldType.DeleteTag];
                let statusFieldNames = this.page_vm?.rootDataGroup.SpecialFields[SpecialFieldType.Status];

                let deleteTagFieldName = null;
                for (const key in deleteTagFieldNames) {
                    if (Object.prototype.hasOwnProperty.call(deleteTagFieldNames, key)) {
                        const element = deleteTagFieldNames[key];
                        fields.hasOwnProperty(element);
                        if (fields[element] != undefined) {
                            deleteTagFieldName = element;
                        }
                    }
                }

                let statusFieldName = null;
                for (const key in statusFieldNames) {
                    if (Object.prototype.hasOwnProperty.call(statusFieldNames, key)) {
                        const element = statusFieldNames[key];
                        fields.hasOwnProperty(element);
                        if (fields[element] != undefined) {
                            statusFieldName = element;
                        }
                    }
                }

                //TODO:还没好
            }
        }

        console.log("打开单据:" + billid);

        let attachWhere = `${this.detailData?.dataView.TableShortName}.ParentTypeid = ${billid}`;
        this.detailData?.Filter(attachWhere)
    }
}