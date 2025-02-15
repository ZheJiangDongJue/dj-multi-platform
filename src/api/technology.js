
import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
const context = getGlobalContext();

const Api = {
    getDbNames: (tableName, id) => api_helper.get('/billapi/getdatauseid', { dbName: context.dbName, tableName, id }),
}

export default Api