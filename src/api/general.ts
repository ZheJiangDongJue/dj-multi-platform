
import { Query } from '@/core/query';
import api_helper from '../utils/api_helper';
import '../utils/api_helper/extension';
import { getGlobalContext } from '@/utils/global';
import { DataGetterPack } from '@/core/data-getter-pack';
const context = getGlobalContext();

const Api = {
    getDataUseDataView: (dataViewUid: Number, dataGetterPack: DataGetterPack) => api_helper.get('/generalentityapi/getdatausedataview', { dbName: context.dbName, dataViewUid, dataGetterPack: JSON.stringify(dataGetterPack) }),
    getDataEx: (query: Query) => api_helper.get('/billapi/getdataex', { dbName: context.dbName, query: JSON.stringify(query) }),
}

export default Api