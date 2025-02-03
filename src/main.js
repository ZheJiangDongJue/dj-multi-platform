import Vue from 'vue'
// import App from './App.vue'
import router from './router.js'

Vue.config.productionTip = false

// if (process.env.NODE_ENV !== 'production') {
//   console.log = function() {}
// }

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

import detectDeviceType from './multi-platform-util.js'

async function mountApp() {
  const deviceType = detectDeviceType();
  let app;

  if (deviceType === 'mobile') {
    app = (await import('./MobileApp.vue')).default;
  } else if (deviceType === 'tablet') {
    app = (await import('./TabletApp.vue')).default;
  } else {
    app = (await import('./DesktopApp.vue')).default;
  }

  new Vue({
    router,
    render: h => h(app)
  }).$mount('#app');
}

mountApp();
