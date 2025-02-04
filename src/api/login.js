
import api_helper from '../utils/api_helper';

const LoginApi = {
    getDbNames: async (username, password) => await api_helper.get('/loginapi/getdbnames', { username, password }),
    login: async (dbName, username, password) => await api_helper.get('/loginapi/login', { dbName, username, password }),
}

export default LoginApi