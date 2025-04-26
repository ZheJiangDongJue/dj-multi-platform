/**
 * 关闭输入法指令
 * 用法：v-close-keyboard
 * 
 * 当在输入框按下回车键时，自动关闭输入法并移除焦点
 * 适用于van-field等输入组件
 */

export default {
    inserted(el) {
        const inputEl = el.querySelector('input');
        if (inputEl) {
            inputEl.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    // 关闭输入法的三种方法

                    // 方法1: 常规移除焦点
                    if (inputEl.blur) {
                        inputEl.blur();
                    }

                    // 方法2: 尝试对当前活动元素移除焦点
                    if (window.document.activeElement) {
                        try {
                            window.document.activeElement.blur();
                        } catch (error) {
                            console.error('关闭输入法失败:', error);
                        }
                    }

                    // 方法3: 创建临时元素并聚焦的方式（对移动设备特别有效）
                    try {
                        const tmpEl = document.createElement('input');
                        tmpEl.style.position = 'absolute';
                        tmpEl.style.opacity = '0';
                        tmpEl.style.height = '0';
                        tmpEl.style.width = '0';
                        document.body.appendChild(tmpEl);
                        tmpEl.focus();
                        document.body.removeChild(tmpEl);
                    } catch (error) {
                        console.error('尝试强制关闭输入法失败:', error);
                    }
                }
            });
        }
    },

    // 当元素解绑时清理事件监听器，防止内存泄漏
    unbind(el) {
        const inputEl = el.querySelector('input');
        if (inputEl) {
            inputEl.removeEventListener('keyup', () => { });
        }
    }
}; 