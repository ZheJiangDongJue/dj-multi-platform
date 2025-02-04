const getters = {
    isLoading: state => state.loading.isLoading,
    userInfo: state => state.common.userInfo,
    treeTopId: state => state.tree.treeTopId
}
export default getters