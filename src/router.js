import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Login from './views/login/Login.vue'
import Home from './views/home/Home.vue'

// 配置路由
const routes = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
]

// 创建路由实例
const router = new VueRouter({
    routes // short for `routes: routes`
})

export default router