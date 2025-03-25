import Vue from "vue";
import { Column, DetailViewModel, PageBaseViewModel } from "./page-base-vm";
import billapi from '@/api/bill';
import generalapi from '@/api/general';
import sysapi from '@/api/system-data';
import { methodMixin } from '@/mixins';
import store from '@/store' //仓库
import { DataGetterPack } from "../data-getter-pack";
// import { Toast } from 'vant';

// 定义一个使用混入对象的组件
var myComponent = Vue.extend({
    store,
    mixins: [methodMixin]
})
var context = new myComponent()

class BillData {
    tableName!: string;
    columns: Array<Column> = [];
    data: { [key: string]: any } = Vue.observable({});
    page_vm: BillPageViewModel | undefined;
    requiredFields: { [key: string]: string } = {}; // 必填字段键值对，key是字段名称，value是中文名称
    defaultValues: { [key: string]: any } = {}; // 字段默认值键值对，key是字段名称，value是默认值

    constructor(page_vm: BillPageViewModel) {
        this.page_vm = page_vm;
    }

    //设置表名,并根据表名获取字段
    async setTableName(tableName: string): Promise<void> {
        this.tableName = tableName;
        let type = await sysapi.getSystemTypeByTableName(tableName) as any;
        let fields = await sysapi.getSystemFieldsBySystemTypeUid(type.Uid) as any;
        for (const key in fields) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) { // 过滤掉原型链上的属性
                const field = fields[key];
                if ((field.FieldMode & 1) != 0) {
                    // 根据 CSharpType 计算默认值
                    const defaultValue = this.page_vm!.getDefaultValueByCSharpType(field.CSharpType, field.FieldName);
                    // 存储默认值
                    this.defaultValues[field.FieldName] = defaultValue;
                }
                this.tryAddColumn(field.FieldName as string);
            }
        }
    }

    /**
     * 尝试添加字段
     * @param columnName 字段名
     * @param isVirtual 是虚拟字段
     */
    tryAddColumn(columnName: string, isVirtual: boolean = false) {
        if (this.columns.findIndex(c => c.name == columnName) == -1) {
            this.columns.push(new Column(columnName, isVirtual));
        }
    }

    /**
     * 设置值
     * @param field 字段
     * @param value 值
     * @returns 
     */
    setValue(field: string, value: any): void {
        // // 判断字段是否在列中
        // if (this.columns.findIndex(c => c.name == field) == -1) {
        //     console.log("字段" + field + "不在列中");
        //     return;
        // }
        //尝试添加字段
        this.tryAddColumn(field, true);
        // 当字段有效时更新行对象对应字段的值
        Vue.set(this.data, field, value);
    }

    /**
     * 设置必填字段
     * @param fields 必填字段键值对，key是字段名称，value是中文名称
     */
    setRequiredFields(fields: { [key: string]: string }): void {
        this.requiredFields = fields;
    }

    /**
     * 验证必填项
     * @returns 验证结果，包含是否通过和错误信息
     */
    validateRequired(): { isValid: boolean, errorMessage: string } {
        const missingFields: Array<string> = [];

        for (const field in this.requiredFields) {
            const value = this.data[field];
            if (value === null || value === undefined || value === '') {
                missingFields.push(this.requiredFields[field]); // 使用中文名称
            }
        }

        if (missingFields.length > 0) {
            return {
                isValid: false,
                errorMessage: `单据头缺少必填字段: ${missingFields.join(', ')}`
            };
        }

        return { isValid: true, errorMessage: '' };
    }

    /**
     * 获取字段的默认值
     * @param fieldName 字段名称
     * @returns 默认值，如果字段不存在则返回 null
     */
    getDefaultValue(fieldName: string): any {
        return this.defaultValues[fieldName] !== undefined ? this.defaultValues[fieldName] : null;
    }
}

export class BillPageViewModel extends PageBaseViewModel {
    billData: BillData | undefined;
    detail_vm: DetailViewModel | undefined;
    isReady: boolean = false;
    billRequiredFields: { [key: string]: string } = {}; // 单据头必填字段键值对
    detailRequiredFields: { [key: string]: string } = {}; // 明细必填字段键值对
    isOpeningBill: boolean = false;

    async init() {
        await super.init();
        let billData = new BillData(this);
        let detail_vm = new DetailViewModel(this);
        Vue.set(this, "billData", Vue.observable(billData));
        Vue.set(this, "detail_vm", Vue.observable(detail_vm));

        // 触发初始化完成事件
        this.triggerEvent('InitCompleted', this);
    }

