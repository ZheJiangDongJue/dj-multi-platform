
import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
const context = getGlobalContext();

const Api = {
    getAllModuleItem: (userId) => api_helper.get('/authapi/getallmoduleitem', { dbName: context.dbName, userId }),
}

export default Api