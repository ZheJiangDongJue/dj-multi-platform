<!-- DockItem.vue -->
<script>
export default {
  name: 'DockItem',
  props: {
    dock: {
      type: String,
      default: 'fill',
      validator: (value) => ['top', 'bottom', 'left', 'right', 'fill'].includes(value)
    }
  },
  render(h) {
    // 动态生成子元素，并绑定 dock 属性
    return h(
      'div',
      {
        class: 'dock-item',
        style: this.itemStyle // 根据 dock 属性动态计算样式
      },
      this.$slots.default
    );
  },
  computed: {
    itemStyle() {
      // 根据停靠方向设置基础样式
      const style = {};
      switch (this.dock) {
        case 'top':
        case 'bottom':
          style.flexShrink = '0'; // 固定高度
          break;
        case 'left':
        case 'right':
          style.flexShrink = '0'; // 固定宽度
          break;
        case 'fill':
          style.flexGrow = '1';   // 填充剩余空间
          style.minWidth = '0';   // 防止内容溢出
          style.minHeight = '0';
          style.width = '100%';
          style.height = '100%';
          break;
      }
      return style;
    }
  }
};
</script>

<style scoped>
.dock-item {
  /* 基础样式 */
  box-sizing: border-box;
  overflow: auto; /* 内容溢出时显示滚动条 */
}
</style>