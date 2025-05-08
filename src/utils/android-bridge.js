import { logout } from './session-manager';

/**
 * Android WebView 交互桥接工具
 * 提供 Web 端与 Android 原生应用交互的功能
 */

// 检测是否在Android环境中
const isAndroid = () => {
  return window.navigator.userAgent.indexOf('Android') > -1 || window.android !== undefined;
};

// 检查和修复桥接
const checkAndFixBridge = () => {
  const hasAndroidObj = typeof window.android !== 'undefined';
  const hasReceiveMessage = hasAndroidObj && typeof window.android.receiveMessage === 'function';

  console.log('[AndroidBridge] 检查桥接状态:', {
    isAndroid: isAndroid(),
    hasAndroidObj,
    hasReceiveMessage
  });

  // 防抖处理
  if (window._bridgeCheckInProgress) {
    console.log('[AndroidBridge] 桥接检查正在进行中，跳过本次检查');
    return;
  }

  window._bridgeCheckInProgress = true;
  setTimeout(() => {
    window._bridgeCheckInProgress = false;
  }, 5000);

  // 如果在Android环境中但没有android对象，尝试通过prompt方式与原生代码通信
  if (isAndroid() && !hasAndroidObj) {
    console.warn('[AndroidBridge] 在Android环境中但未检测到android对象，尝试创建模拟对象');

    // 创建模拟android对象
    window.android = {
      receiveMessage: (messageJson) => {
        console.log('[AndroidBridge] 使用prompt机制发送消息:', messageJson);
        try {
          // 尝试通过prompt方式发送消息
          const result = prompt('AndroidBridge', messageJson);
          if (result) {
            // 解析响应
            try {
              const parsedResult = JSON.parse(result);
              // 查找并调用回调函数
              const message = JSON.parse(messageJson);
              if (message.callbackId && window[message.callbackId]) {
                window[message.callbackId](parsedResult);
              }
            } catch (e) {
              console.error('[AndroidBridge] 解析prompt响应出错:', e);
            }
          }
        } catch (e) {
          console.error('[AndroidBridge] prompt调用出错:', e);
        }
      },

      onBridgeReady: () => {
        console.log('[AndroidBridge] 模拟桥接就绪');
      }
    };

    console.log('[AndroidBridge] 已创建模拟android对象');
  }

  // 检查WebMethods对象
  if (typeof window.WebMethods === 'undefined') {
    console.warn('[AndroidBridge] WebMethods对象不存在，创建本地实现');

    // 创建WebMethods对象
    window.WebMethods = {
      handleNotification(type, data) {
        console.log('[AndroidBridge] 收到通知:', type, data);
        // 触发自定义事件
        const event = new CustomEvent('android-notification', {
          detail: { type, data }
        });
        window.dispatchEvent(event);
      },

      refreshData(params) {
        console.log('[AndroidBridge] 刷新数据请求:', params);
        const event = new CustomEvent('refresh-data', {
          detail: params || {}
        });
        window.dispatchEvent(event);
        return { success: true, message: '数据刷新已触发' };
      },

      getPageInfo() {
        const path = window.location.pathname;
        const query = window.location.search;
        const pageTitle = document.title;

        return {
          path,
          query,
          title: pageTitle,
          url: window.location.href
        };
      }
    };

    console.log('[AndroidBridge] 已创建WebMethods对象');
  }

  return {
    hasAndroidObj: typeof window.android !== 'undefined',
    hasWebMethods: typeof window.WebMethods !== 'undefined'
  };
};

