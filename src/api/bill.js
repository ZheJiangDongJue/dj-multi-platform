
import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
const context = getGlobalContext();

const Api = {
    getDataUseid: (tableName, id) => api_helper.get('/billapi/getdatauseid', { dbName: context.dbName, tableName, id }),
    getDataUseids: (tableName, ids) => api_helper.get('/billapi/getdatauseids', { dbName: context.dbName, tableName, ids: JSON.stringify(ids) }),
}

export default Api