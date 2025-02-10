
import { Query } from '@/core/query';
import api_helper from '../utils/api_helper';
import '../utils/api_helper/extension';

const Api = {
    getDataEx: (dbName: string, query: Query) => api_helper.get('/billapi/getdataex', { dbName, query: JSON.stringify(query) }),
}

export default Api