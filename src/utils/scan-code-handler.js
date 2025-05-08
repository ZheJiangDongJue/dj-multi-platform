/**
 * 扫码处理工具
 * 用于处理来自Android设备的扫码结果
 */

// 存储扫码结果的回调函数
const scanCallbacks = [];

// 初始化扫码监听
export function initScanListener() {
  // 监听来自Android的通知
  window.addEventListener('android-notification', handleAndroidNotification);
  console.log('[ScanCodeHandler] 扫码监听已初始化');
}

// 移除扫码监听
export function removeScanListener() {
  window.removeEventListener('android-notification', handleAndroidNotification);
  console.log('[ScanCodeHandler] 扫码监听已移除');
}

/**
 * 处理来自Android的通知
 * @param {CustomEvent} event - 通知事件
 */
function handleAndroidNotification(event) {
  const { type, data } = event.detail;

  // 处理扫码结果通知
  if (type === 'scanResult' && data && data.barcode) {
    console.log('[ScanCodeHandler] 收到扫码结果:', data.barcode);

    // 调用所有注册的回调函数
    scanCallbacks.forEach(callback => {
      try {
        callback(data.barcode, data);
      } catch (error) {
        console.error('[ScanCodeHandler] 回调函数执行出错:', error);
      }
    });
  }
}

/**
 * 注册扫码结果回调函数
 * @param {Function} callback - 回调函数，接收扫码结果和原始数据对象
 * @returns {Function} - 返回取消注册的函数
 */
export function onScanResult(callback) {
  if (typeof callback !== 'function') {
    console.error('[ScanCodeHandler] 回调必须是函数');
    return () => { };
  }

  // 添加到回调数组
  scanCallbacks.push(callback);
  console.log('[ScanCodeHandler] 已注册扫码回调函数');

  // 返回取消注册的函数
  return () => {
    const index = scanCallbacks.indexOf(callback);
    if (index !== -1) {
      scanCallbacks.splice(index, 1);
      console.log('[ScanCodeHandler] 已移除扫码回调函数');
    }
  };
}

/**
 * 模拟扫码结果（用于测试）
 * @param {string} barcode - 模拟的扫码结果
 */
export function mockScanResult(barcode) {
  if (!barcode) {
    console.error('[ScanCodeHandler] 模拟扫码结果不能为空');
    return;
  }

  console.log('[ScanCodeHandler] 模拟扫码结果:', barcode);

  // 创建模拟事件
  const mockEvent = {
    detail: {
      type: 'scanResult',
      data: {
        barcode,
        timestamp: Date.now(),
        isMock: true
      }
    }
  };

  // 调用处理函数
  handleAndroidNotification(mockEvent);
}

// 默认导出
export default {
  initScanListener,
  removeScanListener,
  onScanResult,
  mockScanResult
};
