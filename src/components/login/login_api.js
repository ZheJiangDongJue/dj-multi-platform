import axios from 'axios';
// import RequestResult from '../../api_utils/request_result';

// 配置 baseURL
const baseURL = process.env.VUE_APP_API_BASE_URL || '/api'; // 根据你的实际情况修改

const instance = axios.create({
    baseURL,
    timeout: 10000, // 设置超时时间
    headers: {
        'Content-Type': 'application/json', // 默认 Content-Type
    },
});

// // 请求拦截器
// instance.interceptors.request.use(
//     (config) => {
//         // 在这里可以添加一些公共的请求头，例如 token
//         const token = localStorage.getItem('token'); // 获取 token
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         // 处理请求错误
//         console.error('Request Error:', error);
//         return Promise.reject(error);
//     }
// );

// // 响应拦截器
// instance.interceptors.response.use(
//     (response) => {
//         // 处理响应数据
//         const { data } = response;

//         // 根据后端接口规范判断是否成功，例如根据 code 或 status 字段
//         if (data.code === 0 || data.status === 'success') {
//             return data.data || data; // 返回真正的数据
//         } else {
//             // 处理错误信息，例如弹窗提示
//             console.error('Response Error:', data.message);

//             // 可以根据不同的错误码进行不同的处理，例如 token 过期跳转到登录页面
//             if (data.code === 401) {
//                 // 跳转到登录页面
//                 window.location.href = '/login';
//             }

//             return Promise.reject(data); // 或者返回一个自定义的错误对象
//         }
//     },
//     (error) => {
//         // 处理响应错误
//         console.error('Response Error:', error);
//         //  根据错误类型进行不同的处理，例如网络错误，超时等
//         if (error.code === 'ECONNABORTED') {
//             console.error('网络请求超时');
//         }
//         return Promise.reject(error);
//     }
// );

const API = {
    get: async (url, params = {}) => await instance.get(url, { params }),
    post: async (url, data = {}) => await instance.post(url, data),
    put: async (url, data = {}) => await instance.put(url, data),
    delete: async (url, params = {}) => await instance.delete(url, { params }),

    //  示例：一个具体的API调用
    getDbNames: async (username, password) => await API.get('/loginapi/getdbnames', { username, password }),
    login: (dbName, username, password) => API.get('/loginapi/login', { dbName, username, password }),
};

export default API;