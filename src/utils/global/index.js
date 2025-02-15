
import { methodMixin } from '@/mixins';
import store from '@/store' //仓库
import Vue from 'vue'

// 获取全局上下文
export function getGlobalContext() {
    return new Vue({
        store,
        mixins: [methodMixin]
    })
}