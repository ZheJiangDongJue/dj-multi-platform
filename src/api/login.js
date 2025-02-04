
import api_helper from '../utils/api_helper';

const LoginApi = {
    getDbNames: (username, password) => api_helper.get('/loginapi/getdbnames', { username, password }),
    login: (dbName, username, password) => api_helper.get('/loginapi/login', { dbName, username, password }),
}

export default LoginApi