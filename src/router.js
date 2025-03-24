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

//页面
import Login from './views/login/Login.vue'
import Home from './views/home/Home.vue'
import UniversalPage from './components/iterate/UniversalPage.vue'
import ProcessAssemblyFlowBill from './views/technology/ProcessAssemblyFlow/ProcessAssemblyFlowBill.vue'
import UserSettings from './views/user-settings/UserSettings.vue'
import BatchReceiveProcessAssemblyFlow from './views/technology/BatchReceiveProcessAssemblyFlow.vue'
import BatchCompleteProcessAssemblyFlow from './views/technology/BatchCompleteProcessAssemblyFlow.vue'
import NetworkError from './views/NetworkError.vue'

// 定义需要权限验证的路由
// const authRoutes = ['/home', '/zzlck', '/unvs']

// 配置路由
const routes = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/home', component: Home, meta: { requiresAuth: true } },
    { path: '/zzlck', component: ProcessAssemblyFlowBill, meta: { requiresAuth: true } },//组装流程卡
    { path: '/pljszzlck', component: BatchReceiveProcessAssemblyFlow, meta: { requiresAuth: true } },//批量接收装配流程
    { path: '/plwgzzlck', component: BatchCompleteProcessAssemblyFlow, meta: { requiresAuth: true } },//批量完工装配流程
    { path: '/user-settings', component: UserSettings, meta: { requiresAuth: true } },
    { path: '/unvs/:pageName', component: UniversalPage, meta: { requiresAuth: true } },
    { path: '/network-error', component: NetworkError },

    { path: '/demo/dock', component: DockDemo },
    { path: '/demo/grid', component: GridDemo },
    { path: '/demo/canvas', component: CanvasDemo },
    { path: '/demo/tableselect', component: TableSelectDemo },
]

// 创建路由实例
const router = new VueRouter({
    routes // short for `routes: routes`
})

// 路由守卫
router.beforeEach((to, from, next) => {
    // 检查是否是网络错误页面，如果是直接通过
    if (to.path === '/network-error') {
        next();
        return;
    }

    // 检查网络连接状态
    if (!navigator.onLine && to.path !== '/login') {
        // 如果断网且不是登录页，重定向到网络错误页
        next({ 
            path: '/network-error', 
            query: { from: to.fullPath } 
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

export default router