import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
const context = getGlobalContext();

const Api = {
    GetSystemPageByPageName: (pageName) => api_helper.get('/systemdataapi/getsystempagebypagename', { dbName: context.dbName, pageName }),
    GetSystemViewInPage: (pageUid) => api_helper.get('/systemdataapi/getsystemviewinpage', { dbName: context.dbName, pageUid }),
    GetSystemControlInViews: (viewUids) => api_helper.get('/systemdataapi/getsystemcontrolinviews', { dbName: context.dbName, viewUids: JSON.stringify(viewUids) }),
    GetSystemSettingForButtonByControls: (controlUids) => api_helper.get('/systemdataapi/getsystemsettingforbuttonbycontrols', { dbName: context.dbName, controlUids: JSON.stringify(controlUids) }),
    GetSystemSettingForDataGridByControls: (controlUids) => api_helper.get('/systemdataapi/getsystemsettingfordatagridbycontrols', { dbName: context.dbName, controlUids: JSON.stringify(controlUids) }),
    GetSystemDataViewFieldsByDataViews: (dataViewUids) => api_helper.get('/systemdataapi/getsystemdataviewfieldsbydataviews', { dbName: context.dbName, dataViewUids: JSON.stringify(dataViewUids) }),
}

export default Api