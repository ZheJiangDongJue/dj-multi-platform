import Vue from 'vue'
import VueRouter from 'vue-router'
import { MessageBox } from 'element-ui'
import store from './store'
import { isSessionExpired, logout } from '@/utils/session-manager'

Vue.use(VueRouter)

//Demo
import DockDemo from './views/demo/DockDemo.vue'
import GridDemo from './views/demo/GridDemo.vue'
import CanvasDemo from './views/demo/CanvasDemo.vue'
import TableSelectDemo from './views/demo/TableSelectDemo.vue'
import ViewportDemo from './components/ViewportDemo.vue'
import BillPageTemplateDemo from './components/page/demo/BillPageTemplateDemo.vue'
import DeviceDetectionTest from './components/DeviceDetectionTest.vue'

//页面
import Login from './views/login/Login.vue'
import NetworkError from './views/NetworkError.vue'
import Home from './views/home/Home.vue'
import UserSettings from './views/user-settings/UserSettings.vue'
import UniversalPage from './components/iterate/UniversalPage.vue'
import ProcessAssemblyFlowBillWrapper from './views/shared/technology/wrapper/ProcessAssemblyFlowBillWrapper.vue'
import BatchReceiveProcessAssemblyFlow from './views/tablet/BatchReceiveProcessAssemblyFlow.vue'
import BatchCompleteProcessAssemblyFlow from './views/tablet/BatchCompleteProcessAssemblyFlow.vue'

// 定义需要权限验证的路由
// const authRoutes = ['/home', '/zzlck', '/unvs']

/**
 * 存储导航历史，用于跳过网络错误页面
 * @type {Array}
 */
const navigationHistory = [];

/**
 * 记录导航历史的最大长度
 * @type {number}
 */
const MAX_HISTORY_LENGTH = 10;

/**
 * 添加路由记录到导航历史
 * @param {Object} route - 路由对象
 */
function addToHistory(route) {
  // 只记录非错误页面
  if (route.path !== '/network-error' && !route.meta.noHistory) {
    const path = route.fullPath;

    // 检查是否已存在相同路径，避免重复记录
    const existingIndex = navigationHistory.indexOf(path);
    if (existingIndex !== -1) {
      // 如果路径已存在，先删除旧条目
      navigationHistory.splice(existingIndex, 1);
    }

    // 添加到历史记录
    navigationHistory.push(path);

    // 限制历史记录长度，防止内存泄漏
    if (navigationHistory.length > MAX_HISTORY_LENGTH) {
      navigationHistory.shift();
    }

    // 输出调试信息
    console.log('更新历史记录:', {
      path: route.path,
      fullPath: route.fullPath,
      history: [...navigationHistory]
    });
  }
}

// 注意：此函数实际上未使用，但为代码完整性保留，添加使用标记避免ESLint警告
/**
 * 获取上一个有效路由（跳过网络错误页面）
 * @returns {string|null} 上一个有效路由路径
 * @unused 保留供将来使用，避免ESLint警告
 */
// eslint-disable-next-line no-unused-vars
function getPreviousValidRoute() {
  // 至少需要有两个历史记录
  if (navigationHistory.length < 2) {
    return null;
  }

  // 返回倒数第二个路由（当前页面的上一个）
  return navigationHistory[navigationHistory.length - 2];
}

// 模块聚合页面空组件
const ModulePageContainer = {
    render: h => h('router-view')
};

