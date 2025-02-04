import Vue from 'vue';
import Vuex from 'vuex';
import loading from './modules/loading';
import getters from './getters';
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
      loading
    },
    getters,
    // 这里引入vuex-persistedstate插件,实现数据持久化
    plugins: [createPersistedState()]
  })
  
  export default store