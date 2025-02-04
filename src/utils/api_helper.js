import axios from 'axios';
import qs from 'qs'
import methodMixin from '../mixins';
import store from '../store' //仓库
import Vue from 'vue'
import { Toast } from 'vant';
// import RequestResult from '../../api_utils/request_result';


// 定义一个使用混入对象的组件
var myComponent = Vue.extend({
  store,
  mixins: [methodMixin]
})
// 定义context为混入对象，通过context.$pushLoading调用接口loading方法
var context = new myComponent()

Vue.use(Toast);


// 配置 baseURL
const baseURL = process.env.VUE_APP_API_BASE_URL || '/api'; // 根据你的实际情况修改

const instance = axios.create({
  baseURL,
  timeout: 10000, // 设置超时时间
  headers: {
    'Content-Type': 'application/json', // 默认 Content-Type
  },
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    //   var loginTime = JSON.parse(localStorage.getItem('loginTime'))
    //   if (!loginURL.includes(config.url)) {
    //     let LoginHour = 43200
    //     let hadLoginTime = new Date().getTime()
    //     let lastTime = (hadLoginTime - loginTime) / 1000
    //     if (lastTime >= LoginHour) {
    //       Dialog.alert({
    //         message: '登录已过期 请重新登录'
    //       }).then(() => {
    //         localStorage.clear()
    //         window.location.replace(VUE_APP_LOGIN_URL)
    //       })
    //     }
    //   }
    return config
  },
  error => {
    //   Dialog.alert({
    //     message: '登录已过期 请重新登录'
    //   }).then(() => {
    //     localStorage.clear()
    //     window.location.replace(VUE_APP_LOGIN_URL)
    //   })
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 处理响应数据
    // if (whiteUrlList.includes(response.config.url)) {
    //   return response
    // }
    // if (!response.data.success) {
    //   Toast(response.data.msg || response.data.error)
    //   // Dialog.alert({
    //   //   message: response.data.error
    //   // }).then(() => {
    //   //   localStorage.clear()
    //   //   window.location.replace(VUE_APP_LOGIN_URL)
    //   // })

    //   return response
    // }
    return response
  },
  error => {
    Toast('请求失败，请稍后再试')
    context.$pushLoading(false, true)
    return Promise.reject(error)
  }
)

const APIHelper = {
  get: (url, params = {}) => {
    return new Promise((resolve, reject) => {
      context.$pushLoading(true, false)
      instance
        .get(url, {
          params: params,
          paramsSerializer: params => {
            return qs.stringify(params, {
              indices: false
            })
          }
        })
        .then(response => {
          if (response.data) {
            resolve(response.data)
          }
          // if (response.data && response.data.success) {
          //   resolve(response.data)
          // }
          // else {
          //   if (whiteUrlList.includes(response.config.url)) {
          //     resolve(response.data)
          //   } else {
          //     reject(response)
          //   }
          // }
          context.$pushLoading(false, false)
        })
        .catch(err => {
          context.$pushLoading(false, true)
          reject(err)
        })
    });
  },
  post: (url, data = {}) => {
    return new Promise((resolve, reject) => {
      context.$pushLoading(true, false)
      instance
        .post(url, data)
        .then(response => {
          // if (response.status == 200 && response.data.success) {
          //   resolve(response.data)
          // }
          // 当状态为200，无返回data.success时也可以返回参数
          if (response.status == 200) {
            resolve(response.data)
          }
          context.$pushLoading(false, false)
        })
        .catch(err => {
          reject(err)
          context.$pushLoading(false, true)
        })
    });
  },
  put: (url, params = {}) => {
    return new Promise((resolve, reject) => {
      context.$pushLoading(true, false)
      instance
        .put(url, params)
        .then(response => {
          if (response.data) {
            resolve(response.data)
          }
          // if (response.data.success) {
          //   resolve(response.data)
          // } else {
          //   reject(response)
          // }
          context.$pushLoading(false, false)
        })
        .catch(err => {
          context.$pushLoading(false, true)
          reject(err)
        })
    });
  },
  delete: (url, params = {}) => {
    return new Promise((resolve, reject) => {
      context.$pushLoading(true, false)
      instance
        .delete(url, {
          params: params
        })
        .then(response => {
          if (response.data) {
            resolve(response.data)
          }
          // if (response.data.success) {
          //   resolve(response.data)
          // } else {
          //   reject(response)
          // }
          context.$pushLoading(false, false)
        })
        .catch(err => {
          context.$pushLoading(false, true)
          reject(err)
        })
    });
  },
};

export default APIHelper;