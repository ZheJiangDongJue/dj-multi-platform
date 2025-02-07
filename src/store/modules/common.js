const state = {
    dbName: '',
    // 用户信息
    userInfo: {},
}

const mutations = {
    userInfo: (state, userInfo) => {
        state.userInfo = userInfo;
    },
    dbName: (state, dbName) => {
        state.dbName = dbName;
    }
}

const actions = {
    commitUserInfo: ({ commit }, data) => {
        commit('userInfo', data)
    },
    commitDbName: ({ commit }, data) => {
        commit('dbName', data)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}