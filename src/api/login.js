
import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
const context = getGlobalContext();

/*
*/
const LoginApi = {
    getDbNames: (username, password) => api_helper.get('/loginapi/getdbnames', { username, password }),
    login: (dbName, username, password) => api_helper.get('/loginapi/login', { dbName, username, password }),
    changePassword: (dbName, oldPwd, newPwd) => api_helper.post('/loginapi/changepassword', { DbName: dbName, UserInfo: context.userInfo, OldPwd: oldPwd, NewPwd: newPwd }),
}

export default LoginApi