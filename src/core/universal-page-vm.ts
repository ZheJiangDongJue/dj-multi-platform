import { ControlType } from "./enums/system/controlType";
import { DataViewHub, SettingHub } from "./loader-hub";

interface ControlViewModel {
    type: ControlType;
}

class UniversalPageMetaInfo {
    views: Array<Object> = [];
    controls: Array<Object> = [];
    viewControls: Map<Number, Array<Object>> | undefined;
}

class UniversalPageViewModel {
    name: string | undefined;
    metaInfo: UniversalPageMetaInfo = new UniversalPageMetaInfo();
    settingHub: SettingHub = new SettingHub();
    dataViewHub: DataViewHub = new DataViewHub();
    // nameToViewElementMap: Map<string, Object> = new Map;
    // nameToControlElementMap: Map<string, Object> = new Map;
    nameToControlViewModel: Map<string, ControlViewModel> = new Map;

    getControlVM(key: string): Object | undefined {
        return this.nameToControlViewModel.get(key);
    }
}

export default UniversalPageViewModel;