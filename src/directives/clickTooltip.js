/**
 * 点击提示指令
 * 用法：v-click-tooltip="'显示的内容'"
 * 或者：v-click-tooltip="{ content: '显示的内容', duration: 3000, placement: 'bottom' }"
 * placement可选值: top, bottom, left, right
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
    tooltip.className = 'click-tooltip';
    tooltip.style.cssText = `
    position: fixed;
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    border-radius: 4px;
    font-size: 14px;
    z-index: 99999;
    padding: 10px;
    max-width: 80%;
    word-break: break-all;
    display: none;
    pointer-events: none;
    transition: opacity 0.2s;
  `;
    document.body.appendChild(tooltip);
    tooltipState.popup = tooltip;
    return tooltip;
};

// 计算tooltip位置
const calculatePosition = (element, placement = 'bottom') => {
    const rect = element.getBoundingClientRect();
    const tooltipEl = createTooltip();

    // 先显示以获取尺寸
    tooltipEl.style.visibility = 'hidden';
    tooltipEl.style.display = 'block';

    const tooltipRect = tooltipEl.getBoundingClientRect();
    tooltipEl.style.display = 'none';
    tooltipEl.style.visibility = 'visible';

    let x, y;

    switch (placement) {
        case 'top':
            x = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            y = rect.top - tooltipRect.height - 10;
            break;
        case 'left':
            x = rect.left - tooltipRect.width - 10;
            y = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
            break;
        case 'right':
            x = rect.right + 10;
            y = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
            break;
        case 'bottom':
        default:
            x = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            y = rect.bottom + 10;
            break;
    }

    // 边界检查
    if (x < 5) x = 5;
    if (y < 5) y = 5;
    if (x + tooltipRect.width > window.innerWidth - 5) {
        x = window.innerWidth - tooltipRect.width - 5;
    }
    if (y + tooltipRect.height > window.innerHeight - 5) {
        y = window.innerHeight - tooltipRect.height - 5;
    }

    return { x, y };
};

// 显示tooltip
const showTooltip = (content, element, placement, duration = 3000) => {
    const tooltip = createTooltip();
    tooltip.textContent = content;

    const { x, y } = calculatePosition(element, placement);
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
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
        tooltipState.popup.style.opacity = '0';
        setTimeout(() => {
            tooltipState.popup.style.display = 'none';
            tooltipState.visible = false;
        }, 200);
    }

    if (tooltipState.timer) {
        clearTimeout(tooltipState.timer);
        tooltipState.timer = null;
    }
};

// 点击外部区域关闭tooltip
const handleOutsideClick = (e, el) => {
    if (tooltipState.visible && e.target !== el && !el.contains(e.target)) {
        hideTooltip();
    }
};

export default {
    bind(el, binding) {
        // 从binding中获取值
        let options = {
            content: '',
            duration: 3000,
            placement: 'bottom'
        };

        if (typeof binding.value === 'string') {
            options.content = binding.value;
        } else if (typeof binding.value === 'object') {
            options = { ...options, ...binding.value };
        }

        // 存储元素相关的状态
        el._clickTooltip = {
            options,
            clickHandler: null,
            documentClickHandler: null,
            visible: false
        };

        // 点击处理函数
        el._clickTooltip.clickHandler = function (event) {
            // 如果tooltip已显示，则隐藏
            if (el._clickTooltip.visible) {
                hideTooltip();
                el._clickTooltip.visible = false;
                return;
            }

            // 如果内容为空，使用元素的绑定值或文本内容
            let content = el._clickTooltip.options.content ||
                (el.value || el.textContent || '').trim();

            if (!content) return;

            // 显示tooltip
            showTooltip(
                content,
                el,
                el._clickTooltip.options.placement,
                el._clickTooltip.options.duration
            );

            el._clickTooltip.visible = true;

            // 阻止事件冒泡，避免立即触发document的点击事件
            event.stopPropagation();
        };

        // 添加document点击事件监听，用于点击外部区域关闭tooltip
        el._clickTooltip.documentClickHandler = (e) => handleOutsideClick(e, el);

        // 添加事件监听
        el.addEventListener('click', el._clickTooltip.clickHandler);
        document.addEventListener('click', el._clickTooltip.documentClickHandler);
    },

    update(el, binding) {
        // 更新选项
        if (typeof binding.value === 'string') {
            el._clickTooltip.options.content = binding.value;
        } else if (typeof binding.value === 'object') {
            el._clickTooltip.options = {
                ...el._clickTooltip.options,
                ...binding.value
            };
        }
    },

    unbind(el) {
        // 移除事件监听
        el.removeEventListener('click', el._clickTooltip.clickHandler);
        document.removeEventListener('click', el._clickTooltip.documentClickHandler);

        // 删除元素状态
        delete el._clickTooltip;
    }
}; 