/**
 * viewport-units.js
 * 固定viewport单位实现
 * 在页面加载时计算并保存视窗尺寸，设置为CSS变量
 * 用于在输入法弹出时保持布局稳定
 */

// 存储视窗尺寸
const viewportSize = {
  width: 0,
  height: 0
};

// 确保数值为整数，消除抖动
function roundToPx(value) {
  return Math.floor(value);
}

/**
 * 在输入法收起后，重新计算视窗尺寸
 * 主要用于旋转屏幕后的更新
 */
function recalculateViewportSize() {
  // 获取视窗尺寸 - 使用floor保证整数像素
  const width = roundToPx(window.innerWidth || document.documentElement.clientWidth);
  const height = roundToPx(window.innerHeight || document.documentElement.clientHeight);
  
  // 保存尺寸
  viewportSize.width = width;
  viewportSize.height = height;
  
  // 设置CSS变量 - 确保是整数像素值
  document.documentElement.style.setProperty('--viewport-width', `${width}px`);
  document.documentElement.style.setProperty('--viewport-height', `${height}px`);
  
  // 调试信息
  if (process.env.NODE_ENV !== 'production') {
    console.log('重新计算固定视窗尺寸:', viewportSize);
  }
}

/**
 * 收起输入法
 */
function hideKeyboard() {
  // 让当前活动元素失去焦点，尝试收起键盘
  if (document.activeElement) {
    document.activeElement.blur();
  }
}

/**
 * 检测是否为安卓设备
 */
function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

/**
 * 针对安卓设备应用额外的修复
 */
function applyAndroidFixes() {
  if (isAndroid()) {
    // 添加安卓专用类到body元素
    document.body.classList.add('android-device');
    
    // 对于安卓设备，添加额外的动画优化
    const style = document.createElement('style');
    style.textContent = `
      .android-device * {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      
      .android-device .animate-fix {
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * 监听屏幕旋转事件
 */
function setupOrientationListener() {
  window.addEventListener('orientationchange', () => {
    // 先尝试收起输入法
    hideKeyboard();
    
    // 延迟执行重新计算，确保输入法已经收起且旋转已完成
    setTimeout(() => {
      recalculateViewportSize();
    }, 300);
  });
}

/**
 * 初始化视窗尺寸
 * 只在页面加载时执行一次，之后不随窗口变化更新
 * 仅在屏幕旋转时重新计算
 */
export function initViewportUnits() {
  // 如果已经初始化过，则直接返回
  if (viewportSize.width > 0) {
    return viewportSize;
  }
  
  // 获取视窗尺寸 - 使用floor保证整数像素
  const width = roundToPx(window.innerWidth || document.documentElement.clientWidth);
  const height = roundToPx(window.innerHeight || document.documentElement.clientHeight);
  
  // 保存尺寸
  viewportSize.width = width;
  viewportSize.height = height;
  
  // 设置CSS变量
  document.documentElement.style.setProperty('--viewport-width', `${width}px`);
  document.documentElement.style.setProperty('--viewport-height', `${height}px`);
  
  // 设置屏幕旋转监听
  setupOrientationListener();
  
  // 应用安卓设备特定修复
  applyAndroidFixes();
  
  // 调试信息
  if (process.env.NODE_ENV !== 'production') {
    console.log('初始化固定视窗尺寸:', viewportSize);
  }
  
  return viewportSize;
}

/**
 * 将百分比转换为实际像素
 * @param {number} percent - 百分比值（1-100）
 * @param {string} dimension - 'width'或'height'
 * @returns {number} 对应的像素值
 */
export function percentToPx(percent, dimension = 'width') {
  const base = dimension === 'width' ? viewportSize.width : viewportSize.height;
  // 返回整数像素
  return roundToPx((percent / 100) * base);
}

/**
 * 强制更新视窗尺寸
 * 可在动画问题发生时手动调用
 */
export function forceUpdateViewport() {
  recalculateViewportSize();
  return viewportSize;
}

export default {
  initViewportUnits,
  percentToPx,
  viewportSize,
  forceUpdateViewport
};