// 配置路由
const routes = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        meta: { requiresAuth: true },
        children: [
            // 模块路由
            {
                path: 'technology',
                component: ModulePageContainer,
                meta: { requiresAuth: true },
                children: [
                    { path: 'zzlck', component: ProcessAssemblyFlowBillWrapper, meta: { requiresAuth: true } },
                    { path: 'pljszzlck', component: BatchReceiveProcessAssemblyFlow, meta: { requiresAuth: true } },
                    { path: 'plwgzzlck', component: BatchCompleteProcessAssemblyFlow, meta: { requiresAuth: true } },
                ]
            },
            {
                path: 'example',
                component: ModulePageContainer,
                meta: { requiresAuth: true },
                children: [
                    { path: 'viewport-demo', component: ViewportDemo, meta: { requiresAuth: true } },
                    { path: 'bill-template-demo', component: BillPageTemplateDemo, meta: { requiresAuth: true } },
                    { path: 'device-detection-test', component: DeviceDetectionTest, meta: { requiresAuth: true } },
                ]
            },
            // 子路由定义，可以添加更多的子路由（兼容原有路由）
            { path: 'zzlck', component: ProcessAssemblyFlowBillWrapper, meta: { requiresAuth: true } },
            { path: 'pljszzlck', component: BatchReceiveProcessAssemblyFlow, meta: { requiresAuth: true } },
            { path: 'plwgzzlck', component: BatchCompleteProcessAssemblyFlow, meta: { requiresAuth: true } },
            { path: 'user-settings', component: UserSettings, meta: { requiresAuth: true } },
            // 通用页面路由
            { path: 'unvs/:pageName', component: UniversalPage, meta: { requiresAuth: true } },
            // ViewportDemo路由
            { path: 'viewport-demo', component: ViewportDemo, meta: { requiresAuth: true } },
            // BillPageTemplateDemo路由
            { path: 'bill-template-demo', component: BillPageTemplateDemo, meta: { requiresAuth: true } },
            // DeviceDetectionTest路由
            { path: 'device-detection-test', component: DeviceDetectionTest, meta: { requiresAuth: true } },
        ]
    },
    // 保留原有的直接路由以兼容现有代码
    { path: '/zzlck', component: ProcessAssemblyFlowBillWrapper, meta: { requiresAuth: true } },//组装流程卡
    { path: '/pljszzlck', component: BatchReceiveProcessAssemblyFlow, meta: { requiresAuth: true } },//批量接收装配流程
    { path: '/plwgzzlck', component: BatchCompleteProcessAssemblyFlow, meta: { requiresAuth: true } },//批量完工装配流程
    { path: '/user-settings', component: UserSettings, meta: { requiresAuth: true } },
    { path: '/unvs/:pageName', component: UniversalPage, meta: { requiresAuth: true } },
    { path: '/viewport-demo', component: ViewportDemo },
    { path: '/bill-template-demo', component: BillPageTemplateDemo },
    {
      path: '/network-error',
      component: NetworkError,
      meta: {
        noHistory: true,  // 标记为不记录历史
        skipInHistory: true // 在历史导航中跳过
      }
    },
    { path: '/demo/dock', component: DockDemo },
    { path: '/demo/grid', component: GridDemo },
    { path: '/demo/canvas', component: CanvasDemo },
    { path: '/demo/tableselect', component: TableSelectDemo },
    { path: '/device-detection-test', component: DeviceDetectionTest },
]

// 创建路由实例
const router = new VueRouter({
    routes // short for `routes: routes`
})

// 全局变量存储最后一个非错误页面的路由
// eslint-disable-next-line no-unused-vars
let lastValidRoute = null;

// 全局网络状态监听器，在应用任意地方均可使用
// 在线状态变化函数
const handleOnlineStatusChange = () => {
  // 如果网络恢复并且当前是网络错误页面
  if (navigator.onLine && router.currentRoute.path === '/network-error') {
    const returnPath = router.currentRoute.query.from || '/home';
    // 使用replace避免在历史中留下记录
    router.replace(returnPath);
  }
};

// 添加网络状态监听
window.addEventListener('online', handleOnlineStatusChange);
window.addEventListener('offline', () => {
  //TODO: 暂时不要网络断开事件
  return;
  // // 如果当前不是网络错误页面或登录页
  // if (navigator.onLine === false &&
  //     router.currentRoute.path !== '/network-error' &&
  //     router.currentRoute.path !== '/login') {
  //   router.replace({
  //     path: '/network-error',
  //     query: { from: router.currentRoute.fullPath }
  //   });
  // }
});

// 将navigationHistory暴露给全局以便调试
window.navigationHistory = navigationHistory;

