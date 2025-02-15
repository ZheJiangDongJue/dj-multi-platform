// import { PageMode } from './business/pageMode';
import { EnumHub } from './enum-hub';


var enumHub = EnumHub.getInstance();

if (!enumHub.IsInit) {
    // 注册枚举
    // enumHub.registerEnum(PageMode, "PageMode");
    enumHub.IsInit = true;
}