// Android桥接对象
const AndroidBridge = {
  /**
   * 向Android发送消息
   * @param {string} action - 动作名称
   * @param {object} data - 要发送的数据
   * @returns {Promise} - 返回Promise以支持异步操作
   */
  sendToAndroid(action, data = {}) {
    return new Promise((resolve, reject) => {
      // 检查并修复桥接
      checkAndFixBridge();

      if (!isAndroid()) {
        console.warn('[AndroidBridge] 当前环境不是Android');
        reject(new Error('当前环境不是Android'));
        return;
      }

      try {
        // 创建唯一回调ID
        const callbackId = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

        // 注册临时回调函数
        window[callbackId] = (result) => {
          // 清理临时回调
          delete window[callbackId];
          // 解析结果
          try {
            const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
            resolve(parsedResult);
          } catch (e) {
            resolve(result);
          }
        };

        // 准备发送给Android的数据
        const message = {
          action,
          data,
          callbackId
        };

        // 调用Android提供的接口
        if (window.android && window.android.receiveMessage) {
          console.log(`[AndroidBridge] 发送请求: ${action}`, data);
          window.android.receiveMessage(JSON.stringify(message));

          // 设置超时处理
          setTimeout(() => {
            if (window[callbackId]) {
              console.warn(`[AndroidBridge] 请求超时: ${action}`);
              delete window[callbackId];
              reject(new Error('请求超时'));
            }
          }, 10000);
        } else {
          // 没有可用的桥接方法
          reject(new Error('无法访问Android桥接方法'));
        }
      } catch (error) {
        console.error('[AndroidBridge] 向Android发送消息时出错:', error);
        reject(error);
      }
    });
  },

  /**
   * 检查桥接状态
   * @returns {Promise<object>} 桥接状态信息
   */
  checkBridge() {
    return new Promise((resolve) => {
      const status = checkAndFixBridge();

      // 如果桥接修复成功，测试基本功能
      if (status && status.hasAndroidObj && status.hasWebMethods) {
        this.sendToAndroid('bridgeCheck', { timestamp: Date.now() })
          .then(result => {
            resolve({
              success: true,
              hasAndroidObj: true,
              hasWebMethods: true,
              testResult: result
            });
          })
          .catch(error => {
            resolve({
              success: false,
              hasAndroidObj: true,
              hasWebMethods: true,
              error: error.message
            });
          });
      } else {
        resolve({
          success: false,
          hasAndroidObj: status ? status.hasAndroidObj : false,
          hasWebMethods: status ? status.hasWebMethods : false
        });
      }
    });
  },

  /**
   * 调用Android相机拍照
   * @returns {Promise} - 返回Promise以接收拍照结果
   */
  takePhoto() {
    return this.sendToAndroid('takePhoto');
  },

  /**
   * 调用Android相册选择图片
   * @returns {Promise} - 返回Promise以接收选择的图片
   */
  pickImage() {
    return this.sendToAndroid('pickImage');
  },

  /**
   * 调用Android扫描二维码
   * @returns {Promise} - 返回Promise以接收扫描结果
   */
  scanQRCode() {
    return this.sendToAndroid('scanQRCode');
  },

  /**
   * 获取Android设备信息
   * @returns {Promise} - 返回Promise以接收设备信息
   */
  getDeviceInfo() {
    return this.sendToAndroid('getDeviceInfo');
  },

  /**
   * 退出应用或返回上一级
   * @param {boolean} shouldExit - 是否应该完全退出应用
   * @returns {Promise}
   */
  goBack(shouldExit = false) {
    return this.sendToAndroid('goBack', { shouldExit });
  },

  /**
   * 设置标题
   * @param {string} title - 要设置的标题
   * @returns {Promise}
   */
  setTitle(title) {
    return this.sendToAndroid('setTitle', { title });
  },

  /**
   * 显示Toast消息
   * @param {string} message - 要显示的消息
   * @param {string} duration - 显示时长: 'short'或'long'
   * @returns {Promise}
   */
  showToast(message, duration = 'short') {
    return this.sendToAndroid('showToast', { message, duration });
  }
};

// 接收Android调用的方法
const WebMethods = {
  /**
   * 处理来自Android的通知
   * @param {string} type - 通知类型
   * @param {object} data - 通知数据
   */
  handleNotification(type, data) {
    // 触发自定义事件，方便组件监听
    const event = new CustomEvent('android-notification', {
      detail: { type, data }
    });
    window.dispatchEvent(event);

    console.log('[AndroidBridge] 收到Android通知:', type, data);

    // 可以在这里处理不同类型的通知
    switch (type) {
      case 'networkChanged':
        // 处理网络状态变化
        break;
      case 'appPaused':
        // 处理应用进入后台
        break;
      case 'appResumed':
        // 处理应用回到前台
        break;
      case 'scanResult':
        // 处理扫码结果
        console.log('[AndroidBridge] 收到扫码结果:', data.barcode);
        break;
      default:
        // 处理其他类型的通知
        break;
    }
  },

  /**
   * 刷新页面数据
   * @param {object} params - 刷新参数
   */
  refreshData(params) {
    const event = new CustomEvent('refresh-data', {
      detail: params || {}
    });
    window.dispatchEvent(event);

    console.log('[AndroidBridge] Android请求刷新数据:', params);
    return { success: true, message: '数据刷新已触发' };
  },

  /**
   * 获取当前页面信息
   * @returns {object} 页面信息
   */
  getPageInfo() {
    const path = window.location.pathname;
    const query = window.location.search;
    const pageTitle = document.title;

    return {
      path,
      query,
      title: pageTitle,
      url: window.location.href
    };
  },

  /**
   * 退出登录
   */
  logout: () => {
    logout();
  }
};

// 将Web方法暴露到window对象，供Android调用
window.WebMethods = WebMethods;

// 初始化时检查并修复桥接
checkAndFixBridge();

// 通知Android JS桥接已加载
if (isAndroid() && window.android && window.android.onBridgeReady) {
  console.log('[AndroidBridge] 通知Android桥接已就绪');
  window.android.onBridgeReady();
}

// 添加页面加载完成后重新检查
window.addEventListener('load', () => {
  console.log('[AndroidBridge] 页面加载完成，重新检查桥接状态');
  setTimeout(checkAndFixBridge, 1000);
});

export default AndroidBridge;