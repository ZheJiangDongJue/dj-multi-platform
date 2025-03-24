/**
 * 长按提示指令
 * 用法：v-long-press-tooltip="'显示的内容'"
 * 或者：v-long-press-tooltip="{ content: '显示的内容', duration: 3000, delay: 500 }"
 */

// 全局变量，用于存储tooltip状态
let tooltipState = {
  timer: null,
  popup: null,
  visible: false
};

// 创建全局单例tooltip元素
const createTooltip = () => {
  if (tooltipState.popup) {
    return tooltipState.popup;
  }

  // 创建tooltip元素
  const tooltip = document.createElement('div');
  tooltip.className = 'long-press-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    border-radius: 4px;
    font-size: 14px;
    z-index: 2000;
    padding: 10px;
    max-width: 80%;
    word-break: break-all;
    display: none;
    pointer-events: none;
  `;
  document.body.appendChild(tooltip);
  tooltipState.popup = tooltip;
  return tooltip;
};

// 显示tooltip
const showTooltip = (content, x, y, duration = 3000) => {
  const tooltip = createTooltip();
  tooltip.textContent = content;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  tooltip.style.display = 'block';
  tooltipState.visible = true;

  // 设置自动关闭
  if (tooltipState.timer) {
    clearTimeout(tooltipState.timer);
  }
  
  tooltipState.timer = setTimeout(() => {
    hideTooltip();
  }, duration);
};

// 隐藏tooltip
const hideTooltip = () => {
  if (tooltipState.popup) {
    tooltipState.popup.style.display = 'none';
    tooltipState.visible = false;
  }
  
  if (tooltipState.timer) {
    clearTimeout(tooltipState.timer);
    tooltipState.timer = null;
  }
};

export default {
  bind(el, binding) {
    // 从binding中获取值
    let options = {
      content: '',
      duration: 3000,
      delay: 500
    };

    if (typeof binding.value === 'string') {
      options.content = binding.value;
    } else if (typeof binding.value === 'object') {
      options = { ...options, ...binding.value };
    }

    // 存储元素相关的状态
    el._longPressTooltip = {
      pressTimer: null,
      touchStartHandler: null,
      touchEndHandler: null,
      options
    };

    // 触摸开始处理函数
    el._longPressTooltip.touchStartHandler = function(event) {
      if (el._longPressTooltip.pressTimer) {
        clearTimeout(el._longPressTooltip.pressTimer);
      }

      // 如果内容为空，使用元素的绑定值或文本内容
      let content = el._longPressTooltip.options.content || 
                   (el.value || el.textContent || '').trim();

      if (!content) return;

      // 设置长按计时器
      el._longPressTooltip.pressTimer = setTimeout(() => {
        // 计算位置
        const rect = event.target.getBoundingClientRect();
        showTooltip(
          content,
          rect.left,
          rect.bottom + 10,
          el._longPressTooltip.options.duration
        );
      }, el._longPressTooltip.options.delay);
    };

    // 触摸结束处理函数
    el._longPressTooltip.touchEndHandler = function() {
      if (el._longPressTooltip.pressTimer) {
        clearTimeout(el._longPressTooltip.pressTimer);
        el._longPressTooltip.pressTimer = null;
      }
    };

    // 添加事件监听
    el.addEventListener('touchstart', el._longPressTooltip.touchStartHandler);
    el.addEventListener('touchend', el._longPressTooltip.touchEndHandler);
    el.addEventListener('touchcancel', el._longPressTooltip.touchEndHandler);
  },

  update(el, binding) {
    // 更新选项
    if (typeof binding.value === 'string') {
      el._longPressTooltip.options.content = binding.value;
    } else if (typeof binding.value === 'object') {
      el._longPressTooltip.options = { 
        ...el._longPressTooltip.options, 
        ...binding.value 
      };
    }
  },

  unbind(el) {
    // 清除计时器
    if (el._longPressTooltip.pressTimer) {
      clearTimeout(el._longPressTooltip.pressTimer);
    }
    
    // 移除事件监听
    el.removeEventListener('touchstart', el._longPressTooltip.touchStartHandler);
    el.removeEventListener('touchend', el._longPressTooltip.touchEndHandler);
    el.removeEventListener('touchcancel', el._longPressTooltip.touchEndHandler);
    
    // 删除元素状态
    delete el._longPressTooltip;
  }
}; 