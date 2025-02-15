class EnumData {
    key: String | undefined;
    value: Number = 0;

    constructor(k: String, v: Number) {
        this.key = k;
        this.value = v;
    }
}

class EnumAgent {
    KVMap: Map<String, Number> = new Map;
    VKMap: Map<Number, String> = new Map;
    Data: Array<EnumData> = [];

    constructor(enumObj: any) {
        for (const key in enumObj) {
            if (typeof enumObj[key] === 'number') {
                this.KVMap.set(key, enumObj[key]);
                this.VKMap.set(enumObj[key], key);
                this.Data.push(new EnumData(key, enumObj[key]));
            }
        }
    }
}

export class EnumHub {
    private static instance: EnumHub | null = null;
    EnumClassNameMap: Map<String, EnumAgent> = new Map;
    IsInit: boolean = false;

    private constructor() { } // 私有构造函数，防止外部实例化

    static getInstance(): EnumHub {
        if (!EnumHub.instance) {
            EnumHub.instance = new EnumHub();
        }
        return EnumHub.instance;
    }
    registerEnum(enumObj: any, enumName: string) {
        this.EnumClassNameMap.set(enumName, new EnumAgent(enumObj));
    }
}