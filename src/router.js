import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

//Demo
import DockDemo from './views/demo/DockDemo.vue'
import GridDemo from './views/demo/GridDemo.vue'
import CanvasDemo from './views/demo/CanvasDemo.vue'
import TableSelectDemo from './views/demo/TableSelectDemo.vue'

//页面
import Login from './views/login/Login.vue'
import Home from './views/home/Home.vue'
import CsPage from './views/technology/AssemblyProcessReception.vue'
import UniversalPage from './components/iterate/UniversalPage.vue'


// 配置路由
const routes = [
    {
        path: '/c',
        name: 'CsPage',
        component: CsPage
    },
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/home', component: Home },
    { path: '/unvs/:pageName', component: UniversalPage },
    { path: '/system/page', component: UniversalPage },
    { path: '/demo/dock', component: DockDemo },
    { path: '/demo/grid', component: GridDemo },
    { path: '/demo/canvas', component: CanvasDemo },
    { path: '/demo/tableselect', component: TableSelectDemo },
]

// 创建路由实例
const router = new VueRouter({
    routes // short for `routes: routes`
})

export default router