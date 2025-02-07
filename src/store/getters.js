const getters = {
    isLoading: state => state.loading.isLoading,
    dbName: state => state.common.dbName,
    userInfo: state => state.common.userInfo,
}
export default getters