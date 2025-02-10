<script>
export default {
  name: 'DockPanel',
  props: {
    lastChildFill: { type: Boolean, default: true }
  },
  render(h) {
    const slots = this.$slots.default || [];
    const children = slots.filter(vnode => vnode.tag);
    
    // 处理 LastChildFill
    if (this.lastChildFill && children.length > 0) {
      const lastChild = children[children.length - 1];
      const dockAttr = lastChild.componentOptions?.propsData?.dock;
      if (!dockAttr || !['top', 'bottom', 'left', 'right'].includes(dockAttr)) {
        lastChild.componentOptions.propsData.dock = 'fill';
      }
    }

    // 按 dock 分组
    const groups = { top: [], bottom: [], left: [], right: [], fill: [] };
    children.forEach(vnode => {
      const dock = vnode.componentOptions?.propsData?.dock || 'fill';
      groups[dock in groups ? dock : 'fill'].push(vnode);
    });

    return h('div', { class: 'dock-panel' }, [
      // Top 区域：从上到下排列
      h('div', { class: 'dock-top' }, groups.top),
      
      // Middle 区域（包含 Left/Fill/Right）
      h('div', { class: 'dock-middle' }, [
        // Left 区域：从左到右排列
        h('div', { class: 'dock-horizontal dock-left' }, groups.left),
        
        // Fill 区域
        h('div', { class: 'dock-fill' }, groups.fill),
        
        // Right 区域：从右到左排列
        h('div', { class: 'dock-horizontal dock-right' }, groups.right)
      ]),
      
      // Bottom 区域：从下到上排列
      h('div', { class: 'dock-bottom' }, groups.bottom)
    ]);
  }
};
</script>

<style scoped>
.dock-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

/* Top/Bottom 垂直排列 */
.dock-top, .dock-bottom {
  flex-shrink: 0;
  display: flex;
  flex-direction: column; /* Top 默认方向 */
}
.dock-bottom {
  flex-direction: column-reverse; /* Bottom 反向排列 */
}

/* Middle 区域 */
.dock-middle {
  flex-grow: 1;
  min-height: 0;
  display: flex;
}

/* Left/Right 水平排列 */
.dock-horizontal {
  flex-shrink: 0;
  display: flex;
}
.dock-left {
  flex-direction: row; /* Left 默认方向 */
}
.dock-right {
  flex-direction: row-reverse; /* Right 反向排列 */
}

/* Fill 区域 */
.dock-fill {
  flex-grow: 1;
  min-width: 0;
}
</style>