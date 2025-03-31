
import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
import { DbChangedPackResult } from './core/DbChangePackResult';
const context = getGlobalContext();

/*
*/
const LoginApi = {
    getDbNames: (username, password) => api_helper.get('/loginapi/getdbnames', { username, password }),
    login: (dbName, username, password) => api_helper.get('/loginapi/login', { dbName, username, password }),
    /**
     * 修改密码
     * @param {string} dbName - 数据库名称
     * @param {string} oldPwd - 旧密码
     * @param {string} newPwd - 新密码
     * @returns {Promise<DbChangedPackResult>} - 包含请求结果的对象
     */
    changePassword: (dbName, oldPwd, newPwd) => api_helper.post('/loginapi/changepassword', { DbName: dbName, UserInfo: context.userInfo, OldPwd: oldPwd, NewPwd: newPwd }),
}

console.log(DbChangedPackResult);

export default LoginApi