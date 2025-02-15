import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
const context = getGlobalContext();

export default {
  getMaterial(id) {
    return api_helper.get('/billapi/getdatauseid', { dbName: context.dbName, tableName: 'Material', id })
  }
}

// export function getMaterial(id, dbName) {
//   return api_helper.get('/billapi/getdatauseid', { dbName, tableName: 'Material', id });
// }