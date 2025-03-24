import sysapi from '@/api/system-data';
import Vue from 'vue';

type CommandDelegate = (...args: any[]) => void | Promise<void>;
// type EventDelegate = (...args: any[]) => void;

export class PageBaseViewModel {

    /**页面名称 */
    name: string | undefined;

    /**显示名称 */
    displayName: string | undefined;
    commands: { [key: string]: CommandDelegate } = {};
    events: Map<string, Function[]> = new Map();;

    constructor() {
        this.initCommand();
    }

    init() {
    }

    initCommand(): void {
        this.registerCommand("Refresh", (...args: any[]) => {
            console.log("Refresh", args);
        });
    }

    /**
     * 注册Command
     * 
     * @param name 名称
     * @param command 
     */
    registerCommand(name: string, command: CommandDelegate): void {
        this.commands[name] = command;
    }

    /**
     * 调用Command
     * 
     * @param name 名称
     * @param args 参数
     */
    raiseCommand(name: string, ...args: any[]) {
        if (this.commands[name]) {
            this.commands[name].apply(this, args);
        }
    }

    /**
     * 异步调用Command
     * 
     * @param name 名称
     * @param args 参数
     * @returns 
     */
    raiseCommandAsync(name: string, ...args: any[]): Promise<void> {
        if (this.commands[name]) {
            return this.commands[name].apply(this, args) as Promise<void>;
        }
        return Promise.resolve();
    }

    /**
     * 尝试调用Command
     * 
     * @param name 名称
     * @param args 参数
     * @returns 
     */
    tryRaiseCommandAsync(name: string, ...args: any[]): Promise<void> {
        if (this.commands[name]) {
            const command = this.commands[name];
            if (command instanceof Promise) {
                return command.apply(this, args) as Promise<void>;
            } else {
                command.apply(this, args);
            }
        }
        return Promise.resolve();
    }

    // 注册事件
    registerEvent(eventName: string, callback: Function) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName)?.push(callback);
    }

    // 移除事件
    unregisterEvent(eventName: string, callback?: Function) {
        if (!callback) {
            this.events.delete(eventName);
            return;
        }

        const callbacks = this.events.get(eventName);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // 触发事件
    triggerEvent(eventName: string, ...args: any[]) {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (e) {
                    console.error(`Event ${eventName} handler error:`, e);
                }
            });
        }
    }

    /**
     * 根据 C# 类型获取默认值
     * @param csharpType C# 类型枚举值
     * @param fieldName 字段名称
     * @returns 默认值
     */
    getDefaultValueByCSharpType(csharpType: number, fieldName: string): any {
        // 根据 CSharpType 枚举返回对应的默认值
        switch (csharpType) {
            case 0: // Byte
            case 1: // SByte
            case 2: // Short
            case 3: // UShort
            case 4: // Int
            case 5: // UInt
            case 6: // Long
            case 7: // ULong
                return 0;
            case 8: // Float
            case 9: // Double
            case 10: // Decimal
                return 0.0;
            case 11: // Bool
                return false;
            case 12: // Char
                return '';
            case 13: // String
                return '';
            case 14: // DateTime
                const date = new Date();
                const sqlDate = date.toISOString().slice(0, 19).replace('T', ' ');
                return sqlDate;
            case 15: // Bytes
                return null;
            default:
                return null;
        }
    }
}

export class DetailViewModel {
    tableName: string | undefined;
    columns: Array<Column> = [];
    details: Array<any> = Vue.observable([]);
    page_vm: PageBaseViewModel | undefined;
    dataView: { [key: string]: any } = {};
    dataViewFields: Array<any> = [];
    requiredFields: { [key: string]: string } = {}; // 必填字段键值对，key是字段名称，value是中文名称
    defaultValues: { [key: string]: any } = {}; // 字段默认值键值对，key是字段名称，value是默认值

    constructor(page_vm: PageBaseViewModel) {
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
                this.tryAddColumn(field.FieldName as string);
                if ((field.FieldMode & 1) != 0) {
                    // 根据 CSharpType 计算默认值
                    const defaultValue = this.page_vm!.getDefaultValueByCSharpType(field.CSharpType, field.FieldName);
                    // 存储默认值
                    this.defaultValues[field.FieldName] = defaultValue;
                }
            }
        }
    }

    async setDataView(dataViewUid: number) {
        this.dataView = (await sysapi.getSystemDataViewByUid(dataViewUid)) as any;
        this.dataViewFields = (await sysapi.getSystemDataViewFieldsByDataViewUid(dataViewUid)) as any;
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
     * @param row 行
     * @param field 字段
     * @param value 值
     * @returns 
     */
    setValue(row: any, field: string, value: any): void {
        // // 判断字段是否在列中
        // if (this.columns.findIndex(c => c.name == field) == -1) {
        //     console.log("字段" + field + "不在列中");
        //     return;
        // }
        //尝试添加字段
        this.tryAddColumn(field, true);
        // 当字段有效时更新行对象对应字段的值
        Vue.set(this.details[row], field, value);
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
        if (this.details.length === 0) {
            return { isValid: true, errorMessage: '' }; // 如果没有明细，则不需要验证
        }

        const invalidRows: Array<{ row: number, fields: Array<string> }> = [];

        // 遍历所有明细行
        for (let i = 0; i < this.details.length; i++) {
            const row = this.details[i];
            const missingFields: Array<string> = [];

            // 检查每个必填字段
            for (const field in this.requiredFields) {
                const value = row[field];
                if (value === null || value === undefined || value === '') {
                    missingFields.push(this.requiredFields[field]); // 使用中文名称
                }
            }

            if (missingFields.length > 0) {
                invalidRows.push({ row: i + 1, fields: missingFields });
            }
        }

        if (invalidRows.length > 0) {
            // 构建错误消息
            let errorMessage = '明细表存在必填项未填写:\n';
            invalidRows.forEach(item => {
                errorMessage += `第${item.row}行: ${item.fields.join(', ')}\n`;
            });

            return {
                isValid: false,
                errorMessage: errorMessage
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

export class Column {
    name!: string;
    isVirtual!: boolean;

    /**
     * 
     * @param name 字段名
     * @param isVirtual 是虚拟字段
     */
    constructor(name: string, isVirtual = false) {
        this.name = name;
        this.isVirtual = isVirtual;
    }
}