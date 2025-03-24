import { ControlType } from "../enums/system/controlType";

export interface MetaGroup{
    controlMeta: any | undefined;
    controlSetting: any | undefined;
}

export interface ControlCore {
    meta: MetaGroup | undefined;
}

export class ControlViewModel {
    type: ControlType | undefined;//控件类型
    core: any | undefined;//使用的核心
}