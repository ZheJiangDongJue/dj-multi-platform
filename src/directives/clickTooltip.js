/**
 * 点击提示指令
 * 用法：v-click-tooltip="'显示的内容'"
 * 或者：v-click-tooltip="{ content: '显示的内容', duration: 3000, placement: 'bottom' }"
 * placement可选值: top, bottom, left, right
 *
 * 当应用于 van-field 元素时，只有在元素为只读状态 (readonly) 时才会显示 tooltip
 * 日期选择器和职员选择器不会显示 tooltip
 * 绑定内容为空时不会显示 tooltip
 */

// 全局变量，用于存储tooltip状态
let tooltipState = {
  timer: null,
  popup: null,
  visible: false,
};

// 创建全局单例tooltip元素
const createTooltip = () => {
  if (tooltipState.popup) {
    return tooltipState.popup;
  }

  // 创建tooltip元素
  const tooltip = document.createElement("div");
  tooltip.className = "click-tooltip";
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
const calculatePosition = (element, placement = "bottom") => {
  const rect = element.getBoundingClientRect();
  const tooltipEl = createTooltip();

  // 先显示以获取尺寸
  tooltipEl.style.visibility = "hidden";
  tooltipEl.style.display = "block";

  const tooltipRect = tooltipEl.getBoundingClientRect();
  tooltipEl.style.display = "none";
  tooltipEl.style.visibility = "visible";

  let x, y;

  switch (placement) {
    case "top":
      x = rect.left + rect.width / 2 - tooltipRect.width / 2;
      y = rect.top - tooltipRect.height - 10;
      break;
    case "left":
      x = rect.left - tooltipRect.width - 10;
      y = rect.top + rect.height / 2 - tooltipRect.height / 2;
      break;
    case "right":
      x = rect.right + 10;
      y = rect.top + rect.height / 2 - tooltipRect.height / 2;
      break;
    case "bottom":
    default:
      x = rect.left + rect.width / 2 - tooltipRect.width / 2;
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
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.style.display = "block";
  tooltip.style.opacity = "1";
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
    tooltipState.popup.style.opacity = "0";
    setTimeout(() => {
      tooltipState.popup.style.display = "none";
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

/**
 * 检查元素是否为只读状态的 van-field
 * @param {HTMLElement} el - 要检查的元素
 * @returns {boolean} - 如果是非 van-field 或是只读状态的 van-field 则返回 true
 */
const shouldShowTooltip = (el) => {
  // 检查是否是 van-field 元素
  const isVanField =
    el.classList.contains("van-field") || el.closest(".van-field") !== null;

  if (!isVanField) {
    // 不是 van-field 元素，允许显示 tooltip
    return true;
  }

  // 获取 van-field 元素（可能是当前元素或父元素）
  const fieldElement = el.classList.contains("van-field")
    ? el
    : el.closest(".van-field");

  // 检查是否是日期选择器（带有日历图标的字段）
  const hasCalendarIcon =
    fieldElement.querySelector(".van-icon-calendar-o") !== null;
  if (hasCalendarIcon) {
    return false; // 日期选择器不显示 tooltip
  }

  // 检查是否是选择器（带有下拉箭头图标的字段）
  const hasArrowDownIcon =
    fieldElement.querySelector(".van-icon-arrow-down") !== null;
  if (hasArrowDownIcon) {
    return false; // 选择器不显示 tooltip
  }

  // 检查是否有 readonly 属性或具有 van-field--readonly 类
  const hasReadonlyAttr =
    fieldElement.querySelector("input[readonly], textarea[readonly]") !==
      null || fieldElement.hasAttribute("readonly");
  const hasReadonlyClass = fieldElement.classList.contains(
    "van-field--readonly"
  );

  // 只有在只读状态下才显示 tooltip
  return hasReadonlyAttr || hasReadonlyClass;
};

export default {
  bind(el, binding) {
    // 从binding中获取值
    let options = {
      content: "",
      duration: 3000,
      placement: "bottom",
    };

    if (typeof binding.value === "string") {
      options.content = binding.value;
    } else if (typeof binding.value === "object") {
      options = { ...options, ...binding.value };
    }
    
    // 若绑定的内容是空字符串，则明确设置为null
    if (options.content === "") {
      options.content = null;
    }

    // 存储元素相关的状态
    el._clickTooltip = {
      options,
      clickHandler: null,
      documentClickHandler: null,
      visible: false,
    };

    // 点击处理函数
    el._clickTooltip.clickHandler = function (event) {
      // 如果tooltip已显示，则隐藏
      if (el._clickTooltip.visible) {
        hideTooltip();
        el._clickTooltip.visible = false;
        return;
      }

      // 检查是否应该显示 tooltip（只读状态检查）
      if (!shouldShowTooltip(el)) {
        return;
      }

      // 获取内容，优先使用绑定的content
      let content = el._clickTooltip.options.content;
      
      // 如果绑定的content为null或undefined，尝试使用元素的值或文本内容
      if (content === null || content === undefined) {
        content = (el.value || el.textContent || "").trim();
      }

      // 如果内容为空，不显示tooltip
      if (!content) {
        return;
      }

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
    el.addEventListener("click", el._clickTooltip.clickHandler);
    document.addEventListener("click", el._clickTooltip.documentClickHandler);
  },

  update(el, binding) {
    // 更新选项
    if (typeof binding.value === "string") {
      // 若绑定的内容是空字符串，则明确设置为null
      el._clickTooltip.options.content = binding.value === "" ? null : binding.value;
    } else if (typeof binding.value === "object") {
      // 处理对象形式的绑定，确保空字符串转为null
      const updatedOptions = { ...binding.value };
      if (updatedOptions.content === "") {
        updatedOptions.content = null;
      }
      
      el._clickTooltip.options = {
        ...el._clickTooltip.options,
        ...updatedOptions,
      };
    } else if (binding.value === undefined || binding.value === null) {
      // 处理绑定值为undefined或null的情况
      el._clickTooltip.options.content = null;
    }
  },

  unbind(el) {
    // 移除事件监听
    el.removeEventListener("click", el._clickTooltip.clickHandler);
    document.removeEventListener(
      "click",
      el._clickTooltip.documentClickHandler
    );

    // 删除元素状态
    delete el._clickTooltip;
  },
};
