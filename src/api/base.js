import api_helper from '../utils/api_helper';

export default {
  getMaterial( id, dbName ) {
    return api_helper.get('/billapi/getdatauseid', { dbName, tableName:'Material', id })
  }
}

// export function getMaterial(id, dbName) {
//   return api_helper.get('/billapi/getdatauseid', { dbName, tableName: 'Material', id });
// }