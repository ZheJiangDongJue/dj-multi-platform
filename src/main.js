import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/utils/api_helper/extension';
import { initSessionManager } from '@/utils/session-manager';
// 引入Android桥接模块
import AndroidBridge from '@/utils/android-bridge';

// 初始化会话管理
if (localStorage.getItem('loginTime')) {
  initSessionManager();
}

// 将Android桥接模块挂载到Vue原型，以便在所有组件中使用
Vue.prototype.$android = AndroidBridge;

// 浏览器调试避免(...)
// console.log_ = console.log;
// console.log = function (a, ...b) {
//   console.log_(JSON.parse(JSON.stringify(a)), ...JSON.parse(JSON.stringify(b)));
// }

Vue.config.productionTip = false

// if (process.env.NODE_ENV !== 'production') {
//   console.log = function() {}
// }

import mixins from '@/mixins/method';
Vue.mixin(mixins)

import Vant from 'vant';
import 'vant/lib/index.css';
Vue.use(Vant)

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'
import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
Vue.use(VxeUI)
Vue.use(VxeUITable)

// 导入并注册自定义指令
import { installDirectives } from '@/directives';
installDirectives();

// import detectDeviceType from './utils/multi-platform.js'

// async function mountApp() {
//   const deviceType = detectDeviceType();
//   let app;

//   if (deviceType === 'mobile') {
//     app = (await import('./MobileApp.vue')).default;
//   } else if (deviceType === 'tablet') {
//     app = (await import('./TabletApp.vue')).default;
//   } else {
//     app = (await import('./DesktopApp.vue')).default;
//   }

//   new Vue({
//     store,
//     router,
//     render: h => h(app)
//   }).$mount('#app');
// }

// mountApp();

var eventBus = new Vue({})
Vue.prototype.$EventBus = eventBus;

import extension from '@/core/extensions/base-page';

extension();

import extension1 from '@/core/extensions/bill-page';

extension1();

import '@/core/enums';

import UniversalView from './components/iterate/UniversalView.vue';
import DynamicControl from './components/iterate/DynamicControl.vue';

Vue.component('UniversalView', UniversalView)
Vue.component('DynamicControl', DynamicControl)

// 导入网络帮助工具
import networkHelper from '@/utils/network-helper';
// 将网络帮助工具挂载到Vue原型，以便在所有组件中使用
Vue.prototype.$networkHelper = networkHelper;

// 添加Android通知事件监听
window.addEventListener('android-notification', (event) => {
  const { type, data } = event.detail;
  // 分发到Vuex或EventBus
  eventBus.$emit('android-notification', { type, data });
  
  // 特殊处理网络变化事件
  if (type === 'networkChanged' && data && data.isConnected === false) {
    router.push({
      path: '/network-error', 
      query: { from: router.currentRoute.fullPath }
    });
  }
});

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');

// 移除旧的网络监听器代码，现在由network-helper.js统一管理
// window.addEventListener('online', () => {
//   // 如果恢复在线状态并且当前在网络错误页面，尝试返回之前的页面
//   if (router.currentRoute.path === '/network-error' && router.currentRoute.query.from) {
//     router.push(router.currentRoute.query.from);
//   }
// });

// window.addEventListener('offline', () => {
//   // 如果断网且不在网络错误页面，跳转到网络错误页面
//   if (router.currentRoute.path !== '/network-error' && router.currentRoute.path !== '/login') {
//     router.push({
//       path: '/network-error', 
//       query: { from: router.currentRoute.fullPath }
//     });
//   }
// });
window.addEventListener('refresh-data', () => {
  location.reload();
});