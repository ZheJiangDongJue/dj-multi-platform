
import { Query } from '@/core/query';
import api_helper from '../utils/api_helper';
import '../utils/api_helper/extension';
import { getGlobalContext } from '@/utils/global';
import { DataGetterPack } from '@/core/data-getter-pack';
import { ApiMessagePack } from './core/ApiMessagePack';
const context = getGlobalContext();

/*
*/
const Api = {
    getNewUid: () => api_helper.get('/generalapi/getnewuid', {}) as Promise<number>,
    getIdByUid: (tableName: string, uid: number) => api_helper.get('/generalapi/getidbyuid', { dbName: context.dbName, tableName, uid }) as Promise<number>,
    getDataUseid: (tableName: string, id: number): Promise<ApiMessagePack> => api_helper.get('/generalapi/getdatauseid', { dbName: context.dbName, tableName, id }) as Promise<ApiMessagePack>,
    getDataUseids: (tableName: string, ids: number[]): Promise<ApiMessagePack> => api_helper.get('/generalapi/getdatauseids', { dbName: context.dbName, tableName, ids: JSON.stringify(ids) }) as Promise<ApiMessagePack>,
    getDataUseDataView: (dataViewUid: Number, dataGetterPack: DataGetterPack) => api_helper.get('/generalapi/getdatausedataview', { dbName: context.dbName, dataViewUid, dataGetterPack: JSON.stringify(dataGetterPack) }),
    getDataEx: (query: Query) => api_helper.get('/generalapi/getdataex', { dbName: context.dbName, query: JSON.stringify(query) }),
}

export default Api