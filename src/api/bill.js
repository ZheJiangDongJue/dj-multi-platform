
import api_helper from '../utils/api_helper';

const Api = {
    getDataUseid: (dbName, tableName, id) => api_helper.get('/billapi/getdatauseid', { dbName, tableName, id }),
    getDataUseids: (dbName, tableName, ids) => api_helper.get('/billapi/getdatauseids', { dbName, tableName, ids: JSON.stringify(ids) }),
}

export default Api