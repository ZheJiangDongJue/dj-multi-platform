/**
 * 页面状态持久化混入
 * 提供页面刷新前状态的保存和恢复功能
 */
export default {
    data() {
        return {
            // 用于标记是否正在从本地存储恢复状态
            isRestoringState: false,
            // 状态过期时间（默认30分钟）
            stateExpirationTime: 30 * 60 * 1000
        }
    },
    
    created() {
        // 生成页面唯一的存储键（默认使用路由路径）
        this._generateStorageKey();
    },
    
    mounted() {
        // 添加页面刷新前的事件监听
        window.addEventListener('beforeunload', this.savePageState);
    },
    
    beforeDestroy() {
        // 移除事件监听
        window.removeEventListener('beforeunload', this.savePageState);
    },
    
    methods: {
        /**
         * 生成存储状态使用的键名
         * 可以在组件中覆盖此方法来自定义键名
         */
        _generateStorageKey() {
            // 默认使用路由路径作为键名
            if (!this.$options.stateStorageKey) {
                const routePath = this.$route ? this.$route.path : '';
                this.$options.stateStorageKey = `pageState_${routePath.replace(/\//g, '_')}`;
            }
        },
        
        /**
         * 获取存储键名
         * @returns {string} 存储键名
         */
        getStateStorageKey() {
            return this.$options.stateStorageKey || 'pageState';
        },
        
        /**
         * 收集需要保存的状态
         * 在组件中覆盖此方法以收集特定的状态数据
         * @returns {Object} 要保存的状态对象
         */
        collectState() {
            return {
                timestamp: new Date().getTime()
            };
        },
        
        /**
         * 保存页面状态到localStorage
         * 仅在页面刷新前调用
         */
        savePageState() {
            try {
                // 获取当前需要保存的状态
                const pageState = this.collectState();
                
                // 如果状态为空，则不保存
                if (!pageState || Object.keys(pageState).length === 0) {
                    return;
                }
                
                // 获取存储键名
                const storageKey = this.getStateStorageKey();
                
                // 保存状态
                localStorage.setItem(storageKey, JSON.stringify(pageState));
                console.log('页面刷新前状态已保存', storageKey, pageState);
            } catch (error) {
                console.error('保存页面状态出错:', error);
            }
        },
        
        /**
         * 从localStorage获取保存的状态
         * @returns {Object|null} 保存的状态，如果不存在或已过期则返回null
         */
        getStoredState() {
            try {
                const storageKey = this.getStateStorageKey();
                const storedStateStr = localStorage.getItem(storageKey);
                
                if (!storedStateStr) {
                    return null;
                }
                
                const storedState = JSON.parse(storedStateStr);
                
                // 检查状态是否过期
                if (storedState.timestamp) {
                    const currentTime = new Date().getTime();
                    if (currentTime - storedState.timestamp > this.stateExpirationTime) {
                        // 状态已过期，删除它
                        localStorage.removeItem(storageKey);
                        return null;
                    }
                }
                
                return storedState;
            } catch (error) {
                console.error('获取存储状态出错:', error);
                return null;
            }
        },
        
        /**
         * 应用保存的状态
         * 在组件中覆盖此方法以恢复特定的状态
         * @param {Object} storedState 存储的状态
         * @returns {Promise<boolean>} 恢复状态是否成功
         */
        async applyState(storedState) {
            console.log('applyState', storedState);
            // 默认实现，子类应该覆盖此方法
            return Promise.resolve(true);
        },
        
        /**
         * 尝试恢复保存的状态
         * @returns {Promise<boolean>} 是否成功恢复了状态
         */
        async tryRestorePageState() {
            try {
                // 标记为正在恢复状态
                this.isRestoringState = true;
                
                // 获取存储的状态
                const storedState = this.getStoredState();
                
                if (!storedState) {
                    this.isRestoringState = false;
                    return false;
                }
                
                // 应用保存的状态
                const success = await this.applyState(storedState);
                
                // 恢复完状态后，删除存储的状态
                // 这样确保状态只会被恢复一次
                if (success) {
                    this.clearPageState();
                }
                
                return success;
            } catch (error) {
                console.error('恢复页面状态出错:', error);
                return false;
            } finally {
                // 恢复完成后重置标记
                this.isRestoringState = false;
            }
        },
        
        /**
         * 清除保存的状态
         */
        clearPageState() {
            try {
                const storageKey = this.getStateStorageKey();
                localStorage.removeItem(storageKey);
            } catch (error) {
                console.error('清除页面状态出错:', error);
            }
        }
    }
}; 