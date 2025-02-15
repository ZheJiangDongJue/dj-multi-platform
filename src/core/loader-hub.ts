import arrayToSqlInString from "@/utils/sql_helper";
import { ControlType } from "./enums/system/controlType";
import { JoinType, Query } from "./query";
import general from "@/api/general";
import { EnumHub } from "./enums/enum-hub";

export class SettingLoader {
    IsLoaded: boolean = false;
    ControlType: ControlType;
    SettingUidList: Array<Number> = [];
    SettingUidMap: Map<Number, any> = new Map;
    Settings: Array<any> = [];

    constructor(type: ControlType) {
        this.ControlType = type;
    }

    async Load() {
        switch (this.ControlType) {
            case ControlType.Button:

                var query = new Query();
                query.TableName = "SystemSettingForButton";
                query.ShortName = "ssfb";
                query.AddWhere(`ssfb.Uid in (${arrayToSqlInString(this.SettingUidList)}) and ssfb.IsDeleted = 0`);
                var pack = (await general.getDataEx(query)) as any;
                var settings = pack.Data;

                for (let index = 0; index < settings.length; index++) {
                    const setting = settings[index];
                    this.SettingUidMap.set(setting.Uid, setting);
                    this.Settings.push(setting);
                }
                console.log('Button-Settings', this.Settings);

                // var arr = Array.from(this.SettingUidMap.keys());
                // console.log("arr", arr);
                this.IsLoaded = true;
                break;

            case ControlType.DataGrid:

                var query = new Query();
                query.TableName = "SystemSettingForDataGrid";
                query.ShortName = "ssfdg";
                query.AddWhere(`ssfdg.Uid in (${arrayToSqlInString(this.SettingUidList)}) and ssfdg.IsDeleted = 0`);
                var pack = (await general.getDataEx(query)) as any;
                var settings = pack.Data;

                for (let index = 0; index < settings.length; index++) {
                    const setting = settings[index];
                    this.SettingUidMap.set(setting.Uid, setting);
                    this.Settings.push(setting);
                }
                console.log('DataGrid-Settings', this.Settings);

                // var arr = Array.from(this.SettingUidMap.keys());
                // console.log("arr", arr);
                this.IsLoaded = true;
                break;
            case ControlType.ComboBox:

                var query = new Query();
                query.TableName = "SystemSettingForComboBox";
                query.ShortName = "ssfcb";
                query.AddWhere(`ssfcb.Uid in (${arrayToSqlInString(this.SettingUidList)}) and ssfcb.IsDeleted = 0`);
                var pack = (await general.getDataEx(query)) as any;
                var settings = pack.Data;

                for (let index = 0; index < settings.length; index++) {
                    const setting = settings[index];
                    this.SettingUidMap.set(setting.Uid, setting);
                    this.Settings.push(setting);
                }
                console.log('ComboBox-Settings', this.Settings);
                this.IsLoaded = true;

                break;

            case ControlType.ComboBoxForEnum:

                var query = new Query();
                query.TableName = "SystemSettingForEnumComboBox";
                query.ShortName = "ssfecb";
                query.AddWhere(`ssfecb.Uid in (${arrayToSqlInString(this.SettingUidList)}) and ssfecb.IsDeleted = 0`);
                var pack = (await general.getDataEx(query)) as any;
                var settings = pack.Data;

                for (let index = 0; index < settings.length; index++) {
                    const setting = settings[index];
                    this.SettingUidMap.set(setting.Uid, setting);
                    this.Settings.push(setting);
                }
                console.log('EnumComboBox-Settings', this.Settings);

                // 两种获取途径,前期没办法,只能从前端预设里获取;后期,新框架功能上传后可以直接从SystemDictionary获取

                //现在先在前端预设获取
                var agent = EnumHub.getInstance().EnumClassNameMap.get("PageMode");
                if (agent != null) {
                    // agent.Data
                }

                this.IsLoaded = true;

                break;
            default:
                console.log(`啊`);
                break;
        }
    }
}

export class SettingHub {
    Loaders: Array<SettingLoader> = [];
    TypeLoaderMap: Map<ControlType, SettingLoader> = new Map;

    AddControl(controlType: ControlType, settingUid: Number) {
        if (settingUid == 0) {
            return;
        }
        // var log = (console as any).log_;
        if (!this.TypeLoaderMap.has(controlType)) {
            var info = new SettingLoader(controlType);
            this.Loaders.push(info);
            this.TypeLoaderMap.set(controlType, info);
        }
        var loaderInfo = this.TypeLoaderMap.get(controlType);
        if (loaderInfo != null) {
            loaderInfo.SettingUidList.push(settingUid)
        }
    }
}


export class DataViewHub {
    IsLoaded: boolean = false;
    DataViewUidList: Array<Number> = [];
    DataViews: Array<any> = [];
    DataViewUidMap: Map<Number, any> = new Map;
    DataViewFieldsMap: Map<Number, Array<any>> = new Map;//DataViewUid->Fields

    AddDataView(uid: Number) {
        // -1 就是没找到,就加入进去
        if (this.DataViewUidList.indexOf(uid) === -1) {
            this.DataViewUidList.push(uid);
        }
    }

    async LoadAll() {

        var query = new Query();
        query.TableName = "SystemDataView";
        query.ShortName = "ssdv";
        query.AddWhere(`ssdv.Uid in (${arrayToSqlInString(this.DataViewUidList)}) and ssdv.IsDeleted = 0`);
        var pack = (await general.getDataEx(query)) as any;
        var dataViews = pack.Data;
        console.log("dataViews", dataViews);

        for (let index = 0; index < dataViews.length; index++) {
            const dataView = dataViews[index];
            this.DataViewUidMap.set(dataView.Uid, dataView);
            this.DataViews.push(dataView);
        }

        query = new Query();
        query.TableName = "SystemDataViewField";
        query.ShortName = "ssdvf";
        query.AddWhere(`ssdvf.DataViewUid in (${arrayToSqlInString(this.DataViewUidList)}) and ssdvf.IsDeleted = 0`);
        var pack = (await general.getDataEx(query)) as any;
        var dataViewFields = pack.Data;
        for (let index = 0; index < dataViewFields.length; index++) {
            const field = dataViewFields[index];
            var key = field.DataViewUid;
            if (!this.DataViewFieldsMap.has(field.DataViewUid)) {
                this.DataViewFieldsMap.set(key, []);
            }
            var arr = this.DataViewFieldsMap.get(key);
            arr?.push(field);
        }

        this.IsLoaded = true;
    }
}