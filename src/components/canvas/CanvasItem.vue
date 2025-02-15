<template>
  <div class="canvas-item" :style="{
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: zIndex
  }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: Number,
    height: Number,
    zIndex: { type: Number, default: 0 }
  }
}
</script>

<style scoped>
.canvas-item {
  position: absolute;
  /* 以下样式可根据需要调整 */
  /* border: 1px solid #ccc; */
  /* background: white; */
  /* padding: 8px; */
}
</style>