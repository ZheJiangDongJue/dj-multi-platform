import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/utils/api_helper/extension';
import { initSessionManager } from '@/utils/session-manager';

// 初始化会话管理
if (localStorage.getItem('loginTime')) {
  initSessionManager();
}

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

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');

// 全局网络状态监听
window.addEventListener('online', () => {
  // 如果恢复在线状态并且当前在网络错误页面，尝试返回之前的页面
  if (router.currentRoute.path === '/network-error' && router.currentRoute.query.from) {
    router.push(router.currentRoute.query.from);
  }
});

window.addEventListener('offline', () => {
  // 如果断网且不在网络错误页面，跳转到网络错误页面
  if (router.currentRoute.path !== '/network-error' && router.currentRoute.path !== '/login') {
    router.push({
      path: '/network-error', 
      query: { from: router.currentRoute.fullPath }
    });
  }
});
