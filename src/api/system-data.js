import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
const context = getGlobalContext();

/*
*/

const Api = {
    GetDataGroup: () => api_helper.get('/systemdataapi/getdatagroup', { dbName: context.dbName }),
    GetSystemPageByPageName: (pageName) => api_helper.get('/systemdataapi/getsystempagebypagename', { dbName: context.dbName, pageName }),
    GetSystemViewInPage: (pageUid) => api_helper.get('/systemdataapi/getsystemviewinpage', { dbName: context.dbName, pageUid }),
    GetSystemControlInViews: (viewUids) => api_helper.get('/systemdataapi/getsystemcontrolinviews', { dbName: context.dbName, viewUids: JSON.stringify(viewUids) }),
    GetSystemSettingForButtonByControls: (controlUids) => api_helper.get('/systemdataapi/getsystemsettingforbuttonbycontrols', { dbName: context.dbName, controlUids: JSON.stringify(controlUids) }),
    GetSystemSettingForDataGridByControls: (controlUids) => api_helper.get('/systemdataapi/getsystemsettingfordatagridbycontrols', { dbName: context.dbName, controlUids: JSON.stringify(controlUids) }),
    GetSystemDataViewFieldsByDataViews: (dataViewUids) => api_helper.get('/systemdataapi/getsystemdataviewfieldsbydataviews', { dbName: context.dbName, dataViewUids: JSON.stringify(dataViewUids) }),
    
    getSystemTypeByTableName: (tableName) => api_helper.get('/systemdataapi/getsystemtypebytablename', { dbName: context.dbName, tableName }),
    getSystemFieldsBySystemTypeUid: (systemTypeUid) => api_helper.get('/systemdataapi/getsystemfieldsbysystemtypeuid', { dbName: context.dbName, systemTypeUid }),
    getSystemSpecialFieldsByFieldSpecialType: (fieldSpecialType) => api_helper.get('/systemdataapi/getsystemspecialfieldsbyfieldspecialtype', { dbName: context.dbName, fieldSpecialType }),
    getSystemDataViewByUid: (dataViewUid) => api_helper.get('/systemdataapi/getsystemdataviewbyuid', { dbName: context.dbName, dataViewUid }),
    getSystemDataViewFieldsByDataViewUid: (dataViewUid) => api_helper.get('/systemdataapi/getsystemdataviewfieldsbydataviewuid', { dbName: context.dbName, dataViewUid }),
}

export default Api