
import api_helper from '../utils/api_helper';

const LoginApi = {
    getDbNames: (dbName, tableName, id) => api_helper.get('/billapi/getdatauseid', { dbName, tableName, id }),
}

export default LoginApi