// 路由守卫
router.beforeEach((to, from, next) => {
    // 检查是否从网络错误页面恢复
    const isRecoveringFromNetworkError = sessionStorage.getItem('isRecoveringFromNetworkError') === 'true';
    if (isRecoveringFromNetworkError) {
        // 清除标记
        sessionStorage.removeItem('isRecoveringFromNetworkError');
        // 使用replace模式导航以避免在历史记录中留下额外条目
        if (!to.query._recovery) {
            const newTo = {
                ...to,
                query: { ...to.query, _recovery: true },
                replace: true
            };
            next(newTo);
            return;
        }
    }

    // 存储有效路由历史（非错误页面）
    if (!to.meta.noHistory && to.path !== '/network-error') {
        // eslint-disable-next-line no-unused-vars
        lastValidRoute = from;
    }

    // 检查是否是网络错误页面，如果是直接通过
    if (to.path === '/network-error') {
        // 使用replace而非push，不保留在历史记录中
        next();
        return;
    }

    // 检查网络连接状态
    if (!navigator.onLine && to.path !== '/login') {
        // 如果断网且不是登录页，重定向到网络错误页
        next({
            path: '/network-error',
            query: { from: to.fullPath },
            replace: true // 使用replace而不是push，不会记录在历史栈中
        });
        return;
    }

    // 检查路由是否需要认证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth) {
        // 检查是否有用户信息和未过期
        const userInfo = store.getters.userInfo

        if (!userInfo || !userInfo.id) {
            // 没有用户信息，重定向到登录页
            MessageBox.alert('请先登录后再访问', '提示', {
                confirmButtonText: '确定',
                callback: () => {
                    next({ path: '/login' })
                }
            })
        } else if (isSessionExpired()) {
            // 会话已过期，清除状态并重定向到登录页
            MessageBox.alert('会话已过期，请重新登录', '提示', {
                confirmButtonText: '确定',
                callback: () => {
                    // 使用logout函数清理状态
                    logout()
                    next({ path: '/login' })
                }
            })
        } else {
            // 允许访问
            next()
        }
    } else {
        // 不需要认证的路由直接通过
        next()
    }
})

// 路由守卫完成，添加afterEach钩子
router.afterEach((to, from) => {
  console.log('afterEach', to, from);
  // 将成功导航的路由添加到历史记录
  addToHistory(to);

  // 清理恢复导航的临时参数
  if (to.query._recovery && Object.keys(to.query).length > 1) {
    // 创建不包含_recovery参数的新查询对象
    const newQuery = { ...to.query };
    delete newQuery._recovery;

    // 如果其他查询参数仍然存在，使用replace更新URL，确保不增加历史记录
    if (Object.keys(newQuery).length > 0) {
      router.replace({ path: to.path, query: newQuery, hash: to.hash }).catch(err => {
        // 忽略冗余导航错误
        if (err.name !== 'NavigationDuplicated') {
          console.error('清理临时参数出错:', err);
        }
      });
    } else if (to.query._recovery) {
      // 如果只剩下_recovery参数，则完全清除查询参数
      router.replace({ path: to.path, hash: to.hash }).catch(err => {
        // 忽略冗余导航错误
        if (err.name !== 'NavigationDuplicated') {
          console.error('清理临时参数出错:', err);
        }
      });
    }
  }
});

// 重写router.go方法以忽略网络错误页面
const originalGo = VueRouter.prototype.go;
VueRouter.prototype.go = function(n) {
  // 调试信息
  console.log('Navigation history:', navigationHistory);

  // 处理返回操作，跳过网络错误页面
  if (n < 0) {
    // 获取当前路由在历史记录中的索引
    const currentPath = this.currentRoute.fullPath;
    const currentIndex = navigationHistory.lastIndexOf(currentPath);

    // 如果找不到当前路由，尝试使用原始方法
    if (currentIndex === -1) {
      return originalGo.call(this, n);
    }

    // 计算目标索引（跳过网络错误页面）
    let targetIndex = currentIndex + n;
    // 记录跳过的错误页面数量（用于调整目标索引）
    let skippedErrorPages = 0;

    // 查找第一个非错误页面作为目标（向后查找）
    while (targetIndex >= 0 && targetIndex < navigationHistory.length) {
      const historyRoute = navigationHistory[targetIndex];
      const isErrorPage = historyRoute && historyRoute.includes('/network-error');

      if (isErrorPage) {
        // 跳过错误页面，继续向后查找
        skippedErrorPages++;
        targetIndex = currentIndex + n - skippedErrorPages;
      } else {
        // 找到有效的非错误页面
        break;
      }
    }

    // 确保目标索引在有效范围内
    if (targetIndex >= 0 && targetIndex < navigationHistory.length) {
      const targetRoute = navigationHistory[targetIndex];
      const isSameAsCurrent = targetRoute === currentPath;

      // 避免导航到当前位置（这会触发Vue Router警告）
      if (isSameAsCurrent) {
        console.log('避免重复导航到当前位置');
        return Promise.resolve();
      }

      // 使用replace导航到目标路由，避免在历史记录中添加新条目
      return this.replace(targetRoute);
    }
  }

  // 默认使用原始的go方法
  return originalGo.call(this, n);
};

export default router