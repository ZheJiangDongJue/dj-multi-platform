
import api_helper from '../utils/api_helper';

const AuthApi = {
    getAllModuleItem: (dbName, userId) => api_helper.get('/authapi/getallmoduleitem', { dbName, userId }),
}

export default AuthApi