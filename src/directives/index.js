import Vue from 'vue';
import longPressTooltip from './longPressTooltip';// 长按提示

// 注册所有指令
const directives = {
  'long-press-tooltip': longPressTooltip
};

// 安装所有指令
export function installDirectives() {
  Object.keys(directives).forEach(key => {
    Vue.directive(key, directives[key]);
  });
}

export default directives; 