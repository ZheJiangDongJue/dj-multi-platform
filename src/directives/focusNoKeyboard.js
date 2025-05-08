/**
 * v-focus-no-keyboard
 * 自动聚焦但不弹出输入法的指令
 * 
 * 使用方式：v-focus-no-keyboard 或 v-focus-no-keyboard="true"
 * 添加参数：v-focus-no-keyboard:300="true" - 指定延迟时间（毫秒）
 * 动态控制：v-focus-no-keyboard="shouldFocus" - 通过变量控制是否应用聚焦
 */

export default {
  bind(el, binding) {
    // 保存相关配置到元素上
    el._focusNoKeyboard = {
      value: binding.value !== false, // 默认为true，除非明确设置为false
      delay: parseInt(binding.arg) || 300, // 默认延迟300ms，可通过参数修改
    };
  },
  
  // 当指令所在组件的VNode及其子VNode全部更新后调用
  inserted(el) {
    const { value, delay } = el._focusNoKeyboard;
    
    if (value !== false) {
      setTimeout(() => {
        // 如果是Vue组件，尝试找到内部的input元素
        const inputElement = el.tagName === 'INPUT' ? el : el.querySelector('input');
        
        if (inputElement) {
          // 临时设置为只读以防止输入法弹出
          const originalReadOnly = inputElement.hasAttribute('readonly');
          const originalReadOnlyValue = inputElement.getAttribute('readonly');
          
          inputElement.setAttribute('readonly', 'readonly');
          inputElement.focus();
          
          // 500ms后恢复原始状态
          setTimeout(() => {
            if (originalReadOnly) {
              inputElement.setAttribute('readonly', originalReadOnlyValue);
            } else {
              inputElement.removeAttribute('readonly');
            }
          }, 500);
        }
      }, delay);
    }
  },
  
  // 组件更新时检查绑定值是否改变
  update(el, binding) {
    if (binding.value !== binding.oldValue) {
      el._focusNoKeyboard.value = binding.value !== false;
      
      // 如果从false变为true，执行聚焦
      if (el._focusNoKeyboard.value && binding.oldValue === false) {
        const { delay } = el._focusNoKeyboard;
        
        setTimeout(() => {
          const inputElement = el.tagName === 'INPUT' ? el : el.querySelector('input');
          
          if (inputElement) {
            const originalReadOnly = inputElement.hasAttribute('readonly');
            const originalReadOnlyValue = inputElement.getAttribute('readonly');
            
            inputElement.setAttribute('readonly', 'readonly');
            inputElement.focus();
            
            setTimeout(() => {
              if (originalReadOnly) {
                inputElement.setAttribute('readonly', originalReadOnlyValue);
              } else {
                inputElement.removeAttribute('readonly');
              }
            }, 500);
          }
        }, delay);
      }
    }
  }
}; 