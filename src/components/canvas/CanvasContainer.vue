<template>
    <div 
      class="canvas-container"
      :style="{
        width: containerWidth,
        height: containerHeight
      }"
    >
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      width: { type: [Number, String], default: 400 },
      height: { type: [Number, String], default: 300 }
    },
    computed: {
      containerWidth() {
        return typeof this.width === 'number' ? `${this.width}px` : this.width
      },
      containerHeight() {
        return typeof this.height === 'number' ? `${this.height}px` : this.height
      }
    }
  }
  </script>
  
  <style scoped>
  .canvas-container {
    position: relative;
    overflow: hidden;
    background: #f0f0f0; /* 可选背景色 */
  }
  </style>