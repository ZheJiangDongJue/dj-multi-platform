/**
 * 网络工具模块 - 用于处理网络状态检测和相关路由处理
 */
import router from '@/router'

/**
 * 网络帮助类
 */
class NetworkHelper {
  /**
   * 构造函数
   */
  constructor() {
    // 保存上一个有效路由的记录，但目前未被使用
    // eslint-disable-next-line no-unused-vars
    this.lastValidRoute = null;
    this.isOnline = navigator.onLine;
    this.listeners = [];
    
    // 初始化网络监听器
    this.initListeners();
  }
  
  /**
   * 初始化网络监听器
   * @private
   */
  initListeners() {
    // 添加在线状态监听
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  /**
   * 处理网络恢复事件
   * @private
   */
  handleOnline() {
    this.isOnline = true;
    
    // 通知所有监听器
    this.notifyListeners();
    
    // 如果在错误页面，自动重定向
    if (router.currentRoute.path === '/network-error') {
      const returnPath = router.currentRoute.query.from || '/home';
      
      // 标记这是从网络错误页面的恢复导航
      sessionStorage.setItem('isRecoveringFromNetworkError', 'true');
      
      // 添加额外的查询参数，确保避免历史记录中的重复
      const target = {
        path: returnPath,
        query: { 
          ...router.currentRoute.query,
          _recovery: Date.now() // 添加时间戳确保唯一性
        }
      };
      
      // 使用replace避免在历史中留下记录
      router.replace(target).catch(err => {
        // 忽略冗余导航错误
        if (err.name !== 'NavigationDuplicated') {
          console.error('导航错误:', err);
        }
      });
    }
  }
  
  /**
   * 处理网络断开事件
   * @private
   */
  handleOffline() {
    //TODO: 暂时不要网络断开事件
    return;
    // this.isOnline = false;
    
    // // 储存当前页面，用于网络恢复后返回（暂未使用）
    // if (router.currentRoute.path !== '/network-error' && 
    //     router.currentRoute.path !== '/login') {
    //   // eslint-disable-next-line no-unused-vars
    //   this.lastValidRoute = router.currentRoute.fullPath;
    // }
    
    // // 通知所有监听器
    // this.notifyListeners();
  }
  
  /**
   * 通知所有监听器网络状态变化
   * @private
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (err) {
        console.error('网络状态监听器回调错误:', err);
      }
    });
  }
  
  /**
   * 添加网络状态变化监听器
   * @param {Function} callback - 状态变化回调函数，参数为 isOnline
   * @returns {Function} 用于移除监听器的函数
   */
  addStatusListener(callback) {
    if (typeof callback !== 'function') {
      console.error('网络监听器必须是函数');
      return () => {};
    }
    
    this.listeners.push(callback);
    
    // 返回移除监听器的函数
    return () => this.removeStatusListener(callback);
  }
  
  /**
   * 移除网络状态变化监听器
   * @param {Function} callback - 要移除的监听器函数
   */
  removeStatusListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * 检查当前网络状态
   * @returns {boolean} 是否在线
   */
  isNetworkOnline() {
    return navigator.onLine;
  }
  
  /**
   * 处理网络错误，如API请求失败等情况
   * @param {Error} error - 错误对象
   * @param {boolean} [shouldRedirect=true] - 是否应该重定向到错误页面
   */
  handleNetworkError(error, shouldRedirect = true) {
    console.error('网络错误:', error);
    
    // 如果已经离线或者要求重定向
    if (!this.isOnline && shouldRedirect) {
      // 保存当前路由以便恢复
      const currentPath = router.currentRoute.fullPath;
      
      if (currentPath !== '/network-error' && currentPath !== '/login') {
        router.replace({
          path: '/network-error',
          query: { from: currentPath }
        });
      }
    }
    
    return error;
  }
}

// 创建单例实例
const networkHelper = new NetworkHelper();

export default networkHelper; 