    initCommand(): void {
        super.initCommand();

        this.registerCommand("OpenPreviousBill", async (...args: any[]) => {
            console.log("OpenPreviousBill", args);
            if (this.billData) {
                let id = this.billData.data.id ?? 0;
                let pack = await billapi.getPreviousBillid(this.billData.tableName, id) as any;
                if (pack.Status == 200) {
                    let billid = pack.Data;
                    await this.openBill(billid);
                }
                else {
                    context.$dialog.alert({
                        title: '提示',
                        message: pack.Message,
                    })
                }
            }
        });
        this.registerCommand("OpenNextBill", async (...args: any[]) => {
            console.log("OpenNextBill", args);
            if (this.billData) {
                let id = this.billData.data.id ?? 0;
                let pack = await billapi.getNextBillid(this.billData.tableName, id) as any;
                if (pack.Status == 200) {
                    let billid = pack.Data;
                    await this.openBill(billid);
                }
                else {
                    context.$dialog.alert({
                        title: '提示',
                        message: pack.Message,
                    })
                }
            }
        });
        this.registerCommand("NewBill", async (...args: any[]) => {
            console.log("NewBill", args);
            await this.newBill();
        });
        this.registerCommand("RefreshBill", (...args: any[]) => {
            console.log("RefreshBill", args);
            this.reopenBill();
        });
        this.registerCommand("SaveBill", async (...args: any[]) => {
            console.log("SaveBill", args);
            const result = await this.saveBill(true); // 显示成功提示
            if (result.success && result.id) {
                await this.openBill(result.id);
            }
        });
        this.registerCommand("DeleteBill", async (...args: any[]) => {
            console.log("DeleteBill", args);
            if (this.billData) {
                const result = await billapi.generalBillDelete(this.billData.tableName, this.billData.data.id);
                if (result.IsSuccess) {
                    context.$dialog.alert({
                        title: '提示',
                        message: "删除成功",
                    })
                    await this.newBill();
                }
                else {
                    context.$dialog.alert({
                        title: '提示',
                        message: result.ErrorMessage,
                    })
                }
            }
        });
        this.registerCommand("ApprovalBill", async (...args: any[]) => {
            console.log("ApprovalBill", args);
            if (this.billData) {
                console.log(this.billData.data.id, this.billData.tableName);

                // 先保存单据，再审批
                const saveResult = await this.saveBill(false); // 不显示成功提示
                if (!saveResult.success) {
                    context.$dialog.alert({
                        title: '提示',
                        message: saveResult.message,
                    })
                    return; // 如果保存失败，直接返回，不执行审批
                }

                // 执行审批
                let pack = await billapi.generalBillApproval(this.billData.tableName, this.billData.data.id, true);
                if (pack.Status == 200) {
                    context.$dialog.alert({
                        title: '提示',
                        message: "审批成功",
                    })
                    await this.reopenBill();
                }
                else {
                    context.$dialog.alert({
                        title: '提示',
                        message: "保存成功,但审批失败:" + pack.Message,
                    })
                }
            }
        });
        this.registerCommand("ReverseApprovalBill", async (...args: any[]) => {
            console.log("ReverseApprovalBill", args);
            if (this.billData) {
                // 执行反审批
                let pack = await billapi.generalBillApproval(this.billData.tableName, this.billData.data.id, false);
                if (pack.Status == 200) {
                    context.$dialog.alert({
                        title: '提示',
                        message: "反审批成功",
                    })
                    await this.reopenBill();
                }
                else {
                    context.$dialog.alert({
                        title: '提示',
                        message: pack.Message,
                    })
                }
            }
        });
        this.registerCommand("FinishBill", (...args: any[]) => {
            console.log("FinishBill", args);
        });
        this.registerCommand("ReverseFinishBill", (...args: any[]) => {
            console.log("ReverseFinishBill", args);
        });
    }

    /**
     * 设置表名,同时设置单据头和明细的表名
     * 
     * @param tableName 表名
     */
    async setTableName(billTableName: string, detailTableName: string): Promise<void> {
        await this.billData?.setTableName(billTableName);
        await this.detail_vm?.setTableName(detailTableName);
    }

    /**
     * 设置必填字段
     * @param billRequiredFields 单据头必填字段键值对，key是字段名称，value是中文名称
     * @param detailRequiredFields 明细必填字段键值对，key是字段名称，value是中文名称
     */
    setRequiredFields(billRequiredFields: { [key: string]: string }, detailRequiredFields: { [key: string]: string }): void {
        this.billRequiredFields = billRequiredFields;
        this.detailRequiredFields = detailRequiredFields;

        // 如果已经初始化，则直接设置
        if (this.billRequiredFields && Object.keys(this.billRequiredFields).length > 0 && this.billData) {
            this.billData.setRequiredFields(this.billRequiredFields);
        }

        if (this.detailRequiredFields && Object.keys(this.detailRequiredFields).length > 0 && this.detail_vm) {
            this.detail_vm.setRequiredFields(this.detailRequiredFields);
        }
    }

