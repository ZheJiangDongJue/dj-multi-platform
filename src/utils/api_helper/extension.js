import api_helper from '@/utils/api_helper';

import { methodMixin } from '@/mixins';
import store from '@/store' //仓库
import Vue from 'vue'
import { Toast } from 'vant';

// 定义一个使用混入对象的组件
var myComponent = Vue.extend({
    store,
    mixins: [methodMixin]
})
var context = new myComponent()

Vue.use(Toast);

var tag = false;

if (!tag) {
    tag = true;
    api_helper.getData = async function (url, params) {
        var pack = await api_helper.get(url, params);
        if (pack.Status != undefined) {
            var success = pack.Status == 200;
            if (!success) {
                context.$dialog.alert({
                    title: '提示',
                    message: pack.message
                });
            }
            else {
                return pack.Data;
            }
        }
        else if (pack.IsSuccess != undefined) {
            if (!success) {
                context.$dialog.alert({
                    title: '提示',
                    message: pack.message
                });
            }
            else {
                return {
                    addItems: pack.AddItems,
                    updateItems: pack.UpdateItems,
                    deleteItems: pack.DeleteItems,
                    objects: pack.Objects,
                };
            }
        }
        else {
            return pack;
        }
    }
}