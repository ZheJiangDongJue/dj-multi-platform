import { BillBusiness } from "./business/bill-business";
import { BusinessBase } from "./business/business-base";
import { UniversalBusiness } from "./business/universal-business";
import { ControlViewModel } from "./control-vm/control-view-model";
import { DataGroup } from "./data-group";
import { DataViewHub, SettingHub } from "./loader-hub";

class UniversalPageMetaInfo {
    pageMeta: any;
    views: Array<Object> = [];//页面内所有视图
    controls: Array<Object> = [];//页面内所有控件
    viewControls: Map<Number, Array<Object>> | undefined;//某个视图Uid的所有控件
}

class UniversalPageViewModel {
    name: string | undefined;
    metaInfo: UniversalPageMetaInfo = new UniversalPageMetaInfo();
    rootDataGroup: DataGroup = new DataGroup();
    settingHub: SettingHub = new SettingHub();
    dataViewHub: DataViewHub = new DataViewHub();
    // nameToViewElementMap: Map<string, Object> = new Map;
    // nameToControlElementMap: Map<string, Object> = new Map;
    nameToControlViewModel: Map<string, ControlViewModel> = new Map;
    business: BusinessBase | undefined;

    init(): void {
        var key = this.metaInfo.pageMeta.BusinessCoreKey;
        if (key == "通常单类型") {
            this.business = new UniversalBusiness(this);
        }
        else if (key == "单据类型") {
            var business = new BillBusiness(this);
            this.business = business;
        }
        console.log("business初始化");
    }

    getControlVM(key: string): Object | undefined {
        return this.nameToControlViewModel.get(key);
    }
}

export default UniversalPageViewModel;