    async newBill() {
        //使用columns设置初始数据
        if (this.billData) {
            let uid = await generalapi.getNewUid();
            Vue.set(this.billData!.data, "Uid", uid);
            this.billData.columns.forEach(async column => {
                // 使用默认值（如果存在）
                const defaultValue = this.billData!.defaultValues[column.name] !== undefined
                    ? this.billData!.defaultValues[column.name]
                    : null;
                Vue.set(this.billData!.data, column.name, defaultValue);
            });
        }
        if (this.detail_vm) {
            Vue.set(this.detail_vm, 'details', Vue.observable([]));
        }
    }

    /**
     * 打开单据
     * @param id 单据id
     */
    async openBill(id: number) {
        // 设置一个标志，表示正在打开单据
        this.isOpeningBill = true;
        // 触发单据打开前事件
        this.triggerEvent('BeforeOpenBill', this);

        if (this.billData) {
            await this.newBill();//清理一下因为不清理的话watch到的值如果没有变动的话不会触发一些事件
            var pack = (await generalapi.getDataUseid(this.billData.tableName, id)) as any;
            for (const key in pack.Data) {
                if (Object.prototype.hasOwnProperty.call(pack.Data, key)) {
                    const element = pack.Data[key];
                    Vue.set(this.billData.data, key, element);
                }
            }

            var dgpack = new DataGetterPack();
            dgpack.AttachWhere["main"] = `ParentTypeid = ${id}`;
            let pack1 = (await generalapi.getDataUseDataView(this.detail_vm?.dataView.Uid, dgpack)) as any;
            let data1 = Vue.observable(pack1.Data);
            Vue.set(this.detail_vm as object, "details", data1);

            // 触发单据打开后事件
            this.triggerEvent('AfterOpenBill', this);
        }
        this.isOpeningBill = false;
    }

    /**
     * 重新打开单据
     */
    async reopenBill() {
        if (this.billData) {
            var id = this.billData.data.id;
            await this.openBill(id);
        }
    }

    /**
     * 保存单据
     * @param showSuccessMsg 是否显示保存成功提示
     * @returns 保存结果，包含成功状态和单据ID
     */
    async saveBill(showSuccessMsg: boolean = true): Promise<{ success: boolean, id?: number, message?: string }> {
        if (!this.billData) {
            return { success: false, message: "单据数据不存在" };
        }

        try {
            // 验证单据头必填项
            const billValidation = this.billData.validateRequired();
            if (!billValidation.isValid) {
                context.$dialog.alert({
                    title: '验证失败',
                    message: billValidation.errorMessage,
                });
                return { success: false, message: billValidation.errorMessage };
            }

            // 验证明细必填项
            if (this.detail_vm) {
                const detailValidation = this.detail_vm.validateRequired();
                if (!detailValidation.isValid) {
                    context.$dialog.alert({
                        title: '验证失败',
                        message: detailValidation.errorMessage,
                    });
                    return { success: false, message: detailValidation.errorMessage };
                }
            }
            let uid = await generalapi.getNewUid();
            Vue.set(this.billData!.data, "Uid", uid);

            // 调用保存API
            let pack = await billapi.generalBillSave(this.billData.tableName, this.billData.data, this.detail_vm?.details ?? []);
            if (pack.IsSuccess) {
                if (showSuccessMsg) {
                    context.$dialog.alert({
                        title: '提示',
                        message: "保存成功",
                    });
                }

                // 获取id（如果是新建的单据）
                let id = this.billData.data.id;
                if (!id) {
                    id = await generalapi.getIdByUid(this.billData.tableName, this.billData.data.Uid);
                    Vue.set(this.billData.data, "id", id);
                    console.log("保存成功，id为：" + id);
                }

                return { success: true, id };
            } else {
                context.$dialog.alert({
                    title: '提示',
                    message: pack.ErrorMessage,
                });
                return { success: false, message: pack.ErrorMessage };
            }
        } catch (error: any) {
            const errorMessage = "保存失败：" + (error.message || "未知错误");
            context.$dialog.alert({
                title: '提示',
                message: errorMessage,
            });
            return { success: false, message: errorMessage };
        }
    }
}