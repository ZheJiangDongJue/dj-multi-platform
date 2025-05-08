/**
 * Android WebView 桥接调试工具
 * 用于诊断Android桥接问题
 */

// 创建调试日志区域
function createDebugPanel() {
  // 检查是否已存在
  if (document.getElementById('android-bridge-debug')) {
    return;
  }

  // 创建调试面板
  const debugPanel = document.createElement('div');
  debugPanel.id = 'android-bridge-debug';
  debugPanel.style.position = 'fixed';
  debugPanel.style.bottom = '0';
  debugPanel.style.left = '0';
  debugPanel.style.right = '0';
  debugPanel.style.maxHeight = '200px';
  debugPanel.style.overflowY = 'auto';
  debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  debugPanel.style.color = '#FFF';
  debugPanel.style.padding = '10px';
  debugPanel.style.fontFamily = 'monospace';
  debugPanel.style.fontSize = '12px';
  debugPanel.style.zIndex = '10000';
  debugPanel.style.display = 'none';

  // 创建标题和关闭按钮
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '5px';

  const title = document.createElement('span');
  title.textContent = 'Android桥接调试';
  title.style.fontWeight = 'bold';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '关闭';
  closeBtn.style.border = 'none';
  closeBtn.style.background = '#F44336';
  closeBtn.style.color = '#FFF';
  closeBtn.style.padding = '2px 5px';
  closeBtn.style.borderRadius = '3px';
  closeBtn.onclick = () => {
    debugPanel.style.display = 'none';
  };

  header.appendChild(title);
  header.appendChild(closeBtn);
  debugPanel.appendChild(header);

  // 创建日志区域
  const logArea = document.createElement('div');
  logArea.id = 'android-bridge-debug-log';
  debugPanel.appendChild(logArea);

  // 创建开关按钮
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '显示调试';
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.top = '10px';
  toggleBtn.style.right = '10px';
  toggleBtn.style.zIndex = '10001';
  toggleBtn.style.padding = '5px 10px';
  toggleBtn.style.border = 'none';
  toggleBtn.style.background = '#2196F3';
  toggleBtn.style.color = '#FFF';
  toggleBtn.style.borderRadius = '3px';
  toggleBtn.onclick = () => {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
  };

  // 添加到页面
  document.body.appendChild(debugPanel);
  document.body.appendChild(toggleBtn);
}

// 添加日志
function logDebug(message, type = 'info') {
  // 确保面板存在
  if (!document.getElementById('android-bridge-debug')) {
    createDebugPanel();
  }

  const logArea = document.getElementById('android-bridge-debug-log');
  if (!logArea) return;

  // 创建日志条目
  const logEntry = document.createElement('div');
  logEntry.style.marginBottom = '3px';
  
  // 添加时间戳
  const timestamp = new Date().toLocaleTimeString();
  const timeSpan = document.createElement('span');
  timeSpan.textContent = `[${timestamp}] `;
  timeSpan.style.color = '#BBBBBB';
  
  // 设置类型颜色
  const typeColors = {
    info: '#4CAF50',
    error: '#F44336',
    warn: '#FF9800',
    success: '#2196F3'
  };
  
  logEntry.style.color = typeColors[type] || typeColors.info;
  
  // 添加内容
  const content = typeof message === 'object' 
    ? JSON.stringify(message)
    : message.toString();
  
  logEntry.appendChild(timeSpan);
  logEntry.appendChild(document.createTextNode(content));
  
  // 添加到日志区域
  logArea.appendChild(logEntry);
  
  // 自动滚动到底部
  logArea.scrollTop = logArea.scrollHeight;
}

// 检查Android桥接状态
function checkAndroidBridge() {
  logDebug('开始检查Android桥接状态...');
  
  // 检查User Agent
  const userAgent = navigator.userAgent;
  logDebug(`User Agent: ${userAgent}`);
  
  // 检查是否在Android环境
  const isAndroidEnv = userAgent.indexOf('Android') > -1;
  logDebug(`是否在Android环境: ${isAndroidEnv}`, isAndroidEnv ? 'success' : 'warn');
  
  // 检查window.android对象
  const hasAndroidObj = typeof window.android !== 'undefined';
  logDebug(`window.android对象: ${hasAndroidObj ? '存在' : '不存在'}`, hasAndroidObj ? 'success' : 'error');
  
  if (hasAndroidObj) {
    // 列出可用方法
    const methods = [];
    for (const key in window.android) {
      if (typeof window.android[key] === 'function') {
        methods.push(key);
      }
    }
    logDebug(`可用方法: ${methods.join(', ') || '无'}`, methods.length > 0 ? 'success' : 'warn');
  }
  
  // 检查WebMethods对象
  const hasWebMethods = typeof window.WebMethods !== 'undefined';
  logDebug(`window.WebMethods对象: ${hasWebMethods ? '存在' : '不存在'}`, hasWebMethods ? 'success' : 'error');
  
  if (hasWebMethods) {
    // 列出可用方法
    const methods = [];
    for (const key in window.WebMethods) {
      if (typeof window.WebMethods[key] === 'function') {
        methods.push(key);
      }
    }
    logDebug(`WebMethods可用方法: ${methods.join(', ') || '无'}`, methods.length > 0 ? 'success' : 'warn');
  }
  
  // 检查Vue桥接
  const hasVueBridge = typeof window.Vue !== 'undefined' && 
                        typeof window.Vue.prototype !== 'undefined' && 
                        typeof window.Vue.prototype.$android !== 'undefined';
  logDebug(`Vue桥接: ${hasVueBridge ? '已注册' : '未注册'}`, hasVueBridge ? 'success' : 'error');
  
  // 检查EventBus
  const hasEventBus = typeof window.Vue !== 'undefined' && 
                     typeof window.Vue.prototype !== 'undefined' && 
                     typeof window.Vue.prototype.$EventBus !== 'undefined';
  logDebug(`EventBus: ${hasEventBus ? '已注册' : '未注册'}`, hasEventBus ? 'success' : 'warn');
  
  return {
    isAndroidEnv,
    hasAndroidObj,
    hasWebMethods,
    hasVueBridge,
    hasEventBus
  };
}

// 测试Android桥接
function testAndroidBridge() {
  logDebug('开始测试Android桥接...');
  
  // 检查基本状态
  const status = checkAndroidBridge();
  if (!status.hasAndroidObj) {
    logDebug('无法测试：window.android对象不存在', 'error');
    return false;
  }
  
  // 测试直接调用
  try {
    if (typeof window.android.receiveMessage === 'function') {
      const testData = {
        action: 'test',
        data: { timestamp: Date.now() },
        callbackId: 'debug_test_' + Date.now()
      };
      
      // 注册测试回调
      window[testData.callbackId] = (result) => {
        logDebug(`直接调用测试回调收到结果: ${JSON.stringify(result)}`, 'success');
        delete window[testData.callbackId];
      };
      
      logDebug(`测试直接调用: ${JSON.stringify(testData)}`);
      window.android.receiveMessage(JSON.stringify(testData));
      
      // 5秒后检查是否收到回调
      setTimeout(() => {
        if (window[testData.callbackId]) {
          logDebug('直接调用测试未收到回调', 'error');
          delete window[testData.callbackId];
        }
      }, 5000);
    } else {
      logDebug('window.android.receiveMessage方法不存在', 'error');
    }
  } catch (error) {
    logDebug(`直接调用测试出错: ${error.message}`, 'error');
  }
  
  // 测试Vue桥接
  if (status.hasVueBridge) {
    try {
      logDebug('测试Vue桥接 - getDeviceInfo');
      window.Vue.prototype.$android.getDeviceInfo()
        .then(result => {
          logDebug(`Vue桥接测试成功: ${JSON.stringify(result)}`, 'success');
        })
        .catch(error => {
          logDebug(`Vue桥接测试失败: ${error.message}`, 'error');
        });
    } catch (error) {
      logDebug(`Vue桥接测试出错: ${error.message}`, 'error');
    }
  } else {
    logDebug('无法测试Vue桥接: Vue.$android不存在', 'error');
  }
  
  return true;
}

// 初始化
function initDebugTool() {
  // 创建调试面板
  createDebugPanel();
  
  // 检查桥接状态
  checkAndroidBridge();
  
  // 添加页面加载完成事件监听
  window.addEventListener('load', () => {
    logDebug('页面加载完成，重新检查桥接状态');
    setTimeout(() => {
      const status = checkAndroidBridge();
      
      // 如果桥接正常，尝试测试
      if (status.hasAndroidObj && status.hasWebMethods) {
        testAndroidBridge();
      }
    }, 1000);
  });
  
  // 监听Android通知事件
  window.addEventListener('android-notification', event => {
    const { type, data } = event.detail;
    logDebug(`收到Android通知: 类型=${type}, 数据=${JSON.stringify(data)}`, 'info');
  });
  
  logDebug('Android桥接调试工具初始化完成', 'success');
}

// 导出调试工具方法
export default {
  init: initDebugTool,
  log: logDebug,
  check: checkAndroidBridge,
  test: testAndroidBridge
}; 