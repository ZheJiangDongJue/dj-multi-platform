const state = {
    // 是否显示全局加载
    isLoading: false
}

const mutations = {
    isLoading: (state, isLoading) => {
        state.isLoading = isLoading
    }
}

const actions = {
    commitIsLoading: ({ commit }, data) => {
        commit('isLoading